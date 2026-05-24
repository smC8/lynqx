export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  pendingApproval?: boolean;
}

export interface ToolCall {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: "pending" | "running" | "approved" | "rejected" | "done" | "error";
  requiresApproval: boolean;
}

export interface AgentState {
  workflowId: string;
  workflowType: "copilot-investigation" | string;
  status: "idle" | "running" | "waiting_approval" | "completed" | "failed";
  currentStep: string;
  steps: AgentStep[];
  result?: InvestigationResult;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentStep {
  name: string;
  description?: string;
  status: "pending" | "running" | "done" | "error";
  startedAt?: string;
  completedAt?: string;
  output?: Record<string, unknown>;
}

export interface InvestigationResult {
  summary: string;
  findings: Finding[];
  artifacts?: Artifact[];
  observabilityData?: {
    traceCount: number;
    errorRate: number;
    services: string[];
    timeRange: { start: string; end: string };
  };
}

export interface Finding {
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  service?: string;
}

export interface Artifact {
  type: "jira_ticket" | "alert";
  id: string;
  url: string;
  title: string;
}

export interface InvestigationInput {
  query: string;
  timeRange?: {
    start: string;
    end: string;
  };
  services?: string[];
  createTicket?: boolean;
}

export type WorkspaceId = "exec" | "bank" | "dev";
