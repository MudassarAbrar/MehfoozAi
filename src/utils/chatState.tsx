/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Chat State Context — M.3–M.9
 *
 * Persists the AI Assistant conversation across component mount/unmount cycles.
 * The LegalAssistant component reads from and writes to this context so that
 * navigating away (tab switch, voice mode, other features) and returning does
 * NOT destroy the active conversation.
 *
 * A new conversation is created ONLY when the user explicitly clicks "New Chat".
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { LegalQueryResponse, AgentResponse } from '../types';
import type { ConversationSummary } from './agentClient';

// ── Shared Message type (used by LegalAssistant + this context) ──────────────

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  location?: string;
  photos?: string[];
  responsePayload?: LegalQueryResponse;
  agentResponse?: AgentResponse;
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface ChatStateContextValue {
  /** The active conversation messages. */
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

  /** Server-side conversation ID (null = new unsaved conversation). */
  currentConversationId: string | null;
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>;

  /** List of saved conversations for the history sidebar. */
  conversationList: ConversationSummary[];
  setConversationList: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;

  /** Reset to a fresh conversation (explicit "New Chat" action). */
  resetConversation: (welcomeMessage: ChatMessage) => void;
}

const ChatStateContext = createContext<ChatStateContextValue | null>(null);

// ── Provider (mounted once at App level) ──────────────────────────────────────

export function ChatStateProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationList, setConversationList] = useState<ConversationSummary[]>([]);

  const resetConversation = useCallback((welcomeMessage: ChatMessage) => {
    setCurrentConversationId(null);
    setMessages([welcomeMessage]);
  }, []);

  return (
    <ChatStateContext.Provider value={{
      messages,
      setMessages,
      currentConversationId,
      setCurrentConversationId,
      conversationList,
      setConversationList,
      resetConversation
    }}>
      {children}
    </ChatStateContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChatState(): ChatStateContextValue {
  const ctx = useContext(ChatStateContext);
  if (!ctx) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return ctx;
}
