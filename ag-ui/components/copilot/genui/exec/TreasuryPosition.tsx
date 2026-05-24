"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import MiniStat from "@/components/copilot/MiniStat";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { TreasuryPositionData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

const COLORS = ["var(--lime)", "var(--lime-dk)", "var(--info)", "#7AB8FF"];

export default function TreasuryPosition({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as TreasuryPositionData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const positions = data?.positions ?? [];
  const usdTotal =
    positions.filter(p => p.curr === "USD").reduce((a, p) => a + p.value, 0) +
    positions.filter(p => p.curr !== "USD").reduce((a, p) => a + p.fx, 0);
  const fxExposure = positions.filter(p => p.curr !== "USD").reduce((a, p) => a + p.fx, 0);

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources={<>{positions.length} accounts · live</>}
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Send size={12} /> Approve sweep → cashpool
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Download size={12} /> Export position report
          </button>
          <button className="btn btn-ghost btn-sm">Adjust threshold</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={4} /> : (
        <>
          {positions.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No position data found for this query.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
                <MiniStat label="Net USD" value={`$${(usdTotal / 1e6).toFixed(2)} M`} accent="var(--forest)" />
                <MiniStat label="FX exposure" value={`$${(fxExposure / 1e6).toFixed(2)} M`} />
                <MiniStat label="Accounts" value={String(positions.length)} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: 0.5,
                    color: "var(--fg-3)",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Position by account · USD equiv.
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 28,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "var(--bg-sunken)",
                  }}
                >
                  {positions.map((p, i) => {
                    const v = p.curr !== "USD" ? p.fx : p.value;
                    const pct = usdTotal > 0 ? (v / usdTotal) * 100 : 0;
                    return (
                      <div
                        key={i}
                        title={`${p.acc} · ${pct.toFixed(0)}%`}
                        style={{
                          width: pct + "%",
                          background: COLORS[i % COLORS.length],
                          borderRight: i < positions.length - 1 ? "1px solid var(--bg-surface)" : "none",
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {positions.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                      <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>{p.acc}</span>
                      <span className="mono tabular" style={{ fontSize: 11, color: "var(--fg-1)", fontWeight: 600 }}>
                        {p.curr !== "USD"
                          ? "₹" + (p.value / 1e7).toFixed(2) + " Cr"
                          : "$" + (p.value / 1e6).toFixed(2) + " M"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AgentCard>
  );
}
