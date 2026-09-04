/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent context — loads user profile, conversation history, and emergency contacts
 * from Supabase. Formats history for Gemini's role-based content structure.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createUserClient } from '../supabaseServer.js';
import { getAgentConfig } from './config.js';

export interface StoredMessage {
  id: string;
  role: 'user' | 'model' | 'tool_result';
  content: string;
  functionCalls?: unknown;
  toolResults?: unknown;
  createdAt: string;
}

export interface AgentContext {
  userId: string;
  userEmail: string;
  conversationId: string;
  messages: StoredMessage[];
  emergencyContacts: Array<{
    id: string;
    name: string;
    phone: string;
    isEmergencyContact: boolean;
  }>;
}

/** Loads the agent context: user profile, conversation, contacts. */
export async function buildAgentContext(
  userId: string,
  accessToken: string,
  conversationId?: string
): Promise<AgentContext> {
  const userClient = createUserClient(accessToken);
  if (!userClient) {
    throw new Error('Supabase backend not configured');
  }

  // Load user profile
  const { data: profile } = await userClient
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    throw new Error('User profile not found');
  }

  // Load or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv } = await userClient
      .from('conversations')
      .insert({
        user_id: userId,
        title: 'New conversation',
        language: 'en'
      })
      .select('id')
      .single();
    convId = (newConv as Record<string, unknown>)?.id as string;
  }

  // Load conversation messages
  const cfg = getAgentConfig();
  const { data: messages } = await userClient
    .from('messages')
    .select('id, role, content, function_calls, tool_results, created_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
    .limit(cfg.maxHistoryMessages);

  // Load emergency contacts
  const { data: contacts } = await userClient
    .from('emergency_contacts')
    .select('id, name, phone, is_emergency_contact')
    .eq('user_id', userId);

  return {
    userId,
    userEmail: (profile as Record<string, unknown>).email as string || '',
    conversationId: convId!,
    messages: (messages || []).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      role: m.role as 'user' | 'model' | 'tool_result',
      content: m.content as string,
      functionCalls: m.function_calls,
      toolResults: m.tool_results,
      createdAt: m.created_at as string
    })),
    emergencyContacts: (contacts || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      phone: c.phone as string,
      isEmergencyContact: c.is_emergency_contact as boolean
    }))
  };
}

/** Formats stored messages into Gemini's role-based content structure. */
export function formatHistoryForGemini(
  messages: StoredMessage[],
  maxMessages: number
): Array<{ role: string; parts: Array<{ text?: string; functionResponse?: { name: string; response: unknown } }> }> {
  return messages
    .slice(-maxMessages)
    .map(message => {
      if (message.role === 'user') {
        return {
          role: 'user',
          parts: [{ text: message.content }]
        };
      }

      if (message.role === 'model') {
        return {
          role: 'model',
          parts: [{ text: message.content }]
        };
      }

      // tool_result
      return {
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: (message.toolResults as Record<string, unknown>)?.toolName as string || 'unknown',
              response: safeParseToolResult(message.content)
            }
          }
        ]
      };
    });
}

/** Safely parses a tool result string into an object. */
function safeParseToolResult(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === 'object' && parsed !== null ? parsed : { result: content };
  } catch {
    return { result: content };
  }
}
