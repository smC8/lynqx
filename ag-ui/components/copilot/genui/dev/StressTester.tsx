"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import MiniStat from "@/components/copilot/MiniStat";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { StressTesterData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

const SVG_W = 500, SVG_H = 80;

function rpsToPath(rps: number[]): string {
  if (rps.length < 2) return "";
  const maxRps = Math.max(...rps, 1);
  return rps
    .map((v, i) => {
      const x = (i / (rps.length - 1)) * SVG_W;
      const y = SVG_H - (v / maxRps) * (SVG_H - 10) - 5;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export default function StressTester({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as StressTesterData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const submitted = data?.submitted ?? 0;
  const accepted = data?.accepted ?? 0;
  const rejected = data?.rejected ?? 0;
  const p95ms = data?.p95ms ?? 0;
  const rps = data?.rps ?? [];
  const failures = data?.failures ?? [];

  const maxRps = rps.length > 0 ? Math.max(...rps) : 1;
  const limitLineY = SVG_H - (maxRps * 0.78 / maxRps) * (SVG_H - 10) - 5;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="SigNoz · live"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Bolt size={12} /> Apply recommended retry config
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Refresh size={12} /> Re-run at higher concurrency
          </button>
          <button className="btn btn-ghost btn-sm">Save as CI check</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={4} /> : (
        <>
          {!data ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No stress test data found for this query.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
                <MiniStat label="Submitted" value={submitted.toLocaleString()} />
                <MiniStat label="Accepted" value={accepted.toLocaleString()} accent="var(--success)" />
                <MiniStat label="Rejected" value={rejected.toLocaleString()} accent="var(--warn)" />
                <MiniStat label="p95 latency" value={`${p95ms} ms`} />
              </div>

              {rps.length > 1 && (
                <div
                  style={{
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border-2)",
                    borderRadius: "var(--r-md)",
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
                    Requests per second · {rps.length}s window
                  </div>
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height={SVG_H}>
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                      <line key={i} x1="0" x2={SVG_W} y1={SVG_H * p} y2={SVG_H * p} stroke="var(--border-2)" strokeWidth="1" />
                    ))}
                    <path
                      d={rpsToPath(rps)}
                      stroke="var(--lime-dk)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <line x1="0" x2={SVG_W} y1={limitLineY} y2={limitLineY} stroke="var(--warn)" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={SVG_W} y={limitLineY - 2} textAnchor="end" fontSize="9" fill="var(--warn)" fontFamily="var(--font-mono)">
                      {maxRps} rps · peak
                    </text>
                  </svg>
                </div>
              )}

              {failures.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
                    Failure modes
                  </div>
                  <table className="dt">
                    <tbody>
                      {failures.map((f, i) => (
                        <tr key={i}>
                          <td><span className="mono" style={{ fontSize: 12 }}>{f.code}</span></td>
                          <td><span className="mono">{f.count.toLocaleString()}</span></td>
                          <td style={{ color: "var(--fg-3)" }}>{f.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </AgentCard>
  );
}
