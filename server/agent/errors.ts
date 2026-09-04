/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent error normalization — maps various error types to structured error codes.
 */

export type AgentErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_INPUT'
  | 'UNKNOWN_TOOL'
  | 'TOOL_ARGUMENT_INVALID'
  | 'CONFIRMATION_REQUIRED'
  | 'ACTION_EXPIRED'
  | 'ACTION_ALREADY_EXECUTED'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_NOT_OWNED'
  | 'RATE_LIMITED'
  | 'GEMINI_UNAVAILABLE'
  | 'TOOL_EXECUTION_FAILED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';

export class AgentError extends Error {
  code: AgentErrorCode;
  statusCode: number;

  constructor(code: AgentErrorCode, message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AgentError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Normalizes an unknown error into a structured AgentError. */
export function normalizeAgentError(err: unknown): AgentError {
  if (err instanceof AgentError) return err;

  if (err instanceof Error) {
    const message = err.message;

    // Timeout detection
    if (message.includes('timeout') || message.includes('Timeout')) {
      return new AgentError('TIMEOUT', 'The request timed out. Please try again.', 504);
    }

    // Gemini API errors
    if (message.includes('API key') || message.includes('apiKey')) {
      return new AgentError('GEMINI_UNAVAILABLE', 'AI service is not configured.', 503);
    }

    // Generic tool execution failure
    if (message.includes('tool') || message.includes('execution')) {
      return new AgentError('TOOL_EXECUTION_FAILED', message, 500);
    }

    return new AgentError('INTERNAL_ERROR', message, 500);
  }

  return new AgentError('INTERNAL_ERROR', 'An unexpected error occurred.', 500);
}

/** Returns a safe error response object for the client. */
export function toErrorResponse(err: AgentError): {
  code: string;
  message: string;
  statusCode: number;
} {
  return {
    code: err.code,
    message: err.message,
    statusCode: err.statusCode
  };
}
