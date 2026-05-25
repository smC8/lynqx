# Tasks: Lynqx Copilot — Interactive Experience (json-render + A2UI)

**Input**: Design documents from `specs/001-interactive-copilot/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- All paths relative to `ag-ui/`

---

## Phase 1: Setup

**Purpose**: Install packages and create scaffolding. No implementation yet.

- [X] T001 Install `@json-render/core @json-render/react zod` — run `npm install @json-render/core @json-render/react zod` in `ag-ui/`
- [X] T002 [P] Add A2UIMessage types to `lib/types.ts` — add interfaces: `A2UIComponent`, `A2UISurfaceUpdate`, `A2UIDataModelUpdate`, `A2UIBeginRendering`, `A2UIMessage` as defined in `specs/001-interactive-copilot/data-model.md`
- [X] T003 [P] Create stub files for genui module — create empty `lib/genui/catalog.ts`, `lib/genui/registry.tsx`, `lib/genui/a2ui.ts`, and directory `lib/genui/specs/` in `ag-ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: json-render catalog, registry, A2UI helpers, and message storage. MUST be complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create `lib/genui/catalog.ts` — call `defineCatalog(schema, { components, actions })` from `@json-render/core` with these 8 components (each with Zod props): `CardShell` (title: string, sources?: string, footerHint?: string), `MetricRow` (label: string, value: BoundString, valueStyle?: enum), `StatusBadge` (label: BoundString, variant: BoundString), `DataTable` (rows: array of {label, value: BoundString}), `ProgressStep` (label: string, status: BoundString — "pending"|"running"|"done"|"error"), `ActionButton` (label: BoundString, variant: enum, action: {name, context?}, disabled?: BoundString), `SectionHeader` (title: string, eyebrow?: string), `CodeBlock` (code: BoundString, language?: string). Actions: `approvePayment` (workflowId, paymentData object), `cancelPayment` (workflowId), `retryWorkflow` (workflowId, query, cardType). Where `BoundString = z.object({ literalString?: z.string(), path?: z.string() })` with `.refine(d => d.literalString || d.path)`. Export as `lynqxCatalog`. Also export `lynqxCatalogPrompt = lynqxCatalog.prompt()`.

- [X] T005 Create `lib/genui/registry.tsx` — call `defineRegistry(lynqxCatalog, { components, actions })` from `@json-render/react`. Implement React components matching the existing visual language (dark `var(--bg-surface)` background, `var(--fg-3)` mono labels, `var(--lime)` accents, `var(--border-1)` borders, same fontSize/fontFamily as existing cards): `CardShell` renders an `<AgentCard>` shell (reuse existing `components/copilot/AgentCard.tsx`) wrapping `{children}`; `MetricRow` renders a label-value row (same pattern as existing PaymentInitiation grid, monospace label, regular value); `StatusBadge` renders existing `<span className="tag tag-{variant}">` with value resolved from BoundString; `DataTable` renders a grid of MetricRow-style label/value pairs; `ProgressStep` renders a row with a dot (pulsing `animation: lx-pulse` when status="running", green when "done", red when "error", grey when "pending") + label text; `ActionButton` renders `<button className="btn btn-{variant} btn-sm">` with disabled bound to BoundString; `SectionHeader` renders eyebrow text + bold label; `CodeBlock` renders `<pre><code>` with monospace font. Action handlers are stubs for now (filled in T020). Export `{ registry, handlers, executeAction }`.

- [X] T006 Create `lib/genui/a2ui.ts` (simplified: builds LynqxSpec objects directly; skips A2UI message streaming) — implement: (1) `processA2UIMessages(messages: A2UIMessage[], state: { componentMap: Map<string, A2UIComponent>; dataModel: Record<string, unknown>; rootId: string | null }): { componentMap, dataModel, rootId }` — iterates messages, applies surfaceUpdate by upserting components into map, applies dataModelUpdate by setting keys on dataModel, applies beginRendering by setting rootId; (2) `resolveBoundValue(bound: { literalString?: string; path?: string }, dataModel: Record<string, unknown>): unknown` — returns literalString or resolves path against dataModel by splitting on "/" and traversing; (3) `renderA2UINode(id: string, componentMap, dataModel, registry, handlers): React.ReactNode` — recursive renderer: get component entry from map, extract [type, props] from component object, get React component from registry, resolve all BoundString props via resolveBoundValue, handle children (explicitList → array of renderA2UINode calls, template → TBD), render component with resolved props + action emit wiring. Export all three.

- [ ] T007 Extend `app/api/agent/state-update/route.ts` — add a second module-level Map: `const a2uiMap = new Map<string, A2UIMessage[]>()`. Export `getA2UIMessages(workflowId: string): A2UIMessage[]`. In POST handler: detect presence of `body.a2uiMessage` key — if present, parse as A2UIMessage, append to `a2uiMap.get(workflowId) ?? []`, return `{ ok: true }`. Existing `{ step, status }` path unchanged.

- [ ] T008 Create `app/api/agent/messages/[id]/route.ts` — GET handler: extract workflowId from params, read cursor from `searchParams.get("cursor") ?? "0"`, get messages from `getA2UIMessages(workflowId)`, slice from cursor, return `{ workflowId, messages: sliced, nextCursor: cursor + sliced.length }`. Return 404 if workflowId not in a2uiMap at all (not just empty — use `a2uiMap.has(workflowId)` check). No Temporal integration needed here.

**Checkpoint**: Foundation ready — run `npm run build` to confirm no type errors before proceeding.

---

## Phase 3: User Story 1 — Multi-Turn Context (Priority: P1)

**Goal**: Each user query passes context from prior cards to the Temporal workflow so follow-up questions resolve references like "that endpoint" or "those accounts".

**Independent Test**: Submit a query, then a follow-up. Check `POST /api/agent/start` request body in Network tab — `input.conversationContext` must be a non-empty string containing a summary of the prior turn.

- [X] T009 [US1] Create `lib/conversation-context.ts` — export `buildConversationContext(feed: FeedItem[], limit = 3): string`. Implementation: take last `limit` items from `feed` (the array is newest-last, so use `feed.slice(-limit)`), reverse to get most-recent-first, map each to `"${i+1}. Q: '${item.q}' → ${item.cardType}: '${item.summary ?? "(no summary)"}'"`; join with `\n`; prepend `"Prior turns (most recent first):\n"` if non-empty, else return `""`.

- [ ] T010 [US1] Add `context` parameter to all 9 `useCopilotAction` render tool definitions in `components/copilot/CopilotScreen.tsx` — append `{ name: "context", type: "string", description: "Comma-separated key entities or endpoints from prior conversation turns relevant to this query. Empty if first turn." }` to each tool's `parameters` array.

- [X] T011 [US1] Update `startInvestigation()` in `components/copilot/CopilotScreen.tsx` — change signature to `startInvestigation(query: string, cardType: string, conversationContext: string): Promise<string | undefined>`, add `conversationContext` to the POST body: `body: JSON.stringify({ workflowType: "copilot-investigation", input: { query, cardType, conversationContext } })`. In each `useCopilotAction` handler, call `buildConversationContext(feed)` and pass as third arg. Store `conversationContext` on the new FeedItem for downstream context building.

- [ ] T012 [US1] Update `app/api/agent/start/route.ts` — forward `input.conversationContext` to Temporal (add to the object passed to `startWorkflow()`). In `simulateDemoWorkflow`, accept `conversationContext` from input and log it: `console.log("[demo] conversationContext:", conversationContext)` (no further processing needed for demo).

**Checkpoint**: US1 complete. Verify `conversationContext` flows from CopilotScreen → agent/start → simulateDemoWorkflow in console output.

---

## Phase 4: User Story 2 — Streaming Status Cards (Priority: P2)

**Goal**: Cards show live progress (step dots) as the Temporal/demo workflow runs, then transition to the full result card — no silent spinner.

**Independent Test**: Submit any query. Before the card data arrives, the card area must show a `CardShell` with 3 `ProgressStep` components, each updating from "pending" → "running" → "done". After all steps done, the full result card renders.

**⚠️ Depends on Phase 2 (Foundational) being complete.**

- [ ] T013 [US2] Create `lib/genui/specs/bankDiagnosticSpec.ts` — export `buildBankDiagnosticMessages(workflowId: string, result?: { topEndpoint: string; volume: string; errorRate: string; summary?: string }): A2UIMessage[]`. Returns the exact message sequence: (1) beginRendering root="card-root"; (2) surfaceUpdate with CardShell (title "Investigating…"), Column of 3 ProgressStep components (ids: s1/s2/s3) with statuses bound to /step1, /step2, /step3; (3) dataModelUpdate step1="running", step2="pending", step3="pending"; (4) dataModelUpdate step1="done", step2="running"; (5) dataModelUpdate step2="done", step3="running"; (6) surfaceUpdate replacing card-root's CardShell with title "API Diagnostics" + sources "SigNoz · yesterday", replacing Column children with MetricRow components (ids: m1/m2/m3) with values bound to /topEndpoint, /volume, /errorRate; (7) dataModelUpdate topEndpoint=result?.topEndpoint ?? "/v1/charges (3,241 calls)", volume=result?.volume ?? "18,423 total", errorRate=result?.errorRate ?? "0.26%", step3="done", __complete=true.

- [ ] T014 [P] [US2] Create `lib/genui/specs/paymentInitiationSpec.ts` following the same 7-message pattern as bankDiagnosticSpec.ts — result card shows MetricRow components for beneficiary, amount, currency, debitAccount, reference, rail, deadline (bound to /beneficiary etc.), plus two ActionButton components (Approve with action approvePayment + bound disabled to "/submitPhase" !== "idle", Cancel with action cancelPayment). Also create stubs for the remaining 7 spec files: `treasuryPositionSpec.ts`, `cashForecastSpec.ts`, `protocolDriftSpec.ts`, `slaIntelligenceSpec.ts`, `apiExplorerSpec.ts`, `stressTestSpec.ts`, `webhookDebugSpec.ts` — each with the same progress steps followed by placeholder result MetricRow components for their data type.

- [ ] T015 [US2] Update `simulateDemoWorkflow()` in `app/api/agent/start/route.ts` — replace the existing `post(step, status)` calls with A2UI message POSTs. Import spec builder by cardType: `{ BankDiagnostic: buildBankDiagnosticMessages, PaymentInitiation: buildPaymentInitiationMessages, ... }`. Build the message sequence using the appropriate builder, then POST each message to `/api/agent/state-update` with `{ workflowId, a2uiMessage: message }` and 500ms delay between messages. Keep the a2uiMap registering the workflowId (so GET /messages/[id] returns 200, not 404) by POSTing at least one message before any delay.

- [X] T016 [US2] Create `components/copilot/A2UICard.tsx` (simplified: uses useWorkflowResult + LynqxSpec builders instead of A2UI message polling) — `"use client"` component. Props: `{ workflowId: string; summary?: string }`. State: `componentMap: Map<string, A2UIComponent>` (useState with `() => new Map()`), `dataModel: Record<string, unknown>` (useState `{}`), `rootId: string | null` (useState null), `cursor: number` (useState 0), `polling: boolean` (useState true). `useEffect` on workflowId: set an interval at 500ms that fetches `GET /api/agent/messages/${workflowId}?cursor=${cursor}`, calls `processA2UIMessages(messages, { componentMap, dataModel, rootId })` to get new state, calls setters, updates cursor to nextCursor, stops polling when `newDataModel.__complete === true`. Clear interval on cleanup. Render: if rootId is null, show a pulse spinner with `summary` text as placeholder; else wrap `renderA2UINode(rootId, componentMap, dataModel, registry, actionHandlers)` in `<StateProvider initialState={dataModel}><VisibilityProvider><ActionProvider handlers={actionHandlers}>...</ActionProvider></VisibilityProvider></StateProvider>`. Import registry and handlers from `lib/genui/registry.tsx`. Build actionHandlers via `useMemo(() => handlers(...), [])`.

- [X] T017 [US2] Update `components/copilot/CopilotScreen.tsx` feed rendering — in the `feed.map()` block, replace `CardComp ? <CardComp ... /> : <GenericStubCard .../>` with: if `item.workflowId` is set, render `<A2UICard workflowId={item.workflowId} summary={item.summary} />`; else fall back to existing `CARD_REGISTRY[item.cardType]` or `<GenericStubCard>`.

**Checkpoint**: US2 complete. Validate with quickstart.md Scenario 1: streaming step indicators must appear before final card. Verify in Network tab that `/api/agent/messages/[workflowId]` is polled multiple times with increasing cursors.

---

## Phase 5: User Story 3 — Actionable Payment Cards (Priority: P3)

**Goal**: Clicking "Approve" on a PaymentInitiation card submits the payment and shows a confirmation. Clicking "Cancel" dismisses without an API call.

**Independent Test**: Submit a payment query → PaymentInitiation card renders via A2UICard → click "Confirm and route for approval" → one POST to `/api/payments/submit` fires → button area shows "✓ Payment accepted · Ref: TXN-…".

**⚠️ Depends on Phase 4 (US2 — A2UICard) being complete.**

- [X] T018 [US3] Create `app/api/payments/submit/route.ts` — POST handler: parse `{ workflowId, paymentData }`. Demo mode (`!process.env.TEMPORAL_ADDRESS`): await 1s, return `{ txRef: "TXN-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(Date.now()).slice(-5)}", status: "accepted" }`. Temporal mode: call `startWorkflow("submitPayment", { ...paymentData, workflowId }, workflowId)`, poll `describeWorkflow` every 500ms for up to 10s, return result or 503 timeout.

- [X] T019 [US3] Implement `approvePayment` and `cancelPayment` action handlers (implemented in `components/copilot/A2UICard.tsx` via ActionProvider) — replace the stubs from T005. `approvePayment: async (params, setState) => { setState(prev => ({ ...prev, submitPhase: "submitting" })); try { const res = await fetch("/api/payments/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(params) }).then(r => r.json()); setState(prev => ({ ...prev, submitPhase: res.status === "accepted" ? "success" : "error", txRef: res.txRef, errorReason: res.reason })); } catch { setState(prev => ({ ...prev, submitPhase: "error", errorReason: "Network error" })); } }`. `cancelPayment: (_params, setState) => { setState(prev => ({ ...prev, submitPhase: "cancelled" })); }`.

- [X] T020 [US3] Payment action buttons integrated into `buildPaymentSpec()` in `lib/genui/a2ui.ts` with idle/submitting/success/error/cancelled phases to include in the result surfaceUpdate (message 6): two `ActionButton` components — Approve button with `label: { path: "/approveLabel" }`, `action: { name: "approvePayment", context: [{ key: "workflowId", value: { path: "/workflowId" } }, { key: "paymentData", value: { path: "/payment" } }] }`, `disabled: { path: "/submitDisabled" }`; Cancel button with `label: { literalString: "Cancel" }`, `action: { name: "cancelPayment", context: [{ key: "workflowId", value: { path: "/workflowId" } }] }`; and a result row `MetricRow` with label "Status" and value bound to `/submitStatus`. In message 7 (dataModelUpdate), add: `workflowId=workflowId`, `approveLabel="Confirm and route for approval"`, `submitDisabled="false"`, `submitPhase="idle"`, `submitStatus=""`, plus payment data fields.

**Checkpoint**: US3 complete. Validate with quickstart.md Scenario 3: one POST to `/api/payments/submit` on Approve, zero on Cancel, submitPhase transitions correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T021 [P] Implement `retryWorkflow` action handler in `lib/genui/registry.tsx` — `retryWorkflow: async (params, setState) => { setState(prev => ({ ...prev, __error: undefined })); await fetch("/api/agent/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ workflowType: "copilot-investigation", input: { query: params.query, cardType: params.cardType } }) }); }`. Note: this doesn't update the A2UICard's workflowId (new workflowId won't be polled). Document this limitation for future improvement.

- [ ] T022 [P] Add error state handling to card spec builders — in each spec builder, if `result` is undefined after the progress phase, include a final `dataModelUpdate` setting `__error: "Workflow did not return data"`. In `A2UICard.tsx`, when `dataModel.__error` is set, render a simple error div with the error message string and a "Retry" button (can use existing `CardSkeleton` styling).

- [ ] T023 Validate quickstart.md Scenario 1 (streaming status) in browser — confirm all 3 progress steps animate, then the full BankDiagnostic card renders. Fix any rendering issues found.

- [ ] T024 Validate quickstart.md Scenario 2 (multi-turn) — submit two connected queries, inspect Network tab for `conversationContext` in second `/api/agent/start` request. Fix if missing.

- [ ] T025 Run regression checklist from quickstart.md — verify all 9 card types render, suggested starters work, persona switcher resets feed, `isLoading` spinner shows while Mistral responds.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001 must complete before any json-render imports)
- **Phase 3 (US1)**: Can start after Phase 2 — independent of US2/US3
- **Phase 4 (US2)**: Depends on Phase 2 — MUST complete before Phase 5
- **Phase 5 (US3)**: Depends on Phase 4 (A2UICard must exist for payment buttons to render)
- **Phase 6 (Polish)**: Depends on Phase 3, 4, 5 all complete

### User Story Dependencies

- **US1 (Multi-Turn)**: Independent of US2/US3 — can be done in parallel with Phase 4
- **US2 (Streaming)**: Depends on Phase 2 (Foundational) — no dependency on US1
- **US3 (Actionable)**: Depends on US2 (payment buttons are inside A2UICard)

### Within Each Phase

- Phase 1: T001 → T002/T003 in parallel (T001 must finish first for imports to resolve)
- Phase 2: T004 → T005 → T006 (catalog before registry before a2ui); T007 and T008 can be done in parallel with T004-T006 (different files)
- Phase 3: T009 → T010 → T011 → T012 (sequential — each depends on prior)
- Phase 4: T013 → T014 in parallel → T015 → T016 → T017 (sequential)
- Phase 5: T018 → T019 → T020 (T018 first, then T019/T020 in parallel)

### Parallel Opportunities

```
Phase 1 (after T001):
  T002 (types)        T003 (stub files)

Phase 2:
  T004 (catalog) → T005 (registry) → T006 (a2ui)
  T007 (state-update) and T008 (messages route) — parallel with T004-T006

Phase 3 and 4 can run in parallel once Phase 2 is done:
  T009-T012 (US1)     T013-T017 (US2)

Phase 5 (after T017):
  T018 (payments route)
  T019 + T020 (action handlers + payment spec) — parallel with each other after T018
```

---

## Implementation Strategy

### MVP First (US2 — Streaming Cards)

Phase 2 foundational work enables US2, which is the most visually impactful change. US2 should be validated in browser before proceeding to US1 or US3.

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 4: US2 Streaming Cards → **STOP and validate in browser**
4. Phase 3: US1 Multi-Turn Context → validate in network tab
5. Phase 5: US3 Actionable Payments → validate button flow

### Incremental Delivery

- After Phase 4 → Demo shows streaming cards (compelling visual improvement)
- After Phase 3 → Demo shows contextual follow-up queries (conversation quality improvement)
- After Phase 5 → Demo shows payment approval (actionable copilot, flagship differentiator)

---

## Notes

- `A2UICard.tsx` must be a `"use client"` component (uses hooks + fetch)
- The `Map` in `useState` requires the functional initializer form `useState(() => new Map())` to avoid stale references
- json-render `StateProvider` manages its own internal state — the `dataModel` passed to it is initial state only; the registry's `setState` updates this provider's state, not React's component state
- All A2UI messages in demo mode are POSTed server-to-server (Next.js API routes calling each other) — this works because `simulateDemoWorkflow` uses `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"`
- Keep existing hardcoded `genui/` card components — they're the fallback for feed items without `workflowId`
