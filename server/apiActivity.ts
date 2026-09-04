/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Activity logging (Prompt #2).
 *
 * Every outbound call the server makes (Twilio SMS, Resend email, Gemini
 * generation, Supabase writes) plus every /api route hit is recorded in
 * public.api_activity_logs, which powers the live ApiActivityDashboard.
 *
 * Write strategy (RLS-aware):
 *  1. Authenticated requests -> per-request user-scoped client
 *     (own_activity_logs policy passes, user_id = auth.uid()).
 *  2. Background/system dispatches -> optional SUPABASE_SERVICE_ROLE_KEY
 *     client (bypasses RLS; key is never exposed to the client bundle).
 *  3. Neither available -> console-only (offline dev fallback).
 *
 * logApiActivity() NEVER throws — logging must not break the request path.
 */

import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthedRequest, createUserClient, isSupabaseServerConfigured } from './supabaseServer.js';

const PREVIEW_MAX_CHARS = 500;

export type TargetService = 'twilio' | 'resend' | 'gemini' | 'supabase' | 'geolocation' | 'server' | 'department_api' | 'department_dispatch';
export type ActivityStatus = 'pending' | 'success' | 'failed' | 'timeout';

export interface ApiActivityEntry {
  endpoint: string;
  method?: string;
  targetService: TargetService;
  status: ActivityStatus;
  statusCode?: number | null;
  /** Truncated to 500 chars; secrets redacted before insert. */
  requestPreview?: unknown;
  responsePreview?: unknown;
  durationMs?: number | null;
  errorMessage?: string | null;
  userId?: string | null;
  /** Present for user-scoped writes; falls back to the service-role client. */
  accessToken?: string | null;
}

let serviceRoleClient: SupabaseClient | null | undefined;

function getServiceRoleClient(): SupabaseClient | null {
  if (serviceRoleClient !== undefined) return serviceRoleClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  serviceRoleClient = url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  return serviceRoleClient;
}

/** True when either the service-role key or the shared user client is usable. */
export function isActivityLogWritable(): boolean {
  return isSupabaseServerConfigured() || getServiceRoleClient() !== null;
}

const SECRET_KEY_PATTERN = /("(?:[^"]*(?:pass|secret|token|key|authorization|credential)[^"]*)"\s*:\s*")([^"]{4,})(")/gi;
const BEARER_PATTERN = /(Bearer\s+)[A-Za-z0-9._\-]+/gi;
const SK_PATTERN = /\b(?:sk|rk|re)_[A-Za-z0-9_\-]{10,}\b/g;

/** Defense-in-depth redaction — previews should never contain raw secrets. */
function redact(text: string): string {
  return text
    .replace(SECRET_KEY_PATTERN, (_m, prefix: string, _value: string, suffix: string) => `${prefix}***REDACTED***${suffix}`)
    .replace(BEARER_PATTERN, '$1***REDACTED***')
    .replace(SK_PATTERN, '***REDACTED***');
}

function truncatePreview(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    if (!raw) return null;
    const safe = redact(raw);
    return safe.length > PREVIEW_MAX_CHARS ? `${safe.slice(0, PREVIEW_MAX_CHARS)}…[truncated]` : safe;
  } catch {
    return '[unserializable]';
  }
}

/** Fire-and-forget activity log write. Never throws, never blocks callers. */
export async function logApiActivity(entry: ApiActivityEntry): Promise<void> {
  try {
    const row = {
      user_id: entry.userId ?? null,
      endpoint: entry.endpoint,
      method: entry.method || 'POST',
      target_service: entry.targetService,
      status: entry.status,
      status_code: entry.statusCode ?? null,
      request_preview: truncatePreview(entry.requestPreview),
      response_preview: truncatePreview(entry.responsePreview),
      duration_ms: entry.durationMs ?? null,
      error_message: entry.errorMessage ? String(entry.errorMessage).slice(0, 500) : null
    };

    const client = entry.accessToken
      ? createUserClient(entry.accessToken)
      : getServiceRoleClient();

    if (!client) {
      // Offline dev fallback — keep a visible trace in the server console.
      console.log('[api-activity]', row.endpoint, row.status, row.status_code ?? '');
      return;
    }

    const { error } = await client.from('api_activity_logs').insert(row);
    if (error) {
      console.warn('api_activity_logs insert failed:', error.message);
    }
  } catch (err: any) {
    console.warn('logApiActivity swallowed error:', err?.message || err);
  }
}

/**
 * Counts a user's recent activity rows — persistent backing for rate
 * limiters so counters survive server restarts. Uses the service-role client
 * when configured, otherwise the caller's user-scoped client
 * (own_activity_logs policy). Returns null when neither is available so
 * callers can fall back to their in-memory counters.
 */
export async function countRecentActivityLogs(params: {
  userId: string;
  endpoint: string;
  statusCode?: number;
  windowMs: number;
  accessToken?: string | null;
}): Promise<number | null> {
  try {
    const client = getServiceRoleClient() ?? (params.accessToken ? createUserClient(params.accessToken) : null);
    if (!client) return null;

    const since = new Date(Date.now() - params.windowMs).toISOString();
    let query = client
      .from('api_activity_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', params.userId)
      .eq('endpoint', params.endpoint)
      .gte('created_at', since);
    if (typeof params.statusCode === 'number') {
      query = query.eq('status_code', params.statusCode);
    }
    const { count, error } = await query;
    if (error) {
      console.warn('countRecentActivityLogs failed:', error.message);
      return null;
    }
    return count ?? 0;
  } catch {
    return null;
  }
}

// =====================================================================
// HTTP route tracker middleware
// =====================================================================

const SKIPPED_PATHS = new Set(['/api/health', '/api/security-status']);

function inferTargetService(path: string): TargetService {
  if (path.startsWith('/api/orchestrate')) return 'gemini';
  if (path.startsWith('/api/recommend-channel')) return 'gemini';
  if (path.startsWith('/api/crisis-alert') || path.startsWith('/api/check-in')) return 'twilio';
  if (path.startsWith('/api/complaint-handoff')) return 'resend';
  if (path.startsWith('/api/mock-handoff') || path.startsWith('/api/complaints')) return 'resend';
  return 'server';
}

/**
 * Logs every /api/* request on response finish. Auth metadata is read from
 * the request AFTER the route ran (supabaseAuthOptional populates it), which
 * is safe because the 'finish' hook fires once the response is complete.
 */
export function apiActivityTracker(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();
  res.on('finish', () => {
    try {
      if (SKIPPED_PATHS.has(req.path)) return;
      const authed = req as AuthedRequest;
      const { supabaseUserId, supabaseAccessToken } = authed;
      // Guest requests can only be persisted when the service-role key is
      // configured; logApiActivity degrades gracefully otherwise.
      if (!supabaseAccessToken && !isActivityLogWritable()) return;
      void logApiActivity({
        endpoint: req.path,
        method: req.method,
        targetService: inferTargetService(req.path),
        status: res.statusCode < 400 ? 'success' : 'failed',
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        userId: supabaseUserId ?? null,
        accessToken: supabaseAccessToken ?? null,
        requestPreview: undefined
      });
    } catch {
      /* tracker must never break the response */
    }
  });
  next();
}
