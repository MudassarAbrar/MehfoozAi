/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent confirmation system — manages pending actions that require user confirmation
 * before execution (SMS, email, check-in, vault save, complaint draft).
 */

import { createUserClient } from '../supabaseServer.js';
import { sendSms } from '../sms.js';
import { dispatchToDepartment, getDepartmentContact } from '../departmentRouting.js';
import { AgentToolProposal, AgentToolStatus, PendingAction } from './schemas.js';
import { AgentError } from './errors.js';

/** Creates a pending action in the database. */
export async function createPendingAction(params: {
  userId: string;
  conversationId: string;
  accessToken: string;
  toolName: string;
  arguments: Record<string, unknown>;
  displayData: Record<string, unknown>;
}): Promise<AgentToolProposal> {
  const userClient = createUserClient(params.accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const idempotencyKey = `${params.userId}:${params.toolName}:${Date.now()}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const { data, error } = await userClient
    .from('agent_pending_actions')
    .insert({
      user_id: params.userId,
      conversation_id: params.conversationId,
      tool_name: params.toolName,
      arguments: params.arguments,
      display_data: params.displayData,
      status: 'pending_confirmation',
      expires_at: expiresAt,
      idempotency_key: idempotencyKey
    })
    .select('id, tool_name, status, display_data, expires_at')
    .single();

  if (error) {
    throw new AgentError('INTERNAL_ERROR', `Failed to create pending action: ${error.message}`, 500);
  }

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    toolName: row.tool_name as string,
    safety: 'requires_confirmation',
    status: 'pending_confirmation',
    title: buildActionTitle(row.tool_name as string, params.displayData),
    description: buildActionDescription(row.tool_name as string, params.displayData),
    displayData: params.displayData as AgentToolProposal['displayData'],
    expiresAt: row.expires_at as string
  };
}

/** Confirms and executes a pending action. */
export async function confirmPendingAction(
  actionId: string,
  userId: string,
  accessToken: string
): Promise<{ result: unknown; toolName: string }> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  // Load the action
  const { data: actionData, error: loadError } = await userClient
    .from('agent_pending_actions')
    .select('*')
    .eq('id', actionId)
    .maybeSingle();

  if (loadError || !actionData) {
    throw new AgentError('RESOURCE_NOT_FOUND', 'Action not found', 404);
  }

  const action = actionData as Record<string, unknown>;

  // Ownership check
  if (action.user_id !== userId) {
    throw new AgentError('RESOURCE_NOT_OWNED', 'Access denied', 403);
  }

  // Status check
  const status = action.status as string;
  if (status === 'executed') {
    throw new AgentError('ACTION_ALREADY_EXECUTED', 'Action already executed', 409);
  }
  if (status === 'cancelled' || status === 'expired') {
    throw new AgentError('ACTION_EXPIRED', 'Action is no longer valid', 410);
  }
  if (status !== 'pending_confirmation') {
    throw new AgentError('INTERNAL_ERROR', `Invalid action status: ${status}`, 400);
  }

  // Expiry check
  const expiresAt = new Date(action.expires_at as string);
  if (expiresAt < new Date()) {
    await userClient
      .from('agent_pending_actions')
      .update({ status: 'expired' })
      .eq('id', actionId);
    throw new AgentError('ACTION_EXPIRED', 'Action has expired', 410);
  }

  // Mark as confirmed
  await userClient
    .from('agent_pending_actions')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', actionId);

  // Mark as executing
  await userClient
    .from('agent_pending_actions')
    .update({ status: 'executing' })
    .eq('id', actionId);

  // Execute the tool
  const toolName = action.tool_name as string;
  const args = action.arguments as Record<string, unknown>;

  try {
    let result: unknown;

    switch (toolName) {
      case 'prepare_complaint_draft':
        result = await executePrepareComplaintDraft(args, userId, accessToken);
        break;

      case 'save_incident_to_vault':
        result = await executeSaveIncidentToVault(args, userId, accessToken);
        break;

      case 'start_safety_checkin':
        result = await executeStartSafetyCheckin(args, userId, accessToken);
        break;

      case 'send_sms_to_contact':
        result = await executeSendSmsToContact(args, userId, accessToken);
        break;

      case 'email_complaint_to_authority':
        result = await executeEmailComplaintToAuthority(args, userId, accessToken);
        break;

      default:
        throw new AgentError('UNKNOWN_TOOL', `Unknown confirmation tool: ${toolName}`, 400);
    }

    // Mark as executed
    await userClient
      .from('agent_pending_actions')
      .update({ status: 'executed', executed_at: new Date().toISOString(), result: result as any })
      .eq('id', actionId);

    return { result, toolName };
  } catch (err: any) {
    // Mark as failed
    await userClient
      .from('agent_pending_actions')
      .update({ status: 'failed', error_message: err.message })
      .eq('id', actionId);
    throw err;
  }
}

/** Cancels a pending action. */
export async function cancelPendingAction(
  actionId: string,
  userId: string,
  accessToken: string
): Promise<void> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const { data, error } = await userClient
    .from('agent_pending_actions')
    .select('user_id, status')
    .eq('id', actionId)
    .maybeSingle();

  if (error || !data) {
    throw new AgentError('RESOURCE_NOT_FOUND', 'Action not found', 404);
  }

  const action = data as Record<string, unknown>;
  if (action.user_id !== userId) {
    throw new AgentError('RESOURCE_NOT_OWNED', 'Access denied', 403);
  }

  if (action.status !== 'pending_confirmation') {
    throw new AgentError('INTERNAL_ERROR', 'Action is no longer pending', 400);
  }

  await userClient
    .from('agent_pending_actions')
    .update({ status: 'cancelled' })
    .eq('id', actionId);
}

// =====================================================================
// Tool implementations (confirmation-required)
// =====================================================================

async function executePrepareComplaintDraft(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<unknown> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const category = typeof args.category === 'string' ? args.category : 'unspecified';
  const incidentSummary = typeof args.incident_summary === 'string' ? args.incident_summary : '';
  const district = typeof args.district === 'string' ? args.district : 'Lahore';
  const requestedSupport = typeof args.requested_support === 'string' ? args.requested_support : '';

  // Insert a draft complaint
  const { data, error } = await userClient
    .from('complaints')
    .insert({
      user_id: userId,
      status: 'draft',
      category,
      district,
      summary_plain: `${category} | ${district} | draft`
    })
    .select('id, tracking_number')
    .single();

  if (error) {
    throw new AgentError('TOOL_EXECUTION_FAILED', `Failed to create complaint draft: ${error.message}`, 500);
  }

  const row = data as Record<string, unknown>;
  return {
    success: true,
    complaintId: row.id,
    trackingNumber: row.tracking_number,
    message: 'Complaint draft created. You can review and edit it before sending.'
  };
}

async function executeSaveIncidentToVault(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<unknown> {
  // Vault saving requires client-side encryption. Return a UI action signal.
  return {
    success: true,
    uiAction: 'save_incident_to_vault',
    incidentType: args.incident_type,
    title: args.title,
    message: 'Please review and encrypt the incident on your device before saving.'
  };
}

async function executeStartSafetyCheckin(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<unknown> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const destination = typeof args.destination === 'string' ? args.destination : '';
  const durationMinutes = typeof args.duration_minutes === 'number' ? args.duration_minutes : 0;
  const contactIds = Array.isArray(args.contact_ids) ? args.contact_ids as string[] : [];

  if (!destination || !durationMinutes) {
    throw new AgentError('TOOL_ARGUMENT_INVALID', 'Destination and duration are required', 400);
  }

  // Load contacts (ownership check)
  const { data: contacts } = await userClient
    .from('emergency_contacts')
    .select('id, name, phone')
    .eq('user_id', userId)
    .in('id', contactIds);

  const contactPhones = (contacts || []).map((c: Record<string, unknown>) => ({
    id: c.id,
    name: c.name,
    phone: c.phone
  }));

  const expectedArrival = new Date(Date.now() + durationMinutes * 60000).toISOString();

  const { data, error } = await userClient
    .from('check_ins')
    .insert({
      user_id: userId,
      destination,
      expected_arrival: expectedArrival,
      grace_period_minutes: 2,
      status: 'active',
      contact_ids: contactIds,
      contact_phones: contactPhones
    })
    .select('id, expected_arrival')
    .single();

  if (error) {
    throw new AgentError('TOOL_EXECUTION_FAILED', `Failed to start check-in: ${error.message}`, 500);
  }

  const row = data as Record<string, unknown>;
  return {
    success: true,
    checkInId: row.id,
    expectedArrival: row.expected_arrival,
    message: `Safety check-in started. Expected arrival: ${new Date(row.expected_arrival as string).toLocaleString()}`
  };
}

async function executeSendSmsToContact(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<unknown> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const contactId = typeof args.contact_id === 'string' ? args.contact_id : '';
  const message = typeof args.message === 'string' ? args.message : '';
  const includeGps = typeof args.include_gps === 'boolean' ? args.include_gps : false;

  if (!contactId || !message) {
    throw new AgentError('TOOL_ARGUMENT_INVALID', 'Contact ID and message are required', 400);
  }

  // Load contact (ownership check)
  const { data: contactData } = await userClient
    .from('emergency_contacts')
    .select('id, name, phone')
    .eq('id', contactId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!contactData) {
    throw new AgentError('RESOURCE_NOT_OWNED', 'Contact not found or access denied', 404);
  }

  const contact = contactData as Record<string, unknown>;
  const phone = contact.phone as string;

  // Send SMS via Twilio
  const smsResult = await sendSms(phone, message, {
    userId,
    accessToken,
    reason: 'agent_send_sms_to_contact'
  });

  return {
    success: smsResult.success,
    messageId: smsResult.messageId,
    to: smsResult.to,
    simulated: smsResult.simulated,
    status: smsResult.status,
    message: smsResult.success
      ? `SMS sent to ${contact.name}.`
      : `Failed to send SMS: ${smsResult.error || 'Unknown error'}`
  };
}

async function executeEmailComplaintToAuthority(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<unknown> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new AgentError('INTERNAL_ERROR', 'Supabase backend not configured', 503);
  }

  const complaintId = typeof args.complaint_id === 'string' ? args.complaint_id : '';
  const channel = typeof args.department === 'string' ? args.department
    : typeof args.channel === 'string' ? args.channel
    : typeof args.requested_support === 'string' ? args.requested_support
    : 'police_support';

  if (!complaintId) {
    throw new AgentError('TOOL_ARGUMENT_INVALID', 'Complaint ID is required', 400);
  }

  // Load complaint (ownership check)
  const { data: complaintData } = await userClient
    .from('complaints')
    .select('id, tracking_number, category, district, summary_plain')
    .eq('id', complaintId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!complaintData) {
    throw new AgentError('RESOURCE_NOT_OWNED', 'Complaint not found or access denied', 404);
  }

  const complaint = complaintData as Record<string, unknown>;
  const deptContact = getDepartmentContact(channel);

  // Look up the user's email from Supabase auth metadata
  const { data: userData } = await userClient
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle();
  const userEmail = (userData as Record<string, unknown>)?.email as string || '';

  // Dispatch to the concerned department (API + email)
  const deptResult = await dispatchToDepartment(channel, {
    trackingNumber: complaint.tracking_number as string || `REF-${Date.now()}`,
    category: complaint.category as string,
    district: complaint.district as string,
    summary: complaint.summary_plain as string || ''
  }, userEmail, { userId, accessToken });

  return {
    success: deptResult.success,
    department: {
      id: deptResult.department.id,
      name: deptResult.department.name,
      email: deptResult.department.email,
      apiStatus: deptResult.api?.status || 'not_configured',
      emailStatus: deptResult.email.status
    },
    messageId: deptResult.email.messageId,
    simulated: deptResult.email.status === 'simulated',
    message: deptResult.success
      ? `Complaint dispatched to ${deptContact.name} (${deptContact.email}).${deptResult.api?.status === 'dispatched' ? ' Department API endpoint hit.' : ''}`
      : deptResult.email.status === 'simulated'
        ? `Complaint docket registered; dispatch to ${deptContact.name} simulated (live dispatch not configured).`
        : `Failed to dispatch: ${deptResult.email.error || 'Unknown error'}`
  };
}

// =====================================================================
// Helpers
// =====================================================================

function buildActionTitle(toolName: string, displayData: Record<string, unknown>): string {
  switch (toolName) {
    case 'prepare_complaint_draft':
      return 'Prepare Complaint Draft';
    case 'save_incident_to_vault':
      return 'Save Incident to Private Vault';
    case 'start_safety_checkin':
      return `Start Safety Check-In to ${displayData.destination || 'destination'}`;
    case 'send_sms_to_contact':
      return `Send SMS to ${displayData.recipient || 'contact'}`;
    case 'email_complaint_to_authority':
      return 'Email Complaint to Authority';
    default:
      return 'Confirm Action';
  }
}

function buildActionDescription(toolName: string, displayData: Record<string, unknown>): string {
  switch (toolName) {
    case 'prepare_complaint_draft':
      return `Category: ${displayData.complaintCategory || 'unspecified'}. This will create a draft complaint for your review.`;
    case 'save_incident_to_vault':
      return `Type: ${displayData.incidentType || 'incident'}. Title: ${displayData.incidentTitle || 'Untitled'}. This will save an encrypted record to your private vault.`;
    case 'start_safety_checkin':
      return `Destination: ${displayData.destination}. Duration: ${displayData.durationMinutes} minutes. Emergency contacts will be alerted if you do not confirm arrival.`;
    case 'send_sms_to_contact':
      return `To: ${displayData.recipient}. Message: "${displayData.messagePreview || ''}"`;
    case 'email_complaint_to_authority':
      return `This will email your complaint to the configured authority.`;
    default:
      return 'Please confirm this action.';
  }
}
