---
kind: logging_system
name: Console-Only Logging with API Activity Tracking Middleware
category: logging_system
scope:
    - '**'
source_files:
    - MehfoozAi/server.ts
---

## What system/approach is used

The repository has **no dedicated logging framework** (no Winston, Pino, Morgan, Bunyan, or similar). Server-side output is produced exclusively via Node's built-in `console` methods (`console.log`, `console.warn`, `console.error`) directly inside route handlers and middleware in `server.ts`. There is no structured logger, no log-level configuration, no log rotation, and no centralized log sink.

The only structured "logging" facility is an Express middleware called `apiActivityTracker` (imported from `./server/apiActivity.js`), which is mounted on the `/api/` prefix. Its purpose — as documented by the inline comment at line 129 of `server.ts` — is to record real-time API activity into a Supabase table named `public.api_activity_logs`. This is application-level audit/activity tracking rather than operational logging; it persists request metadata for observability but does not emit logs to stdout/stderr.

## Key files and packages

- `MehfoozAi/server.ts` — The single Express entry point that contains all route handlers and emits every `console.*` call in this codebase. It also mounts the `apiActivityTracker` middleware under `/api/`.
- `MehfoozAi/server/apiActivity.ts` (referenced as `./server/apiActivity.js` in imports) — Provides `apiActivityTracker` and `logApiActivity`; responsible for writing API activity records to Supabase.
- No other files in the project import or reference any logging library.

## Architecture and conventions

- **Ad-hoc console calls per handler**: Each route handler uses `console.warn` for recoverable failures (e.g., agent loop fallback, Gemini model call failure) and `console.error` for unrecoverable errors (e.g., channel recommendation error, complaint-handoff error, unhandled server error). Success state is logged once at startup via `console.log` announcing the port.
- **No global error handler**: While there is a catch block emitting `console.error('Unhandled server error:', err.message)` near the end of `server.ts`, there is no Express `app.use((err, req, res, next) => ...)` global error middleware shown in the visible portion of the file.
- **Structured fields are response-bound, not log-bound**: Errors returned to clients follow a consistent shape `{ error, code }` (e.g., `INVALID_QUERY`, `AI_RATE_LIMIT_EXCEEDED`, `SUPABASE_NOT_CONFIGURED`), but these structured fields exist only in HTTP responses, not in log lines.
- **API activity persistence is separate from console logging**: The `apiActivityTracker` middleware runs before routes and writes to `public.api_activity_logs` in Supabase. Console logs and this activity tracker are independent channels — one goes to the process stdout, the other to the database.

## Conventions and constraints

Observed patterns in this codebase:
- All server-side diagnostics go through `console.warn` (recoverable issues) or `console.error` (fatal/unexpected issues); there is no `console.debug` usage and no conditional debug flag.
- Log messages include contextual identifiers such as the failing model name (`Model ${modelName} call failed...`), the endpoint path (via the surrounding middleware), and the error message extracted from the thrown object.
- There is no log level filtering, no environment-based log verbosity toggle, and no structured JSON log format — outputs are plain text strings concatenated with Node's default `console` formatting.
- Application-level audit data (API activity) is persisted via the `apiActivityTracker` middleware rather than written to log files; this is the only place where request/response context is captured systematically.

Constraints enforced by the code:
- Because no logging framework is imported anywhere outside `server.ts`, adding structured logging would require either introducing a new dependency or extending the existing `apiActivityTracker` module.
- The absence of a global Express error handler means uncaught exceptions in route handlers will surface as raw stack traces via `console.error` only if they bubble up to the top-level catch block; otherwise they may terminate the request without a structured log.