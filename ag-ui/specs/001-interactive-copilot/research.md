# Research: Lynqx Copilot — Interactive Experience (json-render + A2UI)

**Date**: 2026-05-25 | **Feature**: 001-interactive-copilot | **Revision**: 2 (json-render focus)

---

## Technology: json-render + A2UI

### Decision: Use `@json-render/core` + `@json-render/react` with A2UI message protocol

**Rationale**: json-render constrains AI-generated UI within a developer-defined catalog, preventing hallucinated components. A2UI's adjacency-list message protocol enables incremental, patch-by-patch UI updates — which maps directly to Temporal workflow step progression (each activity boundary → one A2UI `surfaceUpdate` or `dataModelUpdate` message).

**Packages**:
- `@json-render/core` — `defineCatalog`, `compileSpecStream`
- `@json-render/react` — `defineRegistry`, `Renderer`, `StateProvider`, `VisibilityProvider`, `ActionProvider`
- `zod@4` — catalog prop schemas (peer dependency of `@json-render/react`)

**React version**: `19.2.4` ✓ (json-render peer dep: `react ^19.0.0`)

---

## US1 — Multi-Turn Conversation Context

### Decision: CopilotKit handles LLM history natively; `conversationContext` string fed to Temporal

**Rationale**: `useCopilotChat` already accumulates the full message history and sends it to the LLM on every turn via `BuiltInAgent`. The LLM already sees prior tool calls and their `summary` arguments. The remaining gap is the Temporal side: the workflow only receives the raw query, not what prior cards found.

Fix: `buildConversationContext(feed)` serializes the last 3 FeedItems into a compact plain-text string. This is added as `conversationContext` to every `startInvestigation` call. The Temporal worker can use it to narrow SigNoz queries.

**A2UI connection**: A2UI's `dataModelUpdate` message can carry a `conversationContext` field in the data model, allowing the card renderer to display "Building on: [prior context]" if needed.

**Alternatives considered**:
- Separate context store with `useRef` — redundant; CopilotKit already handles LLM history
- Passing full feed JSON — too large; compact summary string is sufficient

---

## US2 — State-Aware Streaming Cards via A2UI

### Decision: Extend `/api/agent/state-update` to accept A2UI messages; client processes via `A2UICard` component

**Rationale**: The state-update route already receives step events. A2UI's message protocol maps naturally:
- When workflow starts → `beginRendering` message sets root component
- Each workflow activity → `surfaceUpdate` updates progress indicator components
- Data arrives → `dataModelUpdate` populates values in bound components
- Workflow completes → final `surfaceUpdate` replaces progress UI with result card

The client-side `A2UICard` component maintains a component map (`Map<string, A2UIComponent>`) and data model (`Record<string, unknown>`). It polls `/api/agent/messages/[workflowId]` at 500ms intervals during workflow execution. Each poll response contains queued A2UI messages since the last acknowledged cursor.

**A2UI adjacency list format**: Components reference children by ID (flat list, not nested). This enables patching individual status-step components without re-rendering the entire card.

**SpecStream alternative**: json-render also supports RFC 6902 JSONL SpecStream. A2UI is preferred here because:
1. Temporal workers generate A2UI messages naturally (one message per activity)
2. A2UI's `dataModelUpdate` decouples data from layout (data model updates don't require layout re-renders)
3. Full A2UI docs available; `useUIStream`/SpecStream docs not available

---

## US3 — Actionable Payment Cards via json-render Actions

### Decision: Define `approvePayment` and `cancelPayment` in catalog; registry maps to `POST /api/payments/submit`

**Rationale**: json-render actions are the canonical way to handle button interactions. The catalog declares what actions exist (with Zod schemas for params), the registry implements them as async functions that call APIs.

For PaymentInitiation cards, the Temporal workflow sends an A2UI `surfaceUpdate` that includes a `Button` component with `action: { name: "approvePayment", context: [{ key: "paymentData", value: { path: "/payment" } }] }`. The registry handler POSTs this to `/api/payments/submit` and sets state to show the confirmation.

Button states during submission use A2UI's `dataModelUpdate` to set `/submitPhase` to `"submitting"`, `"success"`, or `"error"`. Button visibility and label are bound to this path.

**New route**: `POST /api/payments/submit`
- Demo mode: returns mock `{ txRef: "TXN-YYYYMMDD-NNNNN", status: "accepted" }` after 1s
- Temporal mode: starts `submitPayment` workflow, waits up to 10s for result

**Alternatives considered**:
- Inline fetch directly from a React component — acceptable but breaks the catalog-registry contract
- Re-using `/api/agent/start` with `workflowType: "submitPayment"` — possible but adds unnecessary workflow complexity for a synchronous action

---

## US4 — Persona Tool Scoping (Deferred from this revision)

**Decision**: Persona scoping remains via `useCopilotAdditionalInstructions` (already implemented) + system prompt tool-selection guidance. Separate persona-tool components are planned but deprioritized to keep this revision focused on the json-render integration for US1–US3.

---

## Integration Architecture: CopilotKit + json-render + A2UI

```
User message
  ↓
CopilotKit / BuiltInAgent (Mistral)
  ↓ tool call: renderBankDiagnostic({ summary, context })
CopilotScreen.tsx handler
  ↓ POST /api/agent/start → workflowId
  ↓ push A2UICard(workflowId) to feed
A2UICard.tsx
  ↓ poll /api/agent/messages/[workflowId] every 500ms
  ↓ process A2UI messages:
     beginRendering → set rootId
     surfaceUpdate  → update componentMap
     dataModelUpdate → update dataModel
  ↓ renderA2UI(componentMap, dataModel, rootId, { handlers })
```

Temporal workflow (demo-mode simulation or real):
```
POST /api/agent/state-update:
  beginRendering  → { root: "card-root" }
  surfaceUpdate   → progress steps layout
  dataModelUpdate → step 1 status "running"
  dataModelUpdate → step 1 status "done", step 2 "running"
  dataModelUpdate → step 2 status "done"
  surfaceUpdate   → full result card layout (replaces progress UI)
  dataModelUpdate → populate actual data values
```

---

## Catalog Design: Lynqx Card Components

Building blocks for all card types. The LLM does NOT generate these specs — the Temporal worker (or demo simulator) generates them deterministically based on workflow output data.

| Component | Purpose |
|-----------|---------|
| `CardShell` | Root card container with header + sources footer |
| `MetricRow` | Label + value pair (used for all KV data) |
| `StatusBadge` | Colored tag: success/warning/error/info |
| `DataTable` | Label/value rows for structured data |
| `ProgressStep` | Step indicator: pending/running/done/error |
| `ActionButton` | Primary/secondary/danger button with bound action |
| `SectionHeader` | Section divider with optional eyebrow text |
| `CodeBlock` | Monospace code display (for APIExplorer) |

Actions:
| Action | Params | Handler |
|--------|--------|---------|
| `approvePayment` | `{ workflowId, paymentData }` | POST `/api/payments/submit` |
| `cancelPayment` | `{ workflowId }` | local state update |
| `retryWorkflow` | `{ workflowId, query, cardType }` | POST `/api/agent/start` |
