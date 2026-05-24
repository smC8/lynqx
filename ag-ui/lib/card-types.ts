export interface DiagnosticStep {
  t: string;
  label: string;
  status: "ok" | "fail" | "warn";
  detail: string;
}
export interface BankDiagnosticData {
  steps: DiagnosticStep[];
  patch?: string;
}

export interface SLARow {
  name: string;
  fail: number;   // decimal fraction e.g. 0.05 = 5%
  calls: number;
  tag: string;
  vol: string;
}
export interface SLAIntelligenceData { rows: SLARow[] }

export interface StressFailure { code: string; count: number; reason: string }
export interface StressTesterData {
  submitted: number; accepted: number; rejected: number; p95ms: number;
  rps: number[];  // time-series array of ~30 points
  failures: StressFailure[];
}

export interface WebhookTraceStep { stage: string; status: "ok" | "fail" | "idle"; t: string; detail: string }
export interface WebhookDebugData { trace: WebhookTraceStep[]; fix?: string }

export interface PositionEntry { acc: string; curr: string; value: number; fx: number }
export interface TreasuryPositionData { positions: PositionEntry[] }

export interface CashForecastData {
  base: number[];    // 30 data points in $M
  stress: number[];  // 30 data points in $M
  events: Array<{ label: string; tag: "warn" | "neutral" }>;
}

export interface PaymentInitiationData {
  beneficiary: string;
  beneficiaryBank: string;
  amount: number;
  currency: string;
  debitAccount: string;
  reference: string;
  rail: string;
  deadline: string;
}

export interface ProtocolDriftData {
  bank: string;
  protocol: string;
  registeredVersion: string;
  newFields: Array<{ field: string; path: string }>;
  affectedCustomers: number;
  payloadsSampled: number;
  firstSeenHoursAgo: number;
}

export interface APIExplorerStep { comment: string; code: string }
export interface APIExplorerData {
  endpoint: string;
  description: string;
  steps: APIExplorerStep[];
  scopes: string[];
}
