/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unified Conversation Storage Engine
 *
 * Persists Legal AI conversations and message trajectories across page reloads,
 * navigation switches, and app restarts.
 *
 * Scoping & Security:
 * - Scoped strictly by user ID (or 'demo' for Demo Mode, 'guest' for Guest Mode).
 * - Enforces a maximum limit of 20 conversations per user.
 * - Saves complete ChatMessage objects (user text, assistant responses, timestamps,
 *   photos, citations, and grounded payloads).
 */

import { ChatMessage } from './chatState';
import { ConversationSummary, loadConversations as loadServerConversations, loadConversationMessages as loadServerMessages } from './agentClient';
import { getStoredProfile } from './auth';

const CONVERSATIONS_KEY_PREFIX = 'mehfooz_conversations_v2_';
const MESSAGES_KEY_PREFIX = 'mehfooz_messages_v2_';
const MAX_CONVERSATIONS = 20;

/** Determines the storage partition for the current user session. */
export function getStorageScope(userId?: string | null): string {
  if (userId === 'demo-user-1') return 'demo';
  if (userId) return userId;
  const profile = getStoredProfile();
  if (profile?.id === 'demo-user-1') return 'demo';
  if (profile?.id) return profile.id;
  return 'guest';
}

/** Synchronously reads local conversation summaries for the active user scope. */
export function loadLocalConversations(userId?: string | null): ConversationSummary[] {
  const scope = getStorageScope(userId);
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY_PREFIX + scope);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as ConversationSummary[]) : [];
  } catch {
    return [];
  }
}

/** Synchronously persists local conversation summaries for the active user scope (max 20). */
export function saveLocalConversations(userId: string | null | undefined, list: ConversationSummary[]): void {
  const scope = getStorageScope(userId);
  try {
    const trimmed = list.slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(CONVERSATIONS_KEY_PREFIX + scope, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save conversations to local storage:', err);
  }
}

/** Synchronously reads local messages for a given conversation. */
export function loadLocalMessages(userId: string | null | undefined, conversationId: string): ChatMessage[] {
  const scope = getStorageScope(userId);
  try {
    const raw = localStorage.getItem(`${MESSAGES_KEY_PREFIX}${scope}_${conversationId}`);
    if (!raw) return [];
    const msgs = JSON.parse(raw);
    return Array.isArray(msgs) ? (msgs as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

/** Synchronously persists local messages for a given conversation. */
export function saveLocalMessages(userId: string | null | undefined, conversationId: string, messages: ChatMessage[]): void {
  const scope = getStorageScope(userId);
  try {
    localStorage.setItem(`${MESSAGES_KEY_PREFIX}${scope}_${conversationId}`, JSON.stringify(messages));
  } catch (err) {
    console.warn('Failed to save messages to local storage:', err);
  }
}

/** Removes a conversation and its messages from local storage. */
export function deleteLocalConversation(userId: string | null | undefined, conversationId: string): void {
  const scope = getStorageScope(userId);
  try {
    const current = loadLocalConversations(userId);
    const updated = current.filter(c => c.id !== conversationId);
    saveLocalConversations(userId, updated);
    localStorage.removeItem(`${MESSAGES_KEY_PREFIX}${scope}_${conversationId}`);
  } catch (err) {
    console.warn('Failed to delete local conversation:', err);
  }
}

/**
 * Loads conversation summaries for the current user.
 * Merges local storage entries with server API responses if available.
 */
export async function getConversations(userId?: string | null): Promise<ConversationSummary[]> {
  const localList = loadLocalConversations(userId);

  try {
    const serverList = await loadServerConversations();
    if (serverList && serverList.length > 0) {
      // Merge server and local lists, preferring server items when IDs match
      const mergedMap = new Map<string, ConversationSummary>();
      for (const item of localList) {
        mergedMap.set(item.id, item);
      }
      for (const item of serverList) {
        mergedMap.set(item.id, item);
      }
      const merged = Array.from(mergedMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
        .slice(0, MAX_CONVERSATIONS);

      saveLocalConversations(userId, merged);
      return merged;
    }
  } catch {
    /* Use local fallback */
  }

  return localList;
}

/**
 * Loads messages for a conversation ID.
 * Tries local storage first (full rich ChatMessage objects), falling back to server.
 */
export async function getConversationMessages(
  userId: string | null | undefined,
  conversationId: string
): Promise<ChatMessage[]> {
  const localMsgs = loadLocalMessages(userId, conversationId);
  if (localMsgs.length > 0) {
    return localMsgs;
  }

  try {
    const serverMsgs = await loadServerMessages(conversationId);
    if (serverMsgs && serverMsgs.length > 0) {
      const mapped: ChatMessage[] = serverMsgs
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({
          id: `msg-${m.id}`,
          sender: m.role === 'user' ? 'user' : 'assistant',
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: m.content || ''
        }));
      if (mapped.length > 0) {
        saveLocalMessages(userId, conversationId, mapped);
        return mapped;
      }
    }
  } catch {
    /* Ignore error */
  }

  return [];
}

/**
 * Generates a clean display title from a message string.
 */
export function generateConversationTitle(firstQuery: string, defaultTitle: string = 'Legal Inquiry'): string {
  const clean = firstQuery.replace(/^\[Location:[^\]]+\]\s*/i, '').trim();
  if (!clean) return defaultTitle;
  if (clean.length <= 42) return clean;
  return clean.substring(0, 40) + '…';
}

/**
 * Helper to update or create a conversation and its messages in storage.
 */
export function persistConversationUpdate(
  userId: string | null | undefined,
  conversationId: string,
  messages: ChatMessage[],
  language: 'en' | 'ur',
  existingTitle?: string
): ConversationSummary {
  // Save messages
  saveLocalMessages(userId, conversationId, messages);

  // Find first user query for title if not provided
  const firstUserMsg = messages.find(m => m.sender === 'user');
  const title = existingTitle || (firstUserMsg ? generateConversationTitle(firstUserMsg.text) : (language === 'ur' ? 'قانونی رہنمائی' : 'Legal Inquiry'));

  const lastMsg = messages[messages.length - 1];
  const nowIso = new Date().toISOString();

  const currentList = loadLocalConversations(userId);
  const existingIdx = currentList.findIndex(c => c.id === conversationId);

  const updatedSummary: ConversationSummary = {
    id: conversationId,
    title,
    language,
    message_count: messages.length,
    last_message_at: nowIso,
    created_at: existingIdx >= 0 ? currentList[existingIdx].created_at : nowIso
  };

  let newList: ConversationSummary[];
  if (existingIdx >= 0) {
    newList = [...currentList];
    newList[existingIdx] = updatedSummary;
  } else {
    newList = [updatedSummary, ...currentList];
  }

  // Sort by last_message_at descending & limit to 20
  newList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  if (newList.length > MAX_CONVERSATIONS) {
    const removed = newList.slice(MAX_CONVERSATIONS);
    const scope = getStorageScope(userId);
    removed.forEach(r => {
      try { localStorage.removeItem(`${MESSAGES_KEY_PREFIX}${scope}_${r.id}`); } catch {}
    });
    newList = newList.slice(0, MAX_CONVERSATIONS);
  }

  saveLocalConversations(userId, newList);
  return updatedSummary;
}
