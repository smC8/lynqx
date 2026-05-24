import type { WorkspaceId } from "./types";

export interface CatalogItem {
  t: string;
  d: string;
  icon: string;
}

export interface TranscriptEntry {
  q: string;
  cardType: string;
}

export interface PersonaConfig {
  intro: string;
  starters: string[];
  transcript: TranscriptEntry[];
  catalog: CatalogItem[];
}

export const COPILOT_BY_PERSONA: Record<WorkspaceId, PersonaConfig> = {
  exec: {
    intro:
      "Ask in plain language. Lynqx parses the intent, queries your live data layer, and renders a structured, actionable card — never a wall of text.",
    starters: [
      "What's our net USD position across HDFC and Citi as of this morning?",
      "Pay invoice INV-2041 to Tata Consulting, ₹12.4L from ICICI OpEx, approve by EOD",
      "30-day cash forecast if the Siemens payment delays by 2 weeks",
    ],
    transcript: [
      {
        q: "What's our net USD position across HDFC and Citi as of this morning?",
        cardType: "TreasuryPosition",
      },
      {
        q: "Pay invoice INV-2041 to Tata Consulting, ₹12.4L from our ICICI OpEx account, approve by EOD",
        cardType: "PaymentInitiation",
      },
      {
        q: "30-day cash forecast — what if the Siemens payment delays by 2 weeks?",
        cardType: "CashForecast",
      },
    ],
    catalog: [
      {
        t: "Exception resolution desk",
        d: "Failed payments arrive as a clickable card — error code, plain-English cause, retry / amend / reject actions.",
        icon: "Bolt",
      },
      {
        t: "Regulatory & audit copilot",
        d: "Compiles audit-ready exports — every outbound payment above $100K, with approval chain attached.",
        icon: "Shield",
      },
      {
        t: "ERP reconciliation assistant",
        d: "Finds SAP open items without matching statement lines and lets you investigate / write-off / escalate in line.",
        icon: "Database",
      },
    ],
  },
  bank: {
    intro:
      "Operate the channel in natural language. Diagnose failures, watch protocol drift, see customer health — every response renders as a structured card you can act on.",
    starters: [
      "Why did HDFC's SFTP batch fail last night?",
      "Diff today's ICICI pacs.002 against our registered schema",
      "Which enterprise customers have the highest payment failure rate this quarter?",
    ],
    transcript: [
      {
        q: "Why did HDFC's SFTP batch fail last night?",
        cardType: "BankDiagnostic",
      },
      {
        q: "Diff today's ICICI pacs.002 against our registered schema",
        cardType: "ProtocolDrift",
      },
      {
        q: "Which of our customers have the highest payment failure rate this quarter?",
        cardType: "SLAIntelligence",
      },
    ],
    catalog: [
      {
        t: "Schema & onboarding copilot",
        d: "Describe a new partner's API in plain English. Lynqx generates the DataWeave mapping, Zigflow config, and test payloads.",
        icon: "Wand",
      },
      {
        t: "Volume intelligence",
        d: "Live drill-downs over your channel without a BI tool — slice by rail, time, or counterparty.",
        icon: "TrendUp",
      },
      {
        t: "Customer health digest",
        d: "Auto-generated weekly summaries per customer, ready to send.",
        icon: "Send",
      },
    ],
  },
  dev: {
    intro:
      "Replace static docs and one-off scripts. Describe what you want; get a working sample, a generated mapping, a stress scenario, or a webhook trace — inline.",
    starters: [
      "Show me how to initiate a bulk SEPA payment for a NetSuite customer",
      "Simulate 500 concurrent PAIN.001 submissions with 10% rejection rate",
      "Why aren't my payment status webhooks firing for Citi?",
    ],
    transcript: [
      {
        q: "Show me how to initiate a bulk SEPA payment for a NetSuite customer",
        cardType: "APIExplorer",
      },
      {
        q: "Simulate 500 concurrent PAIN.001 submissions with 10% rejection rate",
        cardType: "StressTester",
      },
      {
        q: "Why aren't my payment status webhooks firing for Citi?",
        cardType: "WebhookDebug",
      },
    ],
    catalog: [
      {
        t: "Reconciliation app builder",
        d: "Map HDFC CAMT.053 lines to NetSuite journal entries. Confirm in a live field-mapping UI; export as DataWeave.",
        icon: "Diff",
      },
      {
        t: "Workflow composer",
        d: "Describe a payment-init → approval → submit → reconcile flow. Copilot generates the Zigflow DSL and flags missing handlers.",
        icon: "Branch",
      },
      {
        t: "Code-sample sandbox",
        d: "Every snippet is runnable against the sandbox — no copy-paste between Postman and your editor.",
        icon: "Play",
      },
    ],
  },
};

export const PERSONA_COPY: Record<WorkspaceId, { eyebrow: string; headline: string }> = {
  exec: {
    eyebrow: "Treasury copilot · powered by CopilotKit + Zigflow",
    headline: "Ask Lynqx anything about cash, payments, or reconciliation.",
  },
  bank: {
    eyebrow: "Bank-ops copilot · powered by CopilotKit + Zigflow",
    headline: "Operate the channel in natural language.",
  },
  dev: {
    eyebrow: "Developer copilot · powered by CopilotKit + Zigflow",
    headline: "Describe the integration. Ship the integration.",
  },
};
