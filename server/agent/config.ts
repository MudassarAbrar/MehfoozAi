/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent configuration — centralized Gemini model and safety limits.
 * Reads env vars lazily (never at module scope) to avoid ESM init-order issues.
 */

export interface AgentConfig {
  apiKey: string | null;
  primaryModel: string;
  fallbackModels: string[];
  maxIterations: number;
  timeoutMs: number;
  maxToolCalls: number;
  maxHistoryMessages: number;
}

let cachedConfig: AgentConfig | null = null;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

export function getAgentConfig(): AgentConfig {
  if (cachedConfig) return cachedConfig;

  const apiKey = process.env.GEMINI_API_KEY || null;
  const primaryModel = process.env.GEMINI_AGENT_MODEL || 'gemini-3.1-flash-lite';
  const fallbackRaw = process.env.GEMINI_FALLBACK_MODELS || '';
  const fallbackModels = fallbackRaw
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  cachedConfig = {
    apiKey,
    primaryModel,
    fallbackModels,
    maxIterations: parsePositiveInt(process.env.GEMINI_AGENT_MAX_ITERATIONS, 4),
    timeoutMs: parsePositiveInt(process.env.GEMINI_AGENT_TIMEOUT_MS, 30000),
    maxToolCalls: parsePositiveInt(process.env.GEMINI_AGENT_MAX_TOOL_CALLS, 8),
    maxHistoryMessages: parsePositiveInt(process.env.GEMINI_AGENT_MAX_HISTORY_MESSAGES, 30),
  };

  return cachedConfig;
}

/** Returns true when the agent can attempt a Gemini call (key present). */
export function isAgentAvailable(): boolean {
  return Boolean(getAgentConfig().apiKey);
}

/** All candidate models in priority order (primary + fallbacks). */
export function getModelChain(): string[] {
  const cfg = getAgentConfig();
  return [cfg.primaryModel, ...cfg.fallbackModels];
}
