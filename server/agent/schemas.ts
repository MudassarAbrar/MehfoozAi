/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent TypeScript schemas — shared types for the agent loop, tool proposals,
 * and API responses. Avoids `any` where practical.
 */

export type AgentResponseType =
  | 'final'
  | 'confirmation_required'
  | 'ui_action'
  | 'error';

export type AgentToolSafety =
  | 'read_only'
  | 'ui_only'
  | 'requires_confirmation';

export type AgentToolStatus =
  | 'proposed'
  | 'pending_confirmation'
  | 'confirmed'
  | 'executing'
  | 'executed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface AgentToolProposal {
  id: string;
  toolName: string;
  safety: AgentToolSafety;
  status: AgentToolStatus;
  title: string;
  description: string;
  displayData: {
    recipient?: string;
    messagePreview?: string;
    destination?: string;
    durationMinutes?: number;
    complaintCategory?: string;
    incidentType?: string;
    incidentTitle?: string;
  };
  expiresAt?: string;
}

export interface AgentStep {
  id: string;
  toolName?: string;
  label: string;
  status: 'active' | 'completed' | 'waiting' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface AgentCitation {
  sourceId: string;
  title: string;
  statute?: string;
  section?: string;
  summary: string;
}

export interface AgentResponse {
  type: AgentResponseType;
  conversationId: string;
  runId: string;
  text?: string;
  citations?: AgentCitation[];
  pendingActions?: AgentToolProposal[];
  uiActions?: Array<{
    action: string;
    payload?: Record<string, unknown>;
  }>;
  steps?: AgentStep[];
  error?: {
    code: string;
    message: string;
  };
  modelUsed?: string;
  isAiGenerated?: boolean;
}

export interface AgentInput {
  userId: string;
  accessToken: string;
  conversationId?: string;
  query: string;
  language: 'en' | 'ur';
  clientContext?: {
    currentLocation?: {
      lat: number;
      lng: number;
      permissionGranted: boolean;
    };
    selectedContactId?: string;
  };
}

export interface AgentOutput {
  type: AgentResponseType;
  text?: string;
  citations?: AgentCitation[];
  pendingActions?: AgentToolProposal[];
  uiActions?: Array<{
    action: string;
    payload?: Record<string, unknown>;
  }>;
  steps?: AgentStep[];
  conversationId: string;
  runId: string;
  modelUsed?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PendingAction {
  id: string;
  userId: string;
  conversationId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  displayData: Record<string, unknown>;
  status: AgentToolStatus;
  createdAt: string;
  expiresAt: string;
  idempotencyKey: string;
}
