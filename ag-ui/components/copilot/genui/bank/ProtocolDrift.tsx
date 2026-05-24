"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import MiniStat from "@/components/copilot/MiniStat";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { ProtocolDriftData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function ProtocolDrift({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as ProtocolDriftData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const newFields = data?.newFields ?? [];
  const bank = data?.bank ?? "—";
  const protocol = data?.protocol ?? "—";
  const registeredVersion = data?.registeredVersion ?? "—";
  const affectedCustomers = data?.affectedCustomers ?? 0;
  const payloadsSampled = data?.payloadsSampled ?? 0;
  const firstSeenHoursAgo = data?.firstSeenHoursAgo ?? 0;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources={`Schema registry · ${bank} · ${payloadsSampled} payloads sampled`}
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
      {isLoading ? <CardSkeleton rows={4} /> : (
        <>
          {newFields.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No protocol drift detected for this query.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="code-block" style={{ padding: 14, fontSize: 11.5 }}>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 6 }}>
                  REGISTERED · {registeredVersion}
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
                  OBSERVED · live ({protocol})
                </div>
                <div>&lt;<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
                <div>{"  "}&lt;GrpHdr/&gt;</div>
                <div>{"  "}&lt;OrgnlGrpInfAndSts/&gt;</div>
                <div>{"  "}&lt;TxInfAndSts&gt;</div>
                <div>{"    "}&lt;StsId/&gt;</div>
                <div>{"    "}&lt;TxSts/&gt;</div>
                {newFields.map((f, i) => (
                  <div key={i} style={{ background: "rgba(159,232,112,0.12)", borderLeft: "2px solid var(--lime)", paddingLeft: 8, marginLeft: -10 }}>
                    {"    "}&lt;<span className="tk-key">{f.field}</span>/&gt;{" "}
                    <span className="tk-cmt">// + new · {f.path}</span>
                  </div>
                ))}
                <div>{"  "}&lt;/TxInfAndSts&gt;</div>
                <div>&lt;/<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 16, alignItems: "center" }}>
            <MiniStat label="First seen" value={`${firstSeenHoursAgo}h ago`} />
            <MiniStat label="Payloads affected" value={`${payloadsSampled} / ${payloadsSampled}`} />
            <MiniStat label="Downstream impact" value={`${affectedCustomers} customers`} accent="var(--warn)" />
          </div>
        </>
      )}
    </AgentCard>
  );
}
