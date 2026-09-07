# MEHFOOZ — ISSUE-BY-ISSUE ACCEPTANCE CRITERIA

## PURPOSE

Use this document to verify the remediation work.

A fix is **NOT considered complete** merely because code was changed.

Every issue must satisfy its acceptance criteria through:

1. code inspection
2. automated tests where practical
3. manual verification where required
4. production-like API testing where applicable
5. regression testing

For every issue, report:

```text
Issue:
Status: PASS / FAIL / PARTIAL
What changed:
How it was tested:
Evidence:
Regression impact:
Remaining limitation:
```

Never mark an issue PASS based only on static code inspection if runtime testing is required.

---

# P0 — CRITICAL SECURITY ACCEPTANCE CRITERIA

---

## ISSUE 1 — Logged Out But API Requests Still Succeed

### Acceptance criteria

- After logout, the frontend authentication state becomes unauthenticated.
- Supabase session is actually signed out.
- Protected polling stops.
- New protected API requests do not carry a valid authenticated session.
- Backend rejects protected requests after logout.
- No protected user data is returned after logout.
- Reloading the page after logout does not restore the previous authenticated user.
- Logging in again restores access normally.

### Required test

```text
Login
→ access protected API
→ logout
→ call protected API
→ expected 401
→ reload
→ expected login screen
```

### PASS only if

There is no state where:

```text
UI = logged out
AND
backend = authenticated
```

---

# ISSUE 2 — Real Logout

### Acceptance criteria

Logout must:

- call the existing Supabase sign-out mechanism
- clear application auth state
- stop protected polling
- clear appropriate client auth state
- redirect appropriately
- prevent protected API access
- not delete unrelated user data
- not accidentally delete the Supabase account

### PASS test

Login → logout → refresh → login required.

---

# ISSUE 3 — Polling Stops After Logout

### Acceptance criteria

Every authentication-dependent polling mechanism is identified.

After logout:

- intervals are cleared
- timers are cleared
- subscriptions are cleaned up
- pending protected requests are safely ignored/aborted where practical
- polling does not restart automatically
- logout does not trigger another authenticated poll

### PASS test

Use browser/network logs:

```text
Before logout:
poll requests occur

After logout:
no authenticated polling continues
```

---

# ISSUE 4 — Server-Side Authentication

### Acceptance criteria

Protected endpoints do not trust:

- localStorage
- React state
- `userId` supplied by client
- `isAdmin`
- `authenticated=true`
- frontend route guards

A valid server-verifiable authentication token is required.

### PASS test

Call protected endpoint:

```text
without token → 401
invalid token → 401
valid token → allowed
```

---

# ISSUE 5 — Supabase Client Exposure

### Acceptance criteria

Client bundle may contain only intentionally public Supabase configuration.

It must NOT contain:

- service-role key
- database password
- server secret
- Gemini secret
- Twilio secret
- Resend secret
- JWT signing secret
- private encryption key

### PASS test

Inspect:

```text
.env*
dist/
production JS bundles
source maps
```

Search for secret identifiers and known secret values.

No server secret may be recoverable from the production client bundle.

---

# ISSUE 6 — Supabase Origin/CORS Safety

### Acceptance criteria

- Production backend CORS allows only intended origins.
- Development remains functional.
- Unknown browser origins cannot use browser CORS to access protected APIs.
- CORS is NOT being treated as the primary authorization mechanism.
- Supabase RLS remains the actual data-access boundary.

### PASS test

Test API from:

```text
production origin → allowed
development origin → allowed where configured
unapproved origin → browser access blocked
```

Do not mark PASS merely because an OPTIONS request is rejected; verify the complete behavior.

---

# ISSUE 7 — Supabase RLS

### Acceptance criteria

For every private/user-owned table:

- SELECT is ownership protected.
- INSERT cannot assign another user as owner.
- UPDATE cannot modify another user's record.
- DELETE cannot delete another user's record.
- anonymous users cannot access private data.

### PASS test

Create:

```text
User A
User B
```

Attempt:

```text
A → B's record
B → A's record
anonymous → private record
```

All unauthorized operations must fail.

---

# ISSUE 8 — Privilege Escalation

### Acceptance criteria

An ordinary user cannot become:

- admin
- super-admin
- moderator
- staff
- organization administrator

by changing:

- request body
- localStorage
- profile fields
- role
- isAdmin
- metadata
- API parameters

### PASS test

Attempt:

```json
{
  "role": "admin",
  "isAdmin": true
}
```

through the browser/API.

Expected:

```text
operation rejected
```

and authorization remains unchanged.

---

# ISSUE 9 — IDOR / Resource Ownership

### Acceptance criteria

For every resource:

- conversation
- message
- vault
- incident
- complaint
- check-in
- emergency contact
- community resource

User A cannot access User B's resource merely by changing its ID.

### PASS test

```text
A token + B resource ID
```

must produce:

```text
403 or 404
```

according to the API's intended policy.

No B data may appear in:

- body
- metadata
- error
- logs returned to client

---

# ISSUE 10 — Centralized API Authentication

### Acceptance criteria

Protected APIs use the application's standard authentication mechanism.

There are no accidental endpoints that:

- skip authentication
- implement weaker authentication
- trust client user IDs
- authenticate only in the frontend

### PASS test

Generate an endpoint inventory.

Every protected endpoint must have an explicit authentication/authorization decision.

---

# ISSUE 11 — `/api/conversations` Rate Limiting

### Acceptance criteria

`/api/conversations` has an effective rate limit for authenticated users.

Unauthenticated requests remain:

```text
401
```

Rate-limit violations return:

```text
429
```

where applicable.

### PASS test

Run repeated authenticated requests and record:

```text
request number
status code
response
```

A sustained abusive request pattern must eventually trigger the configured limit.

---

# ISSUE 12 — Rate Limits Actually Work

### Acceptance criteria

Rate limiting exists at appropriate layers:

```text
authenticated user
+
IP
+
endpoint/action
```

where appropriate.

Limits are configurable.

The implementation does not rely solely on frontend throttling.

### PASS test

Test:

```text
single user
multiple users / same IP
multiple requests
```

and demonstrate actual enforcement.

---

# ISSUE 13 — Rate Limit Response

### Acceptance criteria

When a rate limit is exceeded:

```text
HTTP 429
```

is returned.

The response:

- does not leak internal state
- does not expose secrets
- provides retry guidance where appropriate

---

# ISSUE 14 — Session Refresh

### Acceptance criteria

The app:

- restores existing session on startup
- listens for auth state changes
- handles token refresh
- updates current access token
- continues working after normal access-token expiration

### PASS test

Simulate/allow token expiry.

Expected:

```text
expired access token
→ supported refresh
→ new access token
→ API works
```

without requiring the user to manually log in again.

---

# ISSUE 15 — Central Auth State

### Acceptance criteria

There is one authoritative authentication state.

The following do not independently decide authentication:

```text
Navbar
Chat
Home
Settings
API helper
```

They consume the centralized state.

### PASS test

Sign out from one location.

All protected UI updates consistently.

---

# ISSUE 16 — Current Token Used

### Acceptance criteria

API requests do not permanently reuse an expired token.

After refresh, subsequent requests use the new access token.

### PASS test

Inspect network requests before and after token refresh.

The Authorization token must update.

---

# ISSUE 17 — 401 Recovery

### Acceptance criteria

For an expired token:

```text
request
→ 401
→ refresh
→ retry once
```

Maximum one retry.

If refresh fails:

```text
stop protected operations
clear auth state
require login
```

### FAIL condition

Any infinite loop such as:

```text
401 → refresh → retry → 401 → refresh → ...
```

---

# ISSUE 18 — No Random Logout

### Acceptance criteria

The app does not log users out because of:

- network failure
- 500
- 503
- timeout
- rate limit
- temporary third-party failure

Only genuine authentication failure can trigger session recovery/logout behavior.

---

# ISSUE 19 — Plaintext Password Storage

### Acceptance criteria

No plaintext password is stored anywhere.

Search and verify:

```text
localStorage
sessionStorage
IndexedDB
Supabase tables
logs
network payloads
React state persistence
```

No plaintext password may be persisted.

### PASS test

Inspect browser storage after signup/login.

Password must not be present.

---

# ISSUE 20 — Auth Password vs Vault Password

### Acceptance criteria

Account password:

- handled by Supabase Auth
- never manually stored

Vault password:

- never stored plaintext
- uses secure password-derived cryptographic material
- uses appropriate salt/KDF
- has no universal password

---

# ISSUE 21 — Password Reset

### Acceptance criteria

Forgot-password:

- sends reset through supported authentication mechanism
- does not reveal account existence unnecessarily
- never exposes current password
- never stores reset passwords plaintext

### PASS test

Test:

```text
valid email
unknown email
expired reset link
used reset link
```

without account enumeration leakage.

---

# ISSUE 22 — Vault Password Security

### Acceptance criteria

- No default `1234`.
- No default `0000`.
- No universal password.
- No static password-derived secret.
- Vault remains usable after the security fix.
- Existing supported vault data is not silently destroyed.

---

# ISSUE 23 — Emergency Purge Semantics

### Acceptance criteria

The app clearly distinguishes:

```text
Purge local/device data
```

from:

```text
Delete account
```

If purge is local only:

- local sensitive data is removed
- Supabase account remains
- UI says exactly that

### PASS test

Perform purge.

Verify:

```text
local vault/data → deleted
Supabase account → remains
```

if that is the intended behavior.

---

# ISSUE 24 — Honest Purge UI

### Acceptance criteria

Confirmation text accurately describes:

- what will be deleted
- where it will be deleted
- whether account deletion occurs
- whether recovery is possible

No misleading language such as "delete account" for a local purge.

---

# P1 — RELIABILITY & API SECURITY

---

# ISSUE 25 — Community Share

### Acceptance criteria

Clicking Share performs a real action.

Where supported:

```text
Web Share API
```

is invoked with valid share data.

If unavailable:

- fallback works, or
- user receives a clear message.

### FAIL

Button produces no action or fake success.

---

# ISSUE 26 — Overpass API

### Acceptance criteria

- valid Overpass query is generated
- request has bounded timeout
- retry behavior is bounded
- errors are handled
- response parsing is robust
- no infinite retry
- UI does not crash when Overpass fails
- no fake POIs are displayed

If an existing fallback provider exists, it is used appropriately.

---

# ISSUE 27 — Database IDs

### Acceptance criteria

Only required fields are returned to the frontend.

Internal database fields are not unnecessarily exposed.

However:

**Do not treat every database ID as a vulnerability.**

PASS requires actual authorization security, not simply hiding IDs.

---

# ISSUE 28 — Client Database Models

### Acceptance criteria

Frontend authorization does not depend on database IDs or client-side ownership checks.

The server/database verifies ownership.

Client-side checks may remain for UX but are not security boundaries.

---

# ISSUE 29 — API DTO Abstraction

### Acceptance criteria

Security-sensitive APIs return intentional API DTOs rather than blindly serializing database rows.

At minimum review:

- conversations
- profiles
- vaults
- incidents
- complaints
- check-ins
- community
- admin endpoints

No unnecessary internal fields are returned.

---

# ISSUE 30 — Email Validation

### Acceptance criteria

Email:

- required where required
- trimmed
- normalized where appropriate
- valid format
- reasonable max length
- rejected client-side when clearly invalid
- rejected server-side when invalid

### PASS examples

```text
test@example.com → accepted
abc → rejected
abc@ → rejected
@domain.com → rejected
```

---

# ISSUE 31 — Phone Validation

### Acceptance criteria

Phone field:

- validates Pakistani expected formats
- normalizes to canonical format
- rejects obviously invalid values
- validates server-side
- does not accept arbitrary strings

### PASS examples

Use the application's supported Pakistani formats and verify both local and international representations if supported.

---

# ISSUE 32 — Existing User Compatibility

### Acceptance criteria

Security validation does not lock out legitimate existing users solely because old data is imperfect.

Legacy malformed data is handled gracefully.

---

# ISSUE 33 — Onboarding Back Button

### Acceptance criteria

Every onboarding step after the first has:

```text
Back
```

Back:

- returns exactly one step
- preserves data
- does not submit
- does not reset onboarding
- does not delete data

---

# ISSUE 34 — Onboarding State

### Acceptance criteria

Moving:

```text
Next
→ Back
→ Next
```

preserves previously entered information.

### PASS test

Enter values in steps 1–4.

Go backward.

Return forward.

All previously entered values remain.

---

# ISSUE 35 — Safety Guide

### Acceptance criteria

Safety Guide does NOT open onboarding.

It opens a dedicated information/help experience.

---

# ISSUE 36 — Safety Guide Content

### Acceptance criteria

The guide explains actual existing features.

Every explanation must match implementation.

It must not claim:

- nonexistent emergency services
- nonexistent monitoring
- nonexistent encryption
- nonexistent integrations
- nonexistent legal guarantees

---

# ISSUE 37 — Safety Guide Location

### Acceptance criteria

Safety Guide is accessible from the main menu/navigation.

It is discoverable on mobile and desktop.

---

# ISSUE 38 — Help Button

### Acceptance criteria

Help:

```text
→ Help/Safety Guide
```

and never:

```text
→ onboarding step 1
```

unless onboarding is explicitly required by a particular help action.

---

# ISSUE 39 — Help vs Safety Guide

### Acceptance criteria

Users can understand the difference between:

```text
Help
```

and:

```text
Safety Guide
```

without duplicated/conflicting flows.

If the product combines them, there is one clearly labeled destination.

---

# ISSUE 40 — Home Duplication

### Acceptance criteria

Home is simplified without removing functionality.

Repeated feature navigation is reduced.

Every remaining Home action has a clear purpose.

All existing features remain accessible from the canonical navigation.

---

# ISSUE 41 — Feature Explanations

### Acceptance criteria

Users can find an explanation of every major feature from Safety Guide.

Explanations are:

- concise
- accurate
- understandable
- consistent with the actual implementation

---

# ISSUE 42 — Navigation Consistency

### Acceptance criteria

Navigation does not unexpectedly:

- restart onboarding
- reset chat
- reset forms
- lose active state
- duplicate routes

Back navigation behaves predictably.

---

# ISSUE 43 — AI Failure

### Acceptance criteria

If the AI service fails:

The UI explicitly communicates failure.

Example acceptable behavior:

```text
AI service is temporarily unavailable.
Please try again.
```

It must NOT display an AI-generated-looking fake draft.

---

# ISSUE 44 — AI Failure Transparency

### Acceptance criteria

Internally distinguish:

```text
AI_SERVICE_UNAVAILABLE
RAG_UNAVAILABLE
TIMEOUT
TOOL_FAILURE
AUTH_FAILURE
```

The frontend receives a safe meaningful error.

No:

- stack traces
- API keys
- internal URLs
- infrastructure details

are exposed.

---

# ISSUE 45 — API Error Contract

### Acceptance criteria

API errors follow a consistent structure where practical.

At minimum the frontend can distinguish:

```text
401
403
404
409
422
429
500
503
```

without parsing arbitrary error strings.

---

# ISSUE 46 — Polling + Session Expiry

### Acceptance criteria

```text
login
→ polling
→ token refresh
→ polling continues
→ logout
→ polling stops
```

No stale authenticated polling continues after logout.

---

# ISSUE 47 — RLS Matrix

### Acceptance criteria

For each private table:

| Actor | Own Data | Other User Data |
|---|---|---|
| User | allowed where intended | denied |
| Anonymous | denied | denied |
| Admin | only explicitly authorized | only explicitly authorized |

Every result must be tested, not assumed.

---

# ISSUE 48 — Privilege Escalation Testing

### Acceptance criteria

Changing frontend state or request fields cannot elevate authorization.

Test:

```text
role
isAdmin
permissions
user metadata
```

through API and browser manipulation.

---

# ISSUE 49 — Direct Supabase Testing

### Acceptance criteria

A user with a valid bearer token may be able to reach the Supabase endpoint — that alone is NOT a failure.

The acceptance requirement is:

```text
direct Supabase request
+
valid ordinary user token
```

cannot access unauthorized records or perform unauthorized mutations.

---

# ISSUE 50 — CORS

### Acceptance criteria

Production APIs do not use unnecessarily permissive:

```text
Access-Control-Allow-Origin: *
```

for authenticated sensitive operations.

Configured origins continue to work.

---

# ISSUE 51 — CSRF

### Acceptance criteria

Determine authentication transport first.

If Bearer Authorization is used:

- do not add unnecessary cookie-CSRF architecture.

If cookies authenticate protected operations:

- appropriate CSRF defenses must exist.

---

# ISSUE 52 — Security Headers

### Acceptance criteria

Production responses include appropriate security headers without breaking:

- Supabase
- fonts
- maps
- audio
- PWA
- AI
- navigation

CSP violations must not appear during normal application operation.

---

# ISSUE 53 — Environment Variables

### Acceptance criteria

Production client environment contains only public values.

Server-only secrets remain server-side.

No secret appears in:

```text
dist
source maps
browser network responses
frontend JS
```

---

# ISSUE 54 — Vercel Configuration

### Acceptance criteria

Production deployment:

- uses correct environment variables
- uses correct production domain
- has working auth callbacks
- has working API routes
- has working Supabase redirects
- does not depend on localhost

---

# ISSUE 55 — Development Compatibility

### Acceptance criteria

Security changes do not make local development unusable.

Both:

```text
development
production
```

must work with their intended configurations.

---

# ISSUE 56 — Preserve RAG/AI

### Acceptance criteria

Security remediation does not remove:

- RAG
- conversation history
- tools
- agent functionality
- existing legal documents
- existing AI workflow

Existing AI functionality remains operational.

---

# ISSUE 57 — Offline Functionality

### Acceptance criteria

Offline-supported features continue working.

Network-dependent features fail honestly instead of producing fabricated results.

---

# ISSUE 58 — Incremental API Abstraction

### Acceptance criteria

DTO changes are limited to useful/security-sensitive APIs.

No unnecessary full API rewrite.

Existing frontend functionality continues working.

---

# ISSUE 59 — Secure Deletes

### Acceptance criteria

Delete operations verify ownership server-side/RLS-side.

Changing:

```text
vaultId
incidentId
conversationId
```

cannot delete another user's data.

---

# ISSUE 60 — Community Security

### Acceptance criteria

Community operations enforce:

- ownership
- authorization
- input validation
- appropriate visibility
- no IDOR

---

# ISSUE 61 — Location Privacy

### Acceptance criteria

Exact GPS coordinates are:

- exposed only where required
- not unnecessarily logged
- not exposed across users
- protected by authorization

Emergency functionality remains operational.

---

# ISSUE 62 — Emergency Features

### Acceptance criteria

Security changes do not prevent legitimate SOS/check-in emergency behavior.

Duplicate protection may exist.

Emergency requests are not accidentally blocked by ordinary API limits.

---

# ISSUE 63 — Data Deletion Audit

### Acceptance criteria

For every delete/purge operation there is a documented answer:

```text
What?
Where?
Local?
Server?
Both?
Recoverable?
```

UI matches implementation.

---

# ISSUE 64 — Full Authentication Lifecycle

### Acceptance criteria

Complete flow works:

```text
Signup
→ verification
→ login
→ protected API
→ refresh
→ protected API
→ logout
→ protected API denied
→ login again
→ protected API works
```

---

# ISSUE 65 — Expired Token

### Acceptance criteria

Expired token recovery works without manual login where refresh is possible.

If refresh cannot happen:

```text
session ends cleanly
```

rather than leaving the UI in a broken half-authenticated state.

---

# ISSUE 66 — Logout Race Condition

### Acceptance criteria

If logout occurs while a request is pending:

- request completion cannot re-authenticate the user
- stale callbacks cannot restore old state
- protected polling cannot restart

---

# ISSUE 67 — Client Manipulation

### Acceptance criteria

Changing frontend state does not alter server authorization.

Test with browser devtools.

---

# ISSUE 68 — No Token

### Acceptance criteria

Every protected endpoint returns:

```text
401
```

for missing authentication.

No protected data is returned.

---

# ISSUE 69 — Invalid Token

### Acceptance criteria

Invalid bearer token:

```text
401
```

No:

- database details
- stack traces
- sensitive information

---

# ISSUE 70 — Valid Token + Other User ID

### Acceptance criteria

User A token + User B identifier cannot access User B's data.

---

# ISSUE 71 — Rate-Limit Verification

### Acceptance criteria

Rate limits are demonstrated with actual runtime testing.

Report:

```text
Endpoint
Authentication state
Limit
Burst behavior
Sustained behavior
First 429 request
Retry behavior
```

Do not claim rate limiting merely because middleware exists.

---

# ISSUE 72 — HTTP Semantics

### Acceptance criteria

Use:

```text
401 → authentication problem
403 → authorization problem
429 → rate limit
```

consistently.

---

# ISSUE 73 — Regression Testing

### Acceptance criteria

All existing major features still work after remediation.

At minimum test:

```text
Auth
Onboarding
AI
RAG
Voice
Chat history
Vault
Complaint
Navigation
GPS
Check-In
Community
Settings
PWA/offline
```

No previously working feature may be intentionally removed unless explicitly required by this remediation.

---

# ISSUE 74 — No Fake Fallbacks

### Acceptance criteria

There is no fake:

```text
AI success
GPS result
Overpass result
share success
logout success
database operation success
```

when the underlying operation failed.

---

# ISSUE 75 — Security Architecture

### Acceptance criteria

The final system has these independent layers:

```text
Authentication
+
Authorization
+
RLS
+
Input validation
+
Rate limiting
+
Secret protection
+
Safe error handling
```

No single client-side check is treated as the complete security boundary.

---

# ISSUE 76 — UX Architecture

### Acceptance criteria

The final navigation:

- is understandable
- has no duplicate/conflicting routes
- exposes Safety Guide from the menu
- does not accidentally launch onboarding
- preserves existing feature access

---

# ISSUE 77 — Minimal Change

### Acceptance criteria

Every code change must have a reason tied to an identified issue.

Do not introduce unrelated refactors.

---

# ISSUE 78 — No Mass Rewrite

### Acceptance criteria

The existing architecture remains recognizable.

A reviewer should be able to identify the original:

- authentication
- Supabase
- APIs
- AI
- RAG
- vault
- navigation

after remediation.

---

# ISSUE 79 — Priority Order

### Acceptance criteria

Work is completed in this order:

```text
P0 security
↓
P1 reliability/security
↓
P2 functionality
↓
P3 UX
```

Do not spend the majority of implementation effort polishing UX while P0 vulnerabilities remain unresolved.

---

# ISSUE 80 — Attacker Simulation

### Acceptance criteria

An ordinary authenticated user with their own bearer token cannot:

- read another user's data
- modify another user's data
- delete another user's data
- promote themselves
- access admin resources
- bypass RLS
- bypass API authorization

They may be able to reach public Supabase infrastructure, but they must not gain unauthorized data access.

---

# ISSUE 81 — Build Validation

### Acceptance criteria

All existing project checks pass:

```text
typecheck
lint
tests
production build
```

If an existing test fails because of the remediation:

1. determine whether the test exposed a real regression
2. fix the regression
3. only update the test if expected behavior intentionally changed

Do not delete tests simply to obtain green status.

---

# ISSUE 82 — FINAL REPORT

The final report must contain a table:

| Issue | Status | Evidence | Regression |
|---|---|---|---|
| 1 | PASS/FAIL | actual test | result |
| 2 | PASS/FAIL | actual test | result |
| ... | ... | ... | ... |
| 82 | PASS/FAIL | actual test | result |

For every FAIL/PARTIAL:

- explain why
- identify affected code
- explain security/reliability impact
- state what remains

---

# RELEASE GATE

The application must NOT be declared production-ready if any of these remain unresolved:

```text
plaintext passwords
privilege escalation
cross-user data access
broken RLS
protected endpoint without authentication
logout leaving authenticated polling active
unrecoverable session expiry
exposed server secrets
fake security success states
```

A cosmetic or low-risk issue may remain documented as a limitation.

A P0 security issue may not.

---

# FINAL RULE

Do not optimize for:

> "all tests green"

Optimize for:

> "the application still works, the reported vulnerability is actually fixed, and the fix does not introduce a new vulnerability or regression."

Every acceptance criterion must be verified against the **real running application**, not merely inferred from the source code.