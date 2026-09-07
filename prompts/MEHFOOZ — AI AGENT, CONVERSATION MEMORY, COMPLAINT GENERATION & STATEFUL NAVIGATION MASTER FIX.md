# MEHFOOZ — AI AGENT, CONVERSATION MEMORY, COMPLAINT GENERATION & STATEFUL NAVIGATION MASTER FIX

## IMPORTANT

This is a **targeted bug-fix and reliability task**, NOT a redesign.

The existing Mehfooz application already has an AI assistant, complaint flow, legal/RAG functionality, authentication, private vault, navigation, voice mode, Supabase persistence, and other existing functionality.

Fix the existing implementation **without breaking any pre-existing functionality, UI design, visual identity, routes, APIs, security model, or workflows**.

Do not invent new features.

Do not replace working architecture unnecessarily.

Do not introduce Redux, Zustand, another state-management library, another AI provider, or a completely new routing architecture unless inspection proves the existing architecture cannot support the fix.

First inspect the existing implementation and understand how the current system works. Then make the smallest robust changes necessary.

---

# 1. PRIMARY PROBLEMS TO FIX

The current AI experience has several related problems:

1. The AI does not reliably remember previous user messages.
2. Follow-up questions are treated as independent questions.
3. The user sometimes has to manually type something like "this is a workplace harassment case" before the complaint workflow progresses.
4. The AI can continue answering normally instead of recognizing that the user is trying to create a complaint/report.
5. AI responses are unnecessarily long.
6. The complaint draft may contain raw user messages concatenated together instead of a coherent report.
7. The AI-generated `incident_summary` is not reliably being used by the complaint draft flow.
8. Navigation away from Chat can destroy the current conversation.
9. Voice mode can continue speaking after the user navigates away.
10. Returning to Chat can create a new conversation instead of restoring the existing conversation.
11. Chat history and active conversation state are not clearly separated.
12. Tool/action execution can become disconnected from the conversation context.

These should be treated as one coordinated reliability problem.

---

# 2. FIRST: INSPECT THE EXISTING CODE

Before changing anything, inspect at minimum:

- `src/App.tsx`
- AI Assistant / Chat component
- Chat state utilities
- `server/agent/runner.ts`
- `server/agent/systemPrompt.ts`
- `server/agent/confirmation.ts`
- `orchestrator.ts`
- Any conversation/history utility
- Any Supabase conversation/message queries
- Any complaint creation API
- Any complaint builder UI
- Any voice-mode implementation
- Any routing/navigation implementation
- `types.ts`
- Authentication/user state handling

Also search the entire project for:

```text
conversationId
saveMessage
messages
history
newChat
startNewChat
prepareComplaintDraft
incident_summary
category
complaint
voice
speechSynthesis
MediaRecorder
generateContent
maxOutputTokens
orchestrate
```

Do not assume the previously identified lines are still identical. Verify the current code first.

---

# 3. FIX CONVERSATION MEMORY CORRECTLY

## Current underlying problem

The AI must receive a complete and correctly ordered conversation context.

Saving only assistant messages is incorrect.

The conversation should contain:

```text
USER
ASSISTANT
USER
ASSISTANT
USER
ASSISTANT
```

not:

```text
ASSISTANT
ASSISTANT
ASSISTANT
```

and not:

```text
USER
USER
USER
ASSISTANT
```

unless that is genuinely the stored chronological order.

---

# 4. USER MESSAGE MUST BE PERSISTED

When the user sends a message:

1. Identify the active `conversationId`.
2. Save the user message.
3. Load the conversation history.
4. Include the current user message exactly once in the model context.
5. Run the agent.
6. Save the assistant response.
7. Save any tool/action results where the existing architecture supports this.
8. Return the final response.

### CRITICAL: prevent duplicate user messages

Do NOT both:

- save the user message to the database, AND
- load it from the database, AND
- append it again manually

without checking whether it already exists.

The model must receive each user message exactly once.

---

# 5. CONVERSATION HISTORY MUST BE ORDERED

When loading conversation history, explicitly preserve chronological order.

The effective model context should look like:

```text
Earlier user message
Earlier assistant response
Later user message
Later assistant response
Current user message
```

Do not reverse the order.

Do not arbitrarily truncate away the most relevant recent turns.

Use the existing conversation storage mechanism.

---

# 6. DO NOT CREATE A NEW CHAT ON EVERY REQUEST

A major bug to eliminate:

```text
Chat component mounts
→ create new conversation
```

This must NOT happen.

A new conversation should only be created when:

- the user explicitly clicks "New Chat", or
- there is genuinely no active conversation.

Normal component mounting/remounting must restore the active conversation.

---

# 7. ACTIVE CONVERSATION VS CHAT HISTORY

These must be treated as different concepts.

### Active conversation

The conversation currently being used.

### History

Previously saved conversations.

### New Chat

Explicitly creates a new active conversation.

Therefore:

```text
Chat
↓
Other feature
↓
Chat
```

must return to the SAME active conversation.

It must NOT become:

```text
Chat
↓
Other feature
↓
New Chat
```

---

# 8. FOLLOW-UP QUESTIONS MUST USE CONTEXT

The AI should understand conversational references.

Example:

```text
User:
My manager keeps making inappropriate comments.

AI:
I'm sorry you're experiencing this. Can you tell me when this started?

User:
About three months ago.

AI:
...
```

The AI must understand that:

```text
"About three months ago"
```

refers to the workplace harassment situation already being discussed.

It must NOT respond:

> "What are you referring to?"

unless the context genuinely cannot determine the reference.

---

# 9. SHORT ANSWERS MUST NOT MEAN CONTEXT-FREE ANSWERS

Do not solve the long-response problem by simply reducing token count.

The agent must remain context-aware.

Use both:

### Model instruction

Tell the AI to be concise.

### Technical output constraint

Use an appropriate `maxOutputTokens`.

But do not set the token limit so low that the agent cannot:

- answer a legal question
- explain an important safety action
- complete a tool call
- produce a complaint summary

The exact value should be chosen after inspecting the actual response requirements.

A reasonable starting point may be around 500–800 tokens for normal assistant turns, but use the smallest value that does not truncate legitimate responses.

---

# 10. IMPROVE THE SYSTEM PROMPT

Update the existing system prompt rather than replacing the entire AI architecture.

Add explicit instructions along these lines:

```text
CONVERSATIONAL CONTEXT

You are operating within an ongoing conversation.

Always use the supplied conversation history.

Treat follow-up answers as continuations of the current topic unless the user clearly changes topics.

Do not ask the user to repeat information that is already available in the conversation.

If the user says "yes", "no", "that happened three months ago", "my manager", "the same person", "continue", "go ahead", or similar contextual language, interpret it using the previous conversation.

Do not restart the conversation unless the user explicitly starts a new conversation.

RESPONSE LENGTH

Keep normal responses concise.

Prefer approximately 3–5 sentences or a short bullet list.

Do not repeat information the user has already provided.

Do not provide unnecessary background information.

Only provide detailed explanations when the question requires them or the user explicitly asks for detail.

COMPLAINT CONTEXT

When the conversation contains enough information to prepare a complaint, use the information already provided.

Do not force the user to repeat their situation merely to identify the complaint category.

Never invent facts.

Never assume dates, locations, people, organizations, injuries, evidence, witnesses, or events that the user did not provide.

If a critical fact is genuinely missing, ask only for the missing information.

```

Adapt this to the existing prompt rather than blindly replacing existing legal/safety instructions.

---

# 11. FIX INTENT DETECTION / COMPLAINT WORKFLOW

This is especially important.

The problem is NOT simply that the AI needs a better prompt.

The application must correctly understand when the user is trying to make a complaint.

For example:

```text
User:
My supervisor has been sending me inappropriate messages.

AI:
...

User:
It started last month.

AI:
...

User:
I want to report this.
```

The application should recognize that the user wants to proceed to the complaint workflow.

The user should NOT have to manually type:

> "This is a workplace harassment case"

just to make the application understand.

---

# 12. DO NOT RELY ONLY ON ONE KEYWORD

Do not implement simplistic logic such as:

```text
if message.includes("harassment")
```

or:

```text
if message.includes("complaint")
```

The existing AI intent classification should be used.

The classifier should consider:

- Current message
- Recent conversation history
- Existing detected intent
- Existing complaint category if already known
- Existing incident information

For example:

```text
"I want to report this"

```

has little meaning by itself.

But:

```text
Conversation:
"My manager keeps sending inappropriate messages."
"He's also threatened to fire me."
"I want to report this."
```

clearly indicates complaint/report intent.

The conversation context must therefore participate in intent classification.

---

# 13. DO NOT PREMATURELY CREATE A COMPLAINT

Context awareness does NOT mean the system should immediately create a complaint every time a sensitive topic appears.

The AI should distinguish between:

### Asking for information

```text
What is workplace harassment?
```

and:

### Describing an incident

```text
My manager keeps sending inappropriate messages.
```

and:

### Requesting action

```text
I want to report this.
```

Only the appropriate action should trigger the complaint workflow.

Preserve the existing complaint workflow and confirmation requirements.

---

# 14. COMPLAINT DESCRIPTION MUST BE AI-GENERATED AND COHERENT

This is a major required fix.

The current implementation may simply concatenate user messages.

That is NOT acceptable.

For example, if the user said:

```text
My manager keeps sending me inappropriate messages.

It started about three months ago.

I told him to stop but he continued.

I have screenshots.
```

Do NOT generate:

```text
My manager keeps sending me inappropriate messages. It started about three months ago. I told him to stop but he continued. I have screenshots.
```

as the only processing step.

Instead, use the AI to create a concise, professional, factual incident description while preserving the user's facts.

Example structure:

```text
The user reports that their manager has been sending inappropriate messages for approximately three months. The user states that they asked the manager to stop, but the messages continued. The user reports having screenshots documenting the messages.
```

The exact wording should be generated from the actual conversation.

---

# 15. CRITICAL: NEVER INVENT FACTS

The complaint summarizer must have strict grounding.

It may:

- Combine related statements
- Remove repetition
- Correct grammar
- Improve sentence structure
- Organize chronology
- Convert conversational language into professional language

It must NOT:

- Add events
- Add dates
- Add locations
- Add names
- Add witnesses
- Add threats
- Add physical harm
- Add evidence
- Add legal conclusions
- Add motives
- Add claims not stated by the user

If something is unknown, leave it unknown.

---

# 16. USE THE AI FOR REFINEMENT, NOT FACT CREATION

The complaint generation pipeline should conceptually be:

```text
Current conversation
        ↓
Extract relevant user-provided facts
        ↓
AI factual refinement/summarization
        ↓
Grounded concise incident description
        ↓
User sees draft
        ↓
User can edit
        ↓
Existing complaint workflow continues
```

Do NOT send the raw conversation directly into the database as the final complaint description.

---

# 17. EXTRACT USER FACTS BEFORE SUMMARIZATION

Where practical, separate:

### User-provided facts

from:

### Assistant-generated content

The complaint should primarily be grounded in the user's statements.

Do not accidentally include assistant suggestions as if they were facts.

For example, if the assistant says:

> "Was your manager threatening you?"

and the user replies:

> "No."

the complaint must NOT include a threat.

Similarly, if the assistant asks:

> "Did this happen at your office?"

and the user never answers, do not assume the location was the office.

---

# 18. FIX `incident_summary`

Inspect:

```text
server/agent/confirmation.ts
```

and the function responsible for preparing the complaint draft.

If it receives:

```text
incident_summary
```

but does not actually use it, fix that.

The final complaint draft should use the AI-generated summary.

Do not replace the summary with placeholders such as:

```text
category | district | draft
```

unless those are merely metadata fields and not the actual incident description.

---

# 19. KEEP COMPLAINT METADATA SEPARATE

Where supported by the existing schema, maintain separate fields for:

- Category
- District
- Incident description/summary
- Requested support
- Tracking number
- Status

Do not combine unrelated fields into one sentence simply to make the database work.

Use the existing database schema.

Do not redesign the database unless absolutely necessary.

---

# 20. COMPLAINT DRAFT MUST BE REVIEWABLE

Before final submission:

```text
AI-generated factual draft
        ↓
User reviews
        ↓
User edits if necessary
        ↓
User confirms
        ↓
Existing submission process
```

The user must have the opportunity to correct the AI.

The AI must not silently submit an unreviewed generated description.

---

# 21. AGENT SHOULD KNOW WHEN A TOOL/ACTION HAS ALREADY OCCURRED

Prevent repeated actions caused by missing context.

For example, if a complaint draft has already been prepared, the agent should not repeatedly prepare the same draft every time the user sends a follow-up message.

Use existing conversation/tool state where available.

Avoid loops such as:

```text
User asks question
→ Agent answers
→ Agent prepares complaint
→ Agent answers
→ Agent prepares complaint again
```

unless the user explicitly requests another draft.

---

# 22. FIX AGENT TOOL LOOP

Inspect:

```text
server/agent/runner.ts
```

The agent loop must have a clear lifecycle:

```text
Receive user message
↓
Load conversation
↓
Determine intent/context
↓
Call model
↓
If model requests tool:
    execute tool
    return tool result to model
↓
Model produces final answer
↓
Save assistant response
↓
Return response
```

Prevent unnecessary repeated model/tool cycles.

Keep the existing bounded loop.

Do not allow an agent to continue indefinitely because it keeps generating another response.

---

# 23. MODEL MUST NOT ANSWER "ON ITS OWN" FOREVER

If the user sends a message and the model has already produced a valid final response:

STOP.

Do not automatically ask the model another question.

Do not automatically generate another assistant response.

Do not recursively call Gemini simply because the previous response exists.

Only continue the agent loop when the model explicitly requests an existing tool/action that requires another model turn.

---

# 24. GEMINI CONFIGURATION

Inspect how Gemini is initialized.

Verify:

- API key comes from environment configuration.
- No key is hardcoded.
- The same intended model is used consistently.
- Errors are handled properly.
- Timeouts exist.
- Rate/API failures do not cause infinite retries.
- The application does not silently fall back to an unintended model.

Do not expose the API key in frontend code.

If Gemini is server-side, keep it server-side.

---

# 25. DO NOT SOLVE CONTEXT WITH A GIANT PROMPT

Do NOT simply send the entire database/history forever.

Use the existing conversation history mechanism intelligently.

At minimum:

- Preserve recent conversation turns.
- Preserve important existing conversation context.
- Keep messages ordered.
- Avoid duplicate messages.
- Avoid sending irrelevant conversations.
- Maintain the active conversation ID.

If there is already a history/context utility, extend it instead of creating a second competing system.

---

# 26. CHAT STATE MUST SURVIVE NAVIGATION

This connects directly with the previous navigation requirement.

The active chat must survive:

```text
Chat
→ Voice Mode
→ Back
→ Chat
```

and:

```text
Chat
→ Another existing feature
→ Chat
```

and:

```text
Chat
→ Settings
→ Chat
```

The conversation must remain exactly where the user left it.

---

# 27. DO NOT RESET CHAT ON COMPONENT MOUNT

Search for code like:

```typescript
setMessages([])
```

or:

```typescript
createConversation()
```

inside mount effects.

Verify whether those operations accidentally run every time the user returns to Chat.

Replace that behavior with:

```text
If active conversation exists:
    restore it

Else:
    create a conversation only when appropriate
```

---

# 28. VOICE MODE MUST NOT DESTROY CHAT

When Voice Mode opens:

```text
Current Chat
    ↓
Voice Mode
```

Voice Mode should reference the SAME active conversation.

It must not create another conversation.

When Voice Mode closes:

```text
Voice Mode
    ↓
Current Chat
```

the original conversation must be restored.

---

# 29. VOICE PLAYBACK MUST STOP ON EXIT

When the user navigates away from Voice Mode:

- Cancel active speech synthesis where applicable.
- Stop active audio playback.
- Stop associated media resources.
- Remove listeners.
- Clear timers.
- Prevent duplicate playback.
- Prevent background speech.

The voice lifecycle must be tied to the Voice Mode lifecycle.

Do not leave speech running after the user has navigated away.

---

# 30. DO NOT LOSE THE LAST AI RESPONSE

If the AI just answered:

```text
The incident appears to involve workplace harassment...
```

and the user enters Voice Mode, then returns to Chat:

that exact response must still exist in the conversation.

It must not disappear simply because the Chat component unmounted.

---

# 31. CHAT HISTORY MAXIMUM 20

Maintain the existing requirement:

**Maximum 20 conversations in history.**

But do not delete the currently active conversation simply because a component remounted.

The 20-chat limit applies to actual conversations, not navigation events.

Do not create duplicate history records when navigating.

---

# 32. GPS FIX MUST REMAIN PART OF THIS RELEASE

Also include the previously identified GPS and contact fixes.

### GPS

`SafeNavigation` must use real browser/device geolocation when available.

Do not always use:

```text
Gulberg
```

as the user's origin.

Use:

```typescript
navigator.geolocation.getCurrentPosition(...)
```

or the existing location utility if one already exists.

Use the actual coordinates for the navigation origin.

If location permission is denied/unavailable:

- Show an accurate error/state.
- Do not falsely claim GPS is active.
- Use the existing fallback behavior only where appropriate.

---

# 33. GPS MUST NOT BE FAKED

Never display:

> "Current location"

if the coordinates are actually hardcoded.

Never claim:

> "Live GPS"

when the app is using demo coordinates.

Clearly distinguish real location from fallback/demo data.

---

# 34. EMERGENCY CONTACTS MUST ONLY SHOW REAL USER DATA

The SafeNavigation contact section must not fall back to unrelated hardcoded contacts such as:

- Tulsi
- Rudra
- Swapnil Das

if those are not the user's actual contacts.

Fix the onboarding persistence path.

Ensure:

```text
Onboarding
→ emergency contact
→ user profile
→ persistence
→ SafeNavigation
```

is connected correctly.

If there are no contacts:

show the existing appropriate empty state.

Do not invent contacts.

---

# 35. DEPLOYED APP GPS REQUIREMENTS

Because GPS worked differently during development/testing, inspect deployment-related issues too.

Verify:

- Application is served over HTTPS in production.
- Browser geolocation permission is requested correctly.
- Geolocation is not being blocked by an insecure context.
- No frontend CSP or permissions policy blocks geolocation.
- Errors from `navigator.geolocation` are surfaced accurately.
- The production build contains the same location implementation as development.
- No environment-specific code replaces GPS with demo coordinates.

Do not assume that adding `getCurrentPosition()` alone proves production GPS works.

---

# 36. CONTACT PERSISTENCE MUST WORK FOR REAL USERS

Verify the complete real-user flow:

```text
Signup
→ Email verification
→ Onboarding
→ Add one emergency contact
→ Save
→ Enter app
→ SafeNavigation
```

The exact contact entered during onboarding must appear.

Then verify:

```text
Refresh page
→ contact still exists
```

and, where the existing architecture supports it:

```text
Logout
→ Login
→ contact still exists
```

Do not break Supabase/local fallback behavior.

---

# 37. DEMO USER MUST REMAIN DEMO USER

Do not remove the existing demo mode.

The requested behavior is:

### Real user

Uses real authentication, onboarding, contacts, vault/passwords, etc.

### Demo user

Can continue using the existing demo behavior.

Do not accidentally expose demo contacts/data to real users.

Do not use demo data as a fallback for missing real-user data.

---

# 38. FINAL AI RESPONSE BEHAVIOR

The AI should behave approximately like this:

### User asks a general question

Answer concisely.

### User provides incident information

Acknowledge and ask only the next useful question if more information is genuinely needed.

### User provides a follow-up answer

Use previous context.

### User asks to report/complain

Recognize the intent using the entire conversation.

### Enough information exists

Prepare a coherent factual complaint draft.

### Information is missing

Ask only for the critical missing information.

### Draft created

Show it to the user for review/editing.

### User confirms

Continue the existing complaint submission flow.

---

# 39. DO NOT FORCE THE USER TO CLASSIFY THEIR OWN INCIDENT

The AI should infer the likely category from the conversation where possible.

For example:

```text
My manager keeps sending me inappropriate messages.
He started doing this three months ago.
I asked him to stop.
I want to report him.
```

The user should not have to additionally type:

```text
This is a workplace harassment case.
```

The agent can identify the likely category from the existing conversation.

However, if the category is genuinely ambiguous, ask a concise clarification rather than guessing.

---

# 40. PRESERVE USER WORDING WHERE IT MATTERS

The AI-generated report should be professional but should not erase important uncertainty.

For example:

User:

> "I think he shared my photo without permission."

Do not transform this into:

> "He shared my photo without permission."

The word:

> "I think"

represents uncertainty and must remain appropriately represented.

Likewise:

- "I believe"
- "I was told"
- "I don't remember exactly"
- "approximately"
- "possibly"

must not be converted into confirmed facts.

---

# 41. LEGAL SAFETY

The complaint summarizer must not turn the user's description into a definitive legal conclusion.

For example:

User:

> "My manager sent me inappropriate messages."

Do not automatically write:

> "The manager committed a criminal offense."

Instead describe the reported conduct factually.

The existing legal/RAG functionality remains responsible for legal information.

---

# 42. ERROR HANDLING

If Gemini fails:

- Do not create a fake AI-generated complaint.
- Do not claim the AI verified something when it did not.
- Show the existing appropriate error/fallback behavior.
- Preserve the user's conversation.
- Do not lose the user's entered information.

If complaint summarization fails, do not silently save malformed raw conversation text as a polished report.

Use the existing fallback only if it is safe and truthful.

---

# 43. OBSERVABILITY / LOGGING

Add useful server-side logs around the actual workflow, without logging sensitive user content unnecessarily.

Log events such as:

```text
conversation received
conversation history loaded
user message persisted
agent started
tool requested
tool executed
assistant response persisted
complaint draft generation started
complaint draft generation completed
organization API request started
organization API result received
```

Do NOT log:

- API keys
- passwords
- private vault contents
- unnecessary personal information
- complete sensitive incident descriptions unless the existing secure logging architecture explicitly requires it

---

# 44. COMPLAINT SUBMISSION LOG

When the user clicks:

```text
Send Complaint
```

the logs must show the actual organization/API request lifecycle.

For example:

```text
[Complaint] Send initiated
[Complaint] Organization endpoint: <configured endpoint>
[Complaint] Request started
[Complaint] Response received: <actual status>
[Complaint] Submission result: success/failure
```

Do not log a fake success message.

Do not claim an organization received a complaint unless the configured integration actually confirms it.

---

# 45. STATEFUL NAVIGATION TEST MATRIX

After implementation, test:

## Chat

```text
Chat
→ message
→ response
→ another page
→ Chat
```

Expected:

Same conversation.

## Chat + Voice

```text
Chat
→ response
→ Voice Mode
→ leave Voice Mode
→ Chat
```

Expected:

- Speech stops.
- Same chat.
- Same messages.
- No new conversation.

## Chat + New Chat

```text
Chat
→ New Chat
```

Expected:

New conversation.

## Complaint

```text
Chat
→ Make Complaint
→ Incident Details
→ Back
```

Expected:

Previous information remains.

## Complaint from conversation

```text
User describes incident
→ follow-up answers
→ "I want to report this"
→ Make Complaint
```

Expected:

Existing conversation context is used.

User should not have to manually classify the incident if the context is sufficient.

---

# 46. AI MEMORY TEST

Use a test conversation such as:

```text
User:
My manager has been sending me inappropriate messages.

AI:
...

User:
It started around three months ago.

AI:
...

User:
I asked him to stop.

AI:
...

User:
I want to report this.
```

Verify that the final turn understands:

- Manager
- Inappropriate messages
- Approximate three-month timeframe
- User asked the manager to stop
- User wants to report the incident

The user must NOT need to repeat:

> "This is workplace harassment."

---

# 47. COMPLAINT QUALITY TEST

Given:

```text
My manager has been sending me inappropriate messages.
It started around three months ago.
I asked him to stop but he continued.
I have screenshots.
I want to report this.
```

The complaint draft should be:

- coherent
- concise
- professional
- grammatically correct
- factually grounded
- based on user statements
- editable by the user

It must NOT simply concatenate messages.

It must NOT invent missing information.

---

# 48. CONTEXT SWITCH TEST

Test:

```text
User:
My manager is sending inappropriate messages.

AI:
...

User:
What evidence should I keep?

AI:
...

User:
I have screenshots.

AI:
...
```

The AI must understand that "screenshots" refer to the same incident.

---

# 49. SHORT RESPONSE TEST

Ask:

```text
What should I do if my employer is harassing me?
```

The response should be concise and actionable.

It should not produce a huge essay unless the user asks for detailed legal information.

Then ask a follow-up:

```text
What if I have screenshots?
```

The AI should understand the relationship between the two questions.

---

# 50. NO INFINITE RESPONSE TEST

Send one user message.

Verify:

```text
USER
↓
ONE agent execution
↓
ONE final assistant response
```

unless a legitimate tool call requires another model turn.

There must be no:

```text
AI
→ AI
→ AI
→ AI
→ AI
```

loop.

---

# 51. BUILD / TYPE / REGRESSION TESTING

After modifications:

Run the project's existing:

- TypeScript type check
- lint
- production build
- tests if available

Fix all errors introduced by the changes.

Then manually verify the critical application flows.

Do not consider the task complete merely because the code compiles.

---

# 52. DO NOT BREAK EXISTING FEATURES

Regression-test:

- Authentication
- Email verification
- Demo login
- Onboarding
- Emergency contacts
- AI Assistant
- AI conversation history
- Legal/RAG
- Complaint Builder
- Complaint submission
- Private Vault
- Check-In
- SafeNavigation
- GPS
- SOS/crisis functionality
- Voice mode
- Mobile profile
- Settings
- PWA/offline behavior
- Existing Supabase integration
- Existing Twilio/SMS integration
- Existing Resend/email integration

Do not modify unrelated functionality.

---

# 53. IMPLEMENTATION PRINCIPLE

The final architecture should conceptually behave like:

```text
                    ┌──────────────────┐
                    │ Active App State │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
       Chat State        Workflow State     Voice State
          │                  │                  │
          │                  │                  │
     Conversation        Complaint Draft     Playback
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                       Navigation
                             │
              ┌──────────────┼──────────────┐
              │              │              │
            Chat          Complaint       Voice
              │              │              │
              └──────────────┼──────────────┘
                             │
                       Persistent Data
                             │
                         Supabase /
                      existing storage
```

The key principle is:

**Navigation changes where the user is. It must not destroy what the user was doing.**

---

# 54. FINAL ACCEPTANCE CRITERIA

Do not mark the task complete until ALL of the following are true:

### AI MEMORY

- [ ] User messages are persisted.
- [ ] Assistant messages are persisted.
- [ ] Conversation order is correct.
- [ ] Current conversation is supplied to Gemini.
- [ ] Follow-up messages understand previous context.
- [ ] New chat is not created on component remount.
- [ ] Maximum 20 chat history is preserved.

### AI RESPONSES

- [ ] Responses are concise.
- [ ] No unnecessary essays.
- [ ] No repeated information.
- [ ] No uncontrolled agent loop.
- [ ] Gemini errors are handled safely.

### COMPLAINTS

- [ ] Complaint intent uses conversation context.
- [ ] User does not need to manually classify an obvious incident.
- [ ] Relevant user facts are extracted.
- [ ] AI creates a coherent concise report.
- [ ] Raw user-message concatenation is removed.
- [ ] `incident_summary` is actually used.
- [ ] AI does not invent facts.
- [ ] User reviews/edits before submission.
- [ ] Existing complaint submission flow remains intact.

### NAVIGATION

- [ ] Multi-step flows have working Back navigation.
- [ ] Back navigation preserves entered data.
- [ ] Chat survives navigation.
- [ ] Voice survives as a conversation context.
- [ ] Voice stops when leaving Voice Mode.
- [ ] Returning to Chat restores the same conversation.
- [ ] Only explicit New Chat creates a new conversation.

### GPS

- [ ] SafeNavigation requests real device/browser GPS.
- [ ] Real coordinates are used when available.
- [ ] Demo coordinates are not falsely presented as live GPS.
- [ ] Production HTTPS/geolocation requirements are satisfied.
- [ ] GPS errors are handled honestly.

### CONTACTS

- [ ] Onboarding contacts are persisted.
- [ ] SafeNavigation reads the user's actual contacts.
- [ ] Hardcoded demo contacts are removed from real-user fallback.
- [ ] Empty contact state is handled correctly.
- [ ] Contacts survive refresh/login according to the existing persistence architecture.

### SECURITY

- [ ] Gemini API key remains server-side.
- [ ] No passwords/API keys appear in logs.
- [ ] Private Vault architecture remains intact.
- [ ] No sensitive information is unnecessarily logged.
- [ ] Existing security controls remain intact.

---

# 55. FINAL REPORT FROM THE CODING AGENT

After implementation, provide a concise technical report containing:

### Files changed

List every modified file.

### Root causes

Explain the actual root cause of:

- AI memory failure
- Long responses
- Complaint generation failure
- Complaint intent failure
- Chat reset
- Voice continuing after navigation
- GPS failure
- Contact persistence failure

### Fixes implemented

Explain exactly what was changed.

### Tests performed

List the actual tests run.

### Build result

Report:

- TypeScript result
- Build result
- Tests result

### Remaining issues

Explicitly state anything that could not be verified, especially production-only integrations such as:

- Real GPS permissions
- Twilio delivery
- WhatsApp provider delivery
- Organization API availability

Do not claim successful external delivery unless the actual integration confirmed it.

---

# MOST IMPORTANT RULE

Do not treat these bugs as isolated UI problems.

The fundamental requirement is:

> **Mehfooz must maintain continuity of the user's work.**

If a user starts a conversation, the application must remember that conversation.

If the user describes an incident, the AI must use that incident when the user asks to report it.

If the user navigates away, their work must remain.

If the user enters Voice Mode, it must operate on the same conversation.

If the user returns to Chat, they must see the same conversation.

If the user asks to create a complaint, the AI must turn the conversation into a coherent, factual, concise report rather than simply concatenating messages.

Only an explicit **New Chat** action should start a new conversation.

Do not add unrelated features.

Do not redesign the application.

Fix the underlying state, context, AI orchestration, complaint-generation, GPS, contacts, and navigation problems while preserving the existing Mehfooz architecture and functionality.