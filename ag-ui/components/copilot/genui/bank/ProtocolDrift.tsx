import AgentCard from "@/components/copilot/AgentCard";
import MiniStat from "@/components/copilot/MiniStat";
import { Icon } from "@/components/shell/Icons";

export default function ProtocolDrift() {
  return (
    <AgentCard
      summary={
        <>
          ICICI&apos;s <span className="mono">pacs.002</span> response began including{" "}
          <span className="mono">&lt;CdtTrfTxInf&gt;</span> blocks 14h ago — not in your registered mapping. 2 of 4
          customers consuming this feed will silently drop the new data.
        </>
      }
      sources="Schema registry · ICICI · 248 payloads sampled"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Bolt size={12} /> Generate &amp; review DataWeave patch
          </button>
          <button className="btn btn-secondary btn-sm">Pin schema · alert customers</button>
          <button className="btn btn-ghost btn-sm">Mark as expected drift</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="code-block" style={{ padding: 14, fontSize: 11.5 }}>
          <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 6 }}>
            REGISTERED · v2.3
          </div>
          <div>&lt;<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
          <div>{"  "}&lt;GrpHdr/&gt;</div>
          <div>{"  "}&lt;OrgnlGrpInfAndSts/&gt;</div>
          <div>{"  "}&lt;TxInfAndSts&gt;</div>
          <div>{"    "}&lt;StsId/&gt;</div>
          <div>{"    "}&lt;TxSts/&gt;</div>
          <div>{"  "}&lt;/TxInfAndSts&gt;</div>
          <div>&lt;/<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
        </div>
        <div className="code-block" style={{ padding: 14, fontSize: 11.5 }}>
          <div className="mono" style={{ fontSize: 10, color: "rgba(159,232,112,0.85)", letterSpacing: 0.6, marginBottom: 6 }}>
            OBSERVED · live
          </div>
          <div>&lt;<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
          <div>{"  "}&lt;GrpHdr/&gt;</div>
          <div>{"  "}&lt;OrgnlGrpInfAndSts/&gt;</div>
          <div>{"  "}&lt;TxInfAndSts&gt;</div>
          <div>{"    "}&lt;StsId/&gt;</div>
          <div>{"    "}&lt;TxSts/&gt;</div>
          <div style={{ background: "rgba(159,232,112,0.12)", borderLeft: "2px solid var(--lime)", paddingLeft: 8, marginLeft: -10 }}>
            {"    "}&lt;<span className="tk-key">CdtTrfTxInf</span>/&gt;{" "}
            <span className="tk-cmt">// + new</span>
          </div>
          <div>{"  "}&lt;/TxInfAndSts&gt;</div>
          <div>&lt;/<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 16, alignItems: "center" }}>
        <MiniStat label="First seen" value="14h ago" />
        <MiniStat label="Payloads affected" value="248 / 248" />
        <MiniStat label="Downstream impact" value="2 customers" accent="var(--warn)" />
      </div>
    </AgentCard>
  );
}
