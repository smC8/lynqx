# Feature Specification: Lynqx Copilot — Interactive Experience

**Feature Branch**: `001-interactive-copilot`
**Created**: 2026-05-24
**Status**: Draft

## Context

The Lynqx Copilot screen currently delivers one-shot responses: the user asks a question, CopilotKit routes it to a Temporal workflow that queries SigNoz or Lynqx APIs, and a structured card renders. The pipeline works end-to-end but the experience is disconnected — each question is stateless, cards cannot take action, and all personas share the same context and toolset.

This specification covers four enhancements that collectively turn the copilot into a stateful, actionable, persona-aware assistant.

---

## User Scenarios & Testing

### User Story 1 — Multi-Turn Context (Priority: P1)

A user follows up on a previous card without re-stating context. After seeing a BankDiagnostic card showing `/v1/charges` had 47 errors yesterday, they type "drill into that endpoint" and the copilot understands which endpoint and time range they mean.

**Why this priority**: Without conversation memory, every follow-up requires re-describing the full context. This is the most disruptive gap in the current UX.

**Independent Test**: Open the copilot, ask "What were the most used API routes yesterday?", then ask "Show me errors for the top one." The second response must reference the correct endpoint without the user naming it.

**Acceptance Scenarios**:

1. **Given** a BankDiagnostic card rendered for question N, **When** the user asks "drill into that" or "show me errors for it", **Then** the copilot uses the context from question N to identify the subject.
2. **Given** a multi-turn conversation, **When** the user asks about a completely different topic, **Then** prior context does not bleed into the new response.
3. **Given** a session, **When** the user closes and reopens the copilot panel, **Then** conversation history is cleared (session-scoped memory only).

---

### User Story 2 — State-Aware Streaming Cards (Priority: P2)

The copilot card shows live progress as the backend Temporal workflow runs — "querying SigNoz…", "parsing results…", "done" — instead of a blank spinner until the full result arrives.

**Why this priority**: The current UX has a silent delay of 3–8 seconds with no indication of what is happening. This creates anxiety and uncertainty about whether the query is running.

**Independent Test**: Ask a query that triggers a Temporal workflow (e.g., "show me API diagnostics"). The card area must display incremental status text before the final card fully renders.

**Acceptance Scenarios**:

1. **Given** a query that triggers a Temporal workflow, **When** the workflow starts, **Then** the card area immediately shows a loading state with the first status step.
2. **Given** a running workflow, **When** each workflow activity completes, **Then** the card updates its status line in real-time (e.g., "querying SigNoz → 3 services found → rendering…").
3. **Given** a workflow that errors, **When** the error occurs, **Then** the card shows a clear error state with a retry option — not a blank card.
4. **Given** a completed workflow, **When** the result arrives, **Then** the streaming status collapses and the final card renders in its place.

---

### User Story 3 — Actionable Payment Cards (Priority: P3)

The PaymentInitiation card has "Approve" and "Cancel" buttons that currently do nothing. Clicking "Approve" submits the payment to the Lynqx payments API and shows real-time status (accepted/rejected/processing).

**Why this priority**: Actionable cards are the flagship differentiator — a copilot that lets you *do* things, not just see things. Payment approval is the most visible example.

**Independent Test**: Ask "Pay $5,000 USD to Safaricom account 4521 for invoice INV-2024-0891". The card renders with "Approve" and "Cancel". Clicking "Approve" changes the button state, calls the payments API, and shows the result (success/failure).

**Acceptance Scenarios**:

1. **Given** a PaymentInitiation card, **When** the user clicks "Approve", **Then** the button enters a loading state and the payment request is submitted to the Lynqx payments API.
2. **Given** a submitted payment, **When** the API returns success, **Then** the card shows a confirmation with transaction reference and status.
3. **Given** a submitted payment, **When** the API returns an error (e.g., insufficient funds, limit exceeded), **Then** the card shows the specific error reason and the "Approve" button is re-enabled.
4. **Given** a PaymentInitiation card, **When** the user clicks "Cancel", **Then** the card enters a cancelled state and no API call is made.
5. **Given** a submitted payment, **When** the user navigates away or closes the copilot, **Then** an in-flight submission is not retried automatically.

---

### User Story 4 — Persona-Scoped Copilot (Priority: P4)

The copilot adapts its available tools and system instructions based on the active workspace persona (Exec, Developer, Bank Ops). A Developer persona sees API explorer and webhook debug tools; a Bank Ops persona sees SLA intelligence and channel diagnostic tools; an Exec persona sees treasury position and payment initiation tools.

**Why this priority**: Tool overload degrades LLM accuracy. Sending all 9 tools to every persona increases the chance of the wrong card being rendered. Scoping tools per persona also tightens the system prompt.

**Independent Test**: Switch from the Exec workspace to the Developer workspace. Ask "what's the SLA for MPESA?". In Dev mode, this should NOT render the SLAIntelligence card (which is a Bank Ops tool). It should either route to a relevant Dev tool or respond that this is outside Dev scope.

**Acceptance Scenarios**:

1. **Given** the Exec workspace is active, **When** the copilot receives a query, **Then** only Exec-relevant tools are offered (TreasuryPosition, PaymentInitiation, CashForecast, BankDiagnostic).
2. **Given** the Developer workspace is active, **When** the copilot receives a query, **Then** only Developer-relevant tools are offered (APIExplorer, BankDiagnostic, StressTester, WebhookDebug).
3. **Given** the Bank Ops workspace is active, **When** the copilot receives a query, **Then** only Bank Ops tools are offered (SLAIntelligence, BankDiagnostic, ProtocolDrift).
4. **Given** a workspace switch, **When** the user sends the next message, **Then** the persona-appropriate system prompt and tool set are active for that message.
5. **Given** any persona, **When** a query clearly matches a tool from a different persona, **Then** the copilot either routes to the closest available tool or informs the user this is outside the current workspace scope.

---

## Functional Requirements

### FR-1: Conversation Context Window

1. The copilot maintains a rolling context window of the last N messages per session (N ≥ 6 turns).
2. Each rendered card's structured data summary is included in context (not just the raw user message).
3. Context is session-scoped — cleared on browser refresh or explicit "Clear chat" action.
4. The copilot correctly dereferences pronouns and implicit references ("that endpoint", "the top one", "the same period") against recent context.

### FR-2: Real-Time Workflow Status

1. The card area renders a streaming status component as soon as a Temporal workflow starts.
2. Status updates arrive at a minimum cadence of one update per workflow activity boundary.
3. Status messages use plain language ("Querying SigNoz for yesterday's traffic…"), not internal activity names.
4. A final status transition ("Done") triggers replacement of the status component with the completed card.
5. Error states are displayed inline with a retry action.

### FR-3: Payment Submission

1. Clicking "Approve" on a PaymentInitiation card POSTs to the Lynqx payments API with the payment details extracted from the card.
2. The button is disabled during in-flight API calls to prevent double submission.
3. Success, pending, and error states are visually distinct.
4. Transaction reference numbers returned by the API are displayed to the user.

### FR-4: Persona Tool Scoping

1. The active workspace persona is read from application state and passed to the CopilotKit runtime on each request.
2. Each persona has a defined set of allowed tool names and a persona-specific system prompt suffix.
3. The system prompt dynamically includes only the tool descriptions relevant to the active persona.
4. Switching persona mid-session applies to the next message, not retroactively to prior messages.

---

## Success Criteria

1. A user can complete a 3-turn investigation (ask → drill down → filter by time) without re-stating context in turns 2 or 3.
2. The first visual feedback after submitting a query appears within 500ms.
3. A payment submitted via the "Approve" button reaches the Lynqx API with a correct payload on the first click in 100% of test cases.
4. Switching from Exec to Developer workspace and asking an Exec-specific question results in an appropriate refusal or redirect in ≥ 90% of manual test runs.
5. Zero regression in existing one-shot card rendering for all 9 card types.

---

## Assumptions

- The Lynqx payments API endpoint and authentication scheme are available for use in the frontend via the existing Temporal workflow or a new direct API call.
- `useCoAgentStateRender` from CopilotKit is the mechanism for streaming intermediate agent state from Temporal workflows to the UI.
- Persona state (active workspace) is already tracked in the application and accessible via React context or a shared store.
- Conversation history is not persisted to a database in this iteration — session-only memory is acceptable.
- Tool scoping is enforced at the system prompt level (tools described to the LLM) rather than at the CopilotKit action registration level, to avoid conditional hook mounting.

---

## Out of Scope

- Persistent multi-session memory (cross-browser-session conversation history).
- Approval workflows requiring a second approver or multi-factor authorization.
- Adding new card types not already defined in the current 9-tool set.
- Persona management UI (creating, editing, or assigning personas).
