# Contract: CopilotKit API Routes

**Feature**: 001-copilot-ui | **Date**: 2026-05-23

---

## POST /api/copilotkit

The main CopilotRuntime endpoint. Handles all CopilotKit protocol messages including chat completions, tool calls, and agent state updates.

**Managed by**: `CopilotRuntime` from `@copilotkit/runtime`
**Auth**: None (demo scope — add middleware for production)

### Registered Tools (Actions)

#### `queryObservability`
Query SigNoz for logs, traces, or metrics.

```typescript
// Input
{
  signal: "logs" | "traces" | "metrics";
  service?: string;
  timeRange?: { start: string; end: string };
  query?: string;         // free-text filter
  limit?: number;         // default 20
}

// Output
{
  results: Array<Record<string, unknown>>;
  totalCount: number;
  timeRange: { start: string; end: string };
}
```

**Requires approval**: No

---

#### `runInvestigation`
Start a Zigflow/Temporal `copilot-investigation` workflow.

```typescript
// Input
{
  query: string;
  timeRange?: { start: string; end: string };
  services?: string[];
  createTicket?: boolean;
}

// Output (immediate — workflow ID, not final result)
{
  workflowId: string;
  status: "started";
  message: string;    // e.g., "Investigation workflow started. Tracking..."
}
```

**Requires approval**: No (starting is safe; ticket creation requires approval inside the workflow)

---

#### `getWorkflowStatus`
Retrieve current state of a running or completed Temporal workflow.

```typescript
// Input
{ workflowId: string; }

// Output
{ agentState: AgentState; }   // See data-model.md
```

**Requires approval**: No

---

#### `createJiraTicket`
Create a Jira issue. This tool requires human approval before execution.

```typescript
// Input
{
  summary: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  labels?: string[];
}

// Output
{
  ticketId: string;     // e.g., "LNX-42"
  url: string;
  summary: string;
}
```

**Requires approval**: **YES** — displays `ApprovalCard` in the UI before executing

---

## POST /api/agent/start

Starts a Temporal workflow via the Zigflow worker.

**Request**:
```json
{
  "workflowType": "copilot-investigation",
  "input": {
    "query": "string",
    "timeRange": { "start": "string", "end": "string" },
    "services": ["string"],
    "createTicket": false
  }
}
```

**Response 200**:
```json
{
  "workflowId": "copilot-investigation-uuid",
  "taskQueue": "copilot-agents",
  "status": "started"
}
```

**Response 500**:
```json
{
  "error": "Failed to start workflow",
  "detail": "string"
}
```

---

## GET /api/agent/status/:workflowId

Polls the current state of a running workflow. Called by the `AgentStatePanel` component on a 1-second interval while the workflow is running.

**Response 200**:
```json
{
  "workflowId": "string",
  "agentState": {
    "workflowId": "string",
    "workflowType": "copilot-investigation",
    "status": "running",
    "currentStep": "Analyzing with Claude",
    "steps": [
      { "name": "Querying SigNoz", "status": "done", "startedAt": "...", "completedAt": "..." },
      { "name": "Analyzing with Claude", "status": "running", "startedAt": "..." }
    ],
    "result": null,
    "error": null
  }
}
```

**Response 404**:
```json
{ "error": "Workflow not found" }
```
