# MEHFOOZ — STRICT TECHNICAL REMEDIATION PROMPT

You are working on the existing **Mehfooz (محفوظ)** application.

Your task is to remediate **all issues identified in the provided full application audit**.

## NON-NEGOTIABLE RULES

1. **DO NOT redesign the application.**
2. **DO NOT add new functionality.**
3. **DO NOT remove existing functionality unless the audit explicitly requires removing duplicate/insecure implementation.**
4. **DO NOT change the existing product behavior unnecessarily.**
5. **DO NOT replace the current architecture with another architecture.**
6. **DO NOT migrate frameworks, databases, authentication providers, or infrastructure.**
7. **DO NOT introduce new dependencies unless absolutely required to fix one of the listed issues.**
8. **DO NOT change the UI/UX except where explicitly required by an audit finding.**
9. **DO NOT modify the existing legal/RAG logic, vault behavior, SOS/check-in functionality, complaint workflow, directory, navigation, or PWA behavior unless required to resolve one of the listed issues.**
10. Preserve the existing **Supabase + localStorage dual-mode architecture**.
11. Preserve the existing **configured integrations and their fallbacks**.
12. Make the **smallest safe changes necessary**.
13. Do not "improve" unrelated code while making these fixes.
14. Do not silently change business logic.
15. Do not invent requirements that are not present in this prompt.
16. Every modification must have a direct relationship to one of the issues below.
17. Before modifying anything, inspect the relevant existing implementation and understand how it is currently connected.
18. After each group of changes, verify that existing functionality has not been broken.
19. TypeScript must continue to compile successfully.
20. The final result must remain production-safe and must not introduce new security vulnerabilities.

---

# APPLICATION CONTEXT

Mehfooz is a privacy-first, bilingual English/Urdu women's safety and legal navigation application.

Existing major functionality includes:

- AI Legal Assistant using Gemini-powered RAG
- Hybrid semantic + keyword legal retrieval
- Deterministic offline legal fallback
- Zero-Knowledge Incident Vault
- AES-GCM-256 encrypted incident records
- Complaint Builder
- Official complaint handoff
- PDF complaint export
- Email dispatch
- Silent Check-In Engine
- Automatic SMS alerts
- Crisis SOS
- GPS-based emergency alerts
- Stealth Weather Cover
- PIN-verified unlock
- Support Directory
- Offline directory caching
- Safe Navigation
- Community Updates & Alerts
- PWA/offline capability

Existing architecture:

```text
React SPA
    |
    ├── Legal Assistant
    ├── Vault
    ├── Complaint Builder
    └── Check-In Monitor
            |
            v
    orchestrator.ts
    auth.ts
    dataService.ts
            |
            v
       Express Server
            |
            ├── /api/orchestrate
            ├── /api/recommend-channel
            ├── /api/complaint-handoff
            ├── /api/check-in/*
            └── /api/crisis-alert
            |
            ├── Supabase
            ├── Twilio
            └── Resend
```

The existing architecture and feature set are considered fundamentally sound. Fix the identified gaps without restructuring the application.

---

# PRIORITY 1 — CRITICAL SECURITY AND FUNCTIONALITY FIXES

## 1. FIX XSS IN COMPLAINT EMAIL HTML BUILDER

### Location

`server.ts`

Approximately:

```text
server.ts#L609-L687
```

The local `sendComplaintFilingEmail` implementation interpolates user-controlled values directly into HTML.

Potentially affected values include:

- complaint summary
- complainant name
- district
- other complaint fields

This is an XSS/security issue.

There is already a safer implementation in:

```text
server/email.ts
```

which uses `escapeHtml()`.

### Required fix

Do NOT create another HTML escaping implementation if the existing secure implementation can be reused.

Prefer:

- reuse the existing `buildComplaintHtml()`
- reuse the existing secure `sendComplaintEmail()`
- remove the insecure duplicate email-building path where appropriate

All user-controlled values included in generated HTML must be safely escaped.

### Important

Do not change the visual/content structure of the complaint email unless necessary.

The goal is:

```text
user input
    ↓
safe HTML escaping
    ↓
existing email template
    ↓
email provider
```

NOT:

```text
user input
    ↓
raw HTML interpolation
```

Verify that every complaint field entering generated HTML is handled safely.

---

# 2. REMOVE HARDCODED PERSONAL EMAIL FALLBACK

### Location

`server.ts`

Approximately:

```text
server.ts#L749
server.ts#L793
```

Current behavior includes a hardcoded personal email fallback similar to:

```ts
String(
  complaintData.userEmail ||
  req.body.userEmail ||
  'mudassarabrarr@gmail.com'
)
```

This is unacceptable because sensitive complaint/incident information can be sent to a personal email address without the user explicitly specifying it.

### Required fix

Remove the hardcoded personal email completely.

Do NOT replace it with another arbitrary email address.

Use the application's existing configured recipient logic from `email.ts`, specifically:

```text
getComplaintRecipient()
```

If no valid recipient can be determined:

- fail safely
- return an appropriate `400` response
- provide an appropriate error message
- do not send the complaint

The application must never silently send sensitive complaint information to an arbitrary hardcoded personal email.

---

# 3. FIX MALFORMED SMTP_PASS

### Location

`.env`

Approximately:

```text
.env#L16
```

The current value has:

```text
SMTP_PASS=[REDACTED_RESEND_KEY]SMTP_HOST
```

The `SMTP_HOST` text has accidentally been concatenated into the password.

### Required fix

Correct the malformed configuration so the SMTP password value does not contain:

```text
SMTP_HOST
```

The audit identifies the intended value as:

```text
[REDACTED_RESEND_KEY]
```

However, **do not expose, log, print, commit, or hardcode credentials anywhere else**.

If the existing credential should instead be regenerated for security reasons, use the regenerated value in the local environment configuration.

### Important

Do not expose the credential in:

- source code
- console logs
- error responses
- Git
- client-side code
- generated files

Check `.gitignore` and ensure environment secrets remain ignored.

---

# 4. INITIALIZE AUTHENTICATION ON APP STARTUP

### Location

`src/App.tsx`

Approximately:

```text
App.tsx#L40-L82
```

The existing `initializeAuth()` function in:

```text
src/utils/auth.ts
```

is not being called when the application starts.

The application currently initializes using a hardcoded demo profile such as:

```text
Fatima Noor
demo-user-1
```

This means authenticated sessions can be lost after a page refresh.

### Required fix

Add the minimum necessary startup initialization logic.

On application mount:

1. call `initializeAuth()`
2. retrieve the existing authenticated/legacy session
3. update the existing `user` state
4. preserve the existing authentication architecture
5. preserve Supabase authentication
6. preserve legacy localStorage fallback behavior

Do not replace the existing auth implementation.

Do not create a second authentication system.

Do not change login/signup behavior unless required.

The startup sequence should conceptually be:

```text
App starts
   ↓
initializeAuth()
   ↓
restore existing session
   ↓
set user state
   ↓
render application
```

Avoid briefly overwriting a real authenticated user with the demo profile.

The demo profile must not override a valid restored session.

---

# 5. RE-ENABLE CONTENT SECURITY POLICY IN PRODUCTION

### Location

`server.ts`

Approximately:

```text
server.ts#L36
```

Current Helmet configuration disables CSP:

```ts
contentSecurityPolicy: false
```

This creates unnecessary XSS exposure.

### Required fix

Keep development compatibility if necessary, but enable CSP in production.

The intended behavior is:

```text
development
    → allow existing Vite development requirements

production
    → enable strict CSP
```

The policy must allow the resources actually required by the existing application.

The audit specifically identifies allowing:

- `self`
- `fonts.googleapis.com`
- `fonts.gstatic.com`

Do not blindly add:

```text
*
```

Do not allow arbitrary scripts.

Do not weaken the CSP merely to make an error disappear.

Verify the existing application still loads correctly in production after enabling CSP.

---

# PRIORITY 2 — IMPORTANT MAINTENANCE / SECURITY FIXES

# 6. REMOVE DUPLICATE VITE DEPENDENCY

### Location

`package.json`

`vite` currently exists in both:

```text
dependencies
```

and:

```text
devDependencies
```

### Required fix

Keep `vite` only in:

```text
devDependencies
```

Do not change unrelated dependency versions.

Do not perform a dependency upgrade.

Do not regenerate the entire dependency tree unless necessary.

---

# 7. REMOVE HARDCODED 2026 FROM TRACKING NUMBERS

### Location

`server.ts`

Approximately:

```text
server.ts#L746
```

Current tracking number logic contains:

```text
PSCA-${districtCode}-2026-${randomSuffix}
```

### Required fix

Replace the hardcoded year with the current year.

Use equivalent logic to:

```ts
new Date().getFullYear()
```

Preserve the existing tracking number format.

Do not change the tracking number structure beyond replacing the hardcoded year.

---

# 8. CONSOLIDATE DUPLICATE EMAIL SENDING PATHS

There are currently two email implementation paths.

### Path A

`server.ts`

Approximately:

```text
server.ts#L583-L730
```

Uses:

```text
sendComplaintFilingEmail
```

and Nodemailer.

### Path B

`server/email.ts`

Approximately:

```text
email.ts#L165-L254
```

Uses:

```text
sendComplaintEmail
```

and the existing secure email implementation.

### Problem

This creates:

- duplicate functionality
- inconsistent behavior
- duplicate maintenance
- different security properties
- XSS exposure in one path

### Required fix

Consolidate complaint email sending around the existing secure implementation in:

```text
server/email.ts
```

The existing secure email path should become the single source of truth.

Update:

```text
/api/mock-handoff
/api/complaints/send-email
/api/complaint-handoff
```

as necessary so they use the same secure complaint email implementation.

Do not change the external behavior of the endpoints unnecessarily.

Do not remove an endpoint merely because its implementation is duplicated.

Keep existing endpoint contracts unless changing them is required for the security fix.

---

# 9. FIX LEGACY PASSWORD HASHING STATIC SALT

### Location

`src/utils/auth.ts`

Approximately:

```text
auth.ts#L88
```

Current legacy hashing uses a shared static salt similar to:

```ts
crypto.subtle.digest(
  'SHA-256',
  enc.encode(password + '_mehfooz_salt_2026')
)
```

All legacy users effectively use the same salt.

### Required fix

Use a unique random salt per user.

The implementation must:

1. generate a cryptographically secure random salt
2. associate the salt with the user
3. store the salt alongside the legacy credential data
4. use the same salt when verifying that user's password
5. preserve existing legacy-mode authentication functionality

Do not change the Supabase authentication mechanism.

Do not break existing users unnecessarily.

If existing legacy credentials do not contain a salt, preserve compatibility carefully while ensuring newly created credentials use per-user random salts.

Do not invent an unrelated password-storage architecture.

---

# 10. REMOVE GUEST MODE BACKDOOR PINs

### Location

`src/utils/auth.ts`

Approximately:

```text
auth.ts#L404
```

Current behavior accepts hardcoded PINs similar to:

```ts
pin === '1234' || pin === '0000'
```

These must not bypass stealth unlock.

### Required fix

Remove hardcoded universal guest PIN bypasses.

Guest-mode PIN validation must use the application's actual intended PIN mechanism.

Do not add a new authentication mechanism.

Do not create another universal fallback PIN.

Do not replace `1234` with another predictable PIN.

Ensure the stealth unlock behavior still works using the existing legitimate PIN flow.

---

# 11. UPDATE PACKAGE NAME

### Location

`package.json`

Current:

```json
"name": "react-example"
```

### Required fix

Change the package name from the template/default name to the appropriate existing Mehfooz application package name.

Use a valid npm package naming format.

Do not change unrelated package metadata.

---

# 12. MAKE SERVER PORT ENVIRONMENT-CONFIGURABLE

### Location

`server.ts`

Current:

```ts
const PORT = 3000;
```

### Required fix

Use the environment-provided port when available while preserving `3000` as the local fallback.

Equivalent behavior:

```ts
const PORT = Number(process.env.PORT) || 3000;
```

Do not introduce another configuration system.

---

# 13. ADDRESS SMS RATE LIMITER BEING IN-MEMORY ONLY

### Location

`server/sms.ts`

Approximately:

```text
sms.ts#L53
```

Current implementation uses:

```ts
const rateBuckets = new Map()
```

This resets when the server restarts and does not coordinate across multiple instances.

### Required fix

Address the rate-limiting weakness **without redesigning the SMS system**.

The protection must not depend solely on process-local memory for production deployments.

Prefer using an existing persistent application infrastructure if one is already available.

Do not introduce a new database, Redis instance, or external service unless absolutely necessary and directly required to fix this issue.

Do not change Twilio integration.

Do not change SMS message content.

Do not change legitimate SOS behavior.

Do not make the rate limiter so aggressive that legitimate safety alerts are blocked.

The goal is specifically to prevent trivial SMS rate-limit bypass through:

- process restart
- multiple server instances

while preserving legitimate emergency alert functionality.

---

# 14. RESTORE ACCESSIBILITY BY REMOVING `user-scalable=no`

### Location

`index.html`

Approximately:

```text
index.html#L5
```

Current viewport configuration includes:

```text
maximum-scale=1.0
user-scalable=no
```

This prevents user zooming.

### Required fix

Allow users to zoom.

Remove the restriction that disables user scaling.

Do not otherwise redesign the responsive layout.

Do not change viewport dimensions unnecessarily.

Do not add accessibility features unrelated to this finding.

---

# PRIORITY 3 — LOWER-PRIORITY CODE / PRODUCT CLARITY FIXES

# 15. REPLACE DEPRECATED `substr()`

### Location

`src/utils/orchestrator.ts`

Approximately:

```text
orchestrator.ts#L104
```

There are also other occurrences.

### Required fix

Find all relevant uses of:

```ts
substr()
```

Replace them with equivalent modern behavior using:

```ts
substring()
```

or:

```ts
slice()
```

Choose the replacement that preserves the **exact existing behavior**.

Do not alter string-processing logic.

Do not perform unrelated refactoring.

---

# 16. FIX `APP_URL` PLACEHOLDER

### Location

`.env`

Approximately:

```text
.env#L9
```

Current value:

```text
APP_URL="MY_APP_URL"
```

### Required fix

Do not invent a production domain.

Do not guess the deployment URL.

Replace the placeholder only if an existing authoritative application URL is already available in the project's configuration.

If no actual URL exists in the project, handle the configuration safely without inventing one.

Do not introduce fake URLs.

Do not hardcode a domain based on assumptions.

---

# 17. FIX `UserProfile.lastLoginAt` TYPE/PROFILE MISMATCH

### Location

`src/types.ts`

Approximately:

```text
types.ts#L411
```

The type requires:

```ts
lastLoginAt: string
```

but the demo profile in `App.tsx` does not provide it.

### Required fix

Make the existing profile conform correctly to the existing type.

Do not weaken the type merely to hide the error unless the field is genuinely optional throughout the existing application.

Prefer supplying the correct existing value if the field is required.

Do not change unrelated profile fields.

Do not introduce fake timestamps unless required for the existing demo profile behavior.

---

# 18. HANDLE CROSS-DEVICE VAULT DECRYPTION LIMITATION

### Location

`src/utils/dataService.ts`

Approximately:

```text
dataService.ts#L33-L44
```

Each device generates its own vault key:

```text
mehfooz_device_vault_key_v1
```

Therefore, encrypted records created on one device cannot be decrypted on another device.

### IMPORTANT

Do NOT redesign the encryption architecture.

Do NOT introduce cloud key storage.

Do NOT weaken encryption.

Do NOT remove encryption.

Do NOT implement cross-device synchronization.

The audit only requests clearer user communication.

### Required fix

Add a clear warning/information message in the existing relevant UI explaining that the vault is device-specific and records encrypted on one device cannot currently be decrypted on another device.

Use the existing UI structure and styling.

Do not add unrelated functionality.

---

# 19. ADD A REACT ERROR BOUNDARY

### Problem

The application currently has no React error boundary.

An unhandled render error can result in a blank/white screen.

### Required fix

Add a minimal React error boundary around the application.

The boundary should:

1. catch render errors
2. prevent the entire UI from becoming an unexplained blank screen
3. display a safe fallback UI
4. provide a way to recover/reload using the existing browser/application flow

Do not create a full error-monitoring platform.

Do not add external telemetry.

Do not send sensitive user data anywhere.

Do not redesign the application.

The fallback should be minimal and consistent with the existing application.

---

# 20. REMOVE/CONFIGURE HARDCODED EMAIL `from` DOMAIN

### Location

`server.ts`

Approximately:

```text
server.ts#L606
```

Current sender:

```text
no-reply@mehfooz.pk
```

The issue is that this domain may not have appropriate SPF/DKIM configuration.

### Required fix

Do not blindly invent a new domain.

Do not introduce an unrelated email provider.

Use the application's existing email configuration if it already defines a configurable sender.

The sender address should come from configuration where possible.

If the existing configuration already provides a verified sender, use that.

Do not expose secrets.

Do not modify unrelated email behavior.

---

# SECURITY REQUIREMENTS DURING IMPLEMENTATION

While implementing these fixes, specifically inspect for the following within the affected code paths:

## Input handling

User-controlled values must not be:

- directly interpolated into HTML
- executed as JavaScript
- inserted into unsafe DOM contexts
- logged if they contain sensitive incident information

## Authentication

Verify:

- startup session restoration
- Supabase session behavior
- legacy localStorage behavior
- PIN verification
- no universal guest bypass
- no accidental demo-user override

## Secrets

Verify that:

- API keys remain server-side
- SMTP credentials remain server-side
- Twilio credentials remain server-side
- environment secrets are not committed
- credentials are not exposed through API responses
- credentials are not logged

## Email

Verify:

- one secure complaint email implementation
- HTML escaping
- no hardcoded personal recipient
- configured recipient behavior
- configured sender behavior
- existing Resend/SMTP behavior remains functional

## CSP

Verify production CSP does not:

- permit arbitrary scripts
- use wildcard script sources unnecessarily
- break the existing production application

## SMS

Verify:

- existing SOS behavior remains functional
- legitimate alerts are not accidentally blocked
- rate limiting cannot trivially be bypassed by process restart/multiple instances

---

# DO NOT CHANGE THESE EXISTING FEATURES

Unless directly required by one of the 20 fixes above, leave these untouched:

### Legal Assistant

Do not change:

- RAG retrieval
- legal dataset
- embeddings
- semantic retrieval
- keyword retrieval
- retrieval weighting
- Gemini integration
- deterministic offline fallback

### Incident Vault

Do not change:

- AES-GCM-256
- encryption behavior
- encrypted storage format
- device key model
- vault data structure

Only add the requested cross-device limitation explanation.

### Complaint System

Do not change:

- complaint creation flow
- complaint content
- complaint generation logic
- official channels
- PDF behavior
- tracking-number structure

Only fix the listed security/configuration/email issues.

### Check-In Engine

Do not redesign:

- monitored journeys
- pg_cron
- Edge Function backup
- missed check-in behavior

### Crisis SOS

Do not redesign:

- emergency contacts
- GPS handling
- battery information
- SMS burst behavior
- Twilio integration

Only fix the listed rate-limit issue if it directly applies.

### Stealth Mode

Do not redesign:

- weather disguise
- PIN unlock UI
- Esc key behavior

Only remove the hardcoded universal guest PIN bypass.

### Directory

Do not modify directory data or functionality.

### Safe Navigation

Do not modify route scoring.

### Community Updates

Do not modify clustering, confidence scoring, or spam filtering.

### PWA

Do not change service-worker architecture unless one of the listed issues requires it.

---

# IMPLEMENTATION PROCESS

Follow this exact workflow.

## STEP 1 — Inspect

Before making changes:

- inspect `server.ts`
- inspect `server/email.ts`
- inspect `server/sms.ts`
- inspect `src/App.tsx`
- inspect `src/utils/auth.ts`
- inspect `src/utils/dataService.ts`
- inspect `src/utils/orchestrator.ts`
- inspect `src/types.ts`
- inspect `package.json`
- inspect `index.html`
- inspect `.env`
- inspect `.gitignore`
- inspect relevant existing tests/configuration

Do not assume the audit's approximate line numbers are still exact.

Locate the actual current implementations first.

---

# STEP 2 — Create a FIX MATRIX

Before editing, internally map every issue:

| # | Issue | File | Required Change |
|---|---|---|---|
| 1 | Email XSS | server.ts/email.ts | Secure escaping / consolidate |
| 2 | Personal email fallback | server.ts | Remove hardcoded recipient |
| 3 | Malformed SMTP_PASS | .env | Correct configuration |
| 4 | Auth initialization | App.tsx/auth.ts | Restore session on startup |
| 5 | CSP disabled | server.ts | Enable production CSP |
| 6 | Duplicate Vite | package.json | Keep devDependency |
| 7 | Hardcoded year | server.ts | Dynamic current year |
| 8 | Duplicate email paths | server.ts/email.ts | Single secure path |
| 9 | Static password salt | auth.ts | Per-user random salt |
| 10 | Guest PIN backdoors | auth.ts | Remove bypass |
| 11 | Package name | package.json | Correct application name |
| 12 | Hardcoded port | server.ts | ENV override |
| 13 | In-memory SMS limiter | sms.ts | Persistent/multi-instance-safe protection |
| 14 | Zoom disabled | index.html | Allow scaling |
| 15 | Deprecated substr | orchestrator.ts/etc. | Equivalent modern method |
| 16 | APP_URL placeholder | .env | Use authoritative config only |
| 17 | lastLoginAt mismatch | types.ts/App.tsx | Correct type/profile consistency |
| 18 | Cross-device vault | dataService/UI | Clear warning only |
| 19 | No Error Boundary | React app | Minimal boundary |
| 20 | Hardcoded sender | server.ts | Configured sender |

Do not mark an item complete unless it has actually been fixed and verified.

---

# STEP 3 — IMPLEMENT MINIMAL CHANGES

Implement only the required modifications.

Prefer:

```text
small targeted patch
```

over:

```text
large refactor
```

Avoid changing multiple unrelated files for convenience.

If an existing secure helper already exists, reuse it instead of creating another implementation.

---

# STEP 4 — VERIFY SECURITY

After implementation, specifically test:

### Complaint email

Test malicious values such as:

```html
<script>alert('xss')</script>
```

and:

```html
<img src=x onerror=alert(1)>
```

Verify they are treated as text and cannot execute.

### Recipient

Test complaint submission without a recipient.

Expected:

```text
400 / safe failure
```

NOT:

```text
send to hardcoded email
```

### Authentication

Test:

```text
login
→ refresh page
→ session remains
```

Test both configured authentication and legacy fallback where applicable.

### Guest PIN

Verify:

```text
1234
0000
```

cannot universally bypass the intended PIN validation.

### CSP

Verify production application loads under CSP.

### SMS

Verify legitimate SOS still works while excessive repeated requests are rate-limited.

### Accessibility

Verify browser/device zoom is no longer explicitly disabled.

---

# STEP 5 — TYPECHECK

Run the existing TypeScript/type-check command.

The result must remain:

```text
0 TypeScript errors
```

Do not suppress errors using:

```ts
any
```

or:

```ts
@ts-ignore
```

unless there is an existing justified use that must remain.

Do not hide new errors.

---

# STEP 6 — BUILD

Run the existing production build.

Confirm:

- build succeeds
- no broken imports
- no missing environment configuration causing build failure
- no CSP-related obvious production breakage
- no TypeScript errors

---

# STEP 7 — VERIFY EXISTING FUNCTIONALITY

Perform regression verification for the affected areas:

```text
Application startup
Authentication
Guest mode
Stealth unlock
Complaint generation
Complaint email
Mock handoff
Complaint handoff
Tracking number generation
SMS/SOS
Vault
PWA startup
Production build
```

Do not rewrite unrelated functionality.

---

# ENVIRONMENT AND SECRET HANDLING

For `.env`:

- fix malformed configuration
- never expose credentials in source code
- never commit secrets
- never print secrets in logs
- never put secrets in frontend/client-side environment variables
- preserve `.gitignore`

If an actual production `APP_URL` is unavailable, do not invent one.

If a credential appears invalid or compromised, prefer regeneration rather than exposing or duplicating it.

---

# FINAL ACCEPTANCE CRITERIA

The remediation is complete only when ALL of the following are true:

## Critical

- [ ] Complaint email HTML is safely escaped.
- [ ] Insecure duplicate email builder is removed/replaced.
- [ ] No hardcoded personal complaint recipient exists.
- [ ] SMTP configuration is corrected.
- [ ] `initializeAuth()` executes during application startup.
- [ ] Existing sessions survive page refresh.
- [ ] Production CSP is enabled.
- [ ] CSP does not unnecessarily allow arbitrary scripts.

## Important

- [ ] Duplicate Vite dependency removed.
- [ ] Tracking number uses current year.
- [ ] All complaint email endpoints use the secure email path.
- [ ] Legacy passwords use per-user random salts for new credentials.
- [ ] Guest backdoor PINs removed.
- [ ] Package name no longer says `react-example`.
- [ ] Server port supports `process.env.PORT`.
- [ ] SMS rate limiting is not solely process-local for production.
- [ ] Browser zoom is not disabled.

## Code Quality / Reliability

- [ ] Deprecated `substr()` usage addressed.
- [ ] `APP_URL` placeholder is not blindly used as a real URL.
- [ ] `UserProfile.lastLoginAt` is consistent with actual profiles.
- [ ] Cross-device vault limitation is clearly communicated.
- [ ] React error boundary exists.
- [ ] Email sender uses appropriate existing configuration.

## Regression

- [ ] TypeScript passes with zero errors.
- [ ] Production build succeeds.
- [ ] Existing authentication remains functional.
- [ ] Existing legal assistant remains functional.
- [ ] Existing vault remains functional.
- [ ] Existing complaint flow remains functional.
- [ ] Existing SMS/SOS remains functional.
- [ ] Existing stealth mode remains functional.
- [ ] Existing PWA behavior remains functional.
- [ ] No unrelated features were changed.

---

# FINAL RESPONSE REQUIREMENT

After completing the work, report exactly:

## CHANGED

List every file modified and what was changed.

## FIXED ISSUES

List all 20 audit issues and mark each:

```text
FIXED
```

or:

```text
NOT FIXED — reason
```

Do not claim an issue is fixed unless it was actually verified.

## VERIFICATION

Report:

- TypeScript result
- production build result
- relevant security tests
- authentication/session verification
- email verification
- SMS/rate-limit verification
- any remaining limitation

## FILES NOT MODIFIED

Explicitly list important files you inspected but did not modify where relevant.

## IMPORTANT

Do not report unrelated improvements.

Do not claim new functionality was added.

Do not hide failures.

Do not say "everything is fixed" if any acceptance criterion remains incomplete.

The goal is **strict remediation of the supplied audit — nothing more, nothing less — while keeping Mehfooz working exactly as it currently does wherever the audit does not require a change.**