/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Resend email dispatch for formal complaints (Prompt #2) — SERVER-SIDE ONLY.
 *
 * - Configured (RESEND_API_KEY): real email via the `resend` SDK.
 * - Not configured: honest "simulated" dispatch with a generated receipt id
 *   so the complaint flow still completes end-to-end.
 * - Every dispatch is logged to api_activity_logs (endpoint 'resend:email').
 */

import { Resend } from 'resend';
import { logApiActivity } from './apiActivity.js';

export interface EmailDispatchResult {
  success: boolean;
  status: 'dispatched' | 'simulated' | 'failed';
  messageId: string;
  to: string;
  simulated: boolean;
  error?: string;
}

export interface ComplaintEmailPayload {
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
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getComplaintRecipient(): string {
  // Explicitly configured recipients only — no hardcoded authority fallback,
  // so an unconfigured server can never email a real authority inbox.
  return (process.env.COMPLAINT_RECIPIENT_EMAIL || '').trim();
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendClient;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Formal structured complaint letter (statutory references included). */
export function buildComplaintHtml(c: ComplaintEmailPayload): string {
  return `
  <div style="font-family: 'Times New Roman', Times, serif, system-ui; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; color: #0f172a; padding: 24px;">
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px;">
      <div style="font-size: 11px; letter-spacing: 1px; color: #475569; text-transform: uppercase; font-weight: bold;">
        Government of Punjab • Punjab Safe Cities Authority (PSCA) — Official Channel Handoff
      </div>
      <h1 style="font-size: 20px; font-weight: bold; margin: 6px 0 0 0; color: #0f172a;">
        Formal Complaint Docket &amp; Protective Petition
      </h1>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; font-style: italic;">
        Submitted via the Mehfooz (محفوظ) privacy-first legal protection platform
      </p>
    </div>

    <table style="width: 100%; font-size: 13px; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
      <tr><td style="padding: 4px 12px; font-weight: bold; width: 40%; color: #334155;">Official Reference Code:</td>
          <td style="padding: 4px 12px; font-family: monospace; font-weight: bold; color: #047857;">${escapeHtml(c.trackingNumber)}</td></tr>
      <tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Filing Timestamp:</td>
          <td style="padding: 4px 12px;">${new Date().toISOString()}</td></tr>
      <tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Jurisdiction / District:</td>
          <td style="padding: 4px 12px;">${escapeHtml(c.district || 'Lahore')}, Punjab</td></tr>
      <tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Complainant:</td>
          <td style="padding: 4px 12px;">${escapeHtml(c.complainantName || 'Protected Complainant (Sec 13 PPWVA)')}</td></tr>
      <tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Incident Category:</td>
          <td style="padding: 4px 12px;">${escapeHtml(c.category || 'Unspecified')}</td></tr>
      ${c.requestedSupport ? `<tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Requested Support Channel:</td><td style="padding: 4px 12px;">${escapeHtml(c.requestedSupport)}</td></tr>` : ''}
      ${c.incidentDate ? `<tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Incident Date / Time:</td><td style="padding: 4px 12px;">${escapeHtml(c.incidentDate)}${c.incidentTime ? ` ${escapeHtml(c.incidentTime)}` : ''}</td></tr>` : ''}
      ${c.locationDetails ? `<tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Location Details:</td><td style="padding: 4px 12px;">${escapeHtml(c.locationDetails)}</td></tr>` : ''}
      <tr><td style="padding: 4px 12px; font-weight: bold; color: #334155;">Threat Assessment:</td>
          <td style="padding: 4px 12px; color: ${c.isOngoing ? '#b91c1c; font-weight: bold' : '#334155'};">
            ${c.isOngoing ? 'ONGOING RISK (Urgent Protective Action Requested)' : 'Recorded Historical Incident'}
          </td></tr>
    </table>

    <div style="margin: 20px 0;">
      <h3 style="font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 8px;">
        Statement of Facts &amp; Substantive Complaint:
      </h3>
      <div style="background-color: #fafafa; border-left: 3px solid #0f172a; padding: 12px 16px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; color: #1e293b;">${escapeHtml(c.summary)}</div>
    </div>

    <div style="margin-bottom: 20px; font-size: 12px; color: #475569; line-height: 1.5;">
      <h4 style="font-size: 12px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
        Statutory Legal Grounds:
      </h4>
      <p style="margin: 0;">
        This complaint is grounded upon the <em>Punjab Protection of Women Against Violence Act, 2016</em>,
        the <em>Protection Against Harassment of Women at the Workplace Act, 2010 (Amended 2022)</em>, and the
        <em>Prevention of Electronic Crimes Act (PECA), 2016</em>.
      </p>
    </div>

    ${c.isPasswordProtected ? `
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #065f46;">
      <strong>Security Notice:</strong> An encrypted, password-protected PDF copy is attached to the
      complainant's confirmation email. The docket summary above intentionally excludes sensitive evidence.
    </div>
    ` : ''}

    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 14px; font-size: 11px; color: #475569; line-height: 1.6;">
      <strong>Immediate 24/7 Emergency Lines in Punjab:</strong><br />
      • PSCA Police Emergency: <strong>15</strong> (Toll-Free)<br />
      • Punjab Commission on Status of Women (PCSW) Helpline: <strong>1043</strong><br />
      • Ministry of Human Rights Legal Advisory: <strong>1099</strong>
    </div>

    <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center;">
      This docket was prepared and transmitted by the Mehfooz Legal Protection System on behalf of the complainant,
      with her explicit consent. Mehfooz provides general legal information and is not formal legal representation.
    </div>
  </div>`;
}

export function buildComplaintText(c: ComplaintEmailPayload): string {
  return [
    'FORMAL COMPLAINT DOCKET',
    `Reference: ${c.trackingNumber}`,
    `Filed: ${new Date().toISOString()}`,
    `District: ${c.district || 'Lahore'}, Punjab`,
    `Complainant: ${c.complainantName || 'Protected Complainant'}`,
    `Category: ${c.category || 'Unspecified'}`,
    c.requestedSupport ? `Requested support: ${c.requestedSupport}` : '',
    `Threat assessment: ${c.isOngoing ? 'ONGOING RISK' : 'Recorded incident'}`,
    '',
    'STATEMENT OF FACTS:',
    c.summary,
    '',
    'Statutory grounds: PPWVA 2016; Workplace Harassment Act 2010 (Amended 2022); PECA 2016.',
    'Prepared and transmitted by the Mehfooz Legal Protection System with the complainant\u2019s explicit consent.'
  ].filter(Boolean).join('\n');
}

/**
 * Sends the formal complaint email. `to` defaults to the configured
 * authority recipient (COMPLAINT_RECIPIENT_EMAIL); when no recipient is
 * configured the dispatch is honestly simulated (local-only).
 */
export async function sendComplaintEmail(
  complaint: ComplaintEmailPayload,
  options: {
    to?: string;
    subjectPrefix?: string;
    replyTo?: string;
    userId?: string | null;
    accessToken?: string | null;
    reason?: string;
  } = {}
): Promise<EmailDispatchResult> {
  const startedAt = Date.now();
  const to = (options.to || getComplaintRecipient()).trim();
  const replyTo = (options.replyTo || '').trim() || undefined;
  const subject = `${options.subjectPrefix ? `${options.subjectPrefix} ` : ''}[CONFIDENTIAL DOCKET] Formal Legal Complaint Filed — Ref: ${complaint.trackingNumber}`;

  const baseLog = {
    endpoint: 'resend:email',
    method: 'POST',
    targetService: 'resend' as const,
    userId: options.userId ?? null,
    accessToken: options.accessToken ?? null,
    requestPreview: {
      to,
      replyTo: replyTo || null,
      subject,
      reason: options.reason || 'complaint_handoff',
      district: complaint.district,
      category: complaint.category,
      hasAttachment: Boolean(complaint.pdfBase64)
    }
  };

  // No recipient configured (and none passed): stay in honest simulated mode
  // rather than inventing a destination.
  if (!to) {
    const result: EmailDispatchResult = {
      success: true, status: 'simulated',
      messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to: '(unconfigured)', simulated: true
    };
    console.log(`[Mehfooz Email — SIMULATED] no recipient configured ref=${complaint.trackingNumber}`);
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { simulated: true, recipientUnconfigured: true, messageId: result.messageId }
    });
    return result;
  }

  const attachments: { filename: string; content: string }[] = [];
  if (complaint.pdfBase64) {
    const base64 = complaint.pdfBase64.includes('base64,')
      ? complaint.pdfBase64.split('base64,')[1]
      : complaint.pdfBase64;
    attachments.push({
      filename: `Mehfooz_Legal_Complaint_${complaint.trackingNumber}.pdf`,
      content: base64
    });
  }

  const client = getResendClient();
  if (!client) {
    const result: EmailDispatchResult = {
      success: true, status: 'simulated',
      messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to, simulated: true
    };
    console.log(`[Mehfooz Email — SIMULATED] to=${to} ref=${complaint.trackingNumber}`);
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { simulated: true, messageId: result.messageId }
    });
    return result;
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Mehfooz Legal Protection <onboarding@resend.dev>',
      to: [to],
      ...(replyTo ? { replyTo } : {}),
      subject,
      html: buildComplaintHtml(complaint),
      text: buildComplaintText(complaint),
      ...(attachments.length > 0 ? { attachments } : {})
    });
    if (error) {
      throw new Error(error.message || 'Resend returned an error');
    }
    const result: EmailDispatchResult = {
      success: true, status: 'dispatched', messageId: data?.id || `resend-${Date.now()}`, to, simulated: false
    };
    console.log(`[Mehfooz Email Dispatch] to=${to} ref=${complaint.trackingNumber} id=${result.messageId}`);
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { messageId: result.messageId }
    });
    return result;
  } catch (err: any) {
    const message = err?.message || 'Resend dispatch failed';
    console.error('[Mehfooz Email Dispatch Error]:', message);
    const result: EmailDispatchResult = {
      success: false, status: 'failed', messageId: `err-${Date.now()}`, to, simulated: false, error: message
    };
    void logApiActivity({
      ...baseLog, status: 'failed', statusCode: 502, durationMs: Date.now() - startedAt,
      errorMessage: message, responsePreview: { error: message }
    });
    return result;
  }
}
