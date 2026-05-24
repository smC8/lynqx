"use client";

import { useState, useRef, useEffect } from "react";
import { useCopilotAction, useCopilotChat, useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { Icon } from "@/components/shell/Icons";
import PromptLine from "./PromptLine";
import AgentCard from "./AgentCard";
import MiniStat from "./MiniStat";
import ArchitectureStrip from "./ArchitectureStrip";
import GenericStubCard from "./GenericStubCard";
import { COPILOT_BY_PERSONA, PERSONA_COPY } from "@/lib/personas";
import type { WorkspaceId } from "@/lib/types";
import AgentStatePanel from "./AgentStatePanel";

// GenUI card registry — resolved by cardType string
import TreasuryPosition from "./genui/exec/TreasuryPosition";
import PaymentInitiation from "./genui/exec/PaymentInitiation";
import CashForecast from "./genui/exec/CashForecast";
import BankDiagnostic from "./genui/bank/BankDiagnostic";
import ProtocolDrift from "./genui/bank/ProtocolDrift";
import SLAIntelligence from "./genui/bank/SLAIntelligence";
import APIExplorer from "./genui/dev/APIExplorer";
import StressTester from "./genui/dev/StressTester";
import WebhookDebug from "./genui/dev/WebhookDebug";

const CARD_REGISTRY: Record<string, React.ComponentType> = {
  TreasuryPosition,
  PaymentInitiation,
  CashForecast,
  BankDiagnostic,
  ProtocolDrift,
  SLAIntelligence,
  APIExplorer,
  StressTester,
  WebhookDebug,
};

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface FeedItem {
  q: string;
  cardType: string;
}

interface Props {
  persona: WorkspaceId;
}

export default function CopilotScreen({ persona }: Props) {
  const cfg = COPILOT_BY_PERSONA[persona];
  const copy = PERSONA_COPY[persona];
  const [query, setQuery] = useState("");
  const [feed, setFeed] = useState<FeedItem[]>(cfg.transcript);
  const [thinking, setThinking] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>("");

  const { appendMessage, isLoading } = useCopilotChat();
  const effectiveThinking = isDemoMode ? thinking : isLoading;

  // T056 — persona-aware instructions for Claude
  useCopilotAdditionalInstructions({
    instructions: `Active workspace: ${persona}. ${PERSONA_COPY[persona].eyebrow}. ` +
      `Context: ${persona === "exec" ? "treasury, cash management, corporate payments" : persona === "bank" ? "bank operations, protocol diagnostics, customer SLA" : "developer API integration, stress testing, webhook debugging"}. ` +
      `Always respond by calling a render tool that matches the user query — never reply with plain text.`,
  }, [persona]);

  // T047-T055 — register all 9 GenUI render actions
  useCopilotAction({ name: "renderTreasuryPosition", description: "Show treasury position: net USD balance, FX exposure, idle cash across accounts", parameters: [{ name: "summary", type: "string", description: "Position summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "TreasuryPosition" }]); } });
  useCopilotAction({ name: "renderPaymentInitiation", description: "Show a payment initiation card with beneficiary, amount, debit account, and approval chain", parameters: [{ name: "summary", type: "string", description: "Payment summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "PaymentInitiation" }]); } });
  useCopilotAction({ name: "renderCashForecast", description: "Show 30-day cash forecast with baseline, stress scenario, and floor line", parameters: [{ name: "summary", type: "string", description: "Forecast summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "CashForecast" }]); } });
  useCopilotAction({ name: "renderBankDiagnostic", description: "Diagnose bank connectivity or batch failure with step trace and suggested patch", parameters: [{ name: "summary", type: "string", description: "Diagnostic summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "BankDiagnostic" }]); } });
  useCopilotAction({ name: "renderProtocolDrift", description: "Show protocol drift between registered and observed schema for a bank partner", parameters: [{ name: "summary", type: "string", description: "Drift summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "ProtocolDrift" }]); } });
  useCopilotAction({ name: "renderSLAIntelligence", description: "Show customer payment failure rates and SLA health ranked by failure percentage", parameters: [{ name: "summary", type: "string", description: "SLA summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "SLAIntelligence" }]); } });
  useCopilotAction({ name: "renderAPIExplorer", description: "Show API usage examples with curl and SDK code samples for a payment integration", parameters: [{ name: "summary", type: "string", description: "API description" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "APIExplorer" }]); } });
  useCopilotAction({ name: "renderStressTester", description: "Show stress test results with RPS chart, failure stats, and failure modes table", parameters: [{ name: "summary", type: "string", description: "Stress test summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "StressTester" }]); } });
  useCopilotAction({ name: "renderWebhookDebug", description: "Debug webhook delivery failures with pipeline trace and nginx config fix", parameters: [{ name: "summary", type: "string", description: "Webhook issue summary" }], handler: async () => { setFeed(f => [...f, { q: lastQueryRef.current, cardType: "WebhookDebug" }]); } });

  // T063 — Zigflow investigation action
  useCopilotAction({
    name: "runInvestigation",
    description: "Run a deep investigation using Zigflow/Temporal: query SigNoz observability data, analyze with Claude, and optionally create a Jira ticket",
    parameters: [
      { name: "query", type: "string", description: "Natural language investigation query" },
      { name: "services", type: "string", description: "Comma-separated service names to filter (optional)" },
      { name: "createTicket", type: "boolean", description: "Whether to create a Jira ticket (optional)" },
    ],
    handler: async (args) => {
      const res = await fetch("/api/agent/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workflowType: "copilot-investigation",
          input: {
            query: (args as { query?: string }).query ?? lastQueryRef.current,
            services: (args as { services?: string }).services?.split(",").map(s => s.trim()).filter(Boolean),
            createTicket: (args as { createTicket?: boolean }).createTicket ?? false,
          },
        }),
      }).then(r => r.json()) as { workflowId?: string };
      const workflowId = res.workflowId ?? "unknown";
      setFeed(f => [...f, { q: lastQueryRef.current, cardType: `investigation:${workflowId}` }]);
    },
  });

  useEffect(() => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setThinking(false);
    setFeed(cfg.transcript);
    setQuery("");
  }, [persona, cfg.transcript]);

  const submit = (text?: string, starterIndex?: number) => {
    const q = (text ?? query).trim();
    if (!q) return;
    setQuery("");
    lastQueryRef.current = q;

    if (!isDemoMode) {
      // T057 — real mode: route through CopilotKit → Claude
      appendMessage(new TextMessage({ content: q, role: Role.User }));
      return;
    }

    // Demo mode: mock 700ms delay with CARD_REGISTRY lookup
    setThinking(true);
    const canvas = document.querySelector(".app-canvas");
    thinkingTimerRef.current = setTimeout(() => {
      const transcriptEntry =
        starterIndex !== undefined ? cfg.transcript[starterIndex] : undefined;
      const next: FeedItem = transcriptEntry ?? { q, cardType: "stub" };
      setFeed((f) => [...f, next]);
      setThinking(false);
      setTimeout(() => {
        canvas?.scrollTo({ top: canvas.scrollHeight, behavior: "smooth" });
      }, 60);
    }, 700);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      {/* Hero */}
      <div className="slide-up" style={{ marginBottom: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 6, color: "var(--lime-dk)" }}>
          <Icon.Wand size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
          {copy.eyebrow}
        </div>
        <h1 className="h-display">{copy.headline}</h1>
        <p className="body" style={{ marginTop: 8, maxWidth: 760 }}>{cfg.intro}</p>
      </div>

      {/* Composer */}
      <div
        className="slide-up"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-md)",
          padding: 14,
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              flexShrink: 0,
              background: "var(--forest)",
              color: "var(--lime)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon.Wand size={16} />
          </span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Describe what you need — Lynqx will plan, query, and render a card you can act on…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              border: 0,
              outline: 0,
              background: "transparent",
              color: "var(--fg-1)",
              fontSize: 14.5,
              lineHeight: 1.5,
              fontFamily: "var(--font-sans)",
              padding: 6,
            }}
          />
          <button
            className="btn btn-primary"
            disabled={!query.trim() || effectiveThinking}
            onClick={() => submit()}
            style={!query.trim() || effectiveThinking ? { opacity: 0.5, pointerEvents: "none" } : {}}
          >
            {effectiveThinking ? (
              <>
                <Icon.Refresh size={13} /> Working…
              </>
            ) : (
              <>
                Send <Icon.ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

        {/* Suggested starters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, paddingLeft: 46 }}>
          <span
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--fg-3)",
              letterSpacing: 0.6,
              textTransform: "uppercase",
              marginRight: 4,
              alignSelf: "center",
            }}
          >
            Try
          </span>
          {cfg.starters.map((s, i) => (
            <button
              key={i}
              onClick={() => submit(s, i)}
              title={s}
              style={{
                padding: "5px 10px",
                background: "var(--bg-sunken)",
                border: "1px solid var(--border-1)",
                borderRadius: 999,
                fontSize: 11.5,
                color: "var(--fg-2)",
                cursor: "pointer",
                transition: "all 140ms ease",
                textAlign: "left",
                maxWidth: 380,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(159,232,112,0.10)";
                e.currentTarget.style.borderColor = "var(--lime-dk)";
                e.currentTarget.style.color = "var(--fg-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-sunken)";
                e.currentTarget.style.borderColor = "var(--border-1)";
                e.currentTarget.style.color = "var(--fg-2)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ArchitectureStrip />

      {/* Transcript */}
      <div ref={transcriptRef}>
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 14 }}>
          Live transcript · session 8f4a · this workspace
        </div>
        {effectiveThinking && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 14,
              background: "var(--bg-surface-2)",
              borderRadius: "var(--r-md)",
              border: "1px dashed var(--border-strong)",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "var(--lime)",
                animation: "lx-pulse 1s ease-in-out infinite",
              }}
            />
            <span className="mono" style={{ fontSize: 12, color: "var(--fg-2)", letterSpacing: 0.4 }}>
              Planning · resolving entities · drafting structured response…
            </span>
          </div>
        )}
        {[...feed].reverse().map((item, i) => {
          // T063/T064: investigation cards embed AgentStatePanel
          if (item.cardType.startsWith("investigation:")) {
            const workflowId = item.cardType.replace("investigation:", "");
            return (
              <div key={i}>
                <PromptLine text={item.q} />
                <div
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--r-xl)",
                    boxShadow: "var(--shadow-md)",
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <div className="eyebrow" style={{ marginBottom: 12, color: "var(--lime-dk)" }}>
                    <Icon.Branch size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Zigflow investigation · Temporal
                  </div>
                  <AgentStatePanel workflowId={workflowId} />
                </div>
              </div>
            );
          }
          const CardComp = CARD_REGISTRY[item.cardType];
          return (
            <div key={i}>
              <PromptLine text={item.q} />
              {CardComp ? <CardComp /> : <GenericStubCard query={item.q} />}
            </div>
          );
        })}
      </div>

      {/* Capability catalog */}
      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>More capabilities for this workspace</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {cfg.catalog.map((c, i) => {
            const CatIcon = (Icon as Record<string, React.ComponentType<{ size?: number }>>)[c.icon] ?? Icon.Sparkle;
            return (
              <div key={i} className="surface" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: "rgba(159,232,112,0.16)",
                      color: "var(--lime-dk)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CatIcon size={15} />
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-1)" }}>{c.t}</div>
                </div>
                <div className="body" style={{ fontSize: 12.5, margin: 0 }}>{c.d}</div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "auto", alignSelf: "flex-start", paddingLeft: 0 }}
                >
                  Try it <Icon.ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
