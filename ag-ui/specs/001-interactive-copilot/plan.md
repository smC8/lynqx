# Implementation Plan: Lynqx Copilot — Interactive Experience

**Branch**: `001-interactive-copilot` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

## Summary

Replace the existing hardcoded React card components with a json-render + A2UI rendering pipeline. CopilotKit routes user intent (unchanged); Temporal workflows send A2UI messages that drive progressive card rendering via `@json-render/react`. Adds actionable buttons (payments), streaming workflow status, and multi-turn conversation context.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20  
**Framework**: Next.js 16.2.6 App Router  
**CopilotKit**: `@copilotkit/react-core` + `@copilotkit/runtime` v2 with `BuiltInAgent` (Mistral via `@ai-sdk/mistral`)  
**json-render**: `@json-render/core` + `@json-render/react` (new — not yet installed)  
**Schema validation**: `zod@4` (new — not yet installed)  
**Workflow engine**: Temporal (optional; demo mode uses mock simulation in `/api/agent/start`)  
**Observability**: SigNoz (queried by Temporal workers)  
**Storage**: In-process `Map` for A2UI message queues (module-level, session-scoped)  
**Target Platform**: Browser (Next.js SSR + React 19 client components)  
**Performance Goals**: First A2UI message visible within 500ms; step updates at each activity boundary  
**Constraints**: No new LLM calls for UI generation — Temporal workers generate A2UI specs deterministically from data  

## Constitution Check

No constitution defined for this project. No gate violations. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/001-interactive-copilot/
├── plan.md              ← this file
├── research.md          ← tech decisions (complete)
├── data-model.md        ← A2UI message shapes + catalog types (complete)
├── contracts/           ← API contracts (complete)
├── quickstart.md        ← integration test scenarios (complete)
└── tasks.md             ← task breakdown (/speckit-tasks)
```

### Source Code Layout (ag-ui/)

```text
ag-ui/
├── app/
│   └── api/
│       ├── copilotkit/route.ts          ← add conversationContext to render tools (US1)
│       ├── agent/
│       │   ├── start/route.ts           ← pass conversationContext to Temporal (US1)
│       │   ├── state-update/route.ts    ← extend to accept + queue A2UI messages (US2)
│       │   ├── messages/[id]/route.ts   ← NEW: returns queued A2UI messages with cursor (US2)
│       │   └── status/[id]/route.ts    ← unchanged
│       └── payments/
│           └── submit/route.ts          ← NEW: payment submission endpoint (US3)
├── components/
│   └── copilot/
│       ├── CopilotScreen.tsx            ← swap card rendering for A2UICard (US1, US2, US3)
│       ├── A2UICard.tsx                 ← NEW: poll messages → process A2UI → render (US2)
│       └── [genui/ cards kept for fallback]
└── lib/
    ├── genui/
    │   ├── catalog.ts                   ← NEW: defineCatalog() for Lynqx card components (US2, US3)
    │   ├── registry.tsx                 ← NEW: defineRegistry() React implementations + actions (US2, US3)
    │   └── a2ui.ts                      ← NEW: A2UI message types + renderA2UI helper (US2)
    ├── conversation-context.ts          ← NEW: buildConversationContext(feed) → string (US1)
    ├── useWorkflowResult.ts             ← unchanged (kept for fallback)
    ├── personas.ts                      ← unchanged
    └── types.ts                         ← add A2UIMessage, PaymentSubmitState types (US2, US3)
```

## Implementation Phases

### Phase 1: Foundation — json-render catalog + registry (US2 prerequisite)

Install packages and define the Lynqx card catalog.

**Install**:
```bash
npm install @json-render/core @json-render/react zod
```

**`lib/genui/catalog.ts`**: Define `lynqxCatalog` with `defineCatalog()`:
- Components: `CardShell`, `MetricRow`, `StatusBadge`, `DataTable`, `ProgressStep`, `ActionButton`, `SectionHeader`, `CodeBlock`
- Actions: `approvePayment(workflowId, paymentData)`, `cancelPayment(workflowId)`, `retryWorkflow(workflowId, query, cardType)`

**`lib/genui/registry.tsx`**: Implement `defineRegistry(lynqxCatalog, { components, actions })`:
- Components: React implementations matching the existing card visual language (dark bg-surface, mono labels, lime accents)
- Actions: `approvePayment` → `POST /api/payments/submit`; `cancelPayment` → local state; `retryWorkflow` → `POST /api/agent/start`

**`lib/genui/a2ui.ts`**: TypeScript types for A2UI messages + `processA2UIMessages()` helper that updates `componentMap` and `dataModel` from a batch of messages.

---

### Phase 2: A2UI message pipeline (US2)

Wire A2UI messages from Temporal simulation to the client.

**`app/api/agent/state-update/route.ts`**: Extend to accept both the existing `{ step, status }` format AND the new A2UI message format `{ workflowId, a2uiMessage: {...} }`. Both get stored per workflowId.

**`app/api/agent/messages/[id]/route.ts`** (new): 
- `GET /api/agent/messages/[workflowId]?cursor=N`
- Returns messages `[cursor...]` for the given workflow
- Client passes its last-seen cursor; server returns only new messages

**`app/api/agent/start/route.ts`**: Update `simulateDemoWorkflow` to emit full A2UI message sequences instead of just step name strings:

```
beginRendering → progress card layout
surfaceUpdate  → 3 ProgressStep components (querying/analyzing/rendering)
dataModelUpdate → step 1 "running"
dataModelUpdate → step 1 "done", step 2 "running"
dataModelUpdate → step 2 "done", step 3 "running"
surfaceUpdate  → replace progress card with result card (CardShell + MetricRow/DataTable components)
dataModelUpdate → populate result data values
```

Each card type (BankDiagnostic, TreasuryPosition, PaymentInitiation, etc.) has its own spec template function in `lib/genui/specs/` that generates the A2UI message sequence from workflow result data.

---

### Phase 3: A2UICard client component (US2)

**`components/copilot/A2UICard.tsx`**:
```
- Props: workflowId, summary (fallback while loading)
- State: componentMap (Map), dataModel (object), rootId (string|null), cursor (number)
- useEffect: setInterval 500ms → GET /api/agent/messages/[workflowId]?cursor=N
  → processA2UIMessages(messages) → update state
  → stop polling when dataModel.__complete === true
- Render: rootId present → renderA2UI() using json-render; else → loading pulse
- Wrap with: StateProvider, VisibilityProvider, ActionProvider (json-render providers)
```

**`components/copilot/CopilotScreen.tsx`**: Change `FeedItem` rendering to use `<A2UICard>` instead of `<CARD_REGISTRY[item.cardType]>`. Keep the old registry as a fallback for demo mode.

---

### Phase 4: Multi-turn context (US1)

**`lib/conversation-context.ts`**:
```typescript
export function buildConversationContext(feed: FeedItem[], limit = 3): string
// Returns compact plain-text: "Prior turns (most recent first):\n1. Q: '...' → CardType: summary\n..."
```

**`app/api/agent/start/route.ts`**: Pass `input.conversationContext` through to Temporal input and to demo simulator.

**`components/copilot/CopilotScreen.tsx`**: Pass `buildConversationContext(feed)` as `conversationContext` in every `startInvestigation` call.

**`app/api/copilotkit/route.ts`**: Add `context` parameter to all 9 render tool descriptions so the LLM can pass conversational context:
```
parameters: [
  { name: "summary", type: "string", ... },
  { name: "context", type: "string", description: "Comma-separated entities from prior turns relevant to this query" }
]
```

---

### Phase 5: Actionable payments (US3)

**`app/api/payments/submit/route.ts`** (new):
- Demo mode: delay 1s, return `{ txRef: "TXN-YYYYMMDD-NNNNN", status: "accepted" }`
- Temporal mode: start `submitPayment` workflow, wait up to 10s

**json-render action wiring** (in registry.tsx):
```typescript
approvePayment: async (params, setState) => {
  setState(prev => ({ ...prev, submitPhase: "submitting" }));
  const res = await fetch('/api/payments/submit', { method: 'POST', body: JSON.stringify(params) }).then(r => r.json());
  setState(prev => ({ ...prev, submitPhase: res.status === "accepted" ? "success" : "error", txRef: res.txRef, errorReason: res.reason }));
},
cancelPayment: (_, setState) => {
  setState(prev => ({ ...prev, submitPhase: "cancelled" }));
},
```

The PaymentInitiation A2UI spec template includes `ActionButton` components with:
- Approve: `action: { name: "approvePayment", context: [{ key: "workflowId", value: { path: "/workflowId" } }, { key: "paymentData", value: { path: "/payment" } }] }`
- Cancel: `action: { name: "cancelPayment" }`
- Button visibility bound to `$state.submitPhase === "idle"`
- Success/error messages bound to `$state.submitPhase`

## Complexity Tracking

No constitution violations. No complexity justification required.
