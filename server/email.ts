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
      from: process.env.EMAIL_FROM || 'Mehfooz Legal Protection <no-reply@mudassirbaig.me>',
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

/** Sends a welcome & profile creation email via Resend. */
export async function sendWelcomeEmail(email: string, fullName: string): Promise<EmailDispatchResult> {
  const startedAt = Date.now();
  const to = email.trim();
  const subject = `Welcome to Mehfooz — Profile Created (${fullName})`;

  const html = `
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; color: #1c2c34;">
    <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
      <h1 style="color: #1c2c34; font-size: 22px; font-weight: bold; margin: 0;">Mehfooz (محفوظ)</h1>
      <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Safe, Legal Information &amp; Protection System for Punjab</p>
    </div>
    
    <div style="padding: 20px 0;">
      <h2 style="font-size: 16px; color: #1c2c34; margin-top: 0;">Welcome, ${escapeHtml(fullName)}!</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Your secure profile has been created. Mehfooz provides end-to-end encrypted incident logs, safe check-in routes, grounded Punjab legal guidance, and direct support directory access.
      </p>
      <div style="background-color: #ecf4f4; border: 1px solid #bcd4d4; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1c2c34;">Account Registration Summary:</p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #4b5563;">• Email: <strong>${escapeHtml(to)}</strong></p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">• Status: Active &amp; Secured with Client-Side Encryption</p>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
        If you did not request this account, please disregard this email.
      </p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
      Mehfooz • Government of Punjab Protection Framework Compliant • Emergency Police: 15
    </div>
  </div>
  `;

  const baseLog = {
    endpoint: 'resend:welcome',
    method: 'POST',
    targetService: 'resend' as const,
    userId: null,
    accessToken: null,
    requestPreview: { to, subject }
  };

  const client = getResendClient();
  if (!client) {
    const result: EmailDispatchResult = {
      success: true, status: 'simulated', messageId: `sim-welcome-${Date.now()}`, to, simulated: true
    };
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { simulated: true }
    });
    return result;
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Mehfooz Legal Protection <no-reply@mudassirbaig.me>',
      to: [to],
      subject,
      html
    });

    if (error) throw new Error(error.message);

    const result: EmailDispatchResult = {
      success: true, status: 'dispatched', messageId: data?.id || `resend-${Date.now()}`, to, simulated: false
    };
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { messageId: result.messageId }
    });
    return result;
  } catch (err: any) {
    const msg = err?.message || 'Failed to send welcome email';
    console.error('[Mehfooz Welcome Email Error]:', msg);
    const result: EmailDispatchResult = {
      success: false, status: 'failed', messageId: `err-${Date.now()}`, to, simulated: false, error: msg
    };
    void logApiActivity({
      ...baseLog, status: 'failed', statusCode: 502, durationMs: Date.now() - startedAt,
      errorMessage: msg
    });
    return result;
  }
}

/** Sends a formal Account Confirmation Email with verification action link via Resend. */
export async function sendConfirmationEmail(email: string, fullName: string, confirmUrl?: string): Promise<EmailDispatchResult> {
  const startedAt = Date.now();
  const to = email.trim();
  const subject = `[ACTION REQUIRED] Confirm Your Mehfooz Account — Email Verification`;

  const link = confirmUrl || `${process.env.VITE_APP_URL || 'https://mehfooz-legal-navigator.vercel.app'}#login`;

  const html = `
  <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; color: #1c2c34;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
      <h1 style="color: #1c2c34; font-size: 24px; font-weight: bold; margin: 0;">Mehfooz (محفوظ)</h1>
      <p style="color: #fc7454; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Account Verification Required</p>
    </div>
    
    <div style="padding: 24px 0;">
      <h2 style="font-size: 18px; color: #1c2c34; margin-top: 0;">Hello, ${escapeHtml(fullName)}!</h2>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Thank you for creating an account with <strong>Mehfooz</strong>. To activate your profile and start using end-to-end encrypted legal tools, please confirm your email address below:
      </p>
      
      <div style="text-align: center; margin: 28px 0;">
        <a href="${link}" style="display: inline-block; background-color: #1c2c34; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
          Confirm Email &amp; Activate Profile
        </a>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 12px; color: #64748b;">
        <p style="margin: 0; font-weight: bold; color: #1c2c34;">Registration Details:</p>
        <p style="margin: 4px 0 0 0;">• Email: <strong>${escapeHtml(to)}</strong></p>
        <p style="margin: 4px 0 0 0;">• Verification Status: Pending Confirmation</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
        If the button above does not work, copy and paste this verification URL into your browser:<br />
        <a href="${link}" style="color: #fc7454; word-break: break-all;">${link}</a>
      </p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
      Mehfooz • Government of Punjab Protection Framework Compliant • Emergency Police: 15
    </div>
  </div>
  `;

  const baseLog = {
    endpoint: 'resend:confirmation',
    method: 'POST',
    targetService: 'resend' as const,
    userId: null,
    accessToken: null,
    requestPreview: { to, subject }
  };

  const client = getResendClient();
  if (!client) {
    const result: EmailDispatchResult = {
      success: true, status: 'simulated', messageId: `sim-confirm-${Date.now()}`, to, simulated: true
    };
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { simulated: true }
    });
    return result;
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Mehfooz Legal Protection <no-reply@mudassirbaig.me>',
      to: [to],
      subject,
      html
    });

    if (error) throw new Error(error.message);

    const result: EmailDispatchResult = {
      success: true, status: 'dispatched', messageId: data?.id || `resend-${Date.now()}`, to, simulated: false
    };
    void logApiActivity({
      ...baseLog, status: 'success', statusCode: 200, durationMs: Date.now() - startedAt,
      responsePreview: { messageId: result.messageId }
    });
    return result;
  } catch (err: any) {
    const msg = err?.message || 'Failed to send confirmation email';
    console.error('[Mehfooz Confirmation Email Error]:', msg);
    const result: EmailDispatchResult = {
      success: false, status: 'failed', messageId: `err-${Date.now()}`, to, simulated: false, error: msg
    };
    void logApiActivity({
      ...baseLog, status: 'failed', statusCode: 502, durationMs: Date.now() - startedAt,
      errorMessage: msg
    });
    return result;
  }
}


