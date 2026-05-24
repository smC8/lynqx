import AgentCard from "@/components/copilot/AgentCard";
import { Icon } from "@/components/shell/Icons";

const trace = [
  { stage: "Bank notif (Citi)",  status: "ok",   t: "+0ms",  detail: "CAMT.054 received" },
  { stage: "Lynqx event bus",    status: "ok",   t: "+12ms", detail: "payments.settled emitted" },
  { stage: "Webhook dispatcher", status: "fail", t: "+18ms", detail: "TLS handshake failed · cert expired 2026-05-19" },
  { stage: "Retry (1/8)",        status: "fail", t: "+30s",  detail: "same error · entered exponential backoff" },
  { stage: "Listener",           status: "idle", t: "—",     detail: "never received" },
];

export default function WebhookDebug() {
  return (
    <AgentCard
      summary={
        <>
          Citi <span className="mono">payments.settled</span> events are firing — your listener&apos;s TLS
          certificate at <span className="mono"> api.lattice.pay/lynqx/events</span> expired on 2026-05-19. 184
          events queued; retry backoff has paused at attempt 4/8.
        </>
      }
      sources="Webhook delivery log · cert SNI check"
      footerActions={
        <>
          <button className="btn btn-primary btn-sm">
            <Icon.Refresh size={12} /> Replay 184 queued events
          </button>
          <button className="btn btn-secondary btn-sm">
            <Icon.External size={12} /> Open in webhook console
          </button>
          <button className="btn btn-ghost btn-sm">Generate corrected nginx config</button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16 }}>
        {trace.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < trace.length - 1 ? "1px solid var(--border-2)" : "none",
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", width: 50, flexShrink: 0 }}>{s.t}</span>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                flexShrink: 0,
                background:
                  s.status === "ok"
                    ? "rgba(43,168,74,0.18)"
                    : s.status === "fail"
                    ? "rgba(229,72,77,0.18)"
                    : "var(--bg-sunken)",
                color:
                  s.status === "ok"
                    ? "var(--success)"
                    : s.status === "fail"
                    ? "var(--danger)"
                    : "var(--fg-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              {s.status === "ok" ? <Icon.Check size={11} /> : s.status === "fail" ? <Icon.X size={11} /> : <Icon.Dot size={11} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.stage}</div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="code-block">
        <div className="mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" }}>
          Generated listener fix · nginx
        </div>
        <div><span className="tk-key">server</span> {"{"}</div>
        <div>{"  "}listen <span className="tk-num">443</span> ssl http2;</div>
        <div>{"  "}server_name api.lattice.pay;</div>
        <div style={{ background: "rgba(159,232,112,0.10)", borderLeft: "2px solid var(--lime)", paddingLeft: 8, marginLeft: -10 }}>
          {"  "}<span className="tk-key">ssl_certificate</span>{"     "}/etc/letsencrypt/live/api.lattice.pay/fullchain.pem;{" "}
          <span className="tk-cmt">// renewed</span>
        </div>
        <div style={{ background: "rgba(159,232,112,0.10)", borderLeft: "2px solid var(--lime)", paddingLeft: 8, marginLeft: -10 }}>
          {"  "}<span className="tk-key">ssl_certificate_key</span> /etc/letsencrypt/live/api.lattice.pay/privkey.pem;
        </div>
        <div>{"  "}location /lynqx/events {"{ "}proxy_pass http://event_worker; {"}"}</div>
        <div>{"}"}</div>
      </div>
    </AgentCard>
  );
}
