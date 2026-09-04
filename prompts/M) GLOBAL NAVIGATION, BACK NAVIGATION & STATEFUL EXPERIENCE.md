## M) GLOBAL NAVIGATION, BACK NAVIGATION & STATEFUL EXPERIENCE

### M.1 Navigation must be properly implemented across the entire app

The application currently has forward navigation in several flows, such as:

- Submit a report
- Create a complaint
- Incident details
- Jurisdiction selection
- AI Assistant feature transitions
- Voice mode
- Other existing multi-step screens

However, some screens do not provide a way to return to the previous screen.

**Implement a consistent navigation system throughout the existing application.**

Requirements:

- Wherever a user enters a multi-step flow, provide a clear way to go back to the previous step/screen.
- Existing UI design must be preserved.
- Use the application's existing navigation patterns, icons, buttons, spacing, and styling wherever possible.
- Do NOT redesign the application navigation.
- Do NOT introduce a completely new navigation framework unless the existing architecture genuinely requires one.
- The browser/mobile back behavior should also be handled appropriately where applicable.
- Back navigation must return the user to the previous logical state rather than unexpectedly resetting the flow.
- Forward navigation using existing "Next", "Continue", "Submit", etc. buttons must continue working exactly as before.
- Do not break existing complaint/report submission logic.

### M.2 Multi-step flows must preserve their state

For flows such as:

`Step 1 → Step 2 → Step 3 → Step 4`

the user must be able to:

`Step 4 → Back → Step 3 → Back → Step 2`

without losing information already entered.

Preserve:

- Form values
- Selected options
- Uploaded/attached information where applicable
- Current step
- Existing validation state where appropriate
- Any existing draft data

Do not restart the entire flow simply because the user navigates backward.

If the user leaves a flow temporarily and returns through normal in-app navigation, preserve its state unless the existing product behavior explicitly requires clearing it.

---

## M.3 CRITICAL: AI ASSISTANT MUST BE STATEFUL

The AI Assistant currently behaves in a stateless manner when the user moves between features.

Example of the current problem:

1. User opens AI Assistant.
2. User has a conversation with the agent.
3. Agent gives a response.
4. User clicks another feature, such as Voice Mode or another existing assistant action.
5. The agent continues speaking even though the user has navigated away.
6. User returns to Chat.
7. The previous conversation is gone.
8. A new empty chat starts.

This behavior must be fixed.

### Required behavior

The AI Assistant must maintain **one active conversation state** while the user navigates around the application.

The conversation should NOT disappear simply because the user:

- Opens another feature
- Opens voice mode
- Navigates to another existing assistant screen
- Goes to another page
- Returns to the assistant
- Uses another part of the application
- Temporarily leaves the assistant

The active conversation should remain available exactly where the user left it.

### M.4 Conversation lifecycle

Implement the following conversation lifecycle:

**Open Chat**

→ Existing active conversation is loaded.

**Send messages**

→ Messages are added to the same active conversation.

**Agent responds**

→ Response is stored in the active conversation state.

**Navigate somewhere else**

→ Active conversation remains stored.

**Return to Chat**

→ The exact same conversation is restored.

**Continue chatting**

→ New messages continue in the same conversation.

**Start New Chat**

→ Only NOW should a new conversation be created.

This means:

> Navigation is NOT the same thing as starting a new chat.

A new chat must only be created when the user explicitly chooses the existing "New Chat" functionality.

Do not create a new conversation automatically when the Chat component mounts/remounts.

---

## M.5 Prevent chat state from being tied only to component mounting

Inspect the existing React state architecture carefully.

Do NOT rely exclusively on local component state such as:

- `useState()` inside the Chat component
- Component mount/unmount lifecycle
- Route/component remounting

if doing so causes the conversation to disappear.

The active conversation should be maintained at an appropriate application-level state layer or existing persistence/state mechanism.

Use the application's existing architecture wherever possible.

Do NOT introduce Redux, Zustand, another state library, or a completely new architecture unless the existing application genuinely requires it.

The goal is:

**component navigation ≠ conversation deletion**

A Chat component being unmounted must not automatically mean:

`activeConversation = null`

---

# M.6 Voice Mode MUST be tied to the active conversation

There is another critical state issue with Voice Mode.

Current problematic behavior:

1. Agent responds in Chat.
2. User activates Voice Mode.
3. Agent starts speaking.
4. User navigates away from Voice Mode.
5. Voice continues speaking in the background.
6. User returns to Chat.
7. Chat has been reset/newly created.

This must be fixed.

### Required behavior

Voice Mode must belong to the **current active conversation/session**.

When the user leaves Voice Mode:

- Stop or appropriately pause active speech/audio.
- Clean up the speech/audio resources.
- Do not allow audio playback to continue unexpectedly in the background.
- Do not leave orphaned audio/speech processes running.
- Preserve the conversation state.
- Preserve the agent response that was being spoken.
- Return to the same active conversation when the user returns to Chat.

### Important

If the user navigates away from Voice Mode, the application must NOT interpret that navigation as:

`Voice Mode closed → destroy Chat → create new Chat`

Instead:

`Voice Mode closed → stop/cleanup voice → preserve active Chat → user can return to same conversation`

---

# M.7 Voice playback lifecycle

Inspect the existing voice implementation and correctly manage:

- Audio playback
- Speech synthesis
- Audio references
- Media streams
- MediaRecorder where applicable
- Event listeners
- Timers
- Abort/cancellation handlers
- Component cleanup
- Navigation changes

When Voice Mode is exited or the user navigates to another page:

1. Detect that Voice Mode is no longer active.
2. Stop/cancel active speech playback where appropriate.
3. Release media/audio resources.
4. Remove listeners/timers associated with the voice session.
5. Preserve the AI conversation.
6. Restore the conversation when the user returns.

Do not leave background speech running.

Do not create duplicate speech playback when the component remounts.

Do not replay an old response automatically unless that is already an explicit existing feature.

---

# M.8 Returning to Chat must restore the exact active state

When returning to Chat, restore:

- Existing conversation
- Existing messages
- User messages
- Agent responses
- Current conversation ID
- Conversation metadata already supported by the application
- Relevant voice/interaction state where appropriate
- Existing draft/input state if the user had typed something and the current architecture supports preserving it

Do NOT show a blank chat unless:

- The user explicitly selected "New Chat", or
- The active conversation genuinely does not exist.

---

# M.9 Maximum 20 chat history integration

The existing requirement to maintain a maximum of 20 chats must work together with this stateful behavior.

There should be a distinction between:

### Active conversation

The conversation currently being used.

### Chat history

Previously saved conversations that the user can revisit.

### New Chat

An explicit user action that creates a new active conversation.

Do not accidentally create a new history entry every time the user navigates away and comes back.

Do not create duplicate conversations because of React component remounts.

The same conversation should retain its identity while the user is actively using it.

---

# M.10 Navigation and state must work together

Treat navigation and state as two separate concerns.

Navigation should answer:

> "Where is the user?"

State should answer:

> "What was the user doing there?"

Changing location in the application must not automatically destroy application state.

For example:

### Complaint

`Complaint → Incident Details → Back`

must preserve the complaint information.

### AI Chat

`Chat → Voice Mode → Chat`

must preserve the conversation.

### AI Chat

`Chat → Other Feature → Chat`

must preserve the conversation.

### Check-In

`Check-In → another existing page → Check-In`

must preserve the active check-in state where the existing architecture requires it.

### Multi-step forms

`Step 3 → Step 2`

must preserve previously entered information.

---

# M.11 Browser/mobile Back behavior

Where the application uses client-side routing or route-like screen transitions, ensure browser/mobile back navigation behaves predictably.

Do not allow the back action to unexpectedly:

- Reload the entire application
- Reset the current conversation
- Create a new chat
- Clear a form
- Return to an unrelated page
- Trigger duplicate initialization

Use the existing routing/navigation architecture where available.

If the application currently uses internal state-based navigation rather than a router, implement back-state handling within that existing architecture rather than unnecessarily replacing the navigation system.

---

# M.12 Navigation buttons for existing flows

Audit all existing multi-step flows and identify screens where:

- Next exists but Back does not
- Continue exists but Back does not
- A modal/page opens without a clear return path
- A feature opens another feature without a return mechanism
- A nested assistant feature has no way to return to the parent context

Add the missing Back behavior using the existing UI language.

Do NOT add random navigation buttons to screens where they do not logically belong.

Do NOT redesign the header/navigation system.

The objective is simply to make existing flows reversible and state-safe.

---

# M.13 Do not destroy state during route/component transitions

Inspect for patterns such as:

- `useEffect()` resetting state on mount
- Initialization functions running every time a screen mounts
- Chat IDs being regenerated on mount
- Conversation arrays being initialized to empty on every mount
- Voice state being initialized without checking existing active state
- Cleanup functions accidentally deleting persisted state
- Navigation handlers calling reset functions
- Feature switches clearing global state
- Local storage/session storage being overwritten during initialization
- API calls creating a new conversation every time Chat loads

Fix these issues without changing the intended application behavior.

---

# M.14 State persistence boundaries

Use the appropriate persistence level for each type of state.

### Temporary UI state

May remain in React/application state where appropriate.

Examples:

- Current screen
- Modal visibility
- UI toggles

### Active workflow state

Should survive normal navigation.

Examples:

- Complaint draft
- Multi-step form progress
- Active AI conversation
- Active check-in/journey state where already supported

### Chat history

Should use the application's existing history/persistence mechanism and retain a maximum of 20 chats.

### Private information

Must continue following the application's existing encryption/private-vault architecture.

Do NOT store sensitive private data in insecure plain-text storage simply to solve state persistence.

---

# M.15 Do NOT change the product behavior beyond this requirement

This navigation/state work is intended to fix broken behavior.

Do NOT:

- Invent new features
- Add a new navigation product
- Redesign the application
- Replace the existing UI
- Replace the existing AI architecture
- Replace the existing authentication system
- Replace the existing vault architecture
- Add an unnecessary state-management library
- Create new tools that are not already part of the application
- Change the legal/RAG behavior
- Change existing complaint functionality except where required for state preservation

Use the current architecture and make the smallest reliable changes necessary.

---

# M.16 Required testing for navigation/state

Before considering this implementation complete, manually test at minimum:

### Test 1 — Complaint navigation

`Complaint → Step 2 → Step 3 → Back → Step 2`

Verify all previously entered information remains.

### Test 2 — Chat navigation

`Chat → send message → receive response → leave Chat → return Chat`

Verify the exact same conversation remains.

### Test 3 — Chat to Voice

`Chat → agent response → Voice Mode → return to Chat`

Verify:

- Speech does not continue unexpectedly.
- Same conversation remains.
- Previous messages remain.
- No new chat is created.

### Test 4 — Chat to another feature

`Chat → another existing feature → Chat`

Verify the conversation remains unchanged.

### Test 5 — New Chat

`Existing Chat → New Chat`

Verify a genuinely new conversation starts only after the explicit New Chat action.

### Test 6 — History

Create/use multiple conversations and verify:

- They appear in History.
- Existing conversations can be reopened.
- Maximum 20 chats is respected.
- Returning to an active conversation does not create duplicates.

### Test 7 — Browser/mobile Back

Test browser/mobile back behavior through the major flows.

Verify that navigation does not unexpectedly reset state.

### Test 8 — Voice cleanup

Start Voice Mode, navigate away, and verify:

- Audio/speech stops appropriately.
- No background playback remains.
- No duplicate audio starts when returning.
- Conversation remains intact.

---

## M.17 Final state-management principle

The final implementation must follow this rule:

> **The user can move around the application without losing what they were doing.**

And specifically for the AI Assistant:

> **A conversation remains alive until the user explicitly starts a new chat.**

Navigation, component unmounting, switching features, opening Voice Mode, closing Voice Mode, or returning to Chat must NEVER implicitly create a new conversation.