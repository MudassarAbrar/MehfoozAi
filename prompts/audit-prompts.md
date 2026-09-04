---

# Mehfooz (محفوظ) — Full App Audit Report

## What Your App Does

**Mehfooz** is a **privacy-first, bilingual (English/Urdu) women's safety and legal navigation app** for Punjab, Pakistan. It provides:

| Feature | Description |
|---|---|
| **AI Legal Assistant (RAG)** | Gemini-powered legal Q&A grounded in 31 Punjab laws, with hybrid embedding retrieval (60% semantic + 40% keyword) and deterministic offline fallback |
| **Zero-Knowledge Incident Vault** | AES-GCM-256 encrypted incident records with photos/notes — server only stores ciphertext |
| **Complaint Builder & Official Handoff** | Guided complaint drafting with AI channel recommendation, PDF export, and email dispatch to authorities (PSCA/FIA/Ombudsperson) |
| **Silent Check-In Engine** | Monitored journey sessions with pg_cron + Edge Function backup, automatic SMS alerts to emergency contacts on missed check-ins |
| **Crisis SOS** | One-tap SMS burst to emergency contacts with GPS coordinates and battery level |
| **Stealth Weather Cover** | App disguises as a weather app; PIN-verified unlock; Esc key instant exit |
| **Support Directory** | Offline-cached Punjab-wide directory of helplines, shelters, legal aid, and cyber crime wings |
| **Safe Navigation** | Route safety scoring with well-lit %, CCTV coverage, police post proximity |
| **Community Updates & Alerts** | Crowd-sourced safety reports with clustering, confidence scoring, and spam filtering |
| **PWA** | Installable, offline-capable with Workbox service worker caching |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  React SPA (Vite + Tailwind CSS v4 + motion)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Legal    │ │ Vault    │ │Complaint │ │ Check-In │  │
│  │Assistant │ │(AES-GCM) │ │ Builder  │ │ Monitor  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │            │              │        │
│  ┌────▼─────────────▼────────────▼──────────────▼────┐  │
│  │  orchestrator.ts (intent classifier + RAG client) │  │
│  │  auth.ts (dual-mode: Supabase / localStorage)     │  │
│  │  dataService.ts (encrypted persistence layer)     │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ fetch('/api/*')
┌──────────────────────────┼──────────────────────────────┐
│  Express Server (server.ts)                             │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │ /api/orchestrate → Gemini RAG (hybrid retriever)  │  │
│  │ /api/recommend-channel → Gemini channel classifier│  │
│  │ /api/complaint-handoff → Resend email + Supabase  │  │
│  │ /api/check-in/* → pg_cron monitored sessions      │  │
│  │ /api/crisis-alert → Twilio SMS burst              │  │
│  └───────────────────────────────────────────────────┘  │
│  Security: helmet + rate-limit + input sanitization     │
│  Auth: supabaseAuthOptional / requireSupabaseAuth (JWT) │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌──────▼─────┐    ┌──────▼─────┐
   │ Supabase │    │  Twilio    │    │  Resend    │
   │ (PG+RLS) │    │  (SMS)     │    │  (Email)   │
   └──────────┘    └────────────┘    └────────────┘
```

**Dual-mode architecture**: Every subsystem (auth, data, email, SMS) has a **configured path** (Supabase/Twilio/Resend) and a **fallback path** (localStorage/simulated). The app works fully offline with deterministic legal Q&A.

---

## Critical Issues (MUST FIX)

### 1. XSS Vulnerability in Email HTML Builder
**Location**: [server.ts#L609-L687](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L609-L687)

**Problem**: The `sendComplaintFilingEmail` function (local helper, line 583) interpolates user-supplied data (`params.summary`, `params.complainantName`, `params.district`, etc.) directly into HTML **without any escaping**. An attacker could inject malicious scripts via complaint fields. Compare with [email.ts#L61-L64](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server/email.ts#L61-L64) which properly uses `escapeHtml()`.

**Fix**: Either use the `buildComplaintHtml()` from `email.ts` (which escapes all values) or add `escapeHtml()` calls to the local function. The local `sendComplaintFilingEmail` should be removed and replaced with the properly-secured `sendComplaintEmail` from `email.ts`.

### 2. Hardcoded Personal Email as Default Recipient
**Location**: [server.ts#L749](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L749) and [server.ts#L793](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L793)

**Problem**: `String(complaintData.userEmail || req.body.userEmail || 'mudassarabrarr@gmail.com')` — when no user email is provided, complaint emails (potentially containing sensitive incident details) are sent to a hardcoded personal email address. This is a **data leak** and privacy violation.

**Fix**: Remove the hardcoded fallback. Return a 400 error if no recipient email is available, or use only `getComplaintRecipient()` from `email.ts`.

### 3. Malformed SMTP_PASS in .env
**Location**: [.env#L16](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/.env#L16)

**Problem**: `SMTP_PASS=[REDACTED_RESEND_KEY]SMTP_HOST` — the value has `SMTP_HOST` concatenated at the end, making the SMTP password invalid. All email dispatch via SMTP will fail silently (falls back to stream transport).

**Fix**: Correct the value to `[REDACTED_RESEND_KEY]` (or regenerate the Resend API key).

### 4. `initializeAuth()` Never Called on App Startup
**Location**: [App.tsx#L40-L82](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/App.tsx#L40-L82)

**Problem**: The `initializeAuth()` function from `auth.ts` (which restores Supabase sessions or legacy localStorage sessions) is **never called**. The app always starts with a hardcoded demo profile (`Fatima Noor` / `demo-user-1`). Authenticated users will lose their session on page refresh.

**Fix**: Add a `useEffect` in `App.tsx` that calls `initializeAuth()` on mount and sets the `user` state from its return value.

### 5. Content Security Policy Disabled
**Location**: [server.ts#L36](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L36)

**Problem**: `contentSecurityPolicy: false` — CSP is completely disabled. For a women's safety app handling sensitive legal data, this is a significant XSS attack surface. The comment says "Allows Vite dev hot bundle" but this should be re-enabled in production.

**Fix**: Add a conditional CSP: disable only in development, enable a strict policy in production (allow `self`, `fonts.googleapis.com`, `fonts.gstatic.com`).

---

## Warnings (SHOULD FIX)

### 6. Duplicate `vite` in package.json
**Location**: [package.json#L18](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/package.json#L18) and [package.json#L42](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/package.json#L42)

**Problem**: `vite` is listed in both `dependencies` and `devDependencies`. It should only be in `devDependencies`.

### 7. Hardcoded Year in Tracking Numbers
**Location**: [server.ts#L746](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L746)

**Problem**: `PSCA-${districtCode}-2026-${randomSuffix}` — the year `2026` is hardcoded. After January 1, 2027, tracking numbers will show the wrong year.

**Fix**: Use `new Date().getFullYear()`.

### 8. Two Separate Email Sending Code Paths
**Location**: [server.ts#L583-L730](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L583-L730) vs [email.ts#L165-L254](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server/email.ts#L165-L254)

**Problem**: `/api/mock-handoff` and `/api/complaints/send-email` use the local `sendComplaintFilingEmail` (with XSS vulnerability and nodemailer), while `/api/complaint-handoff` uses `sendComplaintEmail` from `email.ts` (with proper escaping and Resend). This creates inconsistent behavior and maintenance burden.

**Fix**: Consolidate to a single email dispatch path using `email.ts`.

### 9. Legacy Password Hashing Uses Static Salt
**Location**: [auth.ts#L88](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/utils/auth.ts#L88)

**Problem**: `crypto.subtle.digest('SHA-256', enc.encode(password + '_mehfooz_salt_2026'))` — all legacy-mode users share the same salt. This makes rainbow table attacks feasible if the localStorage data is ever exfiltrated.

**Fix**: Generate a per-user random salt (like the Supabase mode does for PINs).

### 10. Guest Mode Backdoor PINs
**Location**: [auth.ts#L404](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/utils/auth.ts#L404)

**Problem**: `return pin === '1234' || pin === '0000'` — hardcoded PINs bypass stealth unlock in guest mode. For a safety app, predictable unlock codes are dangerous.

### 11. Package Name Not Updated
**Location**: [package.json#L2](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/package.json#L2)

**Problem**: `"name": "react-example"` — still the template default.

### 12. Port Hardcoded Without Env Override
**Location**: [server.ts#L28](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L28)

**Problem**: `const PORT = 3000;` — no `process.env.PORT` override. Deployment platforms (Cloud Run, Railway) typically inject PORT via environment.

**Fix**: `const PORT = Number(process.env.PORT) || 3000;`

### 13. SMS Rate Limiter is In-Memory Only
**Location**: [sms.ts#L53](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server/sms.ts#L53)

**Problem**: `const rateBuckets = new Map()` — resets on server restart and doesn't work across multiple instances. In a safety app, rate limit bypass could lead to SMS spam to contacts.

### 14. `user-scalable=no` Blocks Accessibility
**Location**: [index.html#L5](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/index.html#L5)

**Problem**: `maximum-scale=1.0, user-scalable=no` prevents users from zooming. This is a WCAG 2.1 violation (Success Criterion 1.4.4 Resize Text) and particularly harmful for a safety app used by elderly or visually-impaired women.

---

## Suggestions (CONSIDER)

### 15. Deprecated `substr()` Usage
**Location**: [orchestrator.ts#L104](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/utils/orchestrator.ts#L104) (and several other places)

**Problem**: `String.prototype.substr()` is deprecated. Use `substring()` or `slice()`.

### 16. `APP_URL` Placeholder Not Replaced
**Location**: [.env#L9](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/.env#L9)

**Problem**: `APP_URL="MY_APP_URL"` — still has the placeholder value.

### 17. Missing `lastLoginAt` in UserProfile Type
**Location**: [types.ts#L411](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/types.ts#L411)

**Problem**: `lastLoginAt: string` is required in the type but the demo profile in `App.tsx` (line 80) doesn't provide it. TypeScript allows it because the object literal is passed through `useState` initializer, but it creates an incomplete profile.

### 18. Cross-Device Decryption Limitation
**Location**: [dataService.ts#L33-L44](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/src/utils/dataService.ts#L33-L44)

**Problem**: Each device generates its own vault key (`mehfooz_device_vault_key_v1`), so records encrypted on one device cannot be decrypted on another. This is documented but could confuse users who switch devices. Consider showing a clear warning in the UI.

### 19. No Error Boundary
The React app has no error boundary component. An unhandled render error will crash the entire app with a white screen — particularly problematic for a safety app.

### 20. Hardcoded `from` Email Domain
**Location**: [server.ts#L606](file:///c:/Users/User/Desktop/MEHFOOZAI%20HACKATHON%20FINAL/MehfoozAi/server.ts#L606)

**Problem**: `no-reply@mehfooz.pk` — the domain `mehfooz.pk` is used as default but may not have SPF/DKIM configured, causing emails to land in spam.

---

## Summary of Changes

- **Mehfooz** is a well-architected women's safety app with a dual-mode persistence engine (Supabase + localStorage fallback), AES-GCM-256 zero-knowledge vault, hybrid RAG legal retrieval, and comprehensive safety features (check-in monitoring, SOS, stealth mode).
- **TypeScript compilation passes with zero errors** — the codebase is type-safe.
- **The most critical issues** are: (1) XSS vulnerability in the local email builder, (2) hardcoded personal email as fallback recipient, (3) malformed SMTP password, (4) `initializeAuth()` never called so sessions don't persist across refreshes, and (5) CSP disabled entirely.
- **The architecture is solid** — graceful degradation, rate limiting, input sanitization, and RLS-aware Supabase integration are all well-implemented. The issues above are fixable without structural changes.
- **Security posture is good but has gaps** — the static salt for legacy passwords, guest backdoor PINs, and disabled CSP should be addressed before any production deployment.