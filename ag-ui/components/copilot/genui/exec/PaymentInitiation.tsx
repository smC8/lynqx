import React from "react";
import AgentCard from "@/components/copilot/AgentCard";
import { Icon } from "@/components/shell/Icons";

const approvers = [
  { role: "Aarti K.", status: "You" },
  { role: "R. Mehta", status: "pending" },
  { role: "CFO desk", status: "pending" },
  { role: "Bank", status: "pending" },
];

export default function PaymentInitiation() {
  return (
    <AgentCard
      summary={
        <>
          Parsed payment intent. Counterparty resolved from your ledger.{" "}
          <strong>PAIN.001</strong> payload prepared and queued for the standard{" "}
          <span className="mono">2-of-3 ICICI OpEx</span> approval workflow.
        </>
      }
      sources="Ledger · ICICI corporate channel"
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
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 16, fontSize: 13 }}>
        {[
          { l: "Beneficiary", v: <span><strong>Tata Consulting Services Ltd</strong><span className="mono" style={{ fontSize: 11.5, color: "var(--fg-3)", marginLeft: 8 }}>· HDFC ****4421 · IFSC HDFC0000240</span></span> },
          { l: "Amount", v: <span><strong>₹ 12,40,000.00</strong> <span style={{ color: "var(--fg-3)" }}>(twelve lakh forty thousand)</span></span> },
          { l: "Debit account", v: <span>ICICI <span className="mono">****5510</span> — OpEx</span> },
          { l: "Reference", v: <span className="mono" style={{ fontSize: 12 }}>INV-2041 · matched to PO-2024-3318</span> },
          { l: "Rail", v: <span><span className="tag tag-info">RTGS</span> <span style={{ fontSize: 12, color: "var(--fg-3)", marginLeft: 4 }}>auto-selected · &gt; ₹ 2 lakh</span></span> },
          { l: "Approval by", v: <span><strong>EOD · 23 May 2026 · 18:00 IST</strong> <span style={{ color: "var(--fg-3)" }}>(7h 22m remaining)</span></span> },
        ].map((row, i) => (
          <React.Fragment key={i}>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase" }}>{row.l}</span>
            <span>{row.v}</span>
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 14, background: "var(--bg-surface-2)", borderRadius: "var(--r-md)" }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 10 }}>
          Approval workflow · Zigflow
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {approvers.map((s, i, arr) => (
            <React.Fragment key={i}>
              <div
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  background: s.status === "You" ? "var(--forest)" : "var(--bg-surface)",
                  color: s.status === "You" ? "var(--lime)" : "var(--fg-1)",
                  border: "1px solid " + (s.status === "You" ? "var(--forest)" : "var(--border-1)"),
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.role}</div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{s.status}</div>
              </div>
              {i < arr.length - 1 && <Icon.ArrowRight size={12} style={{ color: "var(--fg-3)" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </AgentCard>
  );
}
