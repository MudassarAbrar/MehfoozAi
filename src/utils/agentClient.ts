/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent client — thin HTTP wrapper around the server-side agent endpoints.
 * Used by LegalAssistant.tsx to send queries and confirm/cancel actions.
 */

import { AgentResponse } from '../types';
import { getAuthHeaders } from './auth';

/** Sends a query to the server-side agent loop. */
export async function sendAgentMessage(
  query: string,
  language: 'en' | 'ur',
  conversationId?: string,
  clientContext?: {
    currentLocation?: { lat: number; lng: number; permissionGranted: boolean };
    selectedContactId?: string;
  }
): Promise<AgentResponse> {
  const res = await fetch('/api/orchestrate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      query,
      language,
      conversationId,
      clientContext
    })
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as Record<string, string>).error || `Agent request failed (${res.status})`
    );
  }

  return res.json() as Promise<AgentResponse>;
}

/** Confirms a pending action (SMS, email, check-in, vault, complaint draft). */
export async function confirmAgentAction(actionId: string): Promise<AgentResponse> {
  const res = await fetch('/api/orchestrate/confirm', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ actionId })
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as Record<string, string>).error || `Confirmation failed (${res.status})`
    );
  }

  return res.json() as Promise<AgentResponse>;
}

/** Cancels a pending action. */
export async function cancelAgentAction(actionId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/orchestrate/cancel', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ actionId })
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as Record<string, string>).error || `Cancel failed (${res.status})`
    );
  }

  return res.json();
}

/** Stored conversation summary returned by the server. */
export interface ConversationSummary {
  id: string;
  title: string;
  language: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

/** Stored message row returned by the server. */
export interface StoredMessage {
  id: string;
  role: 'user' | 'model' | 'tool_result';
  content: string;
  function_calls: unknown;
  tool_results: unknown;
  execution_status: string | null;
  metadata: unknown;
  created_at: string;
}

/** Loads the authenticated user's recent conversations. */
export async function loadConversations(): Promise<ConversationSummary[]> {
  const res = await fetch('/api/conversations', {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    // Silently return empty when not authenticated or Supabase unavailable.
    return [];
  }

  const body = await res.json();
  return (body.conversations || []) as ConversationSummary[];
}

/** Loads the messages for a specific conversation. */
export async function loadConversationMessages(conversationId: string): Promise<StoredMessage[]> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    return [];
  }

  const body = await res.json();
  return (body.messages || []) as StoredMessage[];
}
