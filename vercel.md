# Vercel Deployment Guide — Mehfooz Legal Navigator

This document records the exact steps used to deploy this project to Vercel, the
problems encountered, and how to redeploy in the future.

## Production URLs

- **Production app:** https://mehfooz-legal-navigator.vercel.app
- **Vercel dashboard:** https://vercel.com/mudassarabrars-projects/mehfooz-legal-navigator
- **Project ID:** `prj_52iYUllwZAWPk3ZY70TPwGFuGUmi`
- **Team:** `mudassarabrars-projects` (`team_6eCbQm9IKB6FVp8rzpnB01W6`)

## Architecture on Vercel

This app is a **Vite React SPA + Express API**, originally built for a single
Node server (`server.ts` serving both static files and `/api/*` routes).
On Vercel it is split into two parts:

| Part | How it runs |
|---|---|
| React SPA (Vite build) | Static files in `dist/`, served by Vercel's CDN |
| Express API (`server.ts`) | Serverless Function via `api/index.ts` entry point |

`vercel.json` rewrites every `/api/*` request to the serverless function and
every other route to the SPA's `index.html` (client-side routing).

## Files Created/Modified for Deployment

| File | Change | Why |
|---|---|---|
| `api/index.ts` | **New** | Serverless entry point — imports and re-exports the Express `app` as the default handler |
| `vercel.json` | **New** | Build command (`npx vite build`), output dir (`dist`), rewrites `/api/(.*)` → `/api`, SPA fallback, asset caching headers |
| `server.ts` | `export const app` | The Express app must be exported so `api/index.ts` can import it |
| `server.ts` | `if (!process.env.VERCEL) startServer()` | Prevents the function from calling `app.listen()` on Vercel |
| `server.ts` | Vite import made lazy (`await import('vite')` inside dev branch) | Static import dragged Vite+Rollup native binaries into the lambda and crashed cold start with `MODULE_NOT_FOUND @rollup/rollup-linux-x64-gnu` |
| All server-side `.ts` files | `.js` extensions added to relative imports | Node ESM requires explicit extensions; TypeScript compiles to ESM here because `package.json` has `"type": "module"` and tsconfig uses `module: ESNext`. Without extensions: `ERR_UNSUPPORTED_DIR_IMPORT` |

## Step-by-Step Deployment Record

### 1. Install Vercel CLI
```powershell
npm install -g vercel
```

### 2. Login
```powershell
vercel login
```
Opens a browser device-authorization prompt (https://vercel.com/oauth/device).

### 3. Configure the project for Vercel
Created `api/index.ts`, `vercel.json`, and applied the `server.ts` changes
listed in the table above.

### 4. Deploy (first deployment)
```powershell
cd MehfoozAi
vercel --yes --name mehfooz-legal-navigator
```
> Note: the CLI derives a default project name from the folder name — this
> folder contains spaces/uppercase which Vercel rejects, so `--name` was required.

### 5. Link and pull project settings
```powershell
vercel pull          # writes .vercel/project.json + .env.development.local
```

### 6. Add environment variables (production)
Pushed every non-empty value from `.env` to Vercel's production environment:
```powershell
vercel env add GEMINI_API_KEY production        # value piped from .env
vercel env add EMAIL_FROM production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
```

### 7. Redeploy to production
```powershell
vercel --prod --yes
```

### 8. Verify
```powershell
curl https://mehfooz-legal-navigator.vercel.app/           # SPA → 200
curl https://mehfooz-legal-navigator.vercel.app/api/health # API → 200 JSON
```

## Problems Encountered (and Fixes)

### Problem 1 — `ERR_UNSUPPORTED_DIR_IMPORT`
```
Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/var/task/server' is not
supported resolving ES modules imported from /var/task/api/index.js
```
**Cause:** `api/index.ts` used `import { app } from '../server'`. The
`@vercel/node` builder compiles TypeScript with the project's tsconfig
(`module: ESNext`), keeping import specifiers verbatim. Node ESM then tried to
resolve `../server`, found the `server/` directory, and crashed. (It also can't
guess `.ts` extensions.)

**Fix:** Every relative import in the server-side tree now uses an explicit
`.js` extension (`'../server.js'`, `'./sms.js'`, `'../../src/data/legalCorpus.js'`, …).
This is the canonical ESM-with-TypeScript pattern — TS tooling maps `.js` → `.ts`
at compile time, and Node gets a real file path at runtime.

**Files touched:** `api/index.ts`, `server.ts`, `server/apiActivity.ts`,
`server/sms.ts`, `server/checkIns.ts`, `server/email.ts`,
`server/agent/runner.ts`, `server/agent/executor.ts`, `server/agent/context.ts`,
`server/agent/confirmation.ts`, `src/utils/hybridRetriever.ts`,
`src/data/legalCorpus.ts`, `src/data/supportDirectory.ts`.

### Problem 2 — `MODULE_NOT_FOUND @rollup/rollup-linux-x64-gnu`
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu … Require stack:
/var/task/node_modules/rollup/dist/native.js
```
**Cause:** `server.ts` statically imported `vite` at module scope (for the dev
middleware). The file tracer bundled Vite + Rollup into the serverless function.
Rollup loads platform-specific native binaries; the ones installed on Windows
don't match the Linux lambda.

**Fix:** The Vite import moved into a lazy `await import('vite')` inside the
dev-only branch of `startServer()` — a branch that never executes on Vercel
(`NODE_ENV=production`), so Vite stays out of the function's dependency graph.

## Local Verification (before deploying)

```powershell
npx tsc --noEmit            # type-check (verifies .js specifiers resolve)
npx vite build              # SPA build → dist/
npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs   # standalone server bundle (non-Vercel hosting)
```

## Redeploying Later

```powershell
cd MehfoozAi
vercel --prod --yes
```

## Notes

- The local dev workflow is unchanged: `npm run dev` (tsx + Vite middleware).
- The esbuild `dist/server.cjs` bundle (`npm run build && npm start`) is still
  produced for non-Vercel hosting (Cloud Run etc.) — Vercel does not use it
  (`vercel.json` runs `npx vite build` only).
- Supabase Edge Functions (`supabase/functions/check-in-monitor`) and the
  pg_cron monitor are independent of this deployment and keep running on Supabase.
- Deployment protection is off; production URL is public.
