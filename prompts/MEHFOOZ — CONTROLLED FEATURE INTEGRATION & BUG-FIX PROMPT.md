# MEHFOOZ — CONTROLLED FEATURE INTEGRATION & BUG-FIX PROMPT

You are modifying the existing **Mehfooz (محفوظ)** application.

Your task is to implement the requirements in this document **inside the existing application without breaking any existing functionality, UI design, visual identity, architecture, routing, authentication integrations, or existing working flows.**

This is NOT a redesign.

This is NOT permission to invent additional features.

You must implement **only what is explicitly described below**.

---

# 0. ABSOLUTE IMPLEMENTATION RULES

Before making any changes:

1. Inspect the existing codebase and understand how each affected feature currently works.
2. Find the existing components, routes, services, APIs, state management, authentication logic, and UI before modifying them.
3. Reuse existing components and services wherever possible.
4. Do not create duplicate implementations of functionality that already exists.
5. Do not replace working functionality with a completely different implementation.
6. Do not change the application's visual design unless explicitly required below.
7. Do not change colors, typography, spacing, branding, icons, or layouts unnecessarily.
8. Do not remove existing functionality unless this prompt explicitly asks for it.
9. Do not add features that are not mentioned in this prompt.
10. Do not change the existing legal/RAG system.
11. Do not change the existing encrypted vault architecture except for the requested password/access behavior.
12. Do not change the existing SOS/check-in architecture unnecessarily.
13. Do not change the existing Supabase/Twilio/Resend architecture unnecessarily.
14. Do not replace APIs simply because another API may be easier.
15. Do not add fake functionality and represent it as real functionality.
16. Do not silently make assumptions about requirements.
17. If an existing implementation already partially supports a requested behavior, modify it rather than replacing it.
18. Maintain backward compatibility wherever possible.
19. Existing demo mode must continue working.
20. Real users must follow the new onboarding/authentication flow described below.
21. The application must remain functional at every stage of implementation.
22. After implementation, run the existing typecheck/build/tests and fix regressions caused by your changes.
23. Do not modify unrelated code merely for code cleanliness.

The objective is:

```text
CURRENT MEHFOOZ APP
        +
REQUESTED FIXES / MODIFICATIONS
        ↓
SAME APP
        +
REQUESTED BEHAVIOR
        +
NO REGRESSIONS
```

---

# 1. SAFE CORRIDOR / NAVIGATION MUST ACTUALLY WORK

## Current problem

The Safe Corridor option on the main home page currently appears to be largely demo/static functionality.

There is only a demo route/data entry and the feature does not actually use live/current GPS or meaningful navigation input.

The Safe Corridor feature needs to become functional using the existing application structure.

---

## Required behavior

When the user opens the Safe Corridor / Navigate functionality:

### Step 1 — User enters a location

Use the existing navigation/location input.

When the user enters a destination/location, the application should use that location to determine the available safe routes.

The location must not simply result in the same static demo route every time.

---

## Step 2 — Show safe route options

The Safe Corridor section should show routes based on:

- current location
- destination entered by the user
- existing safety information/data available to the application

The route results should be presented using the existing Safe Corridor/Navigate UI.

Do NOT redesign the route UI.

---

## Lahore dummy data

Because the application currently needs route/safety data and this is not necessarily connected to a production safety-data source, create **dummy safety/navigation data for common Lahore locations** where necessary.

The dummy data must only support the requested Safe Corridor behavior.

Use common Lahore locations such as existing/common destinations represented in the application's navigation context.

Examples can include:

- Liberty
- Gulberg
- Johar Town
- DHA
- Model Town
- Mall Road
- Anarkali
- Wapda Town
- Faisal Town
- Allama Iqbal Town
- Lahore Cantt
- Bahria Town

Do NOT invent an entirely new navigation product.

The dummy data should allow the existing Safe Corridor UI to demonstrate that different destinations can produce different route/safety results.

---

# 2. SAFE CORRIDOR AND CHECK-IN RELATIONSHIP

The current implementation appears to imply that Safe Corridor requires starting a session.

Review this carefully.

The Safe Corridor route-selection feature itself should NOT unnecessarily require a check-in session just to view safe routes.

The user should be able to:

```text
Enter destination
      ↓
View safe routes
      ↓
Select a route
```

The user can then use the existing Check-In functionality separately.

Do not force the user to start a journey/check-in merely to search for or view safe corridors unless the existing application already requires this for a specific valid reason.

Do not remove the existing Check-In functionality.

The goal is to keep:

```text
Safe Corridor
= route discovery / safety-aware route selection

Check-In
= journey monitoring / arrival monitoring
```

They may work together, but they must not be incorrectly coupled.

---

# 3. NAVIGATE AND SAFE CORRIDOR MUST USE THE SAME NAMING

The application currently has:

- Navigate
- Safe Corridor

These appear to represent overlapping functionality.

Do not leave two confusingly different names for the same feature.

Use the **same naming consistently** across:

- home page
- navigation
- buttons
- headings
- menus
- relevant pages
- relevant navigation labels

Do not redesign the feature.

Only make the naming consistent.

Use the existing preferred Safe Corridor terminology consistently where appropriate.

---

# 4. LAUNCH MUHAFIZ APP → AUTHENTICATION / ONBOARDING

## Current problem

When the user clicks:

**Launch Muhafiz App**

the application should not immediately enter the internal application for a normal new user.

---

## Required real-user flow

When a user visits the application's main link:

```text
Landing Page
```

Then:

```text
Click "Launch Muhafiz App"
        ↓
Signup / Login page
```

The user must authenticate before entering the actual application.

---

# 5. LANDING PAGE ROUTING

Whenever someone accesses the application link, the initial public page should be the existing landing page.

Do not remove or redesign the landing page.

The flow must be:

```text
Application URL
      ↓
Landing Page
      ↓
Launch Muhafiz App
      ↓
Signup / Login
```

---

# 6. DEMO LOGIN MUST REMAIN

The existing demo mode can remain.

It should be clearly separated from the real authentication flow.

Conceptually:

```text
Signup / Login
      ├── Real Signup/Login
      │       ↓
      │   Real onboarding
      │
      └── Demo Mode
              ↓
          Existing demo experience
```

Do not remove the existing demo mode.

Do not force demo users through the complete real-user onboarding.

Only real users should follow the real onboarding structure.

---

# 7. REAL USER SIGNUP FLOW

When a user chooses to create a real account:

```text
Signup
   ↓
Account creation
   ↓
Email verification
   ↓
User information
   ↓
Phone number
   ↓
Address
   ↓
One safe parent/emergency contact number
   ↓
Weather/stealth app password
   ↓
Confirm password
   ↓
Private Vault password
   ↓
Enter application
```

Preserve the existing authentication provider/infrastructure.

Do not create a separate authentication backend if one already exists.

---

# 8. EMAIL VERIFICATION

After real account signup:

The user must verify their email.

Do not allow the new real user to simply bypass email verification if the existing authentication system supports verification.

Use the existing authentication/email infrastructure.

Do not invent another email-verification system.

---

# 9. USER INFORMATION AFTER EMAIL VERIFICATION

After successful email verification, collect:

### Required information

- Phone number
- Address
- One safe parent/emergency contact number

Store these using the existing user/profile/data architecture.

Do not add additional profile fields that were not requested.

---

# 10. WEATHER / STEALTH APP PASSWORD

During the first onboarding process, the user must create the password used to access the actual protected application through the existing weather/stealth mechanism.

Flow:

```text
User onboarding
      ↓
Set app/weather-lock password
      ↓
Confirm password
```

The password must be stored securely using the application's existing secure authentication/storage architecture.

Do not store plaintext passwords.

Do not create a hardcoded universal password.

Do not retain the old universal guest PIN bypass behavior.

---

# 11. FORGOT PASSWORD FOR APP PASSWORD

The application password must have a:

**Forgot Password**

option.

When selected:

```text
Forgot Password
      ↓
Use user's verified email
      ↓
Send password reset email
      ↓
User resets app password
```

Use the existing email/authentication infrastructure where possible.

Do not expose the password itself through email.

Do not implement plaintext password recovery.

The reset mechanism should reset the password rather than reveal the existing password.

---

# 12. PRIVATE VAULT PASSWORD

During first-time onboarding, after setting the application/weather-lock password, ask the user to set a separate password for the Private Vault.

The flow should be:

```text
Set App Password
      ↓
Confirm App Password
      ↓
Set Private Vault Password
      ↓
Confirm/complete
```

The Private Vault password must be separate from the application password.

Do not weaken the existing vault encryption.

Do not remove AES-GCM encryption.

The vault must remain device-specific as currently designed.

---

# 13. PRIVATE VAULT ACCESS

The Private Vault is sensitive.

It should not be directly exposed prominently on the home page.

The existing home-page Incident Vault button should be removed/repositioned as described later.

When a user attempts to access the Private Vault:

```text
Vault
   ↓
Vault password
   ↓
Vault access
```

The vault must remain accessible only on the same device according to the application's existing device-key architecture.

Do not implement cross-device vault synchronization.

---

# 14. INCIDENT VAULT BUTTON ON HOME PAGE

## Current problem

The Incident Vault button is currently prominently visible on the home page.

Because this contains highly sensitive information, it should not be directly exposed so prominently.

---

## Required change

Remove the prominent Incident Vault button from the main home page.

Do not delete the Incident Vault functionality.

Move access to the existing menu/settings area where appropriate.

Use the existing application navigation structure.

Replace the home-page space with an option that already exists in the application's current functionality/navigation context.

Do NOT invent an unrelated new feature just to fill the space.

Preserve the existing home page design as much as possible.

---

# 15. ALL TOOLS BUTTON MUST WORK

## Current problem

The **All Tools** button appears to be decorative/non-functional.

---

## Required behavior

When the user clicks **All Tools**:

A dropdown/menu should open showing the application's existing relevant tools.

Each tool must navigate to its correct existing page/section.

Use the existing routes/components.

For example, if these already exist:

```text
Legal Assistant
Safe Corridor / Navigate
Check-In
Complaint Builder
Private Vault
Support Directory
```

they should route to their corresponding existing pages.

Do NOT add tools that don't already exist.

Do NOT create fake routes.

Do NOT redesign the tool system.

The button must simply become functional using the application's existing features.

---

# 16. CHECK-IN — DYNAMIC NEARBY POIs

## Current problem

Inside Check-In:

There is a map.

Below the map there is a section showing nearby:

- emergency areas
- closest POIs
- safety-related locations

These locations are currently static.

---

## Required behavior

When the user's current location changes:

The nearby POIs/emergency locations shown below the map must update.

They must be based on:

```text
Current GPS location
```

OR, where the existing Check-In flow is destination-oriented:

```text
Selected destination
```

The displayed nearby locations must not remain the same regardless of where the user is.

Example:

```text
Location A
→ nearby POIs A

Location B
→ nearby POIs B
```

Do not hardcode one static list that is always displayed.

---

# 17. CHECK-IN LOCATION DATA

Use the application's existing location/navigation infrastructure.

If the application currently needs local demonstration data, use the same Lahore dummy-location dataset used by Safe Corridor rather than creating multiple unrelated datasets.

The goal is consistency.

Do not add an unrelated external data architecture.

---

# 18. CUSTOM CHECK-IN TIME

## Current problem

Check-In currently provides fixed options approximately:

```text
15 min
30 min
45 min
60 min
```

---

## Required behavior

Keep the existing predefined time options.

Add:

```text
Custom Time
```

When selected, allow the user to specify their own check-in duration.

Do not remove:

- 15 minutes
- 30 minutes
- 45 minutes
- 60 minutes

The custom value must integrate with the existing check-in timer/session system.

Do not create a second timer system.

---

# 19. AUTOMATIC JOURNEY NOTIFICATION

## Current problem

When the user starts a journey/check-in, selected parents/contacts are supposed to receive notifications.

Currently:

- SMS is not actually arriving on the SIM
- WhatsApp messages are not automatically sent
- WhatsApp requires manual sending

---

## Required intended behavior

When the user starts a journey:

```text
User starts journey
       ↓
Automatically send notification
       ├── SMS
       └── WhatsApp
```

The message should communicate that the journey/check-in has started and include the expected duration/time according to the existing journey data.

Do not make the user manually press send after starting the journey.

---

# 20. SMS DELIVERY

Investigate the existing SMS implementation end-to-end.

Verify:

```text
Frontend
 ↓
Existing backend API
 ↓
Twilio/existing SMS service
 ↓
Selected emergency contact
```

Fix the existing implementation so that the configured SMS is actually sent when the journey begins.

Do not replace Twilio with another service unless the current architecture absolutely requires it.

Do not change the SMS provider simply because it is easier.

Do not fake successful delivery.

If the external provider is unavailable or credentials are missing, surface the actual failure rather than pretending the SMS was delivered.

---

# 21. WHATSAPP AUTOMATION

Use the application's existing WhatsApp-related integration if one already exists.

The desired behavior is:

```text
Start Journey
      ↓
Automatic WhatsApp notification
```

The user should not have to manually send the message.

Do not pretend a WhatsApp message was sent if the required provider/API cannot actually send it.

If the existing provider requires configuration, connect the existing flow correctly.

Do not add a completely different messaging platform.

---

# 22. MISSED CHECK-IN ALERT

If the user does not reach/complete the journey within the selected time:

```text
Check-in expires / missed
       ↓
Emergency alert
       ↓
Selected parent/emergency contacts
```

The alert must include the user's **last active coordinates** available from the existing location tracking.

Conceptually:

```text
Last known GPS position
        ↓
Missed check-in alert
        ↓
Emergency contacts
```

Do not create a new tracking system.

Use the existing Check-In location/session architecture.

---

# 23. AI ASSISTANT VOICE RECORDING

## Current problem

The microphone currently:

1. starts recording
2. records for approximately six seconds
3. automatically stops
4. transcribes
5. disables itself

This is not desired.

---

## Required behavior

Recording should NOT automatically stop after six seconds.

The microphone should remain active until the user explicitly stops it.

Flow:

```text
Click microphone
      ↓
Recording starts
      ↓
Recording continues
      ↓
User clicks Stop
      ↓
Recording stops
      ↓
Audio is transcribed
      ↓
Transcribed message remains available
```

---

# 24. ADD RECORDING STOP BUTTON

When recording starts, show an appropriate existing-style recording control with a clear:

```text
Stop Recording
```

button/action.

When the user presses it:

```text
stop microphone
→ finish recording
→ transcribe
```

Do not automatically stop after six seconds.

Do not change the overall AI Assistant design unnecessarily.

---

# 25. TRANSCRIBED MESSAGE MUST BE USABLE AFTER RECORDING

After recording stops and transcription completes:

The transcribed text should remain in the normal AI Assistant message/input flow.

The user should be able to review it before sending where the existing UI supports this.

Do not automatically send the message unless the existing assistant is already designed to do so.

---

# 26. FIX VOICE TRANSCRIPTION

The current transcription is unreliable/not working.

Inspect the complete pipeline:

```text
Microphone
 ↓
MediaRecorder / browser audio
 ↓
Audio blob
 ↓
Existing transcription service
 ↓
Text
 ↓
AI Assistant input
```

Identify why transcription is failing.

Fix the existing implementation rather than replacing the entire assistant.

Handle:

- microphone permission
- recording lifecycle
- audio blob generation
- supported MIME type
- transcription request
- response parsing
- error handling

Do not add an unrelated speech-to-text architecture.

---

# 27. AI ASSISTANT CHAT HISTORY

## Current problem

There is a History option, but clicking it does not display previous chats.

---

## Required behavior

When the user opens:

```text
History
```

they should see previously saved AI Assistant conversations.

Use the existing conversation/message storage architecture if one exists.

Do not create an unrelated database.

---

# 28. LIMIT CHAT HISTORY TO 20 CHATS

Keep a maximum of:

```text
20 conversations
```

in history.

When more than 20 conversations exist:

- retain only the most recent 20 according to the application's existing ordering model.

Users should be able to reopen/revisit these saved conversations.

Do not add unlimited history.

Do not delete active/current chat unexpectedly.

Do not change the existing chat UI unnecessarily.

---

# 29. SAVE TO PRIVATE NOTE / PRIVATE VAULT

When the user chooses:

```text
Save to Private Note
```

the content must be stored in the existing encrypted Private Vault.

Because the vault is sensitive:

- require the Private Vault password
- authenticate access before saving/accessing sensitive notes
- keep vault data encrypted
- keep vault device-specific

Do not store private notes as plaintext in localStorage.

Do not bypass the existing vault encryption.

---

# 30. FIRST-LOGIN PRIVATE VAULT PASSWORD SETUP

For a real user:

During the first onboarding process:

```text
Account signup
 ↓
Email verification
 ↓
Profile information
 ↓
App/weather password
 ↓
Private Vault password
 ↓
Application
```

The Private Vault password should therefore exist before the user attempts to save sensitive notes.

For existing accounts that do not yet have a Private Vault password, use the existing settings/onboarding flow to establish it before vault access.

Do not silently assign a default password.

Do not use `1234`, `0000`, or another universal password.

---

# 31. MAKE COMPLAINT — INCIDENT DESCRIPTION

## Current problem

When the user clicks:

```text
Make a Complaint
```

the application goes to:

```text
Incident Details & Jurisdiction
```

There is a pre-filled:

```text
Describe the incident in your own words
```

section.

Currently, it appears to use some text from an agent response.

---

## Required behavior

Instead of relying on only the latest AI response:

Collect the user's relevant messages from the current AI Assistant conversation.

Conceptually:

```text
User message 1
User message 2
User message 3
User message 4
...
       ↓
Combine user's messages
       ↓
AI refinement
       ↓
Single coherent incident description
       ↓
Place into "Describe the incident in your own words"
```

Only the user's relevant messages should form the source material for this incident description.

Do not blindly concatenate the entire assistant conversation.

---

# 32. AI REFINEMENT OF INCIDENT DESCRIPTION

The combined user-provided information should be sent through the existing AI capability to produce one coherent, refined incident description.

The goal is:

```text
Raw user messages
       ↓
AI refinement
       ↓
Clear incident narrative
```

The AI must not invent facts that the user did not provide.

Do not add fictional:

- dates
- locations
- people
- injuries
- events
- accusations
- evidence

The refinement should improve clarity and organization while preserving the user's factual information.

---

# 33. USER MUST BE ABLE TO EDIT COMPLAINT DESCRIPTION

After generating the refined incident description:

Place it in the existing incident-description input.

The user must be able to:

- read it
- review it
- modify it
- correct it
- continue with the existing complaint flow

Do not automatically submit the complaint.

Do not prevent editing.

---

# 34. PROFILE ON MOBILE

## Current problem

On mobile, the profile button/icon is not properly available/editable.

---

## Required behavior

Ensure the user's profile can be accessed on mobile using the existing responsive navigation/menu.

The user should be able to view/edit their existing profile information.

Do not create a completely new profile system.

Do not redesign desktop profile behavior.

Make the existing profile functionality available in mobile layout as well.

---

# 35. SETTINGS GEAR

Add a **Settings gear** to the existing application menu/navigation.

Do not redesign the entire navigation.

The gear should open the application's settings area.

---

# 36. SETTINGS CONTENT

Settings should contain the requested existing-account configuration options, including:

### App/weather lock password

Allow the user to manage the application password.

### Private Vault password

Allow the user to manage the Private Vault password.

### Email/password settings

Allow the user to manage the relevant existing authentication credentials using the application's existing authentication system.

### Help

Include a Help option in the settings/menu as requested.

Do not invent a large settings system with unrelated options.

Only add the requested settings.

---

# 37. REMOVE TEMPERATURE-HOLD APP-OPEN FEATURE

The current application has a feature involving holding/maintaining the temperature of the app to open/access it.

Remove this specific feature.

Do not replace it with another unrelated unlocking mechanism.

The intended replacement/access structure is the requested:

```text
Settings gear
      ↓
Help
      ↓
Password screen
      ↓
Enter app password
      ↓
Application access
```

Preserve the existing weather/stealth visual behavior.

Only remove the temperature-hold mechanism described above.

---

# 38. APP PASSWORD ACCESS FLOW

For the real user's first onboarding:

```text
Signup
 ↓
Email verification
 ↓
Phone
 ↓
Address
 ↓
Safe parent number
 ↓
Set app/weather password
 ↓
Confirm
 ↓
Set Private Vault password
 ↓
Enter application
```

After that, when accessing the protected application through the intended existing flow:

```text
Weather/stealth interface
       ↓
Settings gear
       ↓
Help
       ↓
Password screen
       ↓
Correct app password
       ↓
Actual application
```

Do not make the user repeat full signup every time.

---

# 39. MOBILE RESPONSIVENESS

## Current problem

When the application is viewed on a smaller/mobile viewport or zoomed out, a blank white strip appears on the left/right side.

This is especially visible on the landing page.

This indicates an overflow/responsive layout problem.

---

## Required fix

Make the existing application properly responsive across mobile widths.

Especially inspect:

- landing page
- navigation
- hero section
- main content width
- fixed/absolute elements
- horizontal containers
- maps
- cards
- buttons
- menus

Find the actual source of horizontal overflow.

Do NOT simply hide the problem with:

```css
overflow-x: hidden;
```

unless it is genuinely appropriate and does not hide content that should be accessible.

Fix the underlying width/layout issue.

The page should occupy the available viewport without creating an unexplained blank strip.

---

# 40. PRESERVE EXISTING RESPONSIVE DESIGN

Do not create a completely separate mobile UI.

Use the existing responsive design system.

Desktop should continue looking/working as it currently does.

Mobile should correctly adapt.

Do not change the visual identity.

---

# 41. COMPLAINT LOGS

When the user reaches:

```text
Send Complaint
```

the application already has a logs section.

The user wants the log to show that the organization's API endpoint was hit.

When the complaint is successfully sent/handoff is initiated:

```text
Send Complaint
      ↓
Existing organization API endpoint
      ↓
Log entry
```

The logs section should clearly indicate the API endpoint request/action.

Do not fabricate a successful API call.

If the API request fails, the log should reflect the actual failure rather than claiming success.

Use the existing logging mechanism if available.

Do not create a separate unrelated logging system.

---

# 42. GPS / LOCATION IMPLEMENTATION

For the requested Safe Corridor and Check-In behavior, use the browser/device's existing geolocation capabilities where appropriate.

Do not assume that a paid GPS service is required.

The device/browser can provide coordinates.

Where the existing application requires route/location lookup, use the existing location/navigation architecture.

If a free map/routing provider is already configured in the project, reuse it.

Do not replace the existing map stack without a direct reason.

---

# 43. DATA CONSISTENCY

Safe Corridor and Check-In should use consistent location data.

Where dummy Lahore data is required:

```text
One coherent Lahore location dataset
```

should be reused by the relevant existing features instead of maintaining several contradictory hardcoded lists.

The data should support:

- common Lahore locations
- route selection
- nearby POIs
- emergency locations

Do not add unrelated datasets.

---

# 44. DEMO MODE EXCEPTION

The user explicitly wants the current demo mode to remain largely as it currently behaves.

Therefore:

### Demo mode

Keep the existing demo behavior.

Do not force demo users through:

- real email verification
- real phone collection
- real address collection
- real parent number onboarding
- new real-user password setup

unless those steps already exist in demo mode.

### Real users

Use the new onboarding flow described in this document.

Do not mix the two flows.

---

# 45. DO NOT BREAK EXISTING AUTHENTICATION

The application already contains authentication logic.

Before changing it:

- inspect the existing auth utilities
- inspect Supabase authentication
- inspect local/legacy fallback behavior
- inspect current demo authentication

Extend the existing system.

Do not create another authentication layer.

Ensure that:

```text
Landing page
→ Login/Signup
→ Authentication
→ onboarding
→ application
```

works without breaking existing sessions.

---

# 46. DO NOT BREAK EXISTING SECURITY FIXES

The previously identified audit issues must remain fixed.

In particular, do not reintroduce:

- complaint email XSS
- hardcoded personal email recipient
- guest PIN backdoors
- insecure plaintext vault storage
- disabled production CSP
- static password salt
- insecure credential storage

The new changes must remain compatible with the security remediation work.

---

# 47. IMPLEMENTATION ORDER

Implement in this order to reduce regression risk:

## Phase 1 — Routing/auth

1. Landing page → Launch → Login/Signup
2. Real signup
3. Email verification
4. User details
5. App password
6. Private Vault password
7. Demo mode preservation

## Phase 2 — Navigation/UI access

8. Remove prominent Incident Vault home button
9. Functional All Tools dropdown
10. Settings gear
11. Mobile profile
12. Remove temperature-hold mechanism
13. Settings/password/help flow

## Phase 3 — Location/navigation

14. Safe Corridor functionality
15. Lahore dummy route/safety data
16. Consistent Navigate/Safe Corridor naming
17. Dynamic Check-In nearby POIs
18. Current-location updates

## Phase 4 — Check-In

19. Custom duration
20. Automatic journey notification
21. SMS delivery
22. WhatsApp automation
23. Missed check-in alert with last active coordinates

## Phase 5 — AI Assistant

24. Fix recording lifecycle
25. Remove six-second auto-stop
26. Stop Recording control
27. Fix transcription
28. Chat history
29. 20-chat limit
30. Private Note/Vault integration

## Phase 6 — Complaint

31. Aggregate user's messages
32. AI refinement
33. Editable incident description
34. API endpoint logging

## Phase 7 — Responsive UI

35. Fix landing page horizontal overflow
36. Check all mobile layouts
37. Verify no blank side strips

---

# 48. TEST EACH FEATURE AFTER IMPLEMENTATION

Do not wait until the end to discover regressions.

Test after each phase.

---

## AUTH TEST

Test:

```text
Landing
→ Launch
→ Signup
→ Email verification
→ Phone
→ Address
→ Parent number
→ App password
→ Confirm
→ Vault password
→ Application
```

Then test:

```text
Logout
→ Login
→ Application
```

Then:

```text
Forgot password
→ Email
→ Reset
→ Login/access
```

---

# 49. DEMO TEST

Verify:

```text
Landing
→ Launch
→ Demo
→ Existing demo app
```

still works.

Do not force demo mode through real onboarding.

---

# 50. SAFE CORRIDOR TEST

Test several Lahore destinations.

For example:

```text
Destination A
→ route results

Destination B
→ different route/safety results
```

Verify the system is not simply returning the same static demo route.

Verify current location is incorporated where supported.

---

# 51. CHECK-IN TEST

Test:

```text
Start check-in
→ select 15 min
```

Then:

```text
Start check-in
→ select Custom Time
→ enter custom duration
```

Verify the existing check-in timer uses the selected value.

Then test location changes.

Verify nearby locations update.

---

# 52. EMERGENCY CONTACT TEST

Start a journey.

Verify the existing backend attempts to send the configured notification automatically.

Verify:

- SMS request
- WhatsApp request

are actually initiated.

Do not report success if the external provider rejects the request.

Test missed check-in behavior and verify last known coordinates are used.

---

# 53. VOICE TEST

Test:

```text
Microphone
→ start recording
→ wait > 6 seconds
→ recording remains active
→ click Stop
→ transcription
```

The microphone must not stop automatically at six seconds.

---

# 54. CHAT HISTORY TEST

Create multiple chats.

Verify:

```text
History
→ previous conversations appear
→ conversation can be reopened
```

Create more than 20.

Verify only the intended 20 most recent conversations remain.

---

# 55. PRIVATE VAULT TEST

Verify:

```text
Save to Private Note
→ Vault password
→ encrypted save
```

Then:

```text
Vault
→ password
→ access
```

Verify vault content remains device-specific.

Verify plaintext private notes are not stored in insecure storage.

---

# 56. COMPLAINT TEST

Send several user messages in the AI Assistant.

Then:

```text
Make Complaint
```

Verify:

```text
User messages
→ combined
→ AI refined
→ incident description field
```

The user must be able to edit the generated description.

Verify no unsupported facts are invented.

Then:

```text
Send Complaint
```

Verify the existing organization API endpoint is actually called.

Verify the logs section records the API action/result.

---

# 57. MOBILE TEST

Test at common mobile viewport widths.

Verify:

- no horizontal blank strip
- no horizontal overflow
- landing page fits viewport
- menu works
- profile works
- settings gear works
- All Tools works
- Safe Corridor works
- Check-In works
- AI Assistant works
- Complaint flow works

Do not break desktop layout while fixing mobile.

---

# 58. FINAL REGRESSION CHECK

Before considering the task complete, verify that these existing major systems still work:

- Landing page
- Authentication
- Demo mode
- AI Legal Assistant
- RAG/legal retrieval
- Incident Vault
- Complaint Builder
- Complaint handoff
- Check-In
- SOS
- Emergency contacts
- Stealth/Weather interface
- Support Directory
- Safe Navigation/Safe Corridor
- Community Updates
- PWA
- Offline behavior

Do not change their behavior unless explicitly required by this prompt.

---

# 59. FINAL TECHNICAL VALIDATION

Run:

- TypeScript/typecheck
- production build
- existing tests
- lint if already configured

Do not introduce:

- TypeScript errors
- broken imports
- broken routes
- runtime crashes
- console errors caused by the changes
- broken mobile layouts

Do not hide errors using:

```text
any
@ts-ignore
eslint-disable
```

unless already legitimately required.

---

# 60. FINAL REPORT

After implementation, provide a concise but complete report.

Use this structure:

## IMPLEMENTED

List every requested modification.

## FILES CHANGED

List each modified file and explain why it was modified.

## AUTH FLOW

Explain the final real-user flow and demo flow.

## SAFE CORRIDOR

Explain how destination/current-location data now affects route results.

## CHECK-IN

Explain:

- dynamic nearby POIs
- custom time
- SMS
- WhatsApp
- missed check-in
- last coordinates

## AI ASSISTANT

Explain:

- recording
- transcription
- history
- 20-chat limit
- private notes

## COMPLAINT

Explain:

- user-message aggregation
- AI refinement
- editing
- organization API logging

## MOBILE

Explain what caused the horizontal overflow and what was corrected.

## VERIFICATION

Report:

```text
TypeScript: PASS/FAIL
Build: PASS/FAIL
Tests: PASS/FAIL
Mobile: PASS/FAIL
Authentication: PASS/FAIL
Safe Corridor: PASS/FAIL
Check-In: PASS/FAIL
Voice: PASS/FAIL
History: PASS/FAIL
Vault: PASS/FAIL
Complaint: PASS/FAIL
```

If an external integration cannot be fully tested because credentials/provider configuration is unavailable, explicitly state that.

Do NOT claim something works if it was only mocked or assumed to work.

---

# FINAL INSTRUCTION

**Implement exactly the requirements in this document.**

Do not add functionality because you think it would be useful.

Do not redesign the application.

Do not modernize unrelated code.

Do not replace working systems unnecessarily.

Do not change existing behavior unless this document specifically requests that behavior to change.

Do not remove existing features except where explicitly requested.

The highest priority is:

```text
EXISTING MEHFOOZ FUNCTIONALITY
        +
REQUESTED MODIFICATIONS
        =
STABLE MEHFOOZ
```

Every change must be:

**minimal, integrated, secure, backwards-compatible, and directly traceable to a requirement in this prompt.**