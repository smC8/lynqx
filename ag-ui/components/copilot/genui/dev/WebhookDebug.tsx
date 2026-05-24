"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { WebhookDebugData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function WebhookDebug({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as WebhookDebugData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const trace = data?.trace ?? [];
  const fix = data?.fix;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="Webhook delivery log · cert SNI check"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Refresh size={12} /> Replay queued events
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.External size={12} /> Open in webhook console
          </button>
          <button className="btn btn-ghost btn-sm">Generate corrected config</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={5} /> : (
        <>
          {trace.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No webhook trace data found for this query.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: fix ? 16 : 0 }}>
              {trace.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < trace.length - 1 ? "1px solid var(--border-2)" : "none",
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 50, flexShrink: 0 }}>{s.t}</span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      flexShrink: 0,
                      background:
                        s.status === "ok"
                          ? "rgba(43,168,74,0.18)"
                          : s.status === "fail"
                          ? "rgba(229,72,77,0.18)"
                          : "var(--bg-sunken)",
                      color:
                        s.status === "ok"
                          ? "var(--success)"
                          : s.status === "fail"
                          ? "var(--danger)"
                          : "var(--fg-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {s.status === "ok" ? <Icon.Check size={11} /> : s.status === "fail" ? <Icon.X size={11} /> : <Icon.Dot size={11} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.stage}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {fix && (
            <div className="code-block">
              <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" }}>
                Generated fix
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{fix}</div>
            </div>
          )}
        </>
      )}
    </AgentCard>
  );
}
