"use client";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { APIExplorerData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function APIExplorer({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as APIExplorerData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const steps = data?.steps ?? [];
  const scopes = data?.scopes ?? [];
  const endpoint = data?.endpoint ?? "";
  const description = data?.description ?? "";

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="Lynqx API · live"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Play size={12} /> Run in sandbox
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Copy size={12} /> Copy curl
          </button>
          <button className="btn btn-ghost btn-sm">Switch language · TS</button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={4} /> : (
        <>
          {steps.length === 0 ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No API explorer data found for this query.</div>
          ) : (
            <>
              {endpoint && (
                <div style={{ marginBottom: 10 }}>
                  <span className="tag tag-info" style={{ fontSize: 11.5, marginRight: 8 }}>{endpoint}</span>
                  {description && <span className="body" style={{ fontSize: 12.5 }}>{description}</span>}
                </div>
              )}
              <div className="code-block">
                {steps.map((step, i) => (
                  <div key={i}>
                    {step.comment && (
                      <div><span className="tk-cmt"># {step.comment}</span></div>
                    )}
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{step.code}</div>
                    {i < steps.length - 1 && <div style={{ height: 8 }} />}
                  </div>
                ))}
              </div>
              {scopes.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  {scopes.map((s, i) => (
                    <span key={i} className="tag tag-info">{s}</span>
                  ))}
                  <span className="tag tag-neutral">sandbox.lynqx.io</span>
                </div>
              )}
            </>
          )}
        </>
      )}
    </AgentCard>
  );
}
