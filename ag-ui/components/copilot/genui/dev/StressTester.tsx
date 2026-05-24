import AgentCard from "@/components/copilot/AgentCard";
import MiniStat from "@/components/copilot/MiniStat";
import { Icon } from "@/components/shell/Icons";

export default function StressTester() {
  return (
    <AgentCard
      summary={
        <>
          Ran <strong>500 concurrent</strong> PAIN.001 submissions against{" "}
          <span className="mono">sandbox.lynqx.io</span> with 10% synthetic rejection.{" "}
          <strong>Throughput peaked at 612 rps</strong>; the bank-side rate limit kicked in at 480 rps — consider
          exponential backoff above 400.
        </>
      }
      sources="Zigflow scenario zs_stress_77a · 31.2s"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Bolt size={12} /> Apply recommended retry config
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Refresh size={12} /> Re-run at 1,000 concurrent
          </button>
          <button className="btn btn-ghost btn-sm">Save as CI check</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <MiniStat label="Submitted" value="15,000" />
        <MiniStat label="Accepted" value="13,490" accent="var(--success)" />
        <MiniStat label="Rejected" value="1,510" accent="var(--warn)" />
        <MiniStat label="p95 latency" value="218 ms" />
      </div>

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
          Requests per second · 31s window
        </div>
        <svg viewBox="0 0 500 80" width="100%" height="80">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line key={i} x1="0" x2="500" y1={80 * p} y2={80 * p} stroke="var(--border-2)" strokeWidth="1" />
          ))}
          <path
            d="M0,70 L60,55 L120,38 L180,22 L240,14 L260,11 L300,28 L340,30 L380,29 L440,28 L500,28"
            stroke="var(--lime-dk)"
            strokeWidth="2"
            fill="none"
          />
          <line x1="0" x2="500" y1="36" y2="36" stroke="var(--warn)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="500" y="34" textAnchor="end" fontSize="9" fill="var(--warn)" fontFamily="var(--font-mono)">
            480 rps · bank limit
          </text>
        </svg>
      </div>

      <div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 8 }}>
          Failure modes
        </div>
        <table className="dt">
          <tbody>
            <tr>
              <td><span className="mono" style={{ fontSize: 12 }}>429 RateExceeded</span></td>
              <td><span className="mono">1,142</span></td>
              <td style={{ color: "var(--fg-3)" }}>above bank&apos;s 480 rps ceiling</td>
            </tr>
            <tr>
              <td><span className="mono" style={{ fontSize: 12 }}>422 ValidationError</span></td>
              <td><span className="mono">312</span></td>
              <td style={{ color: "var(--fg-3)" }}>synthetic — Cdtr/PstlAdr/Ctry omitted</td>
            </tr>
            <tr>
              <td><span className="mono" style={{ fontSize: 12 }}>504 BankTimeout</span></td>
              <td><span className="mono">56</span></td>
              <td style={{ color: "var(--fg-3)" }}>HDFC channel · p99 spike at 28s mark</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AgentCard>
  );
}
