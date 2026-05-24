import AgentCard from "@/components/copilot/AgentCard";
import { Icon } from "@/components/shell/Icons";

const customers = [
  { name: "Bharat Foods",       fail: 0.61, calls: 21944,  plan: "Starter",     vol: "$3.0M" },
  { name: "Voltaire Logistics", fail: 0.18, calls: 94280,  plan: "Scale",       vol: "$12.1M" },
  { name: "Norden Pharma",      fail: 0.07, calls: 56120,  plan: "Growth",      vol: "$8.4M" },
  { name: "Indus Treasury",     fail: 0.04, calls: 184502, plan: "Growth",      vol: "$24.6M" },
  { name: "Lattice Pay",        fail: 0.02, calls: 312088, plan: "Enterprise",  vol: "$48.2M" },
];

const maxFail = Math.max(...customers.map((c) => c.fail));

export default function SLAIntelligence() {
  return (
    <AgentCard
      summary={
        <>
          Quarter-to-date payment failure rate by customer.{" "}
          <strong> Bharat Foods</strong> is 8.7× the channel average — concentrated in{" "}
          <span className="mono">RTGS&gt;₹2L</span> with the same beneficiary IFSC error.
        </>
      }
      sources="673,145 calls · Apr–May 2026 · 6 customers"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Send size={12} /> Send weekly digest to Bharat Foods
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.External size={12} /> Open customer drill-down
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {customers.map((c, i) => {
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
                  {c.plan} · {c.calls.toLocaleString()} calls
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
                {c.fail.toFixed(2)}%
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "right" }}>
                {c.vol}
              </span>
            </div>
          );
        })}
      </div>
    </AgentCard>
  );
}
