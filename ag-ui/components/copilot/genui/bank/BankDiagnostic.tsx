"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { BankDiagnosticData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function BankDiagnostic({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as BankDiagnosticData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const steps = data?.steps ?? [];
  const patch = data?.patch;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="SigNoz · live"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Bolt size={12} /> Apply mapping patch &amp; re-submit
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Logs size={12} /> Open full trace
          </button>
          <button className="btn btn-ghost btn-sm">Notify Indus Treasury</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={5} /> : (
        <div>
          {steps.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No events found for this query.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < steps.length - 1 ? "1px solid var(--border-2)" : "none",
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 64, flexShrink: 0 }}>
                    {s.t}
                  </span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      flexShrink: 0,
                      background: s.status === "ok" ? "rgba(43,168,74,0.18)" : "rgba(229,72,77,0.18)",
                      color: s.status === "ok" ? "var(--success)" : "var(--danger)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {s.status === "ok" ? <Icon.Check size={11} /> : <Icon.X size={11} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>{s.label}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {patch && (
            <div className="code-block" style={{ marginTop: 16 }}>
              <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" }}>
                Suggested fix
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{patch}</div>
            </div>
          )}
        </div>
      )}
    </AgentCard>
  );
}
