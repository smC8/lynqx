# Contract: Zigflow Workflow — copilot-investigation

**Feature**: 001-copilot-ui | **Date**: 2026-05-23

---

## Workflow: `copilot-investigation`

**Task Queue**: `copilot-agents`
**DSL Version**: 1.0.0
**File**: `workflows/copilot-investigation.yaml`

---

## Input Schema

```typescript
{
  query: string;                  // Required: natural language investigation task
  timeRange?: {
    start: string;                // ISO 8601 or "now-Xh" relative format
    end: string;
  };
  services?: string[];            // Optional service name filter
  createTicket?: boolean;         // Default: false
  sessionId?: string;             // CopilotKit session ID for state callbacks
}
```

---

## Execution Steps

| Step | Name | Type | Description |
|------|------|------|-------------|
| 1 | `querySigNoz` | HTTP POST | Query SigNoz `/api/v3/query_range` for logs and traces |
| 2 | `queryTraces` | HTTP POST | Query SigNoz for trace data related to the services |
| 3 | `analyzeWithClaude` | HTTP POST | POST to Anthropic `/v1/messages` with findings for synthesis |
| 4 | `createTicket` | HTTP POST | (Conditional) POST to Jira REST API if `createTicket === true` |
| 5 | `emitResult` | set | Export final `InvestigationResult` to workflow context |

Steps 1 and 2 run in parallel via `fork`.

---

## Output Schema

On completion the workflow context contains:

```typescript
{
  result: {
    summary: string;
    findings: Array<{
      severity: "info" | "warning" | "error" | "critical";
      title: string;
      description: string;
      service?: string;
    }>;
    artifacts?: Array<{
      type: "jira_ticket";
      id: string;
      url: string;
      title: string;
    }>;
    observabilityData: {
      traceCount: number;
      errorRate: number;
      services: string[];
      timeRange: { start: string; end: string };
    };
  }
}
```

---

## State Emission (Agent State Updates)

The workflow emits step-level state updates via a custom HTTP POST to `/api/agent/state-update` at the start and end of each step. This allows the `AgentStatePanel` component to display real-time progress without polling Temporal directly.

**State update payload**:
```json
{
  "workflowId": "string",
  "step": "string",
  "status": "running | done | error",
  "timestamp": "ISO 8601"
}
```

---

## Error Handling

- **SigNoz unavailable**: Step returns empty results; workflow continues with analysis noting limited data
- **Claude API error**: Workflow retries up to 2 times with 5-second backoff; on persistent failure, sets status to `failed` with error message
- **Jira API error**: Ticket creation step retries once; if still failing, logs artifact failure but workflow completes successfully without the ticket

---

## Workflow YAML (Skeleton)

```yaml
document:
  dsl: 1.0.0
  taskQueue: copilot-agents
  workflowType: copilot-investigation
  version: 0.1.0
  title: Copilot Investigation
  summary: Query observability data, analyze with Claude, optionally create a Jira ticket
  metadata:
    activityOptions:
      startToCloseTimeout:
        minutes: 5
input:
  schema:
    format: json
    document:
      type: object
      required: [query]
      properties:
        query:
          type: string
        timeRange:
          type: object
        services:
          type: array
        createTicket:
          type: boolean
do:
  - notifyStart:
      call: http
      with:
        method: post
        endpoint: ${ $env.APP_URL + "/api/agent/state-update" }
        body:
          workflowId: ${ $workflow.id }
          step: "Querying observability data"
          status: running

  - gatherData:
      fork:
        compete: false
        branches:
          - queryLogs:
              call: http
              with:
                method: post
                endpoint: ${ $env.SIGNOZ_API_URL + "/api/v3/query_range" }
                headers:
                  SIGNOZ-API-KEY: ${ $env.SIGNOZ_API_KEY }
                body:
                  # ... SigNoz query params built from $input.query

          - queryTraces:
              call: http
              with:
                method: post
                endpoint: ${ $env.SIGNOZ_API_URL + "/api/v3/query_range" }
                headers:
                  SIGNOZ-API-KEY: ${ $env.SIGNOZ_API_KEY }

  - notifyAnalysis:
      call: http
      with:
        method: post
        endpoint: ${ $env.APP_URL + "/api/agent/state-update" }
        body:
          workflowId: ${ $workflow.id }
          step: "Analyzing with Claude"
          status: running

  - analyzeWithClaude:
      call: http
      with:
        method: post
        endpoint: https://api.anthropic.com/v1/messages
        headers:
          x-api-key: ${ $env.ANTHROPIC_API_KEY }
          anthropic-version: "2023-06-01"
          content-type: application/json
        body:
          model: claude-sonnet-4-6
          max_tokens: 2048
          messages:
            - role: user
              content: ${ "Analyze these observability findings and answer: " + $input.query + "\n\nData: " + ($context.gatherData | tojson) }

  - emitResult:
      export:
        as:
          result:
            summary: ${ $data.analyzeWithClaude.content[0].text }
            findings: []
      set:
        status: completed
```
