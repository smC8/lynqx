# API Contract: POST /api/agent/start (extended)

**Feature**: 001-interactive-copilot (US1 — Multi-Turn Context)  
**Change type**: Additive — new optional field `conversationContext`

---

## Request (extended)

```
POST /api/agent/start
Content-Type: application/json
```

```json
{
  "workflowType": "copilot-investigation",
  "input": {
    "query": "string",
    "cardType": "string",
    "conversationContext": "string (optional)"
  }
}
```

**`conversationContext`** is a compact plain-text summary of the last 1–3 feed items, e.g.:

```
Prior turns (most recent first):
1. Q: 'most used routes yesterday?' → BankDiagnostic: '/v1/charges led with 3.2k calls, 47 errors'
2. Q: 'show treasury position' → TreasuryPosition: 'Net USD 4.1M across HDFC and Citi'
```

The Temporal `copilotInvestigation` workflow receives this as `input.conversationContext` and MAY use it to refine SigNoz query scope. In demo mode, it is logged but not acted upon.

---

## No change to response shape

Response remains:
```json
{ "workflowId": "string", "status": "started" }
```
