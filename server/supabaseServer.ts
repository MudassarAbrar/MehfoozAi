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
