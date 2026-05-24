"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import MiniStat from "@/components/copilot/MiniStat";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { CashForecastData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

const W = 560, H = 160;

function toPath(arr: number[], minV: number, maxV: number) {
  return arr
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (arr.length - 1)) * W},${H - ((v - minV) / (maxV - minV)) * (H - 12) - 6}`)
    .join(" ");
}

export default function CashForecast({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as CashForecastData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const base = data?.base ?? [];
  const stress = data?.stress ?? [];
  const events = data?.events ?? [];

  const allVals = [...base, ...stress];
  const maxV = allVals.length > 0 ? Math.max(...allVals) : 100;
  const minV = 30;

  const floorY = H - ((40 - minV) / (maxV - minV)) * (H - 12) - 6;
  const inflIdx = Math.floor(stress.length * 0.57);
  const inflX = stress.length > 1 ? W * (inflIdx / (stress.length - 1)) : W / 2;
  const inflV = stress[inflIdx] ?? stress[stress.length - 1] ?? 0;
  const inflY = H - ((inflV - minV) / (maxV - minV)) * (H - 12) - 6;

  const today = base[0] ?? 0;
  const baseEnd = base[base.length - 1] ?? 0;
  const stressEnd = stress[stress.length - 1] ?? 0;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="CAMT.053 history · scheduled payments · SAP open items"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Plus size={12} /> Save scenario
          </button>
          <button className="btn btn-secondary btn-sm">Add what-if (delay, FX shock)</button>
          <button className="btn btn-ghost btn-sm">Open in cash desk</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={4} /> : (
        <>
          {base.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No forecast data found for this query.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "flex-end" }}>
                <MiniStat label="Today" value={`$${today.toFixed(1)} M`} accent="var(--forest)" />
                <MiniStat label="Day 30 · baseline" value={`$${baseEnd.toFixed(1)} M`} />
                <MiniStat label="Day 30 · stressed" value={`$${stressEnd.toFixed(1)} M`} accent="var(--warn)" />
                <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11.5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 2, background: "var(--lime)" }} /> Baseline
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 2, background: "var(--warn)", borderTop: "2px dashed var(--warn)" }} /> Stress
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 1, borderTop: "1px dashed var(--fg-3)" }} /> Floor $40M
                  </span>
                </div>
              </div>

              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
                <line x1="0" x2={W} y1={floorY} y2={floorY} stroke="var(--fg-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                {[0.25, 0.5, 0.75].map((p) => (
                  <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="var(--border-2)" strokeWidth="1" />
                ))}
                {base.length > 1 && (
                  <>
                    <path d={toPath(base, minV, maxV) + ` L${W},${H} L0,${H} Z`} fill="var(--lime)" fillOpacity="0.12" />
                    <path d={toPath(base, minV, maxV)} stroke="var(--lime-dk)" strokeWidth="2" fill="none" />
                  </>
                )}
                {stress.length > 1 && (
                  <>
                    <path d={toPath(stress, minV, maxV)} stroke="var(--warn)" strokeWidth="2" fill="none" strokeDasharray="5 4" />
                    <circle cx={inflX} cy={inflY} r="4" fill="var(--warn)" />
                  </>
                )}
              </svg>

              {events.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                  {events.map((e, i) => (
                    <span key={i} className={`tag tag-${e.tag}`} style={{ fontSize: 10.5 }}>{e.label}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </AgentCard>
  );
}
