# Data Model: Lynqx Console Copilot

**Feature**: 001-copilot-ui | **Date**: 2026-05-23

---

## Entities

### ChatMessage

Represents a single message in the copilot conversation thread.

```typescript
interface ChatMessage {
  id: string;                        // UUID
  role: "user" | "assistant" | "tool";
  content: string;                   // Markdown string
  timestamp: string;                 // ISO 8601
  toolCalls?: ToolCall[];            // present when role === "assistant"
  toolCallId?: string;               // present when role === "tool"
  pendingApproval?: boolean;         // true if awaiting human-in-the-loop
}
```

**Validation**:
- `content` must be non-empty for user and assistant messages
- `toolCallId` required when `role === "tool"`
- `timestamp` must be a valid ISO 8601 datetime

---

### ToolCall

Represents a single tool invocation by the AI assistant.

```typescript
interface ToolCall {
  id: string;               // Anthropic tool_use ID
  toolName: string;         // e.g., "queryObservability", "runInvestigation"
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: "pending" | "running" | "approved" | "rejected" | "done" | "error";
  requiresApproval: boolean;
}
```

**Validation**:
- `toolName` must match a registered CopilotKit action name
- `requiresApproval` is determined at registration time (static per tool)

---

### AgentState

Represents the live state of a Zigflow/Temporal workflow triggered by the copilot. This is the shape passed to CopilotKit's `useCoAgent` / `CoAgentStateRenderer`.

```typescript
interface AgentState {
  workflowId: string;
  workflowType: "copilot-investigation" | string;
  status: "idle" | "running" | "waiting_approval" | "completed" | "failed";
  currentStep: string;               // Human-readable step name
  steps: AgentStep[];
  result?: InvestigationResult;      // populated on completion
  error?: string;                    // populated on failure
  startedAt?: string;                // ISO 8601
  completedAt?: string;              // ISO 8601
}
```

---

### AgentStep

A single step within a running Zigflow workflow, streamed to the frontend as the workflow progresses.

```typescript
interface AgentStep {
  name: string;              // e.g., "Querying SigNoz", "Analyzing with Claude"
  description?: string;
  status: "pending" | "running" | "done" | "error";
  startedAt?: string;        // ISO 8601
  completedAt?: string;      // ISO 8601
  output?: Record<string, unknown>;
}
```

---

### InvestigationResult

The final output of a completed `copilot-investigation` Zigflow workflow.

```typescript
interface InvestigationResult {
  summary: string;                   // Claude-generated summary
  findings: Finding[];
  artifacts?: Artifact[];            // Jira tickets, etc.
  observabilityData?: {
    traceCount: number;
    errorRate: number;
    services: string[];
    timeRange: { start: string; end: string };
  };
}

interface Finding {
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  service?: string;
}

interface Artifact {
  type: "jira_ticket" | "alert";
  id: string;
  url: string;
  title: string;
}
```

---

## State Transitions

### AgentState Status FSM

```
idle ──(trigger)──► running ──(step done)──► running
                        │
                        ├──(approval needed)──► waiting_approval
                        │                          │
                        │                    (approved/rejected)
                        │                          │
                        ◄──────────────────────────┘
                        │
                        ├──(all steps done)──► completed
                        └──(error)──────────► failed
```

### ToolCall Status FSM

```
pending ──(start)──► running ──(success)──► done
                         │
                         ├──(needs approval)──► pending_approval
                         │                         │
                         │                   (approve/reject)
                         │                         │
                         ◄─────────────────── approved
                         └──(reject)──────────────► rejected
                         └──(exception)──────────► error
```

---

## Zigflow Workflow Input/Output Schemas

### copilot-investigation: Input

```typescript
interface InvestigationInput {
  query: string;           // Natural language task description
  timeRange?: {
    start: string;         // ISO 8601 or relative (e.g., "now-1h")
    end: string;
  };
  services?: string[];     // Filter to specific service names
  createTicket?: boolean;  // Whether to create a Jira ticket on completion
}
```

### copilot-investigation: Output

The workflow exports the `InvestigationResult` object into its final context.

---

## API Contracts: /api/agent/start

**Request**:
```typescript
POST /api/agent/start
Content-Type: application/json

{
  workflowType: "copilot-investigation";
  input: InvestigationInput;
}
```

**Response**:
```typescript
{
  workflowId: string;
  taskQueue: string;   // "copilot-agents"
  status: "started";
}
```

---

## API Contracts: /api/agent/status/:workflowId

**Response**:
```typescript
{
  workflowId: string;
  agentState: AgentState;
}
```
