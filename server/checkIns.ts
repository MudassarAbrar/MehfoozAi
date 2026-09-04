/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Silent Check-In server-side timers (Prompt #2) + Crisis SMS alerts.
 *
 * The check_ins table is the source of truth: every session has a real
 * expected_arrival timestamp monitored independently of the browser by the
 * pg_cron job + `check-in-monitor` Edge Function (see supabase/functions/).
 * These Express endpoints give the client the same powers:
 *
 *   POST /api/check-in/start    — create a monitored session
 *   POST /api/check-in/confirm  — "I'M SAFE" (sends safe follow-up SMS if
 *                                 alerts already went out)
 *   POST /api/check-in/expire   — failsafe dispatch for overdue sessions
 *                                 (atomic claim → no double sends with the
 *                                 Edge Function)
 *   POST /api/check-in/location — periodic GPS updates
 *   POST /api/check-in/extend   — push expected_arrival out
 *   POST /api/check-in/cancel   — abort a session
 *   GET  /api/check-ins         — recent sessions (UI state restore)
 *   POST /api/crisis-alert      — SOS SMS burst to emergency contacts
 *
 * All routes require a valid Supabase session (RLS user context).
 */

import { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthedRequest, createUserClient, requireSupabaseAuth } from './supabaseServer.js';
import { logApiActivity } from './apiActivity.js';
import {
  sendSms,
  sendCheckInAlert,
  formatEmergencyMessage,
  normalizePhone,
  SmsDispatchResult
} from './sms.js';

interface CheckInContactPhone {
  id?: string;
  name: string;
  phone: string;
}

interface CheckInRow {
  id: string;
  user_id: string;
  destination: string | null;
  expected_arrival: string;
  grace_period_minutes: number;
  status: 'active' | 'arrived' | 'missed' | 'cancelled';
  contact_ids: string[] | null;
  contact_phones: CheckInContactPhone[] | null;
  user_display_name: string | null;
  last_known_lat: number | null;
  last_known_lng: number | null;
  alerts_dispatched_at: string | null;
  created_at: string;
}

const checkInLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Too many check-in requests. Please wait a moment.', code: 'CHECKIN_RATE_LIMIT_EXCEEDED', status: 429 }
});

const crisisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Crisis alert limit reached. Please use direct calls for emergencies.', code: 'CRISIS_RATE_LIMIT_EXCEEDED', status: 429 }
});

function sanitizeContacts(raw: unknown, max: number): CheckInContactPhone[] {
  if (!Array.isArray(raw)) return [];
  const contacts: CheckInContactPhone[] = [];
  for (const item of raw.slice(0, max)) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === 'string' ? rec.name.trim().slice(0, 100) : '';
    const phone = typeof rec.phone === 'string' ? rec.phone.trim() : '';
    if (!phone || !normalizePhone(phone)) continue;
    contacts.push({
      id: typeof rec.id === 'string' ? rec.id.slice(0, 64) : undefined,
      name: name || 'Emergency Contact',
      phone
    });
  }
  return contacts;
}

export function registerCheckInRoutes(app: Express): void {
  // -------------------------------------------------------------------
  // POST /api/check-in/start
  // -------------------------------------------------------------------
  app.post('/api/check-in/start', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }

    const { destination, expectedMinutes, gracePeriodMinutes, contacts, lat, lng } = req.body || {};

    const safeDestination = typeof destination === 'string' ? destination.trim().slice(0, 200) : '';
    const minutes = Number(expectedMinutes);
    const grace = Number(gracePeriodMinutes);

    if (!safeDestination) {
      return res.status(400).json({ error: '"destination" is required.', code: 'INVALID_DESTINATION' });
    }
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 480) {
      return res.status(400).json({ error: '"expectedMinutes" must be between 1 and 480.', code: 'INVALID_DURATION' });
    }
    const safeContacts = sanitizeContacts(contacts, 10);
    if (safeContacts.length === 0) {
      return res.status(400).json({ error: 'At least one contact with a valid phone number is required.', code: 'INVALID_CONTACTS' });
    }

    try {
      const { data: profile } = await userClient
        .from('profiles')
        .select('full_name, safe_nickname')
        .eq('id', authed.supabaseUserId!)
        .maybeSingle();
      const displayName = (profile as Record<string, unknown> | null)?.full_name
        || (profile as Record<string, unknown> | null)?.safe_nickname
        || authed.supabaseUserEmail
        || 'A Mehfooz user';

      const expectedArrival = new Date(Date.now() + minutes * 60000).toISOString();
      const { data, error } = await userClient
        .from('check_ins')
        .insert({
          user_id: authed.supabaseUserId,
          destination: safeDestination,
          expected_arrival: expectedArrival,
          grace_period_minutes: Number.isFinite(grace) && grace >= 0 && grace <= 60 ? Math.round(grace) : 2,
          status: 'active',
          contact_ids: safeContacts.map(c => c.id).filter(Boolean) as string[],
          contact_phones: safeContacts,
          user_display_name: String(displayName).slice(0, 120),
          last_known_lat: typeof lat === 'number' ? lat : null,
          last_known_lng: typeof lng === 'number' ? lng : null
        })
        .select('id, expected_arrival, grace_period_minutes, status')
        .single();

      if (error || !data) {
        console.warn('check-in insert failed:', error?.message);
        return res.status(500).json({ error: 'Could not start the check-in session.', code: 'CHECKIN_INSERT_FAILED' });
      }

      void logApiActivity({
        endpoint: 'supabase:check_ins.insert',
        method: 'POST',
        targetService: 'supabase',
        status: 'success',
        statusCode: 201,
        userId: authed.supabaseUserId,
        accessToken: authed.supabaseAccessToken,
        requestPreview: { destination: safeDestination, minutes, contacts: safeContacts.length },
        responsePreview: data
      });

      return res.json({
        success: true,
        checkIn: {
          id: (data as Record<string, unknown>).id,
          expectedArrival: (data as Record<string, unknown>).expected_arrival,
          gracePeriodMinutes: (data as Record<string, unknown>).grace_period_minutes,
          status: (data as Record<string, unknown>).status
        }
      });
    } catch (err: any) {
      console.error('check-in start error:', err?.message);
      return res.status(500).json({ error: 'A secure server error occurred.', code: 'INTERNAL_SERVER_ERROR' });
    }
  });

  // -------------------------------------------------------------------
  // POST /api/check-in/confirm — "I'M SAFE"
  // -------------------------------------------------------------------
  app.post('/api/check-in/confirm', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }

    const checkInId = typeof req.body?.checkInId === 'string' ? req.body.checkInId : '';
    if (!checkInId) {
      return res.status(400).json({ error: '"checkInId" is required.', code: 'INVALID_CHECKIN_ID' });
    }

    try {
      const { data: row } = await userClient
        .from('check_ins')
        .select('*')
        .eq('id', checkInId)
        .maybeSingle();
      const checkIn = row as unknown as CheckInRow | null;

      if (!checkIn) {
        return res.status(404).json({ error: 'Check-in session not found.', code: 'CHECKIN_NOT_FOUND' });
      }

      // Alerts already fired (missed + dispatched) — notify contacts she is safe.
      let followUpResults: SmsDispatchResult[] = [];
      if (checkIn.status === 'missed' && checkIn.alerts_dispatched_at) {
        const contacts = (checkIn.contact_phones || []) as CheckInContactPhone[];
        const userName = checkIn.user_display_name || 'A Mehfooz user';
        for (const contact of contacts) {
          const result = await sendSms(
            contact.phone,
            `GOOD NEWS: ${userName} has confirmed she is SAFE after a missed check-in. No further action needed. — Mehfooz (محفوظ) Safety App`,
            { userId: authed.supabaseUserId, accessToken: authed.supabaseAccessToken, reason: 'check_in_safe_followup' }
          );
          followUpResults.push(result);
        }
      }

      const { error } = await userClient
        .from('check_ins')
        .update({ status: 'arrived' })
        .eq('id', checkInId);
      if (error) {
        console.warn('check-in confirm update failed:', error.message);
        return res.status(500).json({ error: 'Could not confirm the check-in.', code: 'CHECKIN_UPDATE_FAILED' });
      }

      return res.json({
        success: true,
        followUpAlertsSent: followUpResults.filter(r => r.success).length,
        followUpResults
      });
    } catch (err: any) {
      console.error('check-in confirm error:', err?.message);
      return res.status(500).json({ error: 'A secure server error occurred.', code: 'INTERNAL_SERVER_ERROR' });
    }
  });

  // -------------------------------------------------------------------
  // POST /api/check-in/expire — client-side failsafe dispatch
  // -------------------------------------------------------------------
  app.post('/api/check-in/expire', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }

    const checkInId = typeof req.body?.checkInId === 'string' ? req.body.checkInId : null;

    try {
      // Overdue = past expected arrival + grace period, still unalerted.
      let query = userClient
        .from('check_ins')
        .select('*')
        .eq('user_id', authed.supabaseUserId!)
        .eq('status', 'active')
        .is('alerts_dispatched_at', null)
        .lt('expected_arrival', new Date().toISOString());
      if (checkInId) query = query.eq('id', checkInId);
      const { data, error } = await query.limit(10);
      if (error) {
        console.warn('check-in expire select failed:', error.message);
        return res.status(500).json({ error: 'Could not evaluate overdue check-ins.', code: 'CHECKIN_SELECT_FAILED' });
      }

      const results: { checkInId: string; dispatched: boolean; sms: SmsDispatchResult[] }[] = [];
      for (const raw of (data || []) as unknown as CheckInRow[]) {
        // Grace check (expected_arrival + grace minutes).
        const dueAt = new Date(raw.expected_arrival).getTime() + raw.grace_period_minutes * 60000;
        if (Date.now() < dueAt) continue;

        // Atomic claim — exactly-once dispatch across Express + Edge Function.
        const { data: claimed, error: claimError } = await userClient
          .from('check_ins')
          .update({ status: 'missed', alerts_dispatched_at: new Date().toISOString() })
          .eq('id', raw.id)
          .eq('status', 'active')
          .is('alerts_dispatched_at', null)
          .select('id')
          .maybeSingle();

        if (claimError) {
          console.warn('check-in claim failed:', claimError.message);
          continue;
        }
        if (!claimed) continue; // Edge Function beat us to it — no double send.

        const contacts = (raw.contact_phones || []) as CheckInContactPhone[];
        const sms = await sendCheckInAlert(contacts, {
          userName: raw.user_display_name || 'A Mehfooz user',
          destination: raw.destination || 'her stated destination',
          lat: raw.last_known_lat,
          lng: raw.last_known_lng,
          expectedArrival: raw.expected_arrival,
          userId: authed.supabaseUserId,
          accessToken: authed.supabaseAccessToken
        });
        results.push({ checkInId: raw.id, dispatched: true, sms });
      }

      return res.json({ success: true, processed: results.length, results });
    } catch (err: any) {
      console.error('check-in expire error:', err?.message);
      return res.status(500).json({ error: 'A secure server error occurred.', code: 'INTERNAL_SERVER_ERROR' });
    }
  });

  // -------------------------------------------------------------------
  // POST /api/check-in/location
  // -------------------------------------------------------------------
  app.post('/api/check-in/location', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }
    const { checkInId, lat, lng } = req.body || {};
    if (typeof checkInId !== 'string' || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: '"checkInId", "lat" and "lng" are required.', code: 'INVALID_LOCATION' });
    }
    const { error } = await userClient
      .from('check_ins')
      .update({ last_known_lat: lat, last_known_lng: lng })
      .eq('id', checkInId)
      .eq('status', 'active');
    if (error) {
      return res.status(500).json({ error: 'Could not update location.', code: 'LOCATION_UPDATE_FAILED' });
    }
    return res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // POST /api/check-in/extend
  // -------------------------------------------------------------------
  app.post('/api/check-in/extend', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }
    const { checkInId, extraMinutes } = req.body || {};
    const extra = Number(extraMinutes);
    if (typeof checkInId !== 'string' || !Number.isFinite(extra) || extra < 1 || extra > 240) {
      return res.status(400).json({ error: '"checkInId" and "extraMinutes" (1-240) are required.', code: 'INVALID_EXTEND' });
    }
    const { data: row } = await userClient
      .from('check_ins')
      .select('expected_arrival, grace_period_minutes, status, alerts_dispatched_at')
      .eq('id', checkInId)
      .maybeSingle();
    const checkIn = row as unknown as { expected_arrival: string; status: string; alerts_dispatched_at: string | null } | null;
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in session not found.', code: 'CHECKIN_NOT_FOUND' });
    }
    if (checkIn.status !== 'active' || checkIn.alerts_dispatched_at) {
      return res.status(409).json({ error: 'This session can no longer be extended.', code: 'CHECKIN_NOT_ACTIVE' });
    }
    const newArrival = new Date(new Date(checkIn.expected_arrival).getTime() + extra * 60000).toISOString();
    const { error } = await userClient
      .from('check_ins')
      .update({ expected_arrival: newArrival })
      .eq('id', checkInId)
      .eq('status', 'active');
    if (error) {
      return res.status(500).json({ error: 'Could not extend the session.', code: 'EXTEND_FAILED' });
    }
    return res.json({ success: true, expectedArrival: newArrival });
  });

  // -------------------------------------------------------------------
  // POST /api/check-in/cancel
  // -------------------------------------------------------------------
  app.post('/api/check-in/cancel', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }
    const checkInId = typeof req.body?.checkInId === 'string' ? req.body.checkInId : '';
    if (!checkInId) {
      return res.status(400).json({ error: '"checkInId" is required.', code: 'INVALID_CHECKIN_ID' });
    }
    const { error } = await userClient
      .from('check_ins')
      .update({ status: 'cancelled' })
      .eq('id', checkInId)
      .eq('status', 'active');
    if (error) {
      return res.status(500).json({ error: 'Could not cancel the session.', code: 'CANCEL_FAILED' });
    }
    return res.json({ success: true });
  });

  // -------------------------------------------------------------------
  // GET /api/check-ins — recent sessions for UI state restore
  // -------------------------------------------------------------------
  app.get('/api/check-ins', requireSupabaseAuth, checkInLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const userClient = createUserClient(authed.supabaseAccessToken!);
    if (!userClient) {
      return res.status(503).json({ error: 'Supabase backend not configured.', code: 'SUPABASE_NOT_CONFIGURED' });
    }
    const { data, error } = await userClient
      .from('check_ins')
      .select('id, destination, expected_arrival, grace_period_minutes, status, alerts_dispatched_at, created_at, contact_phones')
      .eq('user_id', authed.supabaseUserId!)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      return res.status(500).json({ error: 'Could not load check-ins.', code: 'CHECKIN_LIST_FAILED' });
    }
    return res.json({ success: true, checkIns: data || [] });
  });

  // -------------------------------------------------------------------
  // POST /api/crisis-alert — SOS SMS burst to emergency contacts
  // -------------------------------------------------------------------
  app.post('/api/crisis-alert', requireSupabaseAuth, crisisLimiter, async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;

    const { contacts, helpline, lat, lng, batteryLevel, message } = req.body || {};
    const safeContacts = sanitizeContacts(contacts, 10);
    if (safeContacts.length === 0) {
      return res.status(400).json({ error: 'At least one contact with a valid phone number is required.', code: 'INVALID_CONTACTS' });
    }

    try {
      // Best-effort display name from the verified profile.
      let displayName = 'A Mehfooz user';
      const userClient = createUserClient(authed.supabaseAccessToken!);
      if (userClient) {
        const { data: profile } = await userClient
          .from('profiles')
          .select('full_name, safe_nickname')
          .eq('id', authed.supabaseUserId!)
          .maybeSingle();
        displayName = String((profile as Record<string, unknown> | null)?.full_name
          || (profile as Record<string, unknown> | null)?.safe_nickname
          || authed.supabaseUserEmail
          || displayName).slice(0, 120);
      }

      const customBody = typeof message === 'string' && message.trim()
        ? message.trim().slice(0, 400)
        : null;
      const body = customBody || formatEmergencyMessage({
        userName: displayName,
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : null,
        helpline: typeof helpline === 'string' ? helpline.slice(0, 100) : undefined
      });

      const results: SmsDispatchResult[] = [];
      for (const contact of safeContacts) {
        results.push(await sendSms(contact.phone, body, {
          userId: authed.supabaseUserId,
          accessToken: authed.supabaseAccessToken,
          reason: `crisis_alert${typeof helpline === 'string' ? `:${helpline.slice(0, 60)}` : ''}`
        }));
      }

      const dispatched = results.filter(r => r.status === 'dispatched').length;
      const simulated = results.filter(r => r.status === 'simulated').length;
      const failed = results.filter(r => !r.success).length;

      return res.json({
        success: failed < results.length,
        contactsNotified: results.filter(r => r.success).length,
        dispatched,
        simulated,
        failed,
        twilioConfigured: results.some(r => r.status === 'dispatched'),
        results
      });
    } catch (err: any) {
      console.error('crisis alert error:', err?.message);
      return res.status(500).json({ error: 'A secure server error occurred.', code: 'INTERNAL_SERVER_ERROR' });
    }
  });
}
