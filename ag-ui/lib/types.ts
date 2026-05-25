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

// A2UI message protocol types
export interface A2UIComponent {
  id: string;
  component: Record<string, Record<string, unknown>>;
}

export interface A2UISurfaceUpdate {
  surfaceId?: string;
  components: A2UIComponent[];
}

export interface A2UIDataModelUpdate {
  surfaceId?: string;
  path?: string;
  contents: Array<{
    key: string;
    valueString?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
    valueMap?: unknown[];
  }>;
}

export interface A2UIBeginRendering {
  surfaceId?: string;
  root: string;
  catalogId?: string;
}

export interface A2UIMessage {
  workflowId: string;
  surfaceUpdate?: A2UISurfaceUpdate;
  dataModelUpdate?: A2UIDataModelUpdate;
  beginRendering?: A2UIBeginRendering;
  deleteSurface?: { surfaceId: string };
}

// Payment submission types
export interface PaymentSubmitRequest {
  workflowId: string;
  paymentData: {
    beneficiary: string;
    beneficiaryBank?: string;
    amount: number;
    currency: string;
    debitAccount: string;
    reference: string;
    rail: string;
    deadline?: string;
  };
}

export interface PaymentSubmitResponse {
  txRef: string;
  status: "accepted" | "rejected" | "processing";
  reason?: string;
}
