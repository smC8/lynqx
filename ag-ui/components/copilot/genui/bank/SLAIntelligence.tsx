"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { SLAIntelligenceData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function SLAIntelligence({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as SLAIntelligenceData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const rows = data?.rows ?? [];
  const maxFail = rows.length > 0 ? Math.max(...rows.map(r => r.fail)) : 1;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="SigNoz · live"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Send size={12} /> Send weekly digest
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.External size={12} /> Open customer drill-down
          </button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={5} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No SLA data found for this query.</div>
          ) : (
            rows.map((c, i) => {
              const pct = (c.fail / maxFail) * 100;
              const isHigh = c.fail > 0.3;
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 90px 70px",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>
                      {c.tag} · {c.calls.toLocaleString()} calls
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 18,
                      background: "var(--bg-sunken)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: pct + "%",
                        height: "100%",
                        background: isHigh ? "var(--danger)" : pct > 25 ? "var(--warn)" : "var(--lime-dk)",
                        transition: "width 600ms ease",
                      }}
                    />
                  </div>
                  <span
                    className="mono tabular"
                    style={{ fontSize: 12.5, fontWeight: 600, color: isHigh ? "var(--danger)" : "var(--fg-1)" }}
                  >
                    {(c.fail * 100).toFixed(2)}%
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "right" }}>
                    {c.vol}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </AgentCard>
  );
}
