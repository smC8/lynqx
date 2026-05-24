import AgentCard from "@/components/copilot/AgentCard";
import MiniStat from "@/components/copilot/MiniStat";
import { Icon } from "@/components/shell/Icons";

const base = [42,44,45,47,46,49,52,51,53,56,58,57,60,62,63,65,64,66,68,69,67,70,72,71,73,75,74,77,78,80];
const stress = base.map((v, i) => v - Math.min(i, 14) * 0.9 - (i > 14 ? 6 : 0));
const W = 560, H = 160;
const maxV = Math.max(...base, ...stress), minV = 30;

function toPath(arr: number[]) {
  return arr
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (arr.length - 1)) * W},${H - ((v - minV) / (maxV - minV)) * (H - 12) - 6}`)
    .join(" ");
}

const floorY = H - ((40 - minV) / (maxV - minV)) * (H - 12) - 6;
const inflX = W * (17 / 29);
const inflY = H - ((stress[17] - minV) / (maxV - minV)) * (H - 12) - 6;

export default function CashForecast() {
  return (
    <AgentCard
      summary={
        <>
          30-day cash position with the <strong>Siemens delay</strong> scenario applied. Position dips to{" "}
          <strong style={{ color: "var(--warn)" }}>$48.2M</strong> on day 17 — still ahead of your $40M floor, but
          tighter than baseline.
        </>
      }
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
      <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "flex-end" }}>
        <MiniStat label="Today" value="$72.4 M" accent="var(--forest)" />
        <MiniStat label="Day 30 · baseline" value="$80.0 M" />
        <MiniStat label="Day 30 · stressed" value="$59.3 M" accent="var(--warn)" />
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11.5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 2, background: "var(--lime)" }} /> Baseline
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 2, background: "var(--warn)", borderTop: "2px dashed var(--warn)" }} /> Siemens +2w
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
        <path d={toPath(base) + ` L${W},${H} L0,${H} Z`} fill="var(--lime)" fillOpacity="0.12" />
        <path d={toPath(base)} stroke="var(--lime-dk)" strokeWidth="2" fill="none" />
        <path d={toPath(stress)} stroke="var(--warn)" strokeWidth="2" fill="none" strokeDasharray="5 4" />
        <circle cx={inflX} cy={inflY} r="4" fill="var(--warn)" />
      </svg>

      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        <span className="tag tag-warn" style={{ fontSize: 10.5 }}>Siemens AG · ₹ 8.4 Cr · delayed 14d</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>Payroll · ₹ 2.1 Cr · day 5</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>GST · ₹ 1.8 Cr · day 7</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>Vendor batch · ₹ 4.2 Cr · day 12</span>
      </div>
    </AgentCard>
  );
}
