import AgentCard from "@/components/copilot/AgentCard";
import MiniStat from "@/components/copilot/MiniStat";
import { Icon } from "@/components/shell/Icons";

const positions = [
  { acc: "HDFC ****8821", curr: "INR", value: 1.84e8, fx: 2.21e6 },
  { acc: "HDFC ****3310", curr: "INR", value: 5.20e7, fx: 6.24e5 },
  { acc: "Citi ****0042", curr: "USD", value: 2.18e6, fx: 0 },
  { acc: "Citi ****0188", curr: "USD", value: 1.04e6, fx: 0 },
];

const usdTotal =
  positions.filter((p) => p.curr === "USD").reduce((a, p) => a + p.value, 0) +
  positions.filter((p) => p.curr === "INR").reduce((a, p) => a + p.fx, 0);

const COLORS = ["var(--lime)", "var(--lime-dk)", "var(--info)", "#7AB8FF"];

export default function TreasuryPosition() {
  return (
    <AgentCard
      summary={
        <>
          Net USD position is <strong style={{ color: "var(--fg-1)" }}>$5.25 M</strong> across 4 accounts as of 09:42
          IST. Idle balance above your $1M threshold detected on{" "}
          <span className="mono">Citi ****0042</span> — sweep instruction prepared.
        </>
      }
      sources={<>4 accounts · 2 banks · live</>}
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Send size={12} /> Approve sweep · $1.18M → cashpool
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Download size={12} /> Export position report
          </button>
          <button className="btn btn-ghost btn-sm">Adjust threshold</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
        <MiniStat label="Net USD" value="$5.25 M" accent="var(--forest)" />
        <MiniStat label="FX exposure (INR→USD)" value="$2.84 M" />
        <MiniStat label="Idle above threshold" value="$1.18 M" accent="var(--warn)" />
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
            const v = p.curr === "INR" ? p.fx : p.value;
            const pct = (v / usdTotal) * 100;
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
                {p.curr === "INR"
                  ? "₹" + (p.value / 1e7).toFixed(2) + " Cr"
                  : "$" + (p.value / 1e6).toFixed(2) + " M"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AgentCard>
  );
}
