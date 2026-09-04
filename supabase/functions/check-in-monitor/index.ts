/**
 * Check-In Monitor Edge Function
 *
 * Background SMS dispatch for missed safety check-ins.
 *
 * Architecture:
 *   1. pg_cron calls expire_missed_check_ins() every 60 s → sets status='missed'
 *   2. This Edge Function is invoked (cron or HTTP) to dispatch SMS alerts for
 *      missed check-ins where alerts_dispatched_at is still NULL.
 *   3. Each check-in is atomically claimed (alerts_dispatched_at set, checked NULL)
 *      to guarantee exactly-once SMS dispatch across this function and the
 *      Express /api/check-in/expire client-side failsafe.
 *
 * Required env vars (set via `supabase secrets set`):
 *   SUPABASE_URL             — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS)
 *   TWILIO_ACCOUNT_SID       — Twilio account SID
 *   TWILIO_AUTH_TOKEN        — Twilio auth token
 *   TWILIO_FROM_NUMBER       — Twilio verified sender number
 *
 * Deploy:  supabase functions deploy check-in-monitor
 * Invoke:  supabase functions invoke check-in-monitor
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- types ----------

interface CheckInContactPhone {
  id?: string;
  name: string;
  phone: string;
}

interface MissedCheckIn {
  id: string;
  user_id: string;
  destination: string | null;
  expected_arrival: string;
  grace_period_minutes: number;
  contact_phones: CheckInContactPhone[];
  user_display_name: string | null;
  last_known_lat: number | null;
  last_known_lng: number | null;
}

// ---------- Twilio ----------

function normalizePhone(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.replace(/[\s\-()]/g, "");
  const candidate = trimmed.startsWith("00") ? `+${trimmed.slice(2)}` : trimmed;
  if (/^\+\d{8,15}$/.test(candidate)) return candidate;
  if (/^0\d{10}$/.test(candidate)) return `+92${candidate.slice(1)}`;
  return null;
}

async function sendTwilioSms(
  to: string,
  body: string,
  sid: string,
  token: string,
  from: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = btoa(`${sid}:${token}`);

  const form = new URLSearchParams();
  form.set("To", to);
  form.set("From", from);
  form.set("Body", body);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const data = await resp.json();
    if (resp.ok) {
      return { success: true, messageId: data.sid };
    }
    return { success: false, error: data.message || `Twilio ${resp.status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

function buildAlertMessage(ci: MissedCheckIn): string {
  const name = ci.user_display_name || "A Mehfooz user";
  const dest = ci.destination || "her stated destination";
  const eta = new Date(ci.expected_arrival).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

  let loc = "";
  if (ci.last_known_lat && ci.last_known_lng) {
    loc = `\nLast known location: https://maps.google.com/?q=${ci.last_known_lat},${ci.last_known_lng}`;
  }

  return (
    `[Mehfooz Safety Alert]\n` +
    `${name} did not arrive at ${dest} by ${eta}.\n` +
    `Please try to reach her immediately.${loc}\n` +
    `— Mehfooz (محفوظ) Safety App`
  );
}

// ---------- handler ----------

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const twilioConfigured = Boolean(twilioSid && twilioToken && twilioFrom);

  // Service-role client bypasses RLS for background cross-user access.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Fetch missed check-ins awaiting alert dispatch.
  const { data: missed, error: selectErr } = await admin
    .from("check_ins")
    .select(
      "id, user_id, destination, expected_arrival, grace_period_minutes, contact_phones, user_display_name, last_known_lat, last_known_lng",
    )
    .eq("status", "missed")
    .is("alerts_dispatched_at", null)
    .limit(50);

  if (selectErr) {
    return new Response(
      JSON.stringify({ error: selectErr.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const rows = (missed || []) as unknown as MissedCheckIn[];
  const results: {
    checkInId: string;
    dispatched: boolean;
    smsCount: number;
    errors: string[];
  }[] = [];

  for (const ci of rows) {
    // 2. Atomic claim — set alerts_dispatched_at only if still NULL.
    const { data: claimed, error: claimErr } = await admin
      .from("check_ins")
      .update({ alerts_dispatched_at: new Date().toISOString() })
      .eq("id", ci.id)
      .is("alerts_dispatched_at", null)
      .select("id")
      .maybeSingle();

    if (claimErr || !claimed) {
      // Another worker already dispatched alerts for this check-in.
      continue;
    }

    // 3. Dispatch SMS to each emergency contact.
    const contacts = (ci.contact_phones || []) as CheckInContactPhone[];
    const alertBody = buildAlertMessage(ci);
    const smsErrors: string[] = [];
    let smsCount = 0;

    for (const contact of contacts) {
      const phone = normalizePhone(contact.phone);
      if (!phone) continue;

      if (!twilioConfigured) {
        // Simulated dispatch when Twilio is not configured.
        smsCount++;
        continue;
      }

      const result = await sendTwilioSms(phone, alertBody, twilioSid!, twilioToken!, twilioFrom!);
      if (result.success) {
        smsCount++;
      } else {
        smsErrors.push(`${phone}: ${result.error}`);
      }
    }

    // 4. Log activity to api_activity_logs for audit trail.
    await admin.from("api_activity_logs").insert({
      user_id: ci.user_id,
      endpoint: "edge:check-in-monitor",
      method: "POST",
      target_service: twilioConfigured ? "twilio" : "server",
      status: smsErrors.length === 0 ? "success" : "failed",
      request_preview: JSON.stringify({
        checkInId: ci.id,
        contacts: contacts.length,
        destination: ci.destination,
      }).slice(0, 500),
      response_preview: JSON.stringify({
        smsDispatched: smsCount,
        errors: smsErrors,
      }).slice(0, 500),
    });

    results.push({
      checkInId: ci.id,
      dispatched: smsErrors.length === 0,
      smsCount,
      errors: smsErrors,
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length,
      twilioConfigured,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
