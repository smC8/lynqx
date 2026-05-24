import AgentCard from "@/components/copilot/AgentCard";
import { Icon } from "@/components/shell/Icons";

const steps = [
  { t: "23:14:00", label: "SFTP connection",           status: "ok",   detail: "HDFC sftp.hdfc.in:22 · connected" },
  { t: "23:14:02", label: "SFTP handshake",            status: "ok",   detail: "TLS 1.3 · cipher AES_256_GCM" },
  { t: "23:14:04", label: "Drop file PAIN.001.xml",    status: "ok",   detail: "184 records · 2.4 MB" },
  { t: "23:14:05", label: "Bank ack 11 lines",         status: "ok",   detail: "CAMT.054 received" },
  { t: "23:14:11", label: "Schema validate",           status: "fail", detail: "173 records failed · CdtTrfTxInf/Cdtr/PstlAdr missing" },
  { t: "23:14:11", label: "Batch rejected",            status: "fail", detail: "Bank policy: Cdtr/PstlAdr/Ctry required as of 14 May" },
];

export default function BankDiagnostic() {
  return (
    <AgentCard
      summary={
        <>
          Root cause: HDFC enforced <span className="mono">Cdtr/PstlAdr/Ctry</span> on PAIN.001 starting 14 May. 173
          of 184 records in your nightly batch dropped because the mapping omits the field. One-click patch available
          for your DataWeave transform.
        </>
      }
      sources="Zigflow execution z_8842 · HDFC bulletin 2026-05-14"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Bolt size={12} /> Apply mapping patch &amp; re-submit
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.Logs size={12} /> Open full trace
          </button>
          <button className="btn btn-ghost btn-sm">Notify Indus Treasury</button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < steps.length - 1 ? "1px solid var(--border-2)" : "none",
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 64, flexShrink: 0 }}>
              {s.t}
            </span>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                flexShrink: 0,
                background: s.status === "ok" ? "rgba(43,168,74,0.18)" : "rgba(229,72,77,0.18)",
                color: s.status === "ok" ? "var(--success)" : "var(--danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              {s.status === "ok" ? <Icon.Check size={11} /> : <Icon.X size={11} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="code-block" style={{ marginTop: 16 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" }}>
          Suggested patch · mapping.dwl
        </div>
        <div><span className="tk-cmt">// add country code to creditor postal address</span></div>
        <div>Cdtr: {"{"}</div>
        <div>{"  "}Nm: payee.name,</div>
        <div>{"  "}PstlAdr: {"{"}</div>
        <div style={{ background: "rgba(159,232,112,0.10)", borderLeft: "2px solid var(--lime)", paddingLeft: 8, marginLeft: -10 }}>
          {"    "}<span className="tk-key">Ctry</span>: payee.country{" "}
          <span className="tk-cmt">// + new</span>
        </div>
        <div>{"  "}{"}"}</div>
        <div>{"}"}</div>
      </div>
    </AgentCard>
  );
}
