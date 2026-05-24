import AgentCard from "@/components/copilot/AgentCard";
import { Icon } from "@/components/shell/Icons";

const LANGS = ["curl", "TypeScript", "Python", "Go"];

export default function APIExplorer() {
  return (
    <AgentCard
      summary={
        <>
          Here is a runnable sample for bulk SEPA. Resolves the NetSuite customer record, batches up to 1,000
          instructions per call, and uses idempotency keys so retries are safe.
        </>
      }
      sources="Lynqx API v1 · NetSuite bundle 4.2"
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
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {LANGS.map((l, i) => (
          <button key={l} className={`btn btn-sm ${i === 0 ? "btn-secondary" : "btn-ghost"}`} style={{ fontSize: 11.5 }}>
            {l}
          </button>
        ))}
      </div>
      <div className="code-block">
        <div><span className="tk-cmt"># 1. Fetch NetSuite vendor record (Lynqx normalises across ERPs)</span></div>
        <div><span className="tk-fn">curl</span> -X GET https://api.lynqx.io/<span className="tk-key">v1</span>/erp/netsuite/vendors/<span className="tk-str">"V-2041"</span> \</div>
        <div>{"  "}-H <span className="tk-str">"Authorization: Bearer $LYNQX_KEY"</span></div>
        <div></div>
        <div><span className="tk-cmt"># 2. Submit a SEPA bulk batch (idempotent, up to 1k items)</span></div>
        <div><span className="tk-fn">curl</span> -X POST https://api.lynqx.io/<span className="tk-key">v1</span>/payments/bulk \</div>
        <div>{"  "}-H <span className="tk-str">"Authorization: Bearer $LYNQX_KEY"</span> \</div>
        <div>{"  "}-H <span className="tk-str">"Idempotency-Key: $(uuidgen)"</span> \</div>
        <div>{"  "}-d <span className="tk-str">&apos;{"{"}</span></div>
        <div>{"    "}<span className="tk-key">&quot;rail&quot;</span>: <span className="tk-str">&quot;SEPA&quot;</span>,</div>
        <div>{"    "}<span className="tk-key">&quot;debtor_account&quot;</span>: <span className="tk-str">&quot;acc_8821&quot;</span>,</div>
        <div>{"    "}<span className="tk-key">&quot;instructions&quot;</span>: [{"{"}</div>
        <div>{"      "}<span className="tk-key">&quot;creditor_ref&quot;</span>: <span className="tk-str">&quot;V-2041&quot;</span>,</div>
        <div>{"      "}<span className="tk-key">&quot;amount&quot;</span>: <span className="tk-num">12400</span>, <span className="tk-key">&quot;ccy&quot;</span>: <span className="tk-str">&quot;EUR&quot;</span></div>
        <div>{"    "}{"}"}]</div>
        <div>{"  "}<span className="tk-str">{"}"}&apos;</span></div>
        <div></div>
        <div><span className="tk-cmt"># → returns batch_id; events stream via webhook payments.bulk.settled</span></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <span className="tag tag-info">payments:write</span>
        <span className="tag tag-info">erp:read</span>
        <span className="tag tag-neutral">sandbox.lynqx.io</span>
        <span className="tag tag-success"><span className="dot dot-live" />8 webhooks listening</span>
      </div>
    </AgentCard>
  );
}
