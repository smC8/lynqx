"use client";
import React from "react";
import AgentCard from "@/components/copilot/AgentCard";
import CardSkeleton from "@/components/copilot/CardSkeleton";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { PaymentInitiationData } from "@/lib/card-types";
import { Icon } from "@/components/shell/Icons";

interface Props { summary?: string; workflowId?: string }

export default function PaymentInitiation({ summary, workflowId }: Props) {
  const wf = useWorkflowResult(workflowId);
  const data = wf.cardData as PaymentInitiationData | undefined;
  const isLoading = wf.status === "running" || (!!workflowId && wf.status === "idle");
  const effectiveSummary = wf.summary ?? summary;

  const beneficiary = data?.beneficiary ?? "—";
  const beneficiaryBank = data?.beneficiaryBank ?? "—";
  const amount = data?.amount ?? 0;
  const currency = data?.currency ?? "INR";
  const debitAccount = data?.debitAccount ?? "—";
  const reference = data?.reference ?? "—";
  const rail = data?.rail ?? "—";
  const deadline = data?.deadline ?? "—";

  const formattedAmount = currency === "INR"
    ? `₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <AgentCard
      summary={isLoading ? (summary ?? "Querying observability data…") : effectiveSummary}
      sources="Ledger · corporate channel"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Check size={12} /> Confirm and route for approval
          </button>
          <button className="btn btn-secondary btn-sm">Edit payment</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}>
            Cancel
          </button>
        </>
      }
    >
      {isLoading ? <CardSkeleton rows={6} /> : (
        <>
          {!data ? (
            <div className="body" style={{ color: "var(--fg-3)", padding: "12px 0" }}>No payment data found for this query.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 16, fontSize: 13 }}>
                {[
                  {
                    l: "Beneficiary",
                    v: (
                      <span>
                        <strong>{beneficiary}</strong>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-3)", marginLeft: 8 }}>
                          · {beneficiaryBank}
                        </span>
                      </span>
                    ),
                  },
                  {
                    l: "Amount",
                    v: <span><strong>{formattedAmount}</strong></span>,
                  },
                  {
                    l: "Debit account",
                    v: <span>{debitAccount}</span>,
                  },
                  {
                    l: "Reference",
                    v: <span className="mono" style={{ fontSize: 12 }}>{reference}</span>,
                  },
                  {
                    l: "Rail",
                    v: (
                      <span>
                        <span className="tag tag-info">{rail}</span>
                      </span>
                    ),
                  },
                  {
                    l: "Deadline",
                    v: <span><strong>{deadline}</strong></span>,
                  },
                ].map((row, i) => (
                  <React.Fragment key={i}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase" }}>
                      {row.l}
                    </span>
                    <span>{row.v}</span>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </AgentCard>
  );
}
