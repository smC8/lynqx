"use client";

import { useEffect, useState, useRef } from "react";
import { marked } from "marked";
import { Icon } from "@/components/shell/Icons";

interface AgentStep {
  step: string;
  status: "running" | "done" | "error";
  timestamp: string;
}

interface AgentStatus {
  workflowId: string;
  status: string;
  steps: AgentStep[];
  result?: { summary?: string };
}

interface Props {
  workflowId: string;
}

function ResultCard({ summary }: { summary: string }) {
  const html = marked.parse(summary) as string;
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        background: "rgba(159,232,112,0.07)",
        border: "1px solid var(--lime-dk)",
        borderRadius: "var(--r-md)",
      }}
    >
      <div className="eyebrow" style={{ color: "var(--lime-dk)", marginBottom: 6 }}>
        Investigation complete
      </div>
      <div
        className="body result-md"
        style={{ fontSize: 13, lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function AgentStatePanel({ workflowId }: Props) {
  const [state, setState] = useState<AgentStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/agent/status/${workflowId}`);
        const data: AgentStatus = await res.json();
        setState(data);
        if (data.status === "completed" || data.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // ignore transient network errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workflowId]);

  if (!state) {
    return (
      <div style={{ padding: "10px 0", color: "var(--fg-3)", fontSize: 13 }}>
        Starting investigation…
      </div>
    );
  }

  const isDone = state.status === "completed" || state.status === "failed";
  const summary = state.result?.summary ?? undefined;

  return (
    <div>
      <div
        style={{
          border: "1px solid var(--border-1)",
          borderRadius: "var(--r-md)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "var(--bg-surface-2)",
            borderBottom: "1px solid var(--border-2)",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase" }}
          >
            Agent trace · {workflowId.slice(-12)}
          </span>
          {!isDone && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "var(--lime)",
                animation: "lx-pulse 1s ease-in-out infinite",
                marginLeft: "auto",
              }}
            />
          )}
          {isDone && state.status === "completed" && (
            <Icon.Check size={13} style={{ color: "var(--lime-dk)", marginLeft: "auto" }} />
          )}
          {isDone && state.status === "failed" && (
            <Icon.X size={13} style={{ color: "var(--lynqx-error, #FF6058)", marginLeft: "auto" }} />
          )}
        </div>

        {/* Steps */}
        <div style={{ padding: "8px 0" }}>
          {state.steps.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px",
              }}
            >
              {s.status === "running" && (
                <Icon.Refresh size={13} style={{ color: "var(--lime-dk)", flexShrink: 0 }} />
              )}
              {s.status === "done" && (
                <Icon.Check size={13} style={{ color: "var(--lime-dk)", flexShrink: 0 }} />
              )}
              {s.status === "error" && (
                <Icon.X size={13} style={{ color: "var(--lynqx-error, #FF6058)", flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 13, color: s.status === "running" ? "var(--fg-1)" : "var(--fg-2)" }}>
                {s.step}
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: "auto" }}>
                {new Date(s.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}

          {state.steps.length === 0 && (
            <div style={{ padding: "8px 14px", color: "var(--fg-3)", fontSize: 13 }}>
              Initialising…
            </div>
          )}
        </div>
      </div>

      {/* T064 — result summary when completed */}
      {isDone && state.status === "completed" && summary && (
        <ResultCard summary={summary} />
      )}
      {isDone && state.status === "failed" && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--fg-2)" }}>
          Investigation encountered an error. Check Temporal and SigNoz connectivity.
        </div>
      )}
    </div>
  );
}
