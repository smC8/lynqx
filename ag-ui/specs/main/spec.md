# Feature Specification: Lynqx Console — Copilot Screen

**Feature Branch**: `001-copilot-ui`
**Created**: 2026-05-23
**Status**: Final
**Design source**: `design/project/screens-copilot.jsx` + `design/project/Lynqx Console.html`

## Context

Lynqx is a headless corporate banking connectivity platform for emerging markets. The console serves three distinct user personas — each accessed as a switchable workspace:

- **Exec** (Corporate treasury) — manages cash positions, payments, and reconciliation
- **Bank** (Bank operators) — monitors channel health, diagnoses failures, tracks customers
- **Dev** (3rd-party developers) — builds integrations, runs tests, debugs webhooks

The copilot screen is a full-page generative-UI experience inside the console. Users describe what they need in natural language; the system plans, queries live data, and renders a structured, actionable card — not a chat bubble.

Architecture explicitly shown in the design:
```
Natural language → CopilotKit → AG-UI ⇄ Zigflow → Lynqx API → Generative UI card
```

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Submit a Natural Language Request, Receive a GenUI Card (Priority: P1)

A user types a question in the NL composer (e.g. "What's our net USD position across HDFC and Citi?") and the system renders a structured, styled card with live data visualisations and action buttons — not a text answer.

**Why this priority**: This is the core loop. Everything else builds on it.

**Independent Test**: Open the Exec workspace Copilot screen, click a starter prompt, wait ~700ms, see a structured AgentCard with stats, a chart or table, and footer action buttons.

**Acceptance Scenarios**:
1. **Given** the Copilot screen is open, **When** the user submits a query, **Then** a "Planning · resolving entities · drafting structured response…" thinking indicator appears within 100ms
2. **Given** the thinking indicator is showing, **When** the response is ready, **Then** the thinking indicator is replaced by a `PromptLine` (user's query) followed by an `AgentCard` (structured response)
3. **Given** a GenUI card is rendered, **Then** it has: a lime accent stripe on the left, a "Generated" badge, source attribution text, structured content body, and footer action buttons

---

### User Story 2 — Persona-Aware Content (Priority: P1)

Switching workspaces (Exec → Bank → Dev) changes the copilot's headline, starter prompts, transcript, and capability catalog to match that persona.

**Why this priority**: The same copilot serving different audiences with irrelevant content is a UX failure.

**Independent Test**: Start on Exec workspace, note the headline "Ask Lynqx anything about cash, payments, or reconciliation." Switch to Bank, observe "Operate the channel in natural language." Switch to Dev, observe "Describe the integration. Ship the integration."

**Acceptance Scenarios**:
1. **Given** the user is on the Exec workspace, **When** the Copilot screen is loaded, **Then** headline, eyebrow, intro text, starters, transcript, and catalog all reflect treasury/payments content
2. **Given** the user switches to Bank workspace, **Then** all copilot content re-renders for bank operations within one render cycle
3. **Given** the user switches to Dev workspace, **Then** all copilot content re-renders for developer use cases

---

### User Story 3 — Use Starter Prompts (Priority: P2)

The composer shows 3 suggested prompts as pill buttons. Clicking one immediately submits it and triggers the agent response flow.

**Independent Test**: Click "Show me how to initiate a bulk SEPA payment for a NetSuite customer" on the Dev workspace; within 1 second the full `GenUI_APIExplorer` card appears with curl + code samples.

**Acceptance Scenarios**:
1. **Given** the copilot page is loaded, **When** a starter pill is clicked, **Then** the composer input is skipped and the query is submitted directly
2. **Given** a starter query matches a pre-rendered card in the transcript registry, **Then** the matching card renders (no LLM round-trip needed in the prototype)
3. **Given** a query does not match, **Then** a `GenericStubCard` renders indicating the sandbox needs to be connected

---

### User Story 4 — Architecture Strip Always Visible (Priority: P3)

The ArchitectureStrip — "Natural language → CopilotKit → AG-UI ⇄ Zigflow → Lynqx API → Generative UI" — is always visible below the composer to contextualise how the system works.

**Independent Test**: Load any persona's Copilot screen; confirm the horizontal node strip is visible between the composer and the transcript.

**Acceptance Scenarios**:
1. **Given** any persona's Copilot screen is loaded, **Then** the Architecture Strip shows 5 nodes connected by arrow icons
2. **Given** the strip is rendered, **Then** each node shows a label, subtitle, and a lime-coloured icon

---

### Edge Cases

- What if the user submits while the previous response is loading? → Submit button is disabled (`disabled={!query.trim() || thinking}`)
- What if a starter prompt text is too long for the pill? → Truncate with `text-overflow: ellipsis` (max-width: 380px per pill)
- What if persona switches mid-thinking? → `useEffect` on persona resets the feed and cancels the in-flight timeout
- What if the NL textarea has a newline (shift+enter)? → Allow multiline; only Enter without Shift submits

---

## Requirements *(mandatory)*

### Console Shell Requirements

**SR-1**: The app renders a full-height shell with a navy-forest left sidebar (248px) and a light canvas content area.

**SR-2**: The sidebar shows: Lynqx logo + version badge, workspace switcher dropdown (Exec/Bank/Dev), and per-persona navigation items. The Copilot nav item is present in every workspace.

**SR-3**: The workspace switcher is a dropdown button. Selecting a workspace changes the active persona throughout the app.

**SR-4**: A `⌘K` command palette is accessible globally.

### Copilot Screen Requirements

**CR-1: Hero Section** — Each persona shows: an eyebrow line (`[Persona] copilot · powered by CopilotKit + Zigflow`), a headline, and an intro paragraph.

**CR-2: NL Composer** — A forest-background textarea with a wand icon, a placeholder, and a Send button. Enter (without Shift) submits. The button shows "Working…" with a refresh icon while the agent is thinking.

**CR-3: Starter Prompts** — Three pill buttons labelled "Try" showing persona-specific suggestions. Clicking one bypasses the textarea and submits directly.

**CR-4: Architecture Strip** — A horizontal row of 5 labelled nodes with lime icons, connected by arrow icons, always rendered between the composer and transcript.

**CR-5: Transcript** — A scrollable feed of `PromptLine` → `AgentCard` pairs. New pairs are appended at the bottom. The transcript auto-scrolls after each new card.

**CR-6: Thinking Indicator** — A pulsing lime dot with "Planning · resolving entities · drafting structured response…" text, shown while the agent is working.

**CR-7: GenUI Cards** — `AgentCard` components with: lime accent left stripe, "Generated" badge with a `Wand` icon, optional source attribution, copy/regenerate icon buttons, a summary line, structured body, and footer action buttons. Each persona's transcript includes the following cards:
  - *Exec*: `GenUI_TreasuryPosition`, `GenUI_PaymentInitiation` (with Zigflow approval chain), `GenUI_CashForecast`
  - *Bank*: `GenUI_BankDiagnostic` (step trace + DataWeave patch), `GenUI_ProtocolDrift` (schema diff), `GenUI_SLAIntelligence` (failure bars)
  - *Dev*: `GenUI_APIExplorer` (code block), `GenUI_StressTester` (rps chart), `GenUI_WebhookDebug` (delivery trace + nginx fix)

**CR-8: Capability Catalog** — A responsive grid of 3 capability cards per persona (non-interactive in the prototype, with "Try it →" ghost buttons).

**CR-9: Generic Stub Card** — For unrecognised queries, a `GenericStubCard` renders with a note that the sandbox needs to be connected.

### Real CopilotKit / Zigflow Integration Requirements

**IR-1**: A real `CopilotRuntime` backend at `/api/copilotkit` with an Anthropic adapter (Claude claude-sonnet-4-6) replaces the prototype's mock 700ms timeout.

**IR-2**: `useCopilotAction` hooks on the client register the actions `queryObservability`, `runInvestigation`, `getWorkflowStatus`, `createJiraTicket`.

**IR-3**: The `runInvestigation` action starts a real Zigflow/Temporal `copilot-investigation` workflow and returns the workflow ID.

**IR-4**: Real GenUI cards are rendered by `CoAgentStateRenderer` or custom `useCopilotAction render` props — matching the visual design in `screens-copilot.jsx`.

---

## Success Criteria *(mandatory)*

1. The Copilot screen renders correctly for all three personas with the correct content (starters, transcript, catalog)
2. Clicking a starter prompt renders a matching GenUI card within 1 second
3. The Architecture Strip is visible and correctly labelled on every persona
4. The thinking indicator animates smoothly (lime pulse) and disappears when the card appears
5. Real Claude responses stream through CopilotKit and render as GenUI cards matching the design's visual style
6. A Zigflow workflow is triggered and its progress is reflected in the UI when the `runInvestigation` action is called

---

## Key Entities *(optional)*

See `data-model.md`.

---

## Design Token Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--lime` | `#9FE870` | Accent stripe, badges, active states |
| `--lime-dk` | `#7FCC50` | Hover states, icons |
| `--forest` | `#1A1A4E` | Sidebar bg, primary buttons, logo |
| `--cream` / `--bg-page` | `#F2F2FA` | Canvas background |
| `--font-sans` | `DM Sans` | All body and display text |
| `--font-mono` | `DM Mono` | Code, labels, eyebrows |

---

## Out of Scope

- Login / authentication
- Mobile layout (desktop ≥ 1280px only)
- Real Lynqx API data integration (banking data is mocked)
- Payments actually being processed
- The non-Copilot screens (Accounts, Transactions, Marketplace, etc.)
