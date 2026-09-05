---
kind: configuration_system
name: Environment-Driven Configuration with Feature Toggles and Fallback Modes
category: configuration_system
scope:
    - '**'
source_files:
    - MehfoozAi/server.ts
    - MehfoozAi/src/utils/supabase.ts
    - MehfoozAi/src/utils/hybridRetriever.ts
    - MehfoozAi/package.json
---

## What system/approach is used

The application uses a minimal, environment-variable-driven configuration approach built on `dotenv` (loaded at server startup in `server.ts`) combined with Vite's `import.meta.env` for client-side build-time variables. There is no centralized config file format (no `.env.*`, `.yaml`, `.toml`, or JSON config). Instead, each external integration reads its own required keys directly from the process environment, and missing keys trigger graceful fallback behavior rather than hard failures.

## Key files and packages

- **`MehfoozAi/server.ts`** — single entry point that calls `dotenv.config()` at line 31, reads `PORT`, `NODE_ENV`, `GEMINI_API_KEY`, `VERCEL`, and `COMPLAINT_RECIPIENT_EMAIL`; wires Express, rate limits, helmet, routes, and startup logic.
- **`MehfoozAi/src/utils/supabase.ts`** — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via `import.meta.env` to lazily create a Supabase browser client; exposes `isSupabaseConfigured()`, `getSupabase()`, and `requireSupabase()`.
- **`MehfoozAi/src/utils/hybridRetriever.ts`** — holds retrieval-mode constants (`EMBEDDING_WEIGHT = 0.6`, `KEYWORD_WEIGHT = 0.4`, `EMBEDDING_MODEL = 'gemini-embedding-2'`) and provides `initializeEmbeddings()` / `areEmbeddingsReady()` / `getRetrieverStatus()` so the rest of the app can query whether vector search is active.
- **`MehfoozAi/package.json`** — defines scripts: `dev` runs `tsx server.ts`, `build` runs `vite build && esbuild server.ts --bundle ... --outfile=dist/server.cjs`, `start` runs `node dist/server.cjs`. The production bundle excludes dev-only dependencies (Vite) via `--packages=external`.
- **`MehfoozAi/server/email.ts`**, **`MehfoozAi/server/sms.ts`**, **`MehfoozAi/server/agent/config.js`** — referenced by `server.ts` via `isEmailConfigured()`, `isSmsConfigured()`, `isAgentAvailable()` to expose feature flags for email dispatch, SMS dispatch, and the agent loop.

## Architecture and conventions

### Environment variable loading
- `dotenv.config()` is called once at the top of `server.ts` before any route or middleware runs. All runtime secrets are expected in a `.env` file co-located with the server.
- Client-side build-time variables use Vite's `import.meta.env` prefixed with `VITE_` (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). These are baked into the SPA bundle at `vite build` time.
- `process.env.NODE_ENV` controls two things: (1) Helmet's Content Security Policy is fully enforced when `production`, relaxed otherwise; (2) Vite is only imported lazily inside `startServer()` when not in production, keeping the production bundle free of Vite/Rollup.

### Feature-flag pattern (capability detection)
Instead of boolean flags read from a config store, the server detects capability at runtime:
- **Gemini AI**: `getGeminiClient()` returns `null` if `GEMINI_API_KEY` is absent; every LLM-dependent endpoint checks this and returns `{ fallback: true, message: '...' }` instead of erroring.
- **Supabase auth**: `isSupabaseServerConfigured()` / `isSupabaseConfigured()` return booleans; endpoints guard with `supabaseAuthOptional` vs `requireSupabaseAuth` middleware.
- **Email/SMS**: `isEmailConfigured()` / `isSmsConfigured()` let the complaint handoff flow proceed in "simulated" mode when credentials are missing.
- **Hybrid retriever**: `initializeEmbeddings()` is invoked at startup only when Gemini is available; `areEmbeddingsReady()` and `getRetrieverStatus()` report readiness to callers.

### Fallback-first design
Every optional integration has a deterministic local fallback:
- Missing `GEMINI_API_KEY` → deterministic rule engine in `getDeterministicChannelRecommendation()` and keyword-only legal corpus search.
- Missing Supabase → localStorage-based auth/data fallback documented in `src/utils/supabase.ts`.
- Missing email/SMS → simulated dispatch logged but not fatal.

### Runtime configuration exposure
- `/api/health` reports the status of every integration (`gemini`, `supabase`, `twilioSms`, `resendEmail`, `hybridRetriever`) plus `hasGeminiKey`, allowing operators to verify configuration without reading logs.
- `/api/security-status` documents active protections (rate limits, headers, sanitization).

### Conventions and constraints
- **No config schema/validation**: environment variables are read as raw strings/numbers with `Number(process.env.PORT) || 3000` defaults. There is no zod/joi validation of env shape.
- **Secrets live only in process.env**: there is no secret manager, vault, or encrypted config file — `GEMINI_API_KEY`, Supabase keys, Resend/Twilio credentials are expected as plain environment variables loaded by dotenv.
- **Build-time vs runtime split**: anything consumed by the SPA must be prefixed `VITE_` and set at build time; everything consumed by the Express server is read from `process.env` at runtime.
- **Production deployment gate**: `if (!process.env.VERCEL)` guards `startServer()`, so the same `dist/server.cjs` can run both locally and on Vercel serverless without crashing.
- **Single port convention**: `PORT` defaults to `3000`; the server binds `0.0.0.0` so container orchestrators can override via environment.
- **Feature toggles are functions, not flags**: consumers call `isAgentAvailable()`, `isEmailConfigured()`, `isSmsConfigured()`, `areEmbeddingsReady()` rather than reading a shared config object.