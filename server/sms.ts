/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Twilio SMS dispatch (Prompt #2) — SERVER-SIDE ONLY.
 * Twilio credentials live exclusively in the server environment and are
 * never exposed to the client bundle.
 *
 * Behavior:
 * - Configured (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER):
 *   real SMS via the `twilio` SDK.
 * - Not configured: graceful "simulated" dispatch so demo flows still work
 *   end-to-end; every dispatch is honestly flagged `simulated` and logged
 *   to api_activity_logs with a simulated marker.
 * - Rate limit guardrail: max 5 SMS per hour per user (violations logged).
 *   Backed by api_activity_logs so the hourly counter survives restarts.
 */

// `twilio` is a CommonJS package whose named exports are assigned at runtime
// (namespace IIFE), so a named ESM import fails under Node. The default import
// resolves to the callable TwilioSDK factory; the class is only imported as a type.
import twilio from 'twilio';
import type { Twilio } from 'twilio';
import { logApiActivity, countRecentActivityLogs } from './apiActivity.js';

export interface SmsDispatchResult {
  success: boolean;
  status: 'dispatched' | 'simulated' | 'failed' | 'rate_limited' | 'invalid_number';
  messageId: string;
  to: string;
  simulated: boolean;
  error?: string;
}

export interface SmsContact {
  id?: string;
  name: string;
  phone: string;
}

export interface SmsDispatchContext {
  userId?: string | null;
  accessToken?: string | null;
  /** Why this SMS is being sent (activity log context). */
  reason?: string;
}

const SMS_HOURLY_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

/** In-process sliding-window limiter (single-instance Express deployment). */
const rateBuckets = new Map<string, number[]>();

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

export function checkSmsRateLimit(userId: string): { allowed: boolean; sentInLastHour: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = (rateBuckets.get(userId) || []).filter(ts => now - ts < RATE_WINDOW_MS);
  if (bucket.length >= SMS_HOURLY_LIMIT) {
    const oldest = bucket[0];
    return {
      allowed: false,
      sentInLastHour: bucket.length,
      retryAfterSeconds: Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000))
    };
  }
  return { allowed: true, sentInLastHour: bucket.length, retryAfterSeconds: 0 };
}

function recordSmsSent(userId: string): void {
  const now = Date.now();
  const bucket = (rateBuckets.get(userId) || []).filter(ts => now - ts < RATE_WINDOW_MS);
  bucket.push(now);
  rateBuckets.set(userId, bucket);
}

/** Normalizes to a +E.164-ish form Twilio accepts; returns null when hopeless. */
export function normalizePhone(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.replace(/[\s\-()]/g, '');
  const candidate = trimmed.startsWith('00') ? `+${trimmed.slice(2)}` : trimmed;
  if (/^\+\d{8,15}$/.test(candidate)) return candidate;
  // Local Pakistani numbers (03xx…) get the +92 prefix automatically.
  if (/^0\d{10}$/.test(candidate)) return `+92${candidate.slice(1)}`;
  return null;
}

let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio | null {
  if (!isSmsConfigured()) return null;
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }
  return twilioClient;
}

/** Core dispatch — one SMS to one recipient, fully logged. */
export async function sendSms(
  to: string,
  body: string,
  ctx: SmsDispatchContext = {}
): Promise<SmsDispatchResult> {
  const startedAt = Date.now();
  const normalized = normalizePhone(to);
  const baseLog = {
    endpoint: 'twilio:sms',
    method: 'POST',
    targetService: 'twilio' as const,
    userId: ctx.userId ?? null,
    accessToken: ctx.accessToken ?? null,
    requestPreview: { to: normalized || to, body: body.slice(0, 160), reason: ctx.reason || 'unspecified' }
  };

  if (!normalized) {
    const result: SmsDispatchResult = {
      success: false, status: 'invalid_number', messageId: '', to,
      simulated: false, error: 'Phone number is not a valid E.164 format.'
    };
    void logApiActivity({ ...baseLog, status: 'failed', statusCode: 400, errorMessage: result.error, durationMs: 0, responsePreview: result });
    return result;
  }

  if (ctx.userId) {
    const limit = checkSmsRateLimit(ctx.userId);
    // Persistent backing: the in-memory bucket resets on server restart, so
    // also count this user's real dispatches (status 201 rows) logged in the
    // last hour. Falls back to the in-memory verdict when no Supabase client
    // is available (offline dev).
    const persistedCount = await countRecentActivityLogs({
      userId: ctx.userId,
      accessToken: ctx.accessToken,
      endpoint: 'twilio:sms',
      statusCode: 201,
      windowMs: RATE_WINDOW_MS
    });
    if (!limit.allowed || (persistedCount !== null && persistedCount >= SMS_HOURLY_LIMIT)) {
      const retryAfterSeconds = limit.allowed
        ? Math.ceil(RATE_WINDOW_MS / 1000) // restart case — oldest dispatch age unknown
        : limit.retryAfterSeconds;
      const result: SmsDispatchResult = {
        success: false, status: 'rate_limited', messageId: '', to: normalized,
        simulated: false,
        error: `SMS rate limit reached (${SMS_HOURLY_LIMIT}/hour). Try again in ${Math.ceil(retryAfterSeconds / 60)} min.`
      };
      void logApiActivity({
        ...baseLog, status: 'failed', statusCode: 429,
        errorMessage: `RATE_LIMIT VIOLATION user=${ctx.userId}`, durationMs: 0,
        responsePreview: {
          rateLimited: true,
          sentInLastHour: Math.max(limit.sentInLastHour, persistedCount ?? 0)
        }
      });
      return result;
    }
  }

  const client = getTwilioClient();
  if (!client) {
    const result: SmsDispatchResult = {
      success: true, status: 'simulated', messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to: normalized, simulated: true
    };
    console.log(`[Mehfooz SMS — SIMULATED] to=${normalized} reason=${ctx.reason || 'unspecified'} body="${body.slice(0, 120)}"`);
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { simulated: true, messageId: result.messageId }
    });
    return result;
  }

  try {
    const fromNumber = process.env.TWILIO_FROM_NUMBER!;
    const message = await client.messages.create({
      to: normalized,
      // Messaging Service SIDs (MG…) are passed via messagingServiceSid.
      ...(fromNumber.startsWith('MG')
        ? { messagingServiceSid: fromNumber }
        : { from: fromNumber }),
      body
    });
    if (ctx.userId) recordSmsSent(ctx.userId);
    const result: SmsDispatchResult = {
      success: true, status: 'dispatched', messageId: message.sid, to: normalized, simulated: false
    };
    console.log(`[Mehfooz SMS Dispatch] to=${normalized} sid=${message.sid} reason=${ctx.reason || 'unspecified'}`);
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 201, durationMs: Date.now() - startedAt,
      responsePreview: { sid: message.sid, status: message.status }
    });
    return result;
  } catch (err: any) {
    const message = err?.message || 'Twilio dispatch failed';
    console.error('[Mehfooz SMS Dispatch Error]:', message);
    const result: SmsDispatchResult = {
      success: false, status: 'failed', messageId: `err-${Date.now()}`, to: normalized,
      simulated: false, error: message
    };
    void logApiActivity({
      ...baseLog, status: 'failed', statusCode: 502, durationMs: Date.now() - startedAt,
      errorMessage: message, responsePreview: { error: message }
    });
    return result;
  }
}

// =====================================================================
// Formatted safety templates (Prompt #2: name + GPS link + timestamp
// + battery level when available)
// =====================================================================

export function formatMapsLink(lat?: number | null, lng?: number | null): string | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function appendSharedDetails(parts: string[], lat?: number | null, lng?: number | null, batteryLevel?: number | null): void {
  const mapLink = formatMapsLink(lat, lng);
  if (mapLink) parts.push(`Live location: ${mapLink}`);
  if (typeof batteryLevel === 'number' && batteryLevel >= 0) {
    parts.push(`Phone battery: ${Math.round(batteryLevel * 100)}%`);
  }
  parts.push(`Time: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} (PKT)`);
  parts.push('— Sent via Mehfooz (محفوظ) Safety App');
}

export function formatEmergencyMessage(params: {
  userName: string;
  lat?: number | null;
  lng?: number | null;
  batteryLevel?: number | null;
  helpline?: string;
}): string {
  const parts = [
    `EMERGENCY SOS: ${params.userName} pressed the crisis alert in the Mehfooz app and may need urgent help.`
  ];
  if (params.helpline) parts.push(`She is contacting: ${params.helpline}.`);
  appendSharedDetails(parts, params.lat, params.lng, params.batteryLevel);
  return parts.join('\n');
}

export function formatCheckInMissedMessage(params: {
  userName: string;
  destination: string;
  lat?: number | null;
  lng?: number | null;
  expectedArrival?: string | null;
}): string {
  const parts = [
    `MISSED CHECK-IN ALERT: ${params.userName} did not confirm arrival`,
    params.destination ? `Destination: ${params.destination}` : '',
    params.expectedArrival ? `She was expected by: ${new Date(params.expectedArrival).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} (PKT)` : ''
  ].filter(Boolean);
  appendSharedDetails(parts, params.lat, params.lng);
  return parts.join('\n');
}

export function formatCheckInSafeMessage(params: { userName: string }): string {
  return `GOOD NEWS: ${params.userName} has confirmed she is SAFE after a missed check-in. No further action needed. — Mehfooz (محفوظ) Safety App`;
}

// =====================================================================
// Multi-contact dispatch helpers
// =====================================================================

export async function sendEmergencyAlert(
  contacts: SmsContact[],
  params: {
    userName: string;
    lat?: number | null;
    lng?: number | null;
    batteryLevel?: number | null;
    helpline?: string;
  } & SmsDispatchContext
): Promise<SmsDispatchResult[]> {
  const body = formatEmergencyMessage(params);
  const results: SmsDispatchResult[] = [];
  for (const contact of contacts) {
    results.push(await sendSms(contact.phone, `${contact.name ? '' : ''}${body}`, {
      userId: params.userId,
      accessToken: params.accessToken,
      reason: `crisis_alert${params.helpline ? `:${params.helpline}` : ''}`
    }));
  }
  return results;
}

export async function sendCheckInAlert(
  contacts: SmsContact[],
  params: {
    userName: string;
    destination: string;
    lat?: number | null;
    lng?: number | null;
    expectedArrival?: string | null;
  } & SmsDispatchContext
): Promise<SmsDispatchResult[]> {
  const body = formatCheckInMissedMessage(params);
  const results: SmsDispatchResult[] = [];
  for (const contact of contacts) {
    results.push(await sendSms(contact.phone, body, {
      userId: params.userId,
      accessToken: params.accessToken,
      reason: 'check_in_missed'
    }));
  }
  return results;
}
