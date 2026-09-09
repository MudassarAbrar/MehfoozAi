/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Server-side Supabase integration:
 * - Singleton admin/anon client for JWT verification (auth.getUser).
 * - Per-request user-scoped clients so RLS ownership applies to server
 *   operations made on a user's behalf.
 * - `supabaseAuthOptional` middleware: verifies the Bearer token WHEN one is
 *   presented (401 on invalid/expired tokens); guests pass through.
 * - `requireSupabaseAuth` middleware: hard 401 without a valid token — used
 *   by routes that write user-scoped data server-side.
 *
 * Both middlewares are ACTIVE ONLY when SUPABASE_URL + SUPABASE_ANON_KEY are
 * configured; without credentials the server keeps its offline fallback.
 */

import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// NOTE: env is read lazily (never captured at module scope). With ESM import
// hoisting this module evaluates BEFORE `dotenv.config()` runs in server.ts,
// so module-scope reads would always see undefined and silently disable the
// Supabase middleware even when SUPABASE_URL/SUPABASE_ANON_KEY are set.

export interface AuthedRequest extends Request {
  supabaseUserId?: string;
  supabaseUserEmail?: string;
  supabaseAccessToken?: string;
}

let serverClient: SupabaseClient | null = null;

export function isSupabaseServerConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) return null;
  if (!serverClient) {
    serverClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serverClient;
}

/** Creates a RLS-scoped client that acts as the supplied user. */
export function createUserClient(accessToken: string): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) return null;
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header !== 'string') return null;
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

/** Verifies a presented Bearer token; guests (no token) pass through. */
export async function supabaseAuthOptional(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!isSupabaseServerConfigured()) return next();

  const token = extractBearerToken(req);
  if (!token) return next(); // Guest request — existing rate limits still apply.

  const supabase = getSupabaseServer()!;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({
      error: 'Your session is invalid or has expired. Please sign in again.',
      code: 'INVALID_SUPABASE_TOKEN'
    });
    return;
  }
  const authed = req as AuthedRequest;
  authed.supabaseUserId = data.user.id;
  authed.supabaseUserEmail = data.user.email || '';
  authed.supabaseAccessToken = token;
  next();
}

/** Hard requirement: rejects requests without a valid Supabase session. */
export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!isSupabaseServerConfigured()) {
    res.status(503).json({
      error: 'This action requires the Supabase backend, which is not configured on this server.',
      code: 'SUPABASE_NOT_CONFIGURED'
    });
    return;
  }

  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Please sign in to use this action.',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  const supabase = getSupabaseServer()!;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({
      error: 'Your session is invalid or has expired. Please sign in again.',
      code: 'INVALID_SUPABASE_TOKEN'
    });
    return;
  }
  const authed = req as AuthedRequest;
  authed.supabaseUserId = data.user.id;
  authed.supabaseUserEmail = data.user.email || '';
  authed.supabaseAccessToken = token;
  next();
}

/** Generates an official Supabase email confirmation action link via admin API when service key is present. */
export async function generateSupabaseVerificationLink(email: string, redirectTo?: string): Promise<string | null> {
  if (!isSupabaseServerConfigured()) return null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!key) return null;
  try {
    const adminClient = createClient(process.env.SUPABASE_URL!, key);
    const { data } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email: email.trim().toLowerCase(),
      password: 'TemporaryPassword123!',
      options: { redirectTo: redirectTo || (process.env.VITE_APP_URL || 'https://mehfooz-legal-navigator.vercel.app') }
    } as any);
    return data?.properties?.action_link || null;
  } catch (err: any) {
    console.warn('generateSupabaseVerificationLink notice:', err?.message || err);
    return null;
  }
}

// 12-Hour Session Message Quota Tracking (Max 10 messages per 12 hours)
interface ServerQuotaRecord {
  count: number;
  windowStart: number;
}

// Server store (keyed by userId, email, or IP)
const serverQuotaStore = new Map<string, ServerQuotaRecord>();

const QUOTA_LIMIT = 10;
const QUOTA_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function checkAndConsumeServerQuota(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}> {
  const now = Date.now();
  const cleanId = (identifier || 'guest').trim().toLowerCase();
  
  let record = serverQuotaStore.get(cleanId);
  if (!record || (now - record.windowStart) > QUOTA_WINDOW_MS) {
    record = { count: 0, windowStart: now };
  }

  if (record.count >= QUOTA_LIMIT) {
    const resetInMs = QUOTA_WINDOW_MS - (now - record.windowStart);
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, resetInMs)
    };
  }

  record.count += 1;
  serverQuotaStore.set(cleanId, record);

  const remaining = QUOTA_LIMIT - record.count;
  const resetInMs = QUOTA_WINDOW_MS - (now - record.windowStart);

  return {
    allowed: true,
    remaining,
    resetInMs
  };
}

export function getServerQuotaStatus(identifier: string): { remaining: number; resetInMs: number } {
  const now = Date.now();
  const cleanId = (identifier || 'guest').trim().toLowerCase();
  const record = serverQuotaStore.get(cleanId);

  if (!record || (now - record.windowStart) > QUOTA_WINDOW_MS) {
    return { remaining: QUOTA_LIMIT, resetInMs: QUOTA_WINDOW_MS };
  }

  const remaining = Math.max(0, QUOTA_LIMIT - record.count);
  const resetInMs = Math.max(0, QUOTA_WINDOW_MS - (now - record.windowStart));
  return { remaining, resetInMs };
}

