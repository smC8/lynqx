import type { WorkflowStep } from "@/lib/useWorkflowResult";
import type { CardTemplate } from "@/lib/supabase";
import { actionBinding } from "@json-render/core";

export type LynqxSpec = {
  root: string;
  elements: Record<string, {
    type: string;
    props: Record<string, unknown>;
    children?: string[];
    on?: Record<string, ReturnType<typeof actionBinding.simple>[]>;
  }>;
  state?: Record<string, unknown>;
};

// Recursively resolve $token strings inside spec props.
// Strings starting with "$" → data[key] (or fallback "—").
// Objects with { value: "$field", default: "..." } → resolved with fallback.
function resolveSpecTokens(
  value: unknown,
  summary: string,
  data: Record<string, unknown>
): unknown {
  if (typeof value === "string") {
    if (value === "$summary") return summary || "—";
    // Only resolve $identifier tokens (valid JS identifier after $), not "$4.1M" etc.
    if (/^\$[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      const raw = data[value.slice(1)];
      return raw !== undefined && raw !== null ? raw : "—";
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => {
      // Special case: { value: "$field", default: "fallback", ...rest }
      if (typeof item === "object" && item !== null && "value" in item && typeof item.value === "string" && item.value.startsWith("$")) {
        const fallback = "default" in item ? String(item.default) : "—";
        const raw = data[(item.value as string).slice(1)];
        const resolved = raw !== undefined && raw !== null ? String(raw) : fallback;
        const { default: _d, ...rest } = item as Record<string, unknown>;
        void _d;
        return resolveSpecTokens({ ...rest, value: resolved }, summary, data);
      }
      return resolveSpecTokens(item, summary, data);
    });
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        resolveSpecTokens(v, summary, data),
      ])
    );
  }
  return value;
}

// Build a spec from a Supabase card_templates row.
// If template.spec is set, tokens in its props are resolved and it is returned directly.
// Otherwise falls back to building from template.rows (MetricRow list).
export function buildSpecFromTemplate(
  template: CardTemplate,
  summary: string,
  data: Record<string, unknown>
): LynqxSpec {
  // Full spec stored in Supabase — resolve tokens and return
  if (template.spec) {
    const resolved = resolveSpecTokens(template.spec, summary, data) as LynqxSpec;
    // json-render requires element.props to be a non-null object — add {} where missing
    for (const el of Object.values(resolved.elements)) {
      if (!el.props) el.props = {};
    }
    return resolved;
  }

  // Legacy: build from rows array
  const resolve = (value: string, fallback?: string): string => {
    if (value === "$summary") return summary || fallback || "";
    if (value.startsWith("$")) {
      const raw = data[value.slice(1)];
      return raw !== undefined && raw !== null ? String(raw) : (fallback ?? "—");
    }
    return value;
  };

  const rowIds = template.rows.map((_, i) => `r${i}`);
  const rowEls: LynqxSpec["elements"] = {};
  template.rows.forEach((row, i) => {
    rowEls[`r${i}`] = {
      type: "MetricRow",
      props: {
        label: row.label,
        value: resolve(row.value, row.default),
        ...(row.style ? { valueStyle: row.style } : {}),
      },
    };
  });

  return {
    root: "card-root",
    elements: {
      "card-root": {
        type: "CardShell",
        props: { title: template.title, sources: template.sources },
        children: rowIds,
      },
      ...rowEls,
    },
  };
}

// Build the loading spec with progress steps from workflow steps
export function buildLoadingSpec(
  steps: WorkflowStep[],
  title = "Investigating…"
): LynqxSpec {
  const stepDefs = steps.length > 0
    ? steps
    : [
        { step: "Querying observability data", status: "running" as const, timestamp: "" },
        { step: "Analyzing with AI", status: "pending" as const, timestamp: "" },
        { step: "Rendering result", status: "pending" as const, timestamp: "" },
      ];

  const stepIds = stepDefs.map((_, i) => `step-${i}`);
  const stepElements: Record<string, LynqxSpec["elements"][string]> = {};
  stepDefs.forEach((s, i) => {
    stepElements[`step-${i}`] = {
      type: "ProgressStep",
      props: {
        label: s.step,
        status: (s.status as string) === "pending" ? "pending" : s.status,
      },
    };
  });

  return {
    root: "card-root",
    elements: {
      "card-root": {
        type: "CardShell",
        props: { title, sources: "SigNoz · Temporal" },
        children: ["steps-col"],
      },
      "steps-col": {
        type: "Spacer",
        props: { size: "sm" },
        children: stepIds,
      },
      ...stepElements,
    },
  };
}

// Build a generic result spec for any card type
export function buildResultSpec(
  cardType: string,
  summary: string,
  data: Record<string, unknown>
): LynqxSpec {
  switch (cardType) {
    case "BankDiagnostic":
      return buildBankDiagnosticSpec(summary, data);
    case "TreasuryPosition":
      return buildTreasurySpec(summary, data);
    case "PaymentInitiation":
      return buildPaymentSpec(summary, data);
    case "CashForecast":
      return buildCashForecastSpec(summary, data);
    case "SLAIntelligence":
      return buildSLASpec(summary, data);
    case "ProtocolDrift":
      return buildProtocolDriftSpec(summary, data);
    case "APIExplorer":
      return buildAPIExplorerSpec(summary, data);
    case "StressTester":
      return buildStressTesterSpec(summary, data);
    case "WebhookDebug":
      return buildWebhookDebugSpec(summary, data);
    default:
      return buildGenericSpec(summary, data);
  }
}

function metricEl(label: string, value: string, style?: "mono" | "danger" | "success"): LynqxSpec["elements"][string] {
  return { type: "MetricRow", props: { label, value, valueStyle: style } };
}

function buildBankDiagnosticSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "API Diagnostics", sources: "SigNoz · yesterday" }, children: ["m1", "m2", "m3", "m4", "m5"] },
      "m1": metricEl("Summary", summary || "No issues detected"),
      "m2": metricEl("Top endpoint", String(data.topEndpoint ?? "/v1/charges (3,241 calls)")),
      "m3": metricEl("Request volume", String(data.volume ?? "18,423 total")),
      "m4": metricEl("Error rate", String(data.errorRate ?? "0.26%"), (data.errorRate && Number(String(data.errorRate).replace("%", "")) > 1) ? "danger" : undefined),
      "m5": metricEl("Status", String(data.status ?? "Healthy"), "success"),
    },
  };
}

function buildTreasurySpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Treasury Position", sources: "Ledger · real-time" }, children: ["m1", "m2", "m3", "m4"] },
      "m1": metricEl("Summary", summary || "Position nominal"),
      "m2": metricEl("Net USD position", String(data.netPosition ?? "$4.1M")),
      "m3": metricEl("FX exposure", String(data.fxExposure ?? "₹12.4L hedged")),
      "m4": metricEl("Idle cash", String(data.idleCash ?? "$280K")),
    },
  };
}

export function buildPaymentSpec(
  summary: string,
  data: Record<string, unknown>,
  opts?: { workflowId?: string; submitPhase?: "idle" | "submitting" | "success" | "error" | "cancelled"; txRef?: string; errorReason?: string }
): LynqxSpec {
  const phase = opts?.submitPhase ?? "idle";
  const children = ["m1", "m2", "m3", "m4", "m5", "m6", "sp1"];

  const actionArea: Record<string, LynqxSpec["elements"][string]> = {};

  if (phase === "idle") {
    children.push("btn-approve", "btn-cancel");
    actionArea["btn-approve"] = {
      type: "ActionButton",
      props: { label: "Confirm and route for approval", variant: "primary" },
      on: {
        press: [actionBinding.simple("approvePayment", {
          workflowId: opts?.workflowId ?? "",
          beneficiary: String(data.beneficiary ?? ""),
          amount: Number(data.amount ?? 0),
          currency: String(data.currency ?? "USD"),
          debitAccount: String(data.debitAccount ?? ""),
          reference: String(data.reference ?? ""),
          rail: String(data.rail ?? ""),
          deadline: String(data.deadline ?? ""),
        })],
      },
    };
    actionArea["btn-cancel"] = {
      type: "ActionButton",
      props: { label: "Cancel", variant: "danger" },
      on: { press: [actionBinding.simple("cancelPayment", { workflowId: opts?.workflowId ?? "" })] },
    };
  } else if (phase === "submitting") {
    children.push("btn-submitting");
    actionArea["btn-submitting"] = {
      type: "ActionButton",
      props: { label: "Submitting…", variant: "primary", disabled: true },
    };
  } else if (phase === "success") {
    children.push("m-txref");
    actionArea["m-txref"] = metricEl("Transaction ref", opts?.txRef ?? "Accepted", "success");
  } else if (phase === "error") {
    children.push("m-error");
    actionArea["m-error"] = metricEl("Error", opts?.errorReason ?? "Submission failed", "danger");
  } else if (phase === "cancelled") {
    children.push("m-cancelled");
    actionArea["m-cancelled"] = { type: "StatusBadge", props: { label: "Cancelled", variant: "neutral" } };
  }

  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Payment Initiation", sources: "Ledger · corporate channel" }, children },
      "m1": metricEl("Summary", summary || "Payment ready for approval"),
      "m2": metricEl("Beneficiary", String(data.beneficiary ?? "—")),
      "m3": metricEl("Amount", `${data.currency ?? "USD"} ${Number(data.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`),
      "m4": metricEl("Debit account", String(data.debitAccount ?? "—"), "mono"),
      "m5": metricEl("Reference", String(data.reference ?? "—"), "mono"),
      "m6": metricEl("Rail", String(data.rail ?? "—")),
      "sp1": { type: "Spacer", props: { size: "sm" } },
      ...actionArea,
    },
  };
}

function buildCashForecastSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "30-Day Cash Forecast", sources: "Ledger · forecast model" }, children: ["m1", "m2", "m3"] },
      "m1": metricEl("Insight", summary || "Cash flow stable"),
      "m2": metricEl("Projected balance", String(data.projected ?? "$3.8M at day 30")),
      "m3": metricEl("Stress floor", String(data.stressFloor ?? "$1.2M (Siemens -2 weeks)"), "danger"),
    },
  };
}

function buildSLASpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "SLA Intelligence", sources: "Payments · last 90 days" }, children: ["m1", "m2", "m3", "m4"] },
      "m1": metricEl("Summary", summary || "Two customers above SLA threshold"),
      "m2": metricEl("Worst failure rate", String(data.worstRate ?? "12.4% — Safaricom")),
      "m3": metricEl("Average success rate", String(data.avgSuccessRate ?? "98.1%")),
      "m4": metricEl("Alert threshold", "5.0%", "danger"),
    },
  };
}

function buildProtocolDriftSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Protocol Drift", sources: "Schema registry" }, children: ["m1", "m2", "m3"] },
      "m1": metricEl("Summary", summary || "Schema drift detected"),
      "m2": metricEl("Partner", String(data.partner ?? "ICICI Bank")),
      "m3": metricEl("Changed fields", String(data.changedFields ?? "3 fields modified in pacs.002")),
    },
  };
}

function buildAPIExplorerSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  const code = String(data.code ?? `curl -X POST https://api.lynqx.io/v1/payments \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"amount":1000,"currency":"USD"}'`);
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "API Explorer", sources: "Lynqx API docs" }, children: ["m1", "code1"] },
      "m1": metricEl("Use case", summary || "Payment initiation example"),
      "code1": { type: "CodeBlock", props: { code, language: "bash" } },
    },
  };
}

function buildStressTesterSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Stress Test Results", sources: "Load runner" }, children: ["m1", "m2", "m3", "m4"] },
      "m1": metricEl("Key finding", summary || "Throughput stable under load"),
      "m2": metricEl("Max sustained RPS", String(data.maxRPS ?? "480 RPS")),
      "m3": metricEl("Failure rate at peak", String(data.failureRate ?? "2.1%"), "danger"),
      "m4": metricEl("Dominant failure mode", String(data.failureMode ?? "Timeout at payment gateway")),
    },
  };
}

function buildWebhookDebugSpec(summary: string, data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Webhook Debug", sources: "Event pipeline" }, children: ["m1", "m2", "m3"] },
      "m1": metricEl("Root cause", summary || "Delivery failure identified"),
      "m2": metricEl("Failed event type", String(data.eventType ?? "payment.status.updated")),
      "m3": metricEl("Suggested fix", String(data.fix ?? "Re-register endpoint — TLS cert expired")),
    },
  };
}

function buildGenericSpec(summary: string, _data: Record<string, unknown>): LynqxSpec {
  return {
    root: "card-root",
    elements: {
      "card-root": { type: "CardShell", props: { title: "Result", sources: "Lynqx" }, children: ["m1"] },
      "m1": metricEl("Summary", summary || "Query processed"),
    },
  };
}
