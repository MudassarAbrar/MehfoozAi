/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Department routing — maps each support channel to its real contact email + API endpoint.
 *
 * When a user submits a complaint the server:
 * 1. Looks up the concerned department from this table
 * 2. Hits the department's API endpoint (if configured) with the complaint payload
 * 3. Sends the formal docket email to the department inbox (Reply-To = user's email)
 * 4. Sends a confirmation copy to the logged-in user
 * 5. Logs every dispatch step to api_activity_logs
 *
 * IMPORTANT: Every email below MUST be verified before going live.
 * - For government departments, confirm the address from their official website.
 * - Placeholder addresses are marked with [VERIFY] — replace before production.
 */

import { logApiActivity } from './apiActivity.js';

export interface DepartmentContact {
  /** Official department name (English). */
  name: string;
  /** Official department name (Urdu). */
  nameUrdu: string;
  /** Email address where complaints are received. */
  email: string;
  /** Department API endpoint for complaint submission (if available). */
  apiEndpoint?: string;
  /** HTTP method for the API endpoint (default: POST). */
  apiMethod?: 'POST' | 'PUT';
  /** Backup / helpline phone number. */
  phone?: string;
  /** Department website for reference. */
  website?: string;
  /** Whether this email has been verified for live dispatch. */
  verified: boolean;
}

export interface DepartmentDispatchResult {
  /** Whether the overall dispatch succeeded (at least one channel). */
  success: boolean;
  /** Email dispatch result. */
  email: { status: 'dispatched' | 'simulated' | 'failed'; messageId: string; error?: string };
  /** API dispatch result (null if no endpoint configured). */
  api: { status: 'dispatched' | 'simulated' | 'failed' | 'not_configured'; statusCode?: number; error?: string } | null;
  /** Department that was contacted. */
  department: { id: string; name: string; email: string; apiEndpoint?: string };
}

/**
 * Master routing table — channel ID → department contact.
 * Keys match the `id` field in SUPPORT_CHANNELS (ComplaintBuilder.tsx).
 */
export const DEPARTMENT_ROUTING: Record<string, DepartmentContact> = {
  police_support: {
    name: 'Punjab Safe Cities Authority (PSCA) Emergency 15',
    nameUrdu: 'پنجاب سیف سٹیز اتھارٹی ایمرجنسی 15',
    email: 'complaint@psca.gop.pk',           // [VERIFY] confirm from https://psca.gop.pk
    apiEndpoint: 'https://psca.gop.pk/api/complaints', // [VERIFY] confirm endpoint exists
    apiMethod: 'POST',
    phone: '15',
    website: 'https://psca.gop.pk/onefive/',
    verified: false
  },
  pcsw_helpline: {
    name: 'Punjab Commission on the Status of Women (PCSW)',
    nameUrdu: 'پنجاب کمیشن برائے وقار نسواں',
    email: 'complaint@pcsw.punjab.gov.pk',     // [VERIFY] confirm from https://pcsw.punjab.gov.pk
    apiEndpoint: 'https://pcsw.punjab.gov.pk/api/complaints', // [VERIFY]
    apiMethod: 'POST',
    phone: '1043',
    website: 'https://pcsw.punjab.gov.pk',
    verified: false
  },
  fospah: {
    name: 'Federal Ombudsperson (Protection Against Harassment)',
    nameUrdu: 'وفاقی محتسب برائے انسداد ہراسانی',
    email: 'complaint@mohtasib.gov.pk',        // [VERIFY] confirm from https://mohtasib.gov.pk
    apiEndpoint: 'https://mohtasib.gov.pk/api/complaints', // [VERIFY]
    apiMethod: 'POST',
    phone: '+92 51 9202078',
    website: 'https://mohtasib.gov.pk',
    verified: false
  },
  workplace_ombudsperson: {
    name: 'Office of the Ombudsperson Punjab (Workplace Harassment)',
    nameUrdu: 'دفتر صوبائی محتسب پنجاب',
    email: 'complaint@ombudspersonpunjab.gov.pk', // [VERIFY] confirm from https://ombudspersonpunjab.gov.pk
    apiEndpoint: 'https://ombudspersonpunjab.gov.pk/api/complaints', // [VERIFY]
    apiMethod: 'POST',
    phone: '+92 42 99205027',
    website: 'https://ombudspersonpunjab.gov.pk',
    verified: false
  },
  legal_aid: {
    name: 'AGHS Legal Aid Cell (Asma Jahangir Foundation)',
    nameUrdu: 'عاصمہ جہانگیر فاؤنڈیشن — مفت قانونی امداد',
    email: 'aghslegalaid@gmail.com',           // [VERIFY] confirm from AGHS directly
    phone: '+92 42 35763234',
    website: 'https://aghs.org.pk',
    verified: false
  },
  shelter: {
    name: 'Dar-ul-Aman (Social Welfare Punjab)',
    nameUrdu: 'دارالامان — محکمہ سماجی بہبود پنجاب',
    email: 'darulaman@socialwelfare.punjab.gov.pk', // [VERIFY] confirm from Social Welfare Dept
    phone: '1043',
    website: 'https://socialwelfare.punjab.gov.pk',
    verified: false
  },
  social_welfare: {
    name: 'Punjab Social Welfare & Bait-ul-Maal',
    nameUrdu: 'محکمہ سماجی بہبود و بیت المال پنجاب',
    email: 'info@baitulmal.punjab.gov.pk',     // [VERIFY] confirm from official site
    phone: '+92 42 99230091',
    website: 'https://baitulmal.punjab.gov.pk',
    verified: false
  },
  counselling: {
    name: 'Rozan Emotional Health & Counselling',
    nameUrdu: 'روزن ذہنی صحت و کونسلنگ',
    email: 'info@rozan.org',                   // [VERIFY] confirm from https://rozan.org
    phone: '0800-22444',
    website: 'https://rozan.org',
    verified: false
  },
  cyber_safety: {
    name: 'Digital Rights Foundation — Cyber Harassment Helpline',
    nameUrdu: 'ڈیجیٹل رائٹس فاؤنڈیشن — سائبر ہراسمنٹ ہیلپ لائن',
    email: 'helpdesk@digitalrightsfoundation.pk', // [VERIFY] confirm from official site
    phone: '0800-39393',
    website: 'https://digitalrightsfoundation.pk',
    verified: false
  }
};

/**
 * Resolve the department contact for a given support channel ID.
 * Falls back to the generic PSCA entry when the channel is unknown.
 */
export function getDepartmentContact(channelId: string | undefined | null): DepartmentContact {
  if (channelId && DEPARTMENT_ROUTING[channelId]) {
    return DEPARTMENT_ROUTING[channelId];
  }
  // Default fallback — PSCA Emergency 15
  return DEPARTMENT_ROUTING.police_support;
}

/**
 * Check whether a department email has been verified for live dispatch.
 * Unverified departments get simulated dispatch (honest reporting).
 */
export function isDepartmentVerified(channelId: string | undefined | null): boolean {
  const contact = getDepartmentContact(channelId);
  return contact.verified && Boolean(contact.email);
}

/**
 * Dispatch complaint to the concerned department via API + email.
 * Logs every step to api_activity_logs for the dashboard.
 *
 * @param channelId - The support channel ID (e.g. 'police_support', 'pcsw_helpline')
 * @param payload - The complaint data to send
 * @param userEmail - The logged-in user's email (used as Reply-To)
 * @param ctx - Auth context for logging
 */
export async function dispatchToDepartment(
  channelId: string | undefined | null,
  payload: {
    trackingNumber: string;
    complainantName?: string;
    district?: string;
    category?: string;
    summary: string;
    incidentDate?: string;
    incidentTime?: string;
    locationDetails?: string;
    isOngoing?: boolean;
    channel?: string;
    requestedSupport?: string;
    pdfBase64?: string;
    isPasswordProtected?: boolean;
  },
  userEmail: string,
  ctx: { userId?: string | null; accessToken?: string | null }
): Promise<DepartmentDispatchResult> {
  const dept = getDepartmentContact(channelId);
  const deptId = channelId || 'police_support';

  // ── 1. API dispatch (if endpoint configured) ──────────────────────────────
  let apiResult: DepartmentDispatchResult['api'] = null;

  if (dept.apiEndpoint) {
    const startedAt = Date.now();
    try {
      const apiPayload = {
        reference: payload.trackingNumber,
        complainant: payload.complainantName || 'Protected Complainant',
        district: payload.district || 'Punjab',
        category: payload.category || 'unspecified',
        summary: payload.summary,
        incidentDate: payload.incidentDate,
        incidentTime: payload.incidentTime,
        location: payload.locationDetails,
        isOngoing: payload.isOngoing,
        contactEmail: userEmail,
        submittedVia: 'Mehfooz Legal Protection Platform'
      };

      const response = await fetch(dept.apiEndpoint, {
        method: dept.apiMethod || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
        signal: AbortSignal.timeout(10_000) // 10s timeout
      });

      apiResult = {
        status: response.ok ? 'dispatched' : 'failed',
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

      void logApiActivity({
        endpoint: dept.apiEndpoint,
        method: dept.apiMethod || 'POST',
        targetService: 'department_api' as const,
        userId: ctx.userId ?? null,
        accessToken: ctx.accessToken ?? null,
        requestPreview: { department: deptId, departmentName: dept.name, trackingNumber: payload.trackingNumber },
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        errorMessage: apiResult.error,
        responsePreview: { department: deptId, status: response.status }
      });

      console.log(`[Mehfooz Dept API] ${dept.name} → ${response.status} (${response.ok ? 'OK' : 'FAILED'})`);
    } catch (err: any) {
      const message = err?.message || 'Department API call failed';
      apiResult = { status: 'failed', error: message };

      void logApiActivity({
        endpoint: dept.apiEndpoint,
        method: dept.apiMethod || 'POST',
        targetService: 'department_api' as const,
        userId: ctx.userId ?? null,
        accessToken: ctx.accessToken ?? null,
        requestPreview: { department: deptId, departmentName: dept.name, trackingNumber: payload.trackingNumber },
        status: 'failed',
        statusCode: 502,
        durationMs: Date.now() - startedAt,
        errorMessage: message,
        responsePreview: { error: message }
      });

      console.error(`[Mehfooz Dept API Error] ${dept.name}:`, message);
    }
  } else {
    apiResult = { status: 'not_configured' };
    void logApiActivity({
      endpoint: 'department_api',
      method: 'POST',
      targetService: 'department_api' as const,
      userId: ctx.userId ?? null,
      accessToken: ctx.accessToken ?? null,
      requestPreview: { department: deptId, departmentName: dept.name, trackingNumber: payload.trackingNumber },
      status: 'success',
      statusCode: 200,
      durationMs: 0,
      responsePreview: { notConfigured: true, message: 'No API endpoint for this department — email-only dispatch' }
    });
  }

  // ── 2. Email dispatch (always attempted) ──────────────────────────────────
  // This is imported lazily to avoid circular deps at module load time.
  const { sendComplaintEmail } = await import('./email.js');

  const emailResult = await sendComplaintEmail(payload, {
    to: dept.email,
    replyTo: userEmail,
    userId: ctx.userId,
    accessToken: ctx.accessToken,
    reason: `department_dispatch:${deptId}`
  });

  return {
    success: emailResult.status !== 'failed' || (apiResult && apiResult.status === 'dispatched'),
    email: { status: emailResult.status, messageId: emailResult.messageId, error: emailResult.error },
    api: apiResult,
    department: { id: deptId, name: dept.name, email: dept.email, apiEndpoint: dept.apiEndpoint }
  };
}
