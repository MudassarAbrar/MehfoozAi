# MEHFOOZ — CRITICAL SECURITY, AUTHENTICATION, API, DATABASE, NAVIGATION & UX REMEDIATION

## ROLE

You are working on the existing Mehfooz application.

This is a **security and reliability remediation task**.

The application already contains working features including:

- authentication
- onboarding
- Supabase
- AI assistant
- RAG
- conversations
- complaint generation
- private vault
- incident vault
- community
- check-in
- navigation
- GPS
- emergency contacts
- safety features
- settings
- help
- mobile UI
- offline functionality

Your job is to fix the issues listed below **without breaking any existing feature**.

---

# ABSOLUTE RULE

## DO NOT REDESIGN THE APPLICATION.

Do not replace working architecture.

Do not remove Supabase.

Do not replace authentication with a different authentication provider.

Do not remove existing APIs.

Do not remove existing features.

Do not rewrite the application from scratch.

Do not create fake implementations.

Do not hide errors to make tests pass.

Do not simply disable functionality because it is difficult to secure.

Make the **smallest safe architectural changes** necessary.

---

# PHASE 1 — INSPECT BEFORE MODIFYING

Before writing code, inspect the entire authentication/data/API lifecycle.

At minimum inspect:

```text
App.tsx
auth.ts
dataService.ts
server.ts
server/*
supabase client initialization
Supabase Edge Functions
Supabase RLS policies
database schema/migrations
conversation APIs
community APIs
vault APIs
onboarding
settings
help
safety guide
navigation
Overpass integration
frontend API utilities
API middleware
route protection
logout implementation
session initialization
token refresh logic
localStorage usage
sessionStorage usage
IndexedDB usage
password handling
environment variables
Vite configuration
Vercel configuration
```

Search the repository for:

```text
supabase
createClient
auth.getSession
auth.getUser
auth.onAuthStateChange
signIn
signUp
signOut
refreshSession
access_token
refresh_token
Authorization
Bearer
localStorage
sessionStorage
password
passwordHash
userId
admin
role
isAdmin
service_role
VITE_
DATABASE
/api/
fetch(
axios
```

Also inspect all database migrations and RLS policies.

Do not assume that frontend restrictions are security boundaries.

---

# ISSUE 1 — LOGGED OUT BUT API REQUESTS STILL SUCCEED

## Current problem

After logout, requests continue being successfully polled.

It appears that only the UI is acting logged out while the application/backend still considers the user authenticated.

This is a critical authentication-state bug.

## Required behavior

After logout:

```text
USER LOGS OUT
↓
Supabase session is terminated
↓
access token removed/invalidated from client session
↓
local authenticated application state cleared
↓
protected API requests stop
↓
backend rejects requests without valid authentication
↓
UI redirects to login
```

There must be no state where:

```text
UI = logged out

BUT

backend requests = authenticated
```

---

# ISSUE 2 — IMPLEMENT REAL LOGOUT

Audit the current logout implementation.

A proper logout must:

1. call Supabase `signOut()`
2. clear authenticated frontend state
3. clear any application-level auth cache
4. stop authenticated polling/timers
5. abort in-flight protected requests where practical
6. prevent new protected requests
7. clear only appropriate local/session auth data
8. redirect to the correct unauthenticated screen
9. verify the session is actually gone

Do not simply do:

```text
setUser(null)
```

and consider logout complete.

The backend must also reject requests that no longer contain a valid authenticated session.

---

# ISSUE 3 — STOP POLLING AFTER LOGOUT

Find every polling mechanism.

Search for:

```text
setInterval
setTimeout
poll
refetchInterval
useEffect
fetch(
axios
```

Determine which polling operations require authentication.

When the user logs out:

```text
clearInterval()
clearTimeout()
unsubscribe()
abort request
```

where applicable.

Do not allow protected polling to continue in the background.

If a polling request happens after logout, it should fail safely with:

```text
401 Unauthorized
```

and must not expose any data.

---

# ISSUE 4 — AUTHENTICATION MUST BE SERVER-SIDE

Never trust:

```text
localStorage user
localStorage role
localStorage isAdmin
localStorage authenticated=true
```

as authentication.

The backend must derive identity from a valid Supabase authentication token/session.

For every protected API:

```text
Authorization: Bearer <access_token>
↓
verify token
↓
derive authenticated user ID
↓
authorize resource
↓
perform operation
```

Never accept:

```text
userId
```

from the frontend as proof of identity.

If the frontend sends:

```json
{
  "userId": "abc"
}
```

the server must verify that it matches the authenticated user or, preferably, ignore it and derive the user ID from the verified token.

---

# ISSUE 5 — SUPABASE URLS ARE VISIBLE IN THE CLIENT

Important distinction:

A Supabase project URL and anon/public key are normally designed to be present in client applications.

They are NOT equivalent to a service-role secret.

However:

**client-side Supabase exposure must never be treated as authorization.**

Audit the application to ensure:

### Allowed in client

Public Supabase project URL.

Public/anon key where required by the Supabase client.

### NEVER in client

```text
SUPABASE_SERVICE_ROLE_KEY
database password
private API keys
Gemini server key
Twilio secret
Resend secret
JWT signing secret
encryption keys
admin credentials
```

Search the built frontend output as well.

Do not only inspect `.env`.

Verify that secrets are not bundled into:

```text
dist/
build/
static JS chunks
source maps
```

---

# ISSUE 6 — SUPABASE ORIGIN RESTRICTION

Investigate whether the application needs and can safely implement:

- allowed origins
- CORS
- Supabase API exposure controls
- redirect URL restrictions
- authentication redirect restrictions

Important:

Do NOT assume that Supabase can simply be configured to "only accept requests from the frontend origin" as a complete security mechanism.

Browsers allow clients to make requests from many origins, and public Supabase endpoints may be intentionally accessible.

The actual security boundary must be:

```text
Authentication
+
RLS
+
Authorization
+
server-side secret protection
```

Where Supabase/dashboard settings support origin restrictions, configure them appropriately for the production domain without breaking local development.

Do not use origin checks as a substitute for RLS.

---

# ISSUE 7 — CRITICAL: DIRECT SUPABASE ACCESS WITH BEARER TOKEN

A tester was able to use their bearer token to query Supabase directly.

Do NOT attempt to solve this by hiding the Supabase URL.

The correct question is:

**What can that authenticated user access using that token?**

Perform a full RLS audit.

For every table containing user/private data, verify:

```text
SELECT
INSERT
UPDATE
DELETE
```

policies.

Every policy must enforce the authenticated user's ownership where appropriate.

Examples:

```text
auth.uid() = user_id
```

or the correct ownership relationship.

Never rely on the frontend to restrict rows.

---

# ISSUE 8 — PREVENT PRIVILEGE ESCALATION

A malicious user must NOT be able to turn themselves into:

```text
admin
super_admin
moderator
staff
organization_admin
```

by modifying:

```text
role
isAdmin
permissions
user metadata
profile fields
request body
localStorage
```

Audit every admin authorization path.

If the current system stores roles in a user-editable profile table, fix the authorization architecture.

Prefer a server-controlled role source and enforce it server-side.

RLS must prevent ordinary users from modifying their own authorization fields.

Example dangerous pattern:

```text
UPDATE profiles
SET role = 'admin'
WHERE id = auth.uid()
```

This must not be possible for ordinary users.

---

# ISSUE 9 — IDOR / RESOURCE OWNERSHIP AUDIT

Test every endpoint involving:

```text
userId
conversationId
messageId
vaultId
incidentId
complaintId
checkInId
contactId
communityPostId
reportId
```

Attempt:

```text
authenticated User A
↓
request User B's resource ID
```

Expected:

```text
403 Forbidden
```

or:

```text
404 Not Found
```

depending on the application's intended information-disclosure policy.

Never return User B's data.

---

# ISSUE 10 — API AUTHENTICATION MUST BE CONSISTENT

Every protected endpoint must use the same authentication middleware/helper.

Do not have some endpoints using:

```text
requireAuth()
```

while others manually inspect headers differently.

Create/reuse one secure server-side authentication mechanism if one already exists.

It should:

1. extract Authorization header
2. validate Bearer format
3. verify Supabase token
4. obtain authenticated user
5. attach trusted identity to request context
6. reject invalid/missing credentials

---

# ISSUE 11 — `/api/conversations` RATE LIMITING

The endpoint:

```text
/api/conversations
```

currently has no effective rate limit.

A loop of 500 requests did not trigger a 403.

Implement appropriate rate limiting.

But understand the difference between:

```text
401 Unauthorized
```

and:

```text
403 Forbidden
```

If the request has no bearer token, it is expected to be rejected as unauthorized.

Rate limiting should not replace authentication.

Correct sequence:

```text
Request
↓
Authentication
↓
Authorization
↓
Rate limiting
↓
Handler
```

or, for some abuse-protection cases, a coarse IP-level limiter may run before authentication.

Do not expect an unauthenticated request to become `403` merely because it was repeated.

---

# ISSUE 12 — RATE LIMITING MUST ACTUALLY WORK

Test with:

### unauthenticated

500 requests.

### authenticated

500 requests from the same user.

### same IP with multiple accounts

Test whether the system is vulnerable to simple account rotation.

Use layered limits:

```text
IP
+
authenticated user
+
endpoint
```

Do not depend only on `userId`.

Use configurable environment variables.

Do not hardcode production limits throughout the codebase.

---

# ISSUE 13 — RATE LIMIT RESPONSE

When a legitimate authenticated user exceeds a limit:

Return an appropriate status such as:

```text
429 Too Many Requests
```

not:

```text
403
```

Include retry information where appropriate.

Do not leak internal rate-limit state.

---

# ISSUE 14 — SESSION REFRESH IS MISSING

The application currently has no reliable session-refresh lifecycle.

Eventually the Supabase bearer token expires and then APIs start returning:

```text
401 Unauthorized
```

with no way to recover.

Fix this.

Use Supabase's supported session lifecycle.

On application startup:

```text
get existing session
↓
restore user
↓
subscribe to auth state changes
```

Handle events such as:

```text
SIGNED_IN
SIGNED_OUT
TOKEN_REFRESHED
USER_UPDATED
```

Use the Supabase client's supported refresh mechanism.

Do not implement a custom JWT refresh algorithm.

---

# ISSUE 15 — AUTH STATE MUST BE CENTRALIZED

There must be one source of truth for authentication.

Avoid:

```text
App has user state
Chat has another auth state
Navbar has another auth state
API client has another auth state
```

Use the existing architecture or create a minimal centralized auth/session layer.

It should expose:

```text
user
session
loading
isAuthenticated
```

and update automatically when Supabase auth state changes.

---

# ISSUE 16 — API REQUEST TOKEN HANDLING

Audit the frontend API client.

Every authenticated request must obtain the current valid access token.

Do not permanently cache an old token.

Bad:

```text
const token = session.access_token
```

once during application startup and reuse it forever.

Instead use the current session/access token through the application's centralized auth layer.

---

# ISSUE 17 — HANDLE TOKEN EXPIRATION GRACEFULLY

When a request receives:

```text
401
```

because the access token expired:

Attempt the supported session refresh flow where appropriate.

Then retry the original request **at most once**.

Do not create:

```text
401
↓
refresh
↓
retry
↓
401
↓
refresh
↓
retry
...
```

infinite loops.

If refresh fails:

```text
clear auth state
stop protected polling
redirect to login
```

---

# ISSUE 18 — DO NOT LOG THE USER OUT RANDOMLY

A transient API failure must not automatically destroy the entire application state.

Distinguish:

```text
network failure
server error
rate limit
expired token
invalid token
authorization failure
```

Only treat an authentication failure as a session problem when it actually indicates invalid/expired authentication.

---

# ISSUE 19 — PASSWORDS ARE CURRENTLY STORED IN PLAINTEXT

This is a CRITICAL vulnerability.

Search the entire repository for:

```text
password
appPassword
vaultPassword
password:
password=
localStorage
sessionStorage
```

Determine exactly where passwords are stored.

There must be NO plaintext password storage.

Never store:

```text
localStorage.setItem("password", password)
```

Never store plaintext passwords in:

```text
Supabase
database
IndexedDB
localStorage
sessionStorage
profile
logs
analytics
```

---

# ISSUE 20 — DISTINGUISH AUTH PASSWORD FROM VAULT PASSWORD

There may be two separate concepts:

### Account authentication password

Handled by Supabase Auth.

Do not manually store it.

### Private Vault password

If the application uses a vault password for local encryption/unlocking, do not store the plaintext vault password.

Use an appropriate password-derived key mechanism.

For example:

```text
user password
↓
random per-user/device salt
↓
KDF
↓
encryption/unlock key
```

Never use:

```text
static universal salt
```

or:

```text
plaintext password
```

as the encryption key.

---

# ISSUE 21 — PASSWORD RESET

The "Forgot Password" flow must use the user's verified email through Supabase's supported password-reset mechanism.

Do not implement custom plaintext password recovery.

Password reset must not expose whether arbitrary emails belong to accounts.

Use generic responses where appropriate.

---

# ISSUE 22 — VAULT PASSWORD SECURITY

Audit:

```text
Private Vault password
Incident Vault password
App/weather-lock password
```

Determine which are actual encryption secrets and which are authentication credentials.

Do not merge them accidentally.

Do not create a universal fallback password.

Do not use:

```text
1234
0000
password
```

as production bypasses.

---

# ISSUE 23 — EMERGENCY PURGE / DELETE DATA SEMANTICS

There is confusion around:

> Emergency purge all local data

A tester observed that:

- local data/vaults were deleted
- Supabase account was NOT deleted

This may actually be correct behavior if the feature is intended to purge **local/device data**, but the UI must make the distinction explicit.

Audit the current implementation.

Clearly distinguish:

### Purge local/device data

Deletes locally stored sensitive data.

Does NOT delete:

- Supabase account
- server-side account
- server-side records unless explicitly intended

### Delete account

A separate destructive operation if the application supports it.

If account deletion does not currently exist, do not pretend that emergency purge deletes the account.

---

# ISSUE 24 — EMERGENCY PURGE MUST BE HONEST

The confirmation text should clearly say what will be deleted.

For example:

> This will permanently remove sensitive Mehfooz data stored on this device. Your Mehfooz account will not be deleted.

Only use wording consistent with the actual implementation.

Do not claim server deletion if only local deletion occurs.

---

# ISSUE 25 — COMMUNITY SHARE BUTTON DOES NOTHING

The Community page has a Share button that currently does nothing.

Inspect the existing community/share implementation.

Implement the intended sharing behavior using existing application functionality.

Prefer:

```text
Web Share API
```

where supported, with a safe fallback.

For example:

```text
navigator.share(...)
```

If sharing is unavailable:

- provide an appropriate fallback
- or show a useful message

Do NOT create a fake share-success state.

If the button is not supposed to perform a new feature, connect it to the existing sharing functionality rather than inventing another architecture.

---

# ISSUE 26 — OVERPASS API FAILURES

The Overpass API integration is currently failing.

Audit:

```text
Overpass endpoint
request construction
query syntax
timeouts
CORS
rate limiting
response parsing
error handling
fallback behavior
```

Do not blindly increase timeouts or retry forever.

Implement:

```text
bounded timeout
bounded retries
proper error handling
```

If multiple Overpass instances are already supported, use an existing fallback mechanism.

Do not depend on a single fragile endpoint if the current architecture already permits fallback.

If Overpass is temporarily unavailable:

- do not crash the navigation UI
- do not fabricate POIs
- clearly indicate unavailable data
- retain other available navigation functionality

---

# ISSUE 27 — DATABASE IDS EXPOSED TO CLIENT

The current database response is apparently not abstracted and database IDs are visible on the client.

Important:

A database ID being visible is not automatically a vulnerability.

The actual concern is whether those IDs can be used to access unauthorized resources.

Still, minimize unnecessary exposure.

Audit every API response.

Do not return internal fields unless the frontend actually needs them.

Create DTO/response transformation layers where appropriate:

```text
Database model
↓
server-side mapper
↓
public API DTO
↓
frontend
```

For example, avoid returning:

```text
internal database metadata
internal authorization fields
service information
private audit fields
internal relationships
```

unless required.

---

# ISSUE 28 — DO NOT USE CLIENT DATABASE MODELS AS SECURITY MODELS

The frontend should not be responsible for understanding authorization.

Do not rely on:

```text
if (post.user_id === currentUser.id)
```

as the security mechanism.

That can be useful for UI behavior, but authorization must happen server-side/RLS-side.

---

# ISSUE 29 — API DTO ABSTRACTION

Where practical, create clear API response types.

Example:

```text
DatabaseConversation
↓
ConversationDTO
```

rather than directly exposing the database row.

This also prevents future schema changes from leaking into the frontend.

Do this incrementally.

Do NOT rewrite every API unnecessarily.

Prioritize security-sensitive APIs first.

---

# ISSUE 30 — EMAIL VALIDATION

The email field currently accepts invalid input.

Implement proper validation.

At minimum:

- required
- valid email structure
- reasonable maximum length
- normalized/trimmed input

Do not rely only on frontend validation.

Validate server-side too.

Use the existing validation library if the project already has one.

Do not introduce a huge dependency solely for basic email validation.

---

# ISSUE 31 — PHONE NUMBER VALIDATION

The phone number currently accepts invalid values.

Implement proper validation.

Because Mehfooz operates in Pakistan, support expected Pakistani formats used by the application.

Normalize where appropriate.

Examples that may need to be supported depending on existing product requirements:

```text
03XXXXXXXXX
+923XXXXXXXXX
923XXXXXXXXX
```

Convert to one canonical format internally where appropriate.

Validate:

- country code
- digit count
- allowed format
- required field
- maximum length

Do not merely check:

```text
value.length > 5
```

Validate server-side as well.

---

# ISSUE 32 — VALIDATION MUST NOT BREAK EXISTING USERS

Do not suddenly invalidate legitimate existing stored numbers/emails.

Normalize existing data where possible.

If legacy data is malformed:

- allow account access
- request correction when the field is edited
- do not destroy the account

---

# ISSUE 33 — ONBOARDING BACK BUTTON

There is currently no Back button during onboarding.

Every multi-step onboarding flow must support:

```text
Next
← Back
```

except the initial step where Back is not meaningful.

Back must:

- return to the previous step
- preserve previously entered values
- not erase form state
- not submit anything
- not trigger destructive actions

---

# ISSUE 34 — ONBOARDING STEP STATE

Do not implement Back by remounting the entire onboarding component and losing state.

Maintain the current onboarding data in one state object.

Example concept:

```text
OnboardingState
├── profile
├── phone
├── address
├── emergencyContact
├── preferences
├── passwords
└── currentStep
```

Only update the relevant step.

---

# ISSUE 35 — SAFETY GUIDE IS BROKEN

Current behavior:

Safety Guide button opens onboarding steps.

This is incorrect.

Safety Guide should NOT launch onboarding.

---

# ISSUE 36 — CREATE A REAL SAFETY GUIDE

The Safety Guide should explain the existing Mehfooz features in one place.

Do NOT invent features.

Use the features that already exist.

Examples where actually present:

### AI Assistant

Explain:

- what it does
- what users can ask
- how to use voice
- how conversation history works

### Private Vault

Explain:

- what it stores
- why it is private
- how the vault password works
- device-specific limitations if applicable

### Incident / Complaint tools

Explain:

- how to document an incident
- how complaint drafting works
- that the user reviews the generated complaint

### Check-In

Explain:

- how it works
- emergency contact behavior
- what happens if the user does not check in

### Safe Navigation / Safe Corridor

Explain:

- route safety functionality
- location permissions
- what the user needs to provide

### Community

Explain:

- what community information is
- what users should avoid sharing
- reporting behavior where already implemented

### Emergency/SOS

Explain only what the actual application currently supports.

Do not promise capabilities that do not exist.

---

# ISSUE 37 — SAFETY GUIDE LOCATION

The Safety Guide should be accessible from the **menu/navigation area**.

Do not make users hunt for it.

The menu should contain something similar to:

```text
Home
AI Assistant
Safe Navigation
Check-In
Community
Safety Guide
Settings
```

Use the application's existing navigation structure.

Do not create duplicate routes unnecessarily.

---

# ISSUE 38 — HELP BUTTON MUST NOT START ONBOARDING

Current behavior:

Click Help
↓
onboarding starts from beginning

This is incorrect.

Help must open the actual Help/Safety Guide content.

Audit all references to:

```text
Help
Safety Guide
OnboardingModal
```

Make sure the wrong handler is not being reused.

---

# ISSUE 39 — HELP VS SAFETY GUIDE

Keep their responsibilities clear.

### Help

Operational help:

- account
- password
- vault
- login
- navigation
- app usage
- troubleshooting

### Safety Guide

Feature education and personal safety guidance:

- what each feature does
- when to use it
- basic safety practices
- emergency guidance
- privacy guidance

If the current product intentionally combines these, keep a single clear Help & Safety Guide destination rather than duplicating content.

---

# ISSUE 40 — HOME PAGE IS TOO REPETITIVE

The Home page currently duplicates functionality already available through the navbar/menu.

Do NOT remove functionality.

Reduce unnecessary duplication.

Audit:

```text
Home cards
Navbar
Menu
Quick actions
Feature buttons
```

Determine which actions are primary.

Home should provide a concise overview and useful quick access.

The navigation should remain the canonical way to access features.

Do not create:

```text
Home button → same feature
Navbar button → same feature
Menu button → same feature
```

for every feature unless there is a clear UX reason.

---

# ISSUE 41 — FEATURE EXPLANATIONS

Users need to understand what the features do.

Do not add random paragraphs everywhere.

Use the Safety Guide as the central explanation location.

Home should remain concise.

Each feature can also have a short contextual description where appropriate.

---

# ISSUE 42 — NAVIGATION CONSISTENCY

Audit all navigation paths.

Every route/page should have:

- clear title
- clear current location
- predictable Back behavior
- menu access
- no accidental onboarding reset

Do not allow navigation to recreate app state.

---

# ISSUE 43 — ERROR HANDLING FOR AI FAILURE

Current behavior:

When the AI service fails, the application falls back to a draft message.

This is dangerous because it makes a service failure look like a legitimate AI-generated response.

Do NOT silently substitute a draft.

Instead clearly report the failure.

Example:

> I'm having trouble reaching the AI service right now. Please try again in a moment.

If the application has a verified offline deterministic fallback that is explicitly intended for this scenario, it may be used — but it must be clearly distinguished from an AI response.

Do NOT show:

```text
AI response
```

when the AI actually failed.

---

# ISSUE 44 — NEVER HIDE AI FAILURE

If:

```text
Gemini unavailable
RAG unavailable
agent timeout
tool failure
```

the UI must receive an honest status.

Use structured errors internally:

```text
AI_SERVICE_UNAVAILABLE
RAG_UNAVAILABLE
AGENT_TIMEOUT
TOOL_FAILURE
AUTH_REQUIRED
```

Do not expose stack traces.

Do not expose API keys.

Do not expose internal infrastructure details.

---

# ISSUE 45 — API ERROR CONTRACT

Standardize API errors where practical:

```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

Do not expose:

```text
stack
database query
SQL
provider credentials
internal file paths
```

---

# ISSUE 46 — PROTECTED POLLING + SESSION EXPIRATION

Combine the polling and auth fixes.

Expected lifecycle:

```text
User logged in
↓
polling active
↓
token refresh occurs
↓
polling continues
↓
user logs out
↓
polling stops
↓
session cleared
↓
protected requests rejected
```

If the session expires unexpectedly:

```text
API returns 401
↓
attempt supported refresh once
↓
if successful → retry request once
↓
if unsuccessful → stop polling + require login
```

---

# ISSUE 47 — SUPABASE RLS TEST MATRIX

For EVERY private table test:

### User A

Can:

- read own data
- create own data
- update own data
- delete own data where allowed

Cannot:

- read User B's data
- update User B's data
- delete User B's data

### User B

Repeat.

### Anonymous

Cannot access private records.

### Admin

Can access only explicitly authorized admin resources.

Do not assume service-role behavior represents normal user behavior.

---

# ISSUE 48 — TEST PRIVILEGE ESCALATION

Attempt:

```text
role = admin
isAdmin = true
permissions = ["admin"]
```

through:

- browser devtools
- direct API
- Supabase REST
- modified request body
- modified localStorage
- modified profile
- direct database REST requests

Expected:

**ordinary user cannot elevate privileges.**

---

# ISSUE 49 — TEST DIRECT SUPABASE ACCESS

Do not merely test:

> Can I reach Supabase?

That is expected for client applications.

Test:

> What can I actually read/write with the anon/user token?

Attempt access to:

- another user's profile
- another user's conversations
- another user's vault
- another user's incidents
- another user's contacts
- admin records

Expected:

Access denied by RLS/authorization.

---

# ISSUE 50 — FRONTEND ORIGIN / CORS

Audit backend CORS.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for sensitive authenticated APIs unless there is a specific justified reason.

Configure production origin(s) appropriately.

Keep local development working.

Do not trust CORS as authentication.

CORS is a browser policy, not an authorization mechanism.

---

# ISSUE 51 — CSRF / AUTH TRANSPORT

Determine whether authenticated API requests use:

```text
Authorization: Bearer
```

or cookies.

If bearer tokens are used in the Authorization header, CSRF risk is different from cookie authentication.

Do not add unnecessary CSRF complexity without understanding the current auth transport.

If cookies are used for authentication anywhere, implement appropriate CSRF protection.

---

# ISSUE 52 — SECURITY HEADERS

Preserve the previous security hardening work.

Verify production security headers including appropriate:

- CSP
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame protection
- HSTS where appropriate for HTTPS

Do not create a CSP that breaks the existing application.

Test:

- fonts
- Supabase
- AI APIs
- maps
- Overpass
- PWA
- images
- audio
- navigation

---

# ISSUE 53 — ENVIRONMENT VARIABLE AUDIT

Search all environment variables.

Client-exposed variables should be explicitly understood.

Anything prefixed for Vite/client exposure must be considered public.

Never put:

```text
SERVICE_ROLE
SECRET
PRIVATE_KEY
DATABASE_PASSWORD
```

in client-exposed environment variables.

---

# ISSUE 54 — VERCEL PRODUCTION CONFIGURATION

Inspect the Vercel deployment configuration.

Verify:

- environment variables
- production domain
- API routes
- server functions
- CORS
- redirects
- auth callback URLs
- Supabase redirect URLs

Do not hardcode localhost into production behavior.

Do not hardcode temporary deployment URLs into security-sensitive configuration.

---

# ISSUE 55 — DO NOT BREAK LOCAL DEVELOPMENT

Security configuration should support:

```text
development
preview
production
```

appropriately.

Do not make production security changes that make local development impossible.

Use environment-based configuration.

---

# ISSUE 56 — PRESERVE EXISTING RAG/AI WORK

Do not break the RAG system while fixing authentication.

Do not change the AI model unnecessarily.

Do not change RAG documents.

Do not remove agent tools.

Do not remove conversation history.

AI errors should be honest rather than silently replaced with fake draft responses.

---

# ISSUE 57 — PRESERVE OFFLINE FUNCTIONALITY

Do not break existing offline functionality.

If a network-dependent feature is unavailable:

- fail gracefully
- clearly indicate unavailable service
- keep local safe features working

Do not fabricate online data.

---

# ISSUE 58 — DATABASE RESPONSE ABSTRACTION SHOULD BE INCREMENTAL

Do NOT rewrite every endpoint simply because database IDs are visible.

Prioritize:

1. private data
2. admin data
3. authorization-sensitive resources
4. internal metadata
5. public community data

Return only fields required by the frontend.

---

# ISSUE 59 — DO NOT TRUST CLIENT-SIDE DELETE OPERATIONS

Audit deletion.

A frontend request such as:

```text
delete(vaultId)
```

must be authorized server-side/RLS-side.

The client cannot be trusted to decide which vault it owns.

---

# ISSUE 60 — COMMUNITY DATA SECURITY

Audit community posts.

Ensure:

- authenticated ownership
- update authorization
- delete authorization
- report authorization
- no IDOR
- no arbitrary user ID accepted from client
- no unauthorized access to private information

Sharing should expose only intentionally public content.

---

# ISSUE 61 — LOCATION PRIVACY

Audit location APIs.

GPS coordinates are sensitive.

Do not expose exact coordinates unnecessarily.

Do not log exact coordinates unless required.

Do not expose another user's location.

Check:

- navigation
- check-in
- SOS
- community
- emergency alerts

for location leakage.

---

# ISSUE 62 — EMERGENCY FUNCTIONALITY MUST NOT BE BROKEN

Security hardening must not disable legitimate emergency behavior.

Do not aggressively rate-limit SOS/crisis operations.

Use:

- idempotency
- duplicate suppression
- authenticated authorization where appropriate
- safe error handling

rather than simply blocking emergency requests.

---

# ISSUE 63 — DATA DELETION AUDIT

For every destructive action, document internally:

```text
What data is deleted?
Where is it deleted?
Local?
Supabase?
Both?
```

Do not make UI claims that differ from implementation.

---

# ISSUE 64 — TEST AUTHENTICATION LIFECYCLE

Mandatory test:

```text
Sign up
↓
Verify email
↓
Login
↓
Access protected API
↓
Refresh page
↓
Still authenticated
↓
Token refresh
↓
API still works
↓
Logout
↓
Protected API fails
↓
Polling stops
↓
Login again
↓
API works again
```

---

# ISSUE 65 — TEST EXPIRED TOKEN

Simulate an expired access token.

Expected:

```text
API request
↓
401
↓
refresh session
↓
retry once
↓
success
```

If refresh cannot succeed:

```text
stop polling
clear auth state
require login
```

---

# ISSUE 66 — TEST LOGOUT RACE CONDITION

Test:

```text
Request starts
↓
user clicks logout
↓
request finishes
```

Ensure the result cannot restore the user to authenticated state.

Also test:

```text
logout
↓
old polling callback fires
```

It must not restart authenticated state.

---

# ISSUE 67 — TEST CLIENT MODIFICATION

Modify in browser devtools:

```text
user.id
role
isAdmin
authenticated
vaultId
conversationId
```

Expected:

No privilege escalation.

---

# ISSUE 68 — TEST API WITHOUT TOKEN

For every protected endpoint:

```text
GET without Authorization
POST without Authorization
PUT without Authorization
DELETE without Authorization
```

Expected:

```text
401
```

and no protected data.

---

# ISSUE 69 — TEST API WITH INVALID TOKEN

Expected:

```text
401
```

No stack trace.

No database information.

---

# ISSUE 70 — TEST API WITH VALID USER TOKEN + OTHER USER ID

Expected:

```text
403/404
```

according to endpoint policy.

No data leakage.

---

# ISSUE 71 — TEST RATE LIMITING

Test:

```text
10 requests
50 requests
100 requests
500 requests
```

against:

- `/api/conversations`
- AI endpoint
- complaint endpoint
- check-in endpoint
- community endpoint
- other expensive endpoints

Record actual behavior.

Do not claim a rate limit exists unless the test actually demonstrates it.

---

# ISSUE 72 — DO NOT CONFUSE 401, 403 AND 429

Use correct semantics:

```text
401 = not authenticated / invalid authentication

403 = authenticated but not authorized

429 = rate limit exceeded
```

Do not return 403 simply because a request is unauthenticated.

---

# ISSUE 73 — REGRESSION TESTING

After changes, test every existing major flow:

## Authentication

- signup
- verification
- login
- refresh
- logout
- password reset

## Onboarding

- all steps
- Back
- Next
- save
- resume

## AI

- normal question
- RAG question
- follow-up question
- out-of-domain question
- voice
- history
- New Chat

## Vault

- unlock
- save
- read
- delete
- emergency purge

## Complaint

- generate
- review
- edit
- submit
- organization handoff

## Navigation

- GPS
- Safe Corridor
- destination
- POIs
- Overpass failure

## Check-In

- start
- emergency contact
- expiration
- alert

## Community

- view
- share
- create if existing
- edit/delete if existing
- report if existing

## Settings

- password
- vault
- email/password
- help

---

# ISSUE 74 — NO FAKE FALLBACKS

Never solve failures with fake success.

Bad:

```text
AI unavailable
↓
show old draft
```

Bad:

```text
Overpass unavailable
↓
show fake nearby locations
```

Bad:

```text
Share failed
↓
show "Shared successfully"
```

Bad:

```text
logout failed
↓
show logged out
```

The application must reflect the actual system state.

---

# ISSUE 75 — FINAL SECURITY ARCHITECTURE

The desired architecture is:

```text
                FRONTEND
                   │
                   │ access token
                   ▼
             API / SERVER
                   │
            authenticate
                   │
                   ▼
           trusted user identity
                   │
            authorize resource
                   │
                   ▼
             rate limiting
                   │
                   ▼
              business logic
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Supabase            APIs
          │
          ▼
         RLS
          │
          ▼
   user-owned records
```

Supabase should not be protected merely by hiding its URL.

The security boundary should be:

```text
Authentication
+
Authorization
+
RLS
+
Server-side validation
+
Secrets protection
+
Rate limiting
```

---

# ISSUE 76 — FINAL UX ARCHITECTURE

The navigation should become approximately:

```text
HOME
 │
 ├── concise overview
 └── important quick actions

MENU
 │
 ├── AI Assistant
 ├── Safe Navigation
 ├── Check-In
 ├── Community
 ├── Safety Guide
 └── Settings
```

Safety Guide:

```text
What Mehfooz does
↓
AI Assistant
↓
Safe Navigation
↓
Check-In
↓
Private Vault
↓
Incident/Complaint tools
↓
Community
↓
Emergency features
↓
Privacy & account safety
```

Help should never unexpectedly start onboarding.

---

# ISSUE 77 — MINIMAL-CHANGE REQUIREMENT

When fixing each issue:

1. Find the existing implementation.
2. Understand why it behaves incorrectly.
3. Fix the root cause.
4. Reuse existing helpers/services.
5. Avoid duplicate implementations.
6. Avoid unnecessary dependencies.
7. Avoid rewriting unrelated components.
8. Test the affected feature.
9. Test adjacent features.

---

# ISSUE 78 — DO NOT MASS-REFACTOR

Do not turn this task into:

> "Let's rewrite authentication."

Do not turn it into:

> "Let's migrate databases."

Do not turn it into:

> "Let's replace Supabase."

Do not turn it into:

> "Let's rebuild navigation."

This is a targeted remediation task.

---

# ISSUE 79 — SECURITY PRIORITY ORDER

Fix in this order:

### P0 — Critical security

1. plaintext passwords
2. authentication/logout
3. token refresh
4. RLS
5. privilege escalation
6. IDOR
7. server authorization
8. exposed secrets
9. protected API authentication

### P1 — Critical reliability/security

10. polling after logout
11. rate limiting
12. API error semantics
13. AI failure handling
14. database response abstraction
15. location privacy

### P2 — Functional issues

16. Overpass
17. share button
18. validation
19. onboarding Back
20. Help/Safety Guide

### P3 — UX

21. Home duplication
22. navigation clarity
23. feature explanations

---

# ISSUE 80 — FINAL SECURITY TEST

Before declaring completion, attempt to attack the application as an ordinary user.

Assume:

> I am a malicious authenticated user with my own valid bearer token.

Try:

```text
read another user's data
modify another user's data
delete another user's data
modify my role
modify isAdmin
access admin endpoint
access another vault
access another conversation
access another complaint
access another emergency contact
query Supabase directly
spam API
spam conversations
continue polling after logout
reuse expired token
modify frontend auth state
modify localStorage
```

The application must resist these attempts.

---

# ISSUE 81 — FINAL BUILD VALIDATION

Run:

```text
typecheck
lint
tests
production build
```

If the project has specific commands, use the existing commands from `package.json`.

Do not modify build configuration unnecessarily.

---

# ISSUE 82 — FINAL REPORT

At the end, provide a structured report:

## Authentication

- logout fixed
- refresh fixed
- session restoration fixed
- polling stopped after logout

## Supabase Security

- RLS audited
- privilege escalation tested
- IDOR tested
- direct Supabase access tested
- client secrets audited

## Password Security

- plaintext storage removed
- vault password handling fixed
- reset flow verified

## API Security

- authentication
- authorization
- rate limits
- 401/403/429 behavior
- DTO abstraction

## Reliability

- AI failures
- Overpass failures
- polling
- session expiry

## UX

- onboarding Back
- Help
- Safety Guide
- Share
- validation
- navigation cleanup

## Tests

Provide actual test results.

Do not write:

> Everything is secure.

Instead state exactly what was tested and what remains a limitation.

---

# MOST IMPORTANT RULE

**SECURITY HARDENING MUST BE ADDED AROUND THE EXISTING WORKING APPLICATION, NOT BY REPLACING THE EXISTING WORKING APPLICATION.**

If a security fix risks breaking an existing feature:

1. identify the dependency
2. make the smallest compatible change
3. preserve the feature's existing contract
4. add regression tests
5. only then continue

Never sacrifice existing functionality simply to make the code look cleaner.

The final application must be:

**secure + authenticated + authorized + session-aware + honest about failures + usable + backward-compatible with existing features.**