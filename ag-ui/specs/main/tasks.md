# Tasks: Lynqx Console — Copilot Experience + Agent Loop

**Input**: Design documents from `specs/main/`
**Design source**: `design/project/screens-copilot.jsx` (primary), `design/project/shell.jsx`, `design/project/styles.css`
**Scope**: Copilot screen + CopilotKit integration + Zigflow agent loop only

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared state dependencies)
- **[Story]**: User story this task belongs to (US1–US4 + USR = Real integration, USZ = Zigflow loop)

---

## Phase 1: Setup

**Purpose**: Initialize the Next.js project and wire in the Lynqx design system. All subsequent phases depend on this.

- [X] T001 Re-initialize `ag-ui/` as a Next.js 14 App Router project: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias '@/*'` — answer no to ESLint (handled separately)
- [X] T002 Install CopilotKit packages: `npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime`
- [X] T003 Install Temporal client: `npm install @temporalio/client @temporalio/worker`
- [X] T004 Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- [X] T005 [P] Copy design CSS into the project: copy `design/project/styles.css` → `app/globals-shell.css`; copy `design/project/lynqx-tokens.css` → `app/globals-tokens.css`
- [X] T006 [P] Copy SVG assets: copy `design/project/assets/` → `public/assets/`
- [X] T007 Update `app/globals.css` to import both: `@import './globals-tokens.css'; @import './globals-shell.css';` and remove Tailwind's base reset (conflicts with Lynqx tokens)
- [X] T008 Update `app/layout.tsx`: add Google Fonts link for DM Sans + DM Mono, import `@copilotkit/react-ui/styles.css`, set `<html>` `data-theme="light"` attribute
- [X] T009 Create `.env.local` with stubs: `ANTHROPIC_API_KEY=`, `TEMPORAL_ADDRESS=localhost:7233`, `TEMPORAL_NAMESPACE=default`, `TEMPORAL_TASK_QUEUE=copilot-agents`, `SIGNOZ_API_URL=`, `SIGNOZ_API_KEY=`, `NEXT_PUBLIC_DEMO_MODE=true`
- [X] T010 Port icon registry from `design/project/icons.jsx` to `components/shell/Icons.tsx` — export named icon components using `lucide-react` mappings (install `lucide-react`)
- [X] T011 [P] Create `lib/types.ts` with shared interfaces: `AgentState`, `AgentStep`, `InvestigationResult`, `ChatMessage`, `ToolCall` (port from `specs/main/data-model.md`)
- [X] T012 [P] Create `lib/personas.ts` — port the full `COPILOT_BY_PERSONA` object from `design/project/screens-copilot.jsx` (starters, transcripts, catalog) as TypeScript exports; transcript entries reference component names (not JSX yet — use string identifiers resolved in CopilotScreen)

**Checkpoint**: `npm run dev` starts without errors; page renders with DM Sans font and Lynqx cream background.

---

## Phase 2: Foundational — Console Shell Host

**Purpose**: The minimal console shell (sidebar + workspace switcher) that hosts the Copilot screen. Only what is needed — no non-Copilot screens, no command palette.

**⚠️ CRITICAL**: Must complete before any Copilot screen work (provides the workspace/persona context).

- [X] T013 Create `lib/workspaces.ts` — port workspace definitions from `design/project/data.jsx`: three workspaces (`exec`, `bank`, `dev`) with id, label, sub, icon, color; per-workspace nav items including the `copilot` nav item
- [X] T014 Build `components/shell/WorkspaceSwitcher.tsx` — dropdown button showing active workspace (lime icon, label, sub text); dropdown lists all three workspaces; `onChange(workspaceId)` callback; port styles from `design/project/shell.jsx` `WorkspaceSwitcher` function
- [X] T015 Build `components/shell/Sidebar.tsx` — forest-navy rail (248px, `var(--bg-rail)`); Logo (lime bar + "lynqx" wordmark + v2.4 badge); `WorkspaceSwitcher`; nav item list for active workspace; active item highlighted with `var(--lime)` background wash; prop: `{ activeWorkspace, onWorkspaceChange, activeRoute, onRouteChange }`
- [X] T016 Update `app/layout.tsx` — wrap children with `<CopilotKit runtimeUrl="/api/copilotkit">` provider
- [X] T017 Update `app/page.tsx` — assemble `.app-shell` layout: `<Sidebar>` + `.app-main` (`.app-canvas` slot); manage `activeWorkspace` and `activeRoute` state; render `<CopilotScreen>` when `activeRoute === 'copilot'`; default to `{ workspace: 'exec', route: 'copilot' }`

**Checkpoint**: Browser shows forest sidebar with workspace switcher; clicking Exec/Bank/Dev switches the workspace label; Copilot nav item is present and highlighted.

---

## Phase 3: US1 — NL Composer → GenUI Card Loop (P1) 🎯 MVP

**Goal**: User types a query (or clicks a starter) → thinking indicator → structured AgentCard renders.

**Independent Test**: Open Exec workspace Copilot screen, click the first starter prompt, wait ~700ms, see a `TreasuryPosition` AgentCard with lime stripe and stats — without any backend running (`NEXT_PUBLIC_DEMO_MODE=true`).

### Shared Atoms (needed by all GenUI cards)

- [X] T018 [P] [US1] Build `components/copilot/AgentBadge.tsx` — lime pill: `rgba(159,232,112,0.14)` bg, `var(--lime-dk)` border, Wand icon + "GENERATED" text (port from `AgentBadge` in `screens-copilot.jsx`)
- [X] T019 [P] [US1] Build `components/copilot/MiniStat.tsx` — label (mono uppercase, 10.5px, `var(--fg-3)`) + value (17px bold, `var(--font-mono)`, optional accent color); props: `{ label, value, mono?, accent? }`
- [X] T020 [P] [US1] Build `components/copilot/PromptLine.tsx` — avatar circle (22px, `var(--mint)` bg, "AK" initials) + message in `var(--bg-surface-2)` box with `var(--border-2)` border and `var(--r-md)` radius; port from `PromptLine` in `screens-copilot.jsx`

### AgentCard Container

- [X] T021 [US1] Build `components/copilot/AgentCard.tsx` — card container with: 3px left lime gradient accent stripe (absolute position); header row (AgentBadge + source attribution + copy/refresh icon buttons); optional summary text; `children` body slot; optional `footerActions` slot (`var(--bg-surface-2)` footer strip); `dense` prop for compact padding; port exactly from `AgentCard` in `screens-copilot.jsx`

### Executive GenUI Cards

- [X] T022 [P] [US1] Build `components/copilot/genui/exec/TreasuryPosition.tsx` — AgentCard wrapping: 3-col MiniStat grid (Net USD, FX exposure, Idle); stacked bar chart (4 segments, lime/info/blue colors, `pct%` widths); legend row with mono labels; footer: "Approve sweep" primary btn + "Export position report" secondary btn + "Adjust threshold" ghost btn. Port from `GenUI_TreasuryPosition` in `screens-copilot.jsx`
- [X] T023 [P] [US1] Build `components/copilot/genui/exec/PaymentInitiation.tsx` — AgentCard wrapping: 2-col grid (label:value rows for Beneficiary, Amount, Debit account, Reference, Rail, Approval by); Zigflow approval chain visual (4 nodes: You/R.Mehta/CFO desk/Bank with ArrowRight icons, active node in `var(--forest)` with `var(--lime)` text); footer: Confirm + Edit + Cancel btns. Port from `GenUI_PaymentInitiation`
- [X] T024 [P] [US1] Build `components/copilot/genui/exec/CashForecast.tsx` — AgentCard wrapping: 3 MiniStats + legend; SVG line chart (viewBox 560×160) with baseline path (lime fill + stroke), stress dashed path (warn), floor dashed line, and inflection circle; scenario tags row. Port from `GenUI_CashForecast`

### Bank GenUI Cards

- [X] T025 [P] [US1] Build `components/copilot/genui/bank/BankDiagnostic.tsx` — AgentCard wrapping: 5-row step trace (timestamp + status icon + label + detail, divided by `var(--border-2)`); DataWeave code block (`.code-block` div) with highlighted "new" line (lime bg + left border); footer: Apply patch + Open trace + Notify btns. Port from `GenUI_BankDiagnostic`
- [X] T026 [P] [US1] Build `components/copilot/genui/bank/ProtocolDrift.tsx` — AgentCard wrapping: 2-column code blocks (Registered vs Observed schema, with highlighted `CdtTrfTxInf` new line); 3 MiniStats (First seen, Payloads, Downstream impact); footer: Generate patch + Pin schema + Mark expected btns. Port from `GenUI_ProtocolDrift`
- [X] T027 [P] [US1] Build `components/copilot/genui/bank/SLAIntelligence.tsx` — AgentCard wrapping: 5-row customer bar chart (name+plan+calls | horizontal bar | failure% | volume columns); bar color driven by failure rate threshold. Port from `GenUI_SLAIntelligence`

### Developer GenUI Cards

- [X] T028 [P] [US1] Build `components/copilot/genui/dev/APIExplorer.tsx` — AgentCard wrapping: language tabs row (curl selected); `.code-block` div with syntax-highlighted curl commands (`tk-fn`, `tk-key`, `tk-str`, `tk-num`, `tk-cmt` spans); tag row (permissions + sandbox). Port from `GenUI_APIExplorer`
- [X] T029 [P] [US1] Build `components/copilot/genui/dev/StressTester.tsx` — AgentCard wrapping: 4-col stat grid; `var(--bg-surface-2)` border box with SVG rps chart (lime path + warn dashed threshold line); failure mode `<table className="dt">`. Port from `GenUI_StressTester`
- [X] T030 [P] [US1] Build `components/copilot/genui/dev/WebhookDebug.tsx` — AgentCard wrapping: 5-row pipeline trace (time + status icon + stage + detail); nginx config code block with highlighted renewed cert lines; footer: Replay + Open console + Generate fix btns. Port from `GenUI_WebhookDebug`

### Generic Stub Card

- [X] T031 [P] [US1] Build `components/copilot/GenericStubCard.tsx` — AgentCard wrapping: 3-col MiniStat grid (Resolved entities, API calls planned, Render target); prompt echo box in `var(--bg-sunken)`. Port from `GenericStubCard`

### Copilot Screen Assembly

- [X] T032 [US1] Build `components/copilot/NLComposer.tsx` — `var(--bg-surface)` card with `var(--border-strong)` border and `var(--r-xl)` radius and `var(--shadow-md)`; forest circle with Wand icon; textarea (transparent bg, 14.5px, 2 rows, Enter=submit, Shift+Enter=newline); Send button (primary, disabled when empty or thinking); thinking state shows "Working… + Refresh icon"; port from composer section in `CopilotScreen`
- [X] T033 [US1] Build `components/copilot/ThinkingIndicator.tsx` — flex row with 12px lime circle (CSS animation `lx-pulse`) + mono text "Planning · resolving entities · drafting structured response…"; outer box: dashed `var(--border-strong)` border, `var(--bg-surface-2)` bg, `var(--r-md)` radius
- [X] T034 [US1] Build `components/copilot/ArchitectureStrip.tsx` — `var(--bg-surface-2)` surface with 5 nodes connected by ArrowRight icons; each node: surface card with lime icon + label + sub text; nodes: "Natural language / user intent" → "CopilotKit / frontend" → "AG-UI ⇄ Zigflow / agent backend" → "Lynqx API / payments · balances" → "Generative UI / rendered card"
- [X] T035 [US1] Build `components/copilot/CapabilityCatalog.tsx` — section with eyebrow "More capabilities for this workspace"; responsive grid `auto-fill, minmax(280px, 1fr)`; each card: lime icon chip + bold title + body text + "Try it →" ghost button; data driven from `lib/personas.ts` catalog array
- [X] T036 [US1] Assemble `components/copilot/CopilotScreen.tsx`:
  - Accept `persona: 'exec' | 'bank' | 'dev'` prop
  - Read config from `lib/personas.ts` for the active persona
  - Hero: eyebrow (lime, Wand icon, e.g. "Treasury copilot · powered by CopilotKit + Zigflow") + `h-display` headline + body intro
  - `NLComposer` with starters from persona config; `submit(text)` handler
  - `ArchitectureStrip`
  - Eyebrow "Live transcript · session 8f4a · this workspace"
  - Transcript feed: `feed.map(item => <PromptLine text={item.q} /> + item.render)`
  - `ThinkingIndicator` when `thinking === true`
  - `CapabilityCatalog`
  - `submit` handler: sets `thinking: true`, after 700ms appends card to feed, sets `thinking: false`, scrolls transcript into view
  - `useEffect` on `persona`: resets feed to `cfg.transcript` and clears query
  - Implement card registry: map persona transcript item names to GenUI component imports

**Checkpoint (US1 complete)**: `NEXT_PUBLIC_DEMO_MODE=true`, open Exec workspace, click starter "What's our net USD position…" → thinking dot → `TreasuryPosition` card with lime stripe appears. Repeat for all 9 cards across 3 personas.

---

## Phase 4: US2 — Persona-Aware Workspace Switching (P1)

**Goal**: Switching workspaces (Exec → Bank → Dev) instantly updates all copilot content.

**Independent Test**: With app running, click the WorkspaceSwitcher dropdown → select Bank → headline changes to "Operate the channel in natural language." → starters show bank prompts → transcript shows bank cards.

- [X] T037 [US2] Lift `activeWorkspace` state to `app/page.tsx` and pass `persona` prop to `CopilotScreen` (already wired in T017; verify the prop actually triggers a re-render of `CopilotScreen`)
- [X] T038 [US2] In `CopilotScreen.tsx`, wrap the `useEffect([persona])` reset to also cancel any in-flight thinking timeout (use `clearTimeout` on the stored ref) to prevent stale card from appearing after persona switch
- [X] T039 [US2] Verify `lib/personas.ts` has complete content for all three personas: `exec` (3 starters, 3 transcript cards, 3 catalog items), `bank` (3+3+3), `dev` (3+3+3); add any missing content from `screens-copilot.jsx`
- [X] T040 [US2] Update `components/shell/Sidebar.tsx` to show the correct nav items for each workspace (exec: Overview/Accounts/Transactions/Statements/Copilot/…, bank: Operations/Copilot, dev: Developer/Copilot); nav items are defined in `lib/workspaces.ts`; Copilot item always present

**Checkpoint (US2 complete)**: Switch between all three workspaces — each shows unique headline, starters, transcript. Switching during thinking cancels the pending card.

---

## Phase 5: US3 — Starter Prompt Pills (P2)

**Goal**: Three pill buttons per persona submit the query without needing to type.

**Independent Test**: Dev workspace → click "Simulate 500 concurrent PAIN.001 submissions…" pill → `StressTester` card appears within 1s.

- [X] T041 [US3] Extract the starter pills from `NLComposer.tsx` into `components/copilot/StarterPills.tsx` — flex row with "Try" mono label + pill buttons; each pill: `var(--bg-sunken)` bg, `var(--border-1)` border, 999px radius, max-width 380px truncated; hover: lime bg wash + `var(--lime-dk)` border; `onSelect(text)` callback
- [X] T042 [US3] Wire `StarterPills.onSelect` to call `submit(text)` directly in `CopilotScreen` — bypasses textarea; verify `query` state is NOT updated (starters skip the textarea entirely)
- [X] T043 [US3] Add `title` attribute to each starter pill (full text as tooltip) to handle long truncated text

**Checkpoint (US3 complete)**: All 9 starters (3 per persona) trigger correct card renders when clicked.

---

## Phase 6: US4 — Architecture Strip (P3)

**Goal**: Architecture Strip is always visible between composer and transcript.

**Independent Test**: Load any workspace's Copilot screen — the 5-node strip "Natural language → CopilotKit → AG-UI ⇄ Zigflow → Lynqx API → Generative UI" is visible below the composer.

- [X] T044 [US4] Verify `ArchitectureStrip` (built in T034) is placed in `CopilotScreen.tsx` between `NLComposer` and the transcript eyebrow; ensure it renders on all three personas
- [X] T045 [US4] Verify strip wraps gracefully at narrow viewport widths (≥ 1280px per spec) — use `flexWrap: 'wrap'` if not already present

**Checkpoint (US4 complete)**: Architecture strip visible and correctly labelled on all three personas.

---

## Phase 7: USR — Real CopilotKit Agent Integration

**Goal**: Replace the 700ms mock timeout with real Claude streaming via CopilotKit. `NEXT_PUBLIC_DEMO_MODE=false` (or unset) activates real mode.

**Independent Test**: Set `ANTHROPIC_API_KEY=real-key`, unset `NEXT_PUBLIC_DEMO_MODE`, restart dev server, ask "What's our net USD position?" → see streaming tokens in the copilot, then a `TreasuryPosition` card renders with actual Claude response driving the data.

- [X] T046 Implement `app/api/copilotkit/route.ts` — `CopilotRuntime` with `AnthropicAdapter`; model: `claude-sonnet-4-6`; system prompt includes Lynqx context; export `POST` via `copilotRuntimeNextJSAppRouterEndpoint`
- [X] T047 [P] [USR] Register `useCopilotAction` in `CopilotScreen.tsx` for `renderTreasuryPosition` — description, parameters for `{ netUSD, accounts[] }`, render prop returns `<TreasuryPosition data={args} />`
- [X] T048 [P] [USR] Register `useCopilotAction` for `renderPaymentInitiation` — parameters for `{ beneficiary, amount, debitAccount, reference, rail, approvalDeadline }`, render prop returns `<PaymentInitiation data={args} />`
- [X] T049 [P] [USR] Register `useCopilotAction` for `renderCashForecast` — parameters for `{ today, day30Baseline, day30Stressed, scenarios[], floor }`, render prop returns `<CashForecast data={args} />`
- [X] T050 [P] [USR] Register `useCopilotAction` for `renderBankDiagnostic` — parameters for `{ steps[], suggestedPatch }`, render prop returns `<BankDiagnostic data={args} />`
- [X] T051 [P] [USR] Register `useCopilotAction` for `renderProtocolDrift` — parameters for `{ registeredSchema, observedSchema, stats }`, render prop returns `<ProtocolDrift data={args} />`
- [X] T052 [P] [USR] Register `useCopilotAction` for `renderSLAIntelligence` — parameters for `{ customers[] }`, render prop returns `<SLAIntelligence data={args} />`
- [X] T053 [P] [USR] Register `useCopilotAction` for `renderAPIExplorer` — parameters for `{ summary, curlCode, tags[] }`, render prop returns `<APIExplorer data={args} />`
- [X] T054 [P] [USR] Register `useCopilotAction` for `renderStressTester` — parameters for `{ stats, failureModes[], rpsData[] }`, render prop returns `<StressTester data={args} />`
- [X] T055 [P] [USR] Register `useCopilotAction` for `renderWebhookDebug` — parameters for `{ trace[], nginxFix }`, render prop returns `<WebhookDebug data={args} />`
- [X] T056 [USR] Add persona-aware system prompt to `CopilotScreen.tsx` via `useCopilotReadable` or passed as `instructions` to CopilotKit — prompt tells Claude which persona is active and which tools are available
- [X] T057 [USR] Update `CopilotScreen.tsx` submit handler: when `NEXT_PUBLIC_DEMO_MODE !== 'true'` and CopilotKit is ready, route the query through CopilotKit's chat instead of the mock 700ms timeout; keep mock path as fallback

**Checkpoint (USR complete)**: Real Claude calls return GenUI cards via tool use. Streaming works. All 9 card types renderable from Claude responses.

---

## Phase 8: USZ — Zigflow Agent Loop

**Goal**: The `runInvestigation` CopilotKit action starts a real Temporal/Zigflow workflow. A live step progress panel shows inside the agent card while the workflow runs.

**Independent Test**: Ask "Investigate why the payment service is failing" (or trigger `runInvestigation` tool) → an `AgentStatePanel` appears showing "Querying SigNoz…" → "Analyzing with Claude…" → "Done"; final result card rendered.

### Temporal Client + API Routes

- [X] T058 Implement `lib/temporal.ts` — Temporal `Client` singleton using `Connection.connect({ address: process.env.TEMPORAL_ADDRESS })`; export `startWorkflow(type, input)` and `describeWorkflow(id)` helpers
- [X] T059 Implement `app/api/agent/start/route.ts` — `POST { workflowType, input }` → `temporalClient.workflow.start(workflowType, { taskQueue, args: [input] })` → return `{ workflowId, status: 'started' }`; handle Temporal connection errors gracefully (return 503)
- [X] T060 Implement `app/api/agent/status/[id]/route.ts` — `GET` → describe workflow via Temporal client → map status to `AgentState`; read step updates from in-memory Map populated by T061; return `AgentState` JSON
- [X] T061 Implement `app/api/agent/state-update/route.ts` — `POST { workflowId, step, status, timestamp }` → store in module-level `Map<string, AgentStep[]>`; return `{ ok: true }`

### AgentStatePanel Component

- [X] T062 [P] [USZ] Build `components/copilot/AgentStatePanel.tsx` — accepts `workflowId: string`; polls `/api/agent/status/:workflowId` every 1s using `setInterval` (clear on unmount); renders step list: each step shows a status icon (Spinner for running, Check for done, X for error) + step name + elapsed time; shows error message if status is `failed`; stops polling when `status === 'completed' | 'failed'`

### CopilotKit `runInvestigation` Action

- [X] T063 [USZ] Register `useCopilotAction` for `runInvestigation` in `CopilotScreen.tsx`:
  - Parameters: `{ query: string, timeRange?: object, services?: string[], createTicket?: boolean }`
  - Handler: POST to `/api/agent/start`, get `workflowId`
  - Render prop: returns `<AgentStatePanel workflowId={workflowId} />` inside a styled wrapper
  - `renderAndWaitForResponse: false` (fire-and-forget; result arrives via AgentStatePanel)
- [X] T064 [USZ] When `AgentStatePanel` receives `status === 'completed'`, display the `InvestigationResult` summary and findings list inside the panel; use `ResultCard` sub-component (inline or extract to `components/copilot/ResultCard.tsx`)

### Zigflow Workflow YAML

- [X] T065 Write `workflows/copilot-investigation.yaml` — full Zigflow DSL per `specs/main/contracts/zigflow-workflow.md`:
  - `workflowType: copilot-investigation`, `taskQueue: copilot-agents`, `dsl: 1.0.0`
  - Input schema: `{ query, timeRange?, services?, createTicket?, sessionId? }`
  - Step 1 `notifyStart`: HTTP POST to `$env.APP_URL + /api/agent/state-update` with `{ step: "Querying observability data", status: running }`
  - Step 2 `gatherData` fork (compete: false): branch `queryLogs` (POST to SigNoz `/api/v3/query_range`) + branch `queryTraces` (POST to SigNoz traces endpoint)
  - Step 3 `notifyAnalysis`: HTTP POST state-update `{ step: "Analyzing with Claude", status: running }`
  - Step 4 `analyzeWithClaude`: HTTP POST to `https://api.anthropic.com/v1/messages` with model `claude-sonnet-4-6`, prompt built from `$input.query + gathered data`
  - Step 5 `emitResult`: export `{ result: { summary: $data.analyzeWithClaude.content[0].text, findings: [], observabilityData: ... } }`
  - Step 6 `notifyDone`: HTTP POST state-update `{ step: "Complete", status: done }`

### Temporal Worker

- [X] T066 Write `worker/index.ts` — Temporal Worker connecting to `TEMPORAL_ADDRESS` on `copilot-agents` task queue; register the Zigflow workflow via the Zigflow Temporal worker SDK; add `"worker": "ts-node worker/index.ts"` script to `package.json`

**Checkpoint (USZ complete)**: Run `npm run worker` in a second terminal; ask a question that triggers `runInvestigation`; see the `AgentStatePanel` update through steps; see the final result rendered.

---

## Phase 9: Polish & Cross-Cutting

- [X] T067 [P] Add `lx-pulse` CSS animation to `globals-shell.css` (used by `ThinkingIndicator`): `@keyframes lx-pulse { 0%,100% { opacity:1 } 50% { opacity:.35 } }`
- [X] T068 [P] Add `slide-up` CSS animation to `globals-shell.css` (used by `AgentCard`): `@keyframes slide-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }`
- [X] T069 [P] Verify WCAG AA contrast: lime `#9FE870` on forest `#1A1A4E` — add a comment in `globals-tokens.css` documenting the contrast ratio
- [X] T070 [P] Add `NEXT_PUBLIC_DEMO_MODE` guard in `CopilotScreen.tsx` submit handler: when `true`, always use 700ms mock; when `false`, use CopilotKit (T057)
- [X] T071 Verify persona switching cancels in-flight timeouts and scrolls transcript to top (T038 + manual test)
- [X] T072 Update `specs/main/quickstart.md` with final npm scripts (`npm run dev`, `npm run worker`), actual env var names, and the "Try these prompts" section

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Shell) ← must have persona/workspace state
    ↓
Phase 3 (US1) ← builds all GenUI cards + CopilotScreen
    ↓ (can start in parallel once Phase 3 done)
Phase 4 (US2)   Phase 5 (US3)   Phase 6 (US4)
    ↓ (all must complete before real integration)
Phase 7 (USR — Real CopilotKit)
    ↓
Phase 8 (USZ — Zigflow loop) ← needs USR actions registered
    ↓
Phase 9 (Polish)
```

### Parallel Opportunities Within Phase 3 (US1)

T018–T031 (all GenUI card components + atoms) are fully parallel — different files, no shared mutable state:

```
Parallel group A (atoms):        T018, T019, T020
Parallel group B (card shells):  T021
Parallel group C (exec cards):   T022, T023, T024
Parallel group D (bank cards):   T025, T026, T027
Parallel group E (dev cards):    T028, T029, T030
Parallel group F (stub card):    T031
Sequential (assembly):           T032 → T033 → T034 → T035 → T036
```

### Parallel Opportunities Within Phase 7 (USR)

T047–T055 (all 9 `useCopilotAction` registrations) are parallel — each is a separate hook in `CopilotScreen.tsx` calling a different tool name.

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Phase 1: Setup
2. Phase 2: Shell host
3. Phase 3: All 9 GenUI cards + CopilotScreen in demo mode
4. **STOP & VALIDATE**: All 3 personas, all 9 starters, thinking indicator, persona switching all work in browser

### Full Demo (Phases 1–8)

1. MVP complete
2. Phase 4–6: Persona switching + starters + architecture strip
3. Phase 7: Real Claude integration
4. Phase 8: Zigflow agent loop
5. **STOP & VALIDATE**: Real investigation workflow runs end-to-end

---

## Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|---------|
| 1 Setup | 12 | T005, T006, T011, T012 |
| 2 Foundation | 5 | — |
| 3 US1 (GenUI + Screen) | 19 | T018–T031 (14 tasks) |
| 4 US2 (Persona switching) | 4 | — |
| 5 US3 (Starters) | 3 | — |
| 6 US4 (Arch strip) | 2 | — |
| 7 USR (CopilotKit real) | 12 | T047–T055 (9 tasks) |
| 8 USZ (Zigflow loop) | 9 | T062 |
| 9 Polish | 6 | T067–T070 |
| **Total** | **72** | **~27 parallel** |
