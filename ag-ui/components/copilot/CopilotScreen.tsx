"use client";

import { useState, useRef, useEffect } from "react";
import { useCopilotAction, useCopilotChat, useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { Icon } from "@/components/shell/Icons";
import PromptLine from "./PromptLine";
import ArchitectureStrip from "./ArchitectureStrip";
import GenericStubCard from "./GenericStubCard";
import A2UICard from "./A2UICard";
import { COPILOT_BY_PERSONA, PERSONA_COPY } from "@/lib/personas";
import { buildConversationContext } from "@/lib/conversation-context";
import { fetchCopilotConfig, type CopilotTool, type CardTemplate } from "@/lib/supabase";
import type { WorkspaceId } from "@/lib/types";

async function startInvestigation(query: string, cardType: string, conversationContext: string): Promise<string | undefined> {
  try {
    const res = await fetch("/api/agent/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workflowType: "copilot-investigation", input: { query, cardType, conversationContext } }),
    }).then(r => r.json()) as { workflowId?: string };
    return res.workflowId;
  } catch { return undefined; }
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface FeedItem {
  q: string;
  cardType: string;
  summary?: string;
  workflowId?: string;
  cardData?: Record<string, unknown>;
}

interface Props {
  persona: WorkspaceId;
}

// Each DB tool gets its own component so useCopilotAction is called once per instance
// (hooks must not be called in loops — separate component instances solve this)
function DynamicToolSlot({
  tool,
  feedRef,
  lastQueryRef,
  setFeed,
  clearPending,
  markToolCalled,
}: {
  tool: CopilotTool;
  feedRef: React.RefObject<FeedItem[]>;
  lastQueryRef: React.RefObject<string>;
  setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>;
  clearPending: () => void;
  markToolCalled: () => void;
}) {
  useCopilotAction({
    name: tool.name,
    description: tool.description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: tool.parameters as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: async (args: any) => {
      // Mark before any awaits so the isLoading effect sees it in time
      markToolCalled();
      clearPending();
      const { summary, ...rest } = args ?? {};
      const cardData: Record<string, unknown> = rest;
      // PaymentInitiation data lives entirely in the AI args — no investigation workflow needed
      const needsWorkflow = tool.card_type !== "PaymentInitiation";
      const ctx = buildConversationContext(feedRef.current ?? []);
      const workflowId = needsWorkflow
        ? await startInvestigation(lastQueryRef.current, tool.card_type, ctx)
        : undefined;
      setFeed(f => [...f, { q: lastQueryRef.current, cardType: tool.card_type, summary, workflowId, cardData }]);
    },
  });
  return null;
}

export default function CopilotScreen({ persona }: Props) {
  const cfg = COPILOT_BY_PERSONA[persona];
  const copy = PERSONA_COPY[persona];
  const [query, setQuery] = useState("");
  const [feed, setFeed] = useState<FeedItem[]>(cfg.transcript);
  const [thinking, setThinking] = useState(false);
  const [tools, setTools] = useState<CopilotTool[]>([]);
  const [templates, setTemplates] = useState<Record<string, CardTemplate>>({});
  // Tracks an in-flight real-mode query before the AI calls a tool
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>("");
  const feedRef = useRef<FeedItem[]>(feed);
  feedRef.current = feed;
  const wasLoadingRef = useRef(false);
  const toolCalledRef = useRef(false);

  // Fetch tools + card templates from Supabase once on mount
  useEffect(() => {
    fetchCopilotConfig().then(({ tools, templates }) => {
      setTools(tools);
      setTemplates(templates);
    });
  }, []);

  const { appendMessage, isLoading } = useCopilotChat();
  const effectiveThinking = isDemoMode ? thinking : isLoading;

  // When loading finishes without a tool being called, add a stub so the query isn't lost.
  // toolCalledRef is set synchronously by DynamicToolSlot before any awaits, so the effect
  // sees it even if isLoading flips in a different React batch than clearPending().
  useEffect(() => {
    if (isDemoMode) return;
    if (wasLoadingRef.current && !isLoading) {
      if (!toolCalledRef.current) {
        setPendingQuery(prev => {
          if (prev) setFeed(f => [...f, { q: prev, cardType: "stub" }]);
          return null;
        });
      } else {
        setPendingQuery(null);
      }
      toolCalledRef.current = false;
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  useCopilotAdditionalInstructions({
    instructions: `Active workspace: ${persona}. ${PERSONA_COPY[persona].eyebrow}. ` +
      `Context: ${persona === "exec" ? "treasury, cash management, corporate payments" : persona === "bank" ? "bank operations, protocol diagnostics, customer SLA" : "developer API integration, stress testing, webhook debugging"}. ` +
      `Always respond by calling a render tool that matches the user query — never reply with plain text.`,
  }, [persona]);

  // runInvestigation is available programmatically via the "Investigate deeper" button on cards,
  // but not exposed as an LLM tool — prevents the model from bypassing visual render tools.

  useEffect(() => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setThinking(false);
    setFeed(cfg.transcript);
    setQuery("");
    setPendingQuery(null);
  }, [persona, cfg.transcript]);

  const submit = (text?: string, starterIndex?: number) => {
    const q = (text ?? query).trim();
    if (!q) return;
    setQuery("");
    lastQueryRef.current = q;

    if (!isDemoMode) {
      setPendingQuery(q);
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
        {/* Pending query — shows the in-flight real-mode query before the AI calls a tool */}
        {pendingQuery && (
          <div style={{ marginBottom: 24 }}>
            <PromptLine text={pendingQuery} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 14,
                background: "var(--bg-surface-2)",
                borderRadius: "var(--r-md)",
                border: "1px dashed var(--border-strong)",
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
          </div>
        )}
        {/* Demo-mode thinking indicator (no pending query tracking in demo) */}
        {isDemoMode && effectiveThinking && (
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
        {[...feed].reverse().map((item, i) => (
          <div key={i}>
            <PromptLine text={item.q} />
            {item.cardType && item.cardType !== "stub"
              ? <A2UICard
                  workflowId={item.workflowId}
                  summary={item.summary}
                  cardType={item.cardType}
                  query={item.q}
                  template={templates[item.cardType]}
                  initialCardData={item.cardData}
                />
              : <GenericStubCard query={item.q} />
            }
          </div>
        ))}
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

      {/* Dynamic tool registrations — one component per Supabase tool row */}
      {tools.map(tool => (
        <DynamicToolSlot
          key={tool.name}
          tool={tool}
          feedRef={feedRef}
          lastQueryRef={lastQueryRef}
          setFeed={setFeed}
          clearPending={() => setPendingQuery(null)}
          markToolCalled={() => { toolCalledRef.current = true; }}
        />
      ))}
    </div>
  );
}
