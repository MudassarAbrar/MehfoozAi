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

interface InMemorySession {
  userId: string;
  conversationId: string;
  messages: StoredMessage[];
  updatedAt: number;
}

// In-memory fallback session store for guest users or when Supabase is not configured
const inMemorySessions = new Map<string, InMemorySession>();
const MAX_IN_MEMORY_SESSIONS = 500;

function cleanupOldSessions() {
  if (inMemorySessions.size <= MAX_IN_MEMORY_SESSIONS) return;
  const sorted = Array.from(inMemorySessions.entries()).sort(
    (a, b) => a[1].updatedAt - b[1].updatedAt
  );
  // Remove oldest 20%
  const toRemove = sorted.slice(0, Math.floor(MAX_IN_MEMORY_SESSIONS * 0.2));
  for (const [key] of toRemove) {
    inMemorySessions.delete(key);
  }
}

/** Loads the agent context: user profile, conversation, contacts. */
export async function buildAgentContext(
  userId: string,
  accessToken?: string,
  conversationId?: string
): Promise<AgentContext> {
  const userClient = accessToken ? createUserClient(accessToken) : null;
  const cfg = getAgentConfig();

  // If Supabase client is available, attempt to load from database
  if (userClient) {
    try {
      // Load user profile
      const { data: profile } = await userClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .maybeSingle();

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

      const parsedMessages: StoredMessage[] = (messages || []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        role: m.role as 'user' | 'model' | 'tool_result',
        content: m.content as string,
        functionCalls: m.function_calls,
        toolResults: m.tool_results,
        createdAt: m.created_at as string
      }));

      // Keep in-memory cache in sync
      inMemorySessions.set(convId!, {
        userId,
        conversationId: convId!,
        messages: parsedMessages,
        updatedAt: Date.now()
      });

      return {
        userId,
        userEmail: (profile as Record<string, unknown>)?.email as string || '',
        conversationId: convId!,
        messages: parsedMessages,
        emergencyContacts: (contacts || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.name as string,
          phone: c.phone as string,
          isEmergencyContact: c.is_emergency_contact as boolean
        }))
      };
    } catch (err: any) {
      console.warn('[AgentContext] Supabase query failed, falling back to session store:', err?.message);
    }
  }

  // Fallback: In-memory session store (guest users or local development)
  const convId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let session = inMemorySessions.get(convId);

  if (!session) {
    session = {
      userId: userId || 'guest',
      conversationId: convId,
      messages: [],
      updatedAt: Date.now()
    };
    inMemorySessions.set(convId, session);
    cleanupOldSessions();
  }

  return {
    userId: session.userId,
    userEmail: '',
    conversationId: convId,
    messages: [...session.messages],
    emergencyContacts: []
  };
}

/** Formats stored messages into Gemini's role-based content structure, merging adjacent same-role messages and compacting long dialogs. */
export function formatHistoryForGemini(
  messages: StoredMessage[],
  maxMessages: number
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  // If dialog exceeds 20 messages, apply compaction to retain key incident facts
  let dialogToProcess = messages;
  let compactionPrefix = '';

  if (messages.length > 20) {
    const earlyMessages = messages.slice(0, messages.length - 10);
    const recentMessages = messages.slice(messages.length - 10);

    // Extract incident facts from early turns
    const userSnippets = earlyMessages
      .filter(m => m.role === 'user')
      .map(m => m.content.slice(0, 150))
      .filter(Boolean);

    if (userSnippets.length > 0) {
      compactionPrefix = `[Prior Incident Context: User previously reported the following facts: ${userSnippets.join('; ')}]\n\n`;
    }
    dialogToProcess = recentMessages;
  } else {
    dialogToProcess = messages.slice(-maxMessages);
  }

  const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (let i = 0; i < dialogToProcess.length; i++) {
    const message = dialogToProcess[i];
    if (!message.content || !message.content.trim()) continue;
    const role: 'user' | 'model' = message.role === 'model' ? 'model' : 'user';
    const text = (i === 0 && compactionPrefix && role === 'user')
      ? `${compactionPrefix}${message.content}`
      : message.content;

    const last = formatted[formatted.length - 1];
    if (last && last.role === role) {
      last.parts.push({ text });
    } else {
      formatted.push({
        role,
        parts: [{ text }]
      });
    }
  }

  return formatted;
}

/** Saves a message to the conversation for history continuity (both Supabase and session store). */
export async function saveMessage(
  conversationId: string,
  accessToken: string | undefined,
  role: 'user' | 'model',
  content: string
): Promise<void> {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const storedMsg: StoredMessage = {
    id: messageId,
    role,
    content: content.slice(0, 10000),
    createdAt: new Date().toISOString()
  };

  // 1. Update in-memory session store
  const session = inMemorySessions.get(conversationId);
  if (session) {
    session.messages.push(storedMsg);
    session.updatedAt = Date.now();
  } else {
    inMemorySessions.set(conversationId, {
      userId: 'guest',
      conversationId,
      messages: [storedMsg],
      updatedAt: Date.now()
    });
    cleanupOldSessions();
  }

  // 2. Persist to Supabase if configured and authenticated
  if (accessToken) {
    try {
      const userClient = createUserClient(accessToken);
      if (userClient) {
        await userClient
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role,
            content: content.slice(0, 10000)
          });

        await userClient
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } catch (err: any) {
      console.warn('[AgentContext] Failed to save message to Supabase:', err?.message);
    }
  }
}

/** Updates conversation title from the first message if needed. */
export async function updateConversationTitle(
  conversationId: string,
  accessToken: string,
  firstMessage: string
): Promise<void> {
  try {
    const userClient = createUserClient(accessToken);
    if (!userClient) return;

    const words = firstMessage.trim().split(/\s+/).slice(0, 6).join(' ');
    const title = words.length > 50 ? words.slice(0, 47) + '...' : words;
    if (title) {
      await userClient
        .from('conversations')
        .update({ title, last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }
  } catch (err: any) {
    console.warn('Failed to update conversation title:', err.message);
  }
}
