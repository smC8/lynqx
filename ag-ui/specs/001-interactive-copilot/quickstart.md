# Quickstart: Lynqx Copilot — Interactive Experience (json-render + A2UI)

**Date**: 2026-05-25 | **Feature**: 001-interactive-copilot | **Revision**: 2

---

## Setup

```bash
npm install @json-render/core @json-render/react zod
```

Verify catalog renders by visiting the copilot screen and checking that `A2UICard` mounts without errors in the console.

---

## Scenario 1: Streaming Status Card (US2 — validate first, it's the foundation)

1. Open the copilot in any workspace
2. Submit: *"What were the most used API routes yesterday?"*
3. **Expected**: Card area immediately shows a `CardShell` with title "Investigating…" and 3 `ProgressStep` components: "Querying SigNoz", "Analyzing with Claude", "Rendering result"
4. Step 1 dot pulses → transitions to ✓ → Step 2 pulses → ✓ → Step 3 pulses → ✓
5. Card area transitions to the full BankDiagnostic result card with real data rows

**Validation**:
- Network tab → `GET /api/agent/messages/[workflowId]` should show 5–8 responses with different cursors
- React DevTools → `A2UICard` state should show `componentMap.size` growing from 1 → 5+ as messages arrive
- The `beginRendering` message arrives first and sets `rootId`

---

## Scenario 2: Multi-Turn Investigation (US1)

1. In **Exec** workspace, type: *"What's our net USD position across HDFC and Citi?"*
   - TreasuryPosition card renders
2. Type: *"Now show me errors for those same accounts yesterday"*
   - Expected: BankDiagnostic card renders, and the `/api/agent/start` request body contains `conversationContext` with a summary of turn 1 mentioning "HDFC" and "Citi"

**Validation**:
- Network tab → `POST /api/agent/start` body → `input.conversationContext` must be non-empty
- The LLM's second response should reference "HDFC" or "Citi" without the user re-stating them (check CopilotKit dev console if enabled)

---

## Scenario 3: Payment Approval (US3)

1. Switch to **Exec** workspace
2. Type: *"Pay $5,000 USD to Safaricom account 4521 for invoice INV-2024-0891"*
3. PaymentInitiation card renders via A2UI — shows beneficiary, amount, rail, deadline rows
4. Two `ActionButton` components visible: "Confirm and route for approval" (primary) + "Cancel" (danger)
5. Click **"Confirm and route for approval"**:
   - Button label changes to "Submitting…" and is disabled
   - Network tab: `POST /api/payments/submit` fires
   - After ~1s: button area replaced with `✓ Payment accepted · Ref: TXN-20260525-00123`
6. Reload and try a new PaymentInitiation, then click **"Cancel"**:
   - Button area shows "Cancelled" with no API call to `/api/payments/submit`

**Validation**:
- `submitPhase` in A2UICard's `dataModel` transitions: `idle → submitting → success`
- Only one POST to `/api/payments/submit` per Approve click (double-click test)

---

## Scenario 4: Error Handling (US2 edge case)

1. Stop the Next.js dev server briefly, then send a query
2. When server is back: error card should show inline with a "Retry" button
3. Click "Retry" → `retryWorkflow` action fires → new `POST /api/agent/start` call

**Validation**:
- `dataModel.__error` is set → `CardShell` renders error state
- "Retry" button uses `retryWorkflow` action with original query and cardType

---

## A2UI Message Sequence Reference (BankDiagnostic example)

Full message sequence emitted by `simulateDemoWorkflow` for `cardType = "BankDiagnostic"`:

```jsonl
{"workflowId":"...","beginRendering":{"root":"card-root"}}
{"workflowId":"...","surfaceUpdate":{"components":[
  {"id":"card-root","component":{"CardShell":{"title":"Investigating…","sources":"SigNoz · Temporal"}}},
  {"id":"steps","component":{"Column":{"children":{"explicitList":["s1","s2","s3"]}}}},
  {"id":"s1","component":{"ProgressStep":{"label":"Querying SigNoz","status":{"path":"/step1"}}}},
  {"id":"s2","component":{"ProgressStep":{"label":"Analyzing results","status":{"path":"/step2"}}}},
  {"id":"s3","component":{"ProgressStep":{"label":"Rendering card","status":{"path":"/step3"}}}}
]}}
{"workflowId":"...","dataModelUpdate":{"contents":[{"key":"step1","valueString":"running"}]}}
{"workflowId":"...","dataModelUpdate":{"contents":[{"key":"step1","valueString":"done"},{"key":"step2","valueString":"running"}]}}
{"workflowId":"...","dataModelUpdate":{"contents":[{"key":"step2","valueString":"done"},{"key":"step3","valueString":"running"}]}}
{"workflowId":"...","surfaceUpdate":{"components":[
  {"id":"card-root","component":{"CardShell":{"title":"API Diagnostics","sources":"SigNoz · yesterday"}}},
  {"id":"metrics","component":{"Column":{"children":{"explicitList":["m1","m2","m3"]}}}},
  {"id":"m1","component":{"MetricRow":{"label":"Top endpoint","value":{"path":"/topEndpoint"}}}},
  {"id":"m2","component":{"MetricRow":{"label":"Request volume","value":{"path":"/volume"}}}},
  {"id":"m3","component":{"MetricRow":{"label":"Error rate","value":{"path":"/errorRate"}}}}
]}}
{"workflowId":"...","dataModelUpdate":{"contents":[
  {"key":"topEndpoint","valueString":"/v1/charges (3,241 calls)"},
  {"key":"volume","valueString":"18,423 total"},
  {"key":"errorRate","valueString":"0.26%"},
  {"key":"step3","valueString":"done"},
  {"key":"__complete","valueBoolean":true}
]}}
```

---

## Regression Checklist

After all phases are implemented, verify no regressions:

- [ ] All 9 card types render correctly via A2UI (each needs its own spec template)
- [ ] Suggested starters still fire and produce cards
- [ ] Demo mode (no MISTRAL_API_KEY) still shows stubs
- [ ] Persona switcher resets the feed and applies new persona config
- [ ] CopilotKit `isLoading` spinner shows while Mistral is responding
- [ ] Old hardcoded card components (`genui/`) still exist as fallbacks (not deleted)
