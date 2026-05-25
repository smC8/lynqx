# API Contract: GET /api/agent/messages/[workflowId]

**Feature**: 001-interactive-copilot (US2 — Streaming Status Cards)  
**Consumer**: `A2UICard.tsx` polling loop  
**Provider**: `app/api/agent/messages/[id]/route.ts` (new)

---

## Request

```
GET /api/agent/messages/{workflowId}?cursor=0
```

`cursor` — integer index (0-based). Returns messages at index ≥ cursor. Default: 0.

---

## Response: 200

```json
{
  "workflowId": "copilotInvestigation-1716649200000",
  "messages": [
    {
      "workflowId": "copilotInvestigation-1716649200000",
      "beginRendering": { "root": "card-root" }
    },
    {
      "workflowId": "copilotInvestigation-1716649200000",
      "surfaceUpdate": {
        "components": [
          {
            "id": "card-root",
            "component": {
              "CardShell": { "title": "Investigating…", "sources": "SigNoz · Temporal" }
            }
          },
          {
            "id": "steps-col",
            "component": {
              "Column": { "children": { "explicitList": ["step-1", "step-2", "step-3"] } }
            }
          },
          {
            "id": "step-1",
            "component": {
              "ProgressStep": { "label": "Querying SigNoz", "status": { "path": "/step1Status" } }
            }
          }
        ]
      }
    },
    {
      "workflowId": "copilotInvestigation-1716649200000",
      "dataModelUpdate": {
        "contents": [{ "key": "step1Status", "valueString": "running" }]
      }
    }
  ],
  "nextCursor": 3
}
```

---

## Response: 404

Returned if workflowId is unknown.

```json
{ "error": "Unknown workflowId" }
```

---

## Behavior

- Messages are stored in-process (module-level `Map<workflowId, A2UIMessage[]>`)
- A workflowId is "complete" when its data model contains `__complete: true` — the client stops polling
- Messages are never deleted during the session (cursor-based access is idempotent)
- The polling client sends `cursor=nextCursor` from the prior response

---

# API Contract: POST /api/agent/state-update (extended)

**Change type**: Additive — supports both existing step format and new A2UI format

## Request (A2UI variant)

```json
{
  "workflowId": "string",
  "a2uiMessage": {
    "surfaceUpdate": { ... }
  }
}
```

The handler detects presence of `a2uiMessage` key. If present, routes to the A2UI message queue. If absent (legacy `{ step, status }` format), stores in the existing step log unchanged.

Both formats remain supported simultaneously.
