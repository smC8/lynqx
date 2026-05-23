// Copilot screen — demonstrates CopilotKit-style generative UI use cases
// rendered inside the Lynqx console. Persona-aware transcript of NL → gen-UI.

// ── Shared atoms ─────────────────────────────────────────────────────────
function AgentBadge({ label = 'Generated', icon = 'Wand' }) {
  const I = window.Icon[icon];
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase',
      color: 'var(--lime-dk)',
      padding: '2px 7px',
      background: 'rgba(159,232,112,0.14)',
      border: '1px solid rgba(159,232,112,0.32)',
      borderRadius: 999,
    }}>
      <I size={10} /> {label}
    </span>
  );
}

function PromptLine({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        background: 'var(--mint)', color: 'var(--forest)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
      }}>AK</span>
      <div style={{
        flex: 1,
        padding: '8px 12px',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--r-md)',
        fontSize: 13.5, color: 'var(--fg-1)',
        lineHeight: 1.5,
      }}>
        {text}
      </div>
    </div>
  );
}

function AgentCard({ children, summary, sources, footerActions, dense }) {
  return (
    <div className="slide-up" style={{
      position: 'relative',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 28,
    }}>
      {/* Lime accent stripe */}
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: 'linear-gradient(180deg, var(--lime), var(--lime-dk))',
      }} />
      <div style={{ padding: dense ? '14px 16px 12px' : '16px 18px 14px', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: summary ? 6 : 0 }}>
          <AgentBadge />
          {sources && (
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0.4 }}>
              ·  sourced from {sources}
            </span>
          )}
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
            <button className="icon-btn" style={{ width: 24, height: 24 }} title="Copy"><window.Icon.Copy size={12} /></button>
            <button className="icon-btn" style={{ width: 24, height: 24 }} title="Regenerate"><window.Icon.Refresh size={12} /></button>
          </span>
        </div>
        {summary && <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.55 }}>{summary}</div>}
      </div>
      <div style={{ padding: dense ? 14 : 18 }}>
        {children}
      </div>
      {footerActions && (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-2)',
          background: 'var(--bg-surface-2)',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {footerActions}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, mono = true, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: accent || 'var(--fg-1)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

// ── EXECUTIVE / TREASURY: gen-UI cards ───────────────────────────────────

function GenUI_TreasuryPosition() {
  // Stacked bar of currency positions, with sweep CTA
  const positions = [
    { acc: 'HDFC ****8821', curr: 'INR', value: 1.84e8, fx: 2.21e6, status: 'live' },
    { acc: 'HDFC ****3310', curr: 'INR', value: 5.20e7, fx: 6.24e5, status: 'live' },
    { acc: 'Citi ****0042', curr: 'USD', value: 2.18e6, fx: 0,       status: 'live' },
    { acc: 'Citi ****0188', curr: 'USD', value: 1.04e6, fx: 0,       status: 'live' },
  ];
  const usdTotal = positions.filter(p => p.curr === 'USD').reduce((a, p) => a + p.value, 0)
                 + positions.filter(p => p.curr === 'INR').reduce((a, p) => a + p.fx, 0);

  return (
    <AgentCard
      summary={<>
        Net USD position is <strong style={{ color: 'var(--fg-1)' }}>$5.25 M</strong> across 4 accounts as of 09:42 IST.
        Idle balance above your $1M threshold detected on <span className="mono">Citi ****0042</span> — sweep instruction prepared.
      </>}
      sources={<>4 accounts · 2 banks · live</>}
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Send size={12} /> Approve sweep · $1.18M → cashpool</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.Download size={12} /> Export position report</button>
        <button className="btn btn-ghost btn-sm">Adjust threshold</button>
      </>}
    >
      {/* Top: USD breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
        <MiniStat label="Net USD" value="$5.25 M" accent="var(--forest)" />
        <MiniStat label="FX exposure (INR→USD)" value="$2.84 M" />
        <MiniStat label="Idle above threshold" value="$1.18 M" accent="var(--warn)" />
      </div>

      {/* Stacked bar */}
      <div style={{ marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 6 }}>Position by account · USD equiv.</div>
        <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-sunken)' }}>
          {positions.map((p, i) => {
            const v = p.curr === 'INR' ? p.fx : p.value;
            const pct = (v / usdTotal) * 100;
            const colors = ['var(--lime)', 'var(--lime-dk)', 'var(--info)', '#7AB8FF'];
            return (
              <div key={i} title={`${p.acc} · ${pct.toFixed(0)}%`} style={{
                width: pct + '%',
                background: colors[i % colors.length],
                borderRight: i < positions.length - 1 ? '1px solid var(--bg-surface)' : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          {positions.map((p, i) => {
            const colors = ['var(--lime)', 'var(--lime-dk)', 'var(--info)', '#7AB8FF'];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length] }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{p.acc}</span>
                <span className="mono tabular" style={{ fontSize: 11, color: 'var(--fg-1)', fontWeight: 600 }}>
                  {p.curr === 'INR' ? '₹' + (p.value / 1e7).toFixed(2) + ' Cr' : '$' + (p.value / 1e6).toFixed(2) + ' M'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AgentCard>
  );
}

function GenUI_PaymentInitiation() {
  return (
    <AgentCard
      summary={<>
        Parsed payment intent. Counterparty resolved from your ledger. <strong>PAIN.001</strong> payload prepared
        and queued for the standard <span className="mono">2-of-3 ICICI OpEx</span> approval workflow.
      </>}
      sources="Ledger · ICICI corporate channel"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Check size={12} /> Confirm and route for approval</button>
        <button className="btn btn-secondary btn-sm">Edit payment</button>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Cancel</button>
      </>}
    >
      {/* Parsed-from-NL summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 10, columnGap: 16, fontSize: 13 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Beneficiary</span>
        <span>
          <strong>Tata Consulting Services Ltd</strong>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)', marginLeft: 8 }}>· HDFC ****4421 · IFSC HDFC0000240</span>
        </span>

        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Amount</span>
        <span><strong>₹ 12,40,000.00</strong> <span style={{ color: 'var(--fg-3)' }}>(twelve lakh forty thousand)</span></span>

        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Debit account</span>
        <span>ICICI <span className="mono">****5510</span> — OpEx</span>

        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Reference</span>
        <span className="mono" style={{ fontSize: 12 }}>INV-2041 · matched to PO-2024-3318</span>

        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Rail</span>
        <span><span className="tag tag-info">RTGS</span> <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 4 }}>auto-selected · &gt; ₹ 2 lakh</span></span>

        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Approval by</span>
        <span><strong>EOD · 23 May 2026 · 18:00 IST</strong> <span style={{ color: 'var(--fg-3)' }}>(7h 22m remaining)</span></span>
      </div>

      {/* Approval chain visual */}
      <div style={{ marginTop: 18, padding: 14, background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)' }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 10 }}>Approval workflow · Zigflow</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { role: 'Aarti K.',  status: 'You' },
            { role: 'R. Mehta',  status: 'pending' },
            { role: 'CFO desk',  status: 'pending' },
            { role: 'Bank',      status: 'pending' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{
                flex: 1, padding: '8px 10px',
                background: s.status === 'You' ? 'var(--forest)' : 'var(--bg-surface)',
                color: s.status === 'You' ? 'var(--lime)' : 'var(--fg-1)',
                border: '1px solid ' + (s.status === 'You' ? 'var(--forest)' : 'var(--border-1)'),
                borderRadius: 6, fontSize: 12,
              }}>
                <div style={{ fontWeight: 600 }}>{s.role}</div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{s.status}</div>
              </div>
              {i < arr.length - 1 && <window.Icon.ArrowRight size={12} style={{ color: 'var(--fg-3)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </AgentCard>
  );
}

function GenUI_CashForecast() {
  // Simple SVG forecast chart with two scenarios
  const base = [42, 44, 45, 47, 46, 49, 52, 51, 53, 56, 58, 57, 60, 62, 63, 65, 64, 66, 68, 69, 67, 70, 72, 71, 73, 75, 74, 77, 78, 80];
  const stress = base.map((v, i) => v - Math.min(i, 14) * 0.9 - (i > 14 ? 6 : 0));
  const w = 560, h = 160;
  const max = Math.max(...base, ...stress), min = 30;
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (arr.length - 1)) * w},${h - ((v - min) / (max - min)) * (h - 12) - 6}`).join(' ');

  return (
    <AgentCard
      summary={<>
        30-day cash position with the <strong>Siemens delay</strong> scenario applied.
        Position dips to <strong style={{ color: 'var(--warn)' }}>$48.2M</strong> on day 17 — still ahead of your $40M floor, but tighter than baseline.
      </>}
      sources="CAMT.053 history · scheduled payments · SAP open items"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Plus size={12} /> Save scenario</button>
        <button className="btn btn-secondary btn-sm">Add what-if (delay, FX shock)</button>
        <button className="btn btn-ghost btn-sm">Open in cash desk</button>
      </>}
    >
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-end' }}>
        <MiniStat label="Today" value="$72.4 M" accent="var(--forest)" />
        <MiniStat label="Day 30 · baseline" value="$80.0 M" />
        <MiniStat label="Day 30 · stressed" value="$59.3 M" accent="var(--warn)" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: 11.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 2, background: 'var(--lime)' }} /> Baseline</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 2, background: 'var(--warn)', borderTop: '2px dashed var(--warn)' }} /> Siemens +2w</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 1, borderTop: '1px dashed var(--fg-3)' }} /> Floor $40M</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
        {/* Floor line */}
        <line x1="0" x2={w} y1={h - ((40 - min) / (max - min)) * (h - 12) - 6} y2={h - ((40 - min) / (max - min)) * (h - 12) - 6} stroke="var(--fg-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        {/* Gridlines */}
        {[0.25, 0.5, 0.75].map(p => <line key={p} x1="0" x2={w} y1={h * p} y2={h * p} stroke="var(--border-2)" strokeWidth="1" />)}
        {/* Baseline */}
        <path d={toPath(base) + ` L${w},${h} L0,${h} Z`} fill="var(--lime)" fillOpacity="0.12" />
        <path d={toPath(base)} stroke="var(--lime-dk)" strokeWidth="2" fill="none" />
        {/* Stressed */}
        <path d={toPath(stress)} stroke="var(--warn)" strokeWidth="2" fill="none" strokeDasharray="5 4" />
        {/* Inflection annotation */}
        <circle cx={w * (17 / 29)} cy={h - ((stress[17] - min) / (max - min)) * (h - 12) - 6} r="4" fill="var(--warn)" />
      </svg>

      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        <span className="tag tag-warn" style={{ fontSize: 10.5 }}>Siemens AG · ₹ 8.4 Cr · delayed 14d</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>Payroll · ₹ 2.1 Cr · day 5</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>GST · ₹ 1.8 Cr · day 7</span>
        <span className="tag tag-neutral" style={{ fontSize: 10.5 }}>Vendor batch · ₹ 4.2 Cr · day 12</span>
      </div>
    </AgentCard>
  );
}

// ── BANK OPS: gen-UI cards ───────────────────────────────────────────────

function GenUI_BankDiagnostic() {
  const steps = [
    { t: '23:14:02', label: 'SFTP handshake',          status: 'ok',    detail: 'TLS 1.3 · cipher AES_256_GCM' },
    { t: '23:14:04', label: 'Drop file PAIN.001.xml',  status: 'ok',    detail: '184 records · 2.4 MB' },
    { t: '23:14:05', label: 'Bank ack 11 lines',       status: 'ok',    detail: 'CAMT.054 received' },
    { t: '23:14:11', label: 'Schema validate',         status: 'fail',  detail: '173 records failed · CdtTrfTxInf/Cdtr/PstlAdr missing' },
    { t: '23:14:11', label: 'Batch rejected',          status: 'fail',  detail: 'Bank policy: Cdtr/PstlAdr/Ctry required as of 14 May' },
  ];
  return (
    <AgentCard
      summary={<>
        Root cause: HDFC enforced <span className="mono">Cdtr/PstlAdr/Ctry</span> on PAIN.001 starting 14 May.
        173 of 184 records in your nightly batch dropped because the mapping omits the field.
        One-click patch available for your DataWeave transform.
      </>}
      sources="Zigflow execution z_8842 · HDFC bulletin 2026-05-14"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Bolt size={12} /> Apply mapping patch &amp; re-submit</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.Logs size={12} /> Open full trace</button>
        <button className="btn btn-ghost btn-sm">Notify Indus Treasury</button>
      </>}
    >
      {/* Step trace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0',
            borderBottom: i < steps.length - 1 ? '1px solid var(--border-2)' : 'none',
          }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 64, flexShrink: 0 }}>{s.t}</span>
            <span style={{
              width: 18, height: 18, borderRadius: 999, flexShrink: 0,
              background: s.status === 'ok' ? 'rgba(43,168,74,0.18)' : 'rgba(229,72,77,0.18)',
              color: s.status === 'ok' ? 'var(--success)' : 'var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
            }}>
              {s.status === 'ok' ? <window.Icon.Check size={11} /> : <window.Icon.X size={11} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* DataWeave patch preview */}
      <div className="code-block" style={{ marginTop: 16 }}>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Suggested patch · mapping.dwl</div>
        <div><span className="tk-cmt">// add country code to creditor postal address</span></div>
        <div>Cdtr: &#123;</div>
        <div>{'  '}Nm: payee.name,</div>
        <div>{'  '}PstlAdr: &#123;</div>
        <div style={{ background: 'rgba(159,232,112,0.10)', borderLeft: '2px solid var(--lime)', paddingLeft: 8, marginLeft: -10 }}>{'    '}<span className="tk-key">Ctry</span>: payee.country <span className="tk-cmt">// + new</span></div>
        <div>{'  '}&#125;</div>
        <div>&#125;</div>
      </div>
    </AgentCard>
  );
}

function GenUI_ProtocolDrift() {
  return (
    <AgentCard
      summary={<>
        ICICI's <span className="mono">pacs.002</span> response began including <span className="mono">&lt;CdtTrfTxInf&gt;</span> blocks 14h ago — not in your registered mapping.
        2 of 4 customers consuming this feed will silently drop the new data.
      </>}
      sources="Schema registry · ICICI · 248 payloads sampled"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Bolt size={12} /> Generate &amp; review DataWeave patch</button>
        <button className="btn btn-secondary btn-sm">Pin schema · alert customers</button>
        <button className="btn btn-ghost btn-sm">Mark as expected drift</button>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="code-block" style={{ padding: 14, fontSize: 11.5 }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.6, marginBottom: 6 }}>REGISTERED · v2.3</div>
          <div>&lt;<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
          <div>{'  '}&lt;GrpHdr/&gt;</div>
          <div>{'  '}&lt;OrgnlGrpInfAndSts/&gt;</div>
          <div>{'  '}&lt;TxInfAndSts&gt;</div>
          <div>{'    '}&lt;StsId/&gt;</div>
          <div>{'    '}&lt;TxSts/&gt;</div>
          <div>{'  '}&lt;/TxInfAndSts&gt;</div>
          <div>&lt;/<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
        </div>
        <div className="code-block" style={{ padding: 14, fontSize: 11.5 }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(159,232,112,0.85)', letterSpacing: 0.6, marginBottom: 6 }}>OBSERVED · live</div>
          <div>&lt;<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
          <div>{'  '}&lt;GrpHdr/&gt;</div>
          <div>{'  '}&lt;OrgnlGrpInfAndSts/&gt;</div>
          <div>{'  '}&lt;TxInfAndSts&gt;</div>
          <div>{'    '}&lt;StsId/&gt;</div>
          <div>{'    '}&lt;TxSts/&gt;</div>
          <div style={{ background: 'rgba(159,232,112,0.12)', borderLeft: '2px solid var(--lime)', paddingLeft: 8, marginLeft: -10 }}>{'    '}&lt;<span className="tk-key">CdtTrfTxInf</span>/&gt; <span className="tk-cmt">// + new</span></div>
          <div>{'  '}&lt;/TxInfAndSts&gt;</div>
          <div>&lt;/<span className="tk-key">FIToFIPmtStsRpt</span>&gt;</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
        <MiniStat label="First seen" value="14h ago" />
        <MiniStat label="Payloads affected" value="248 / 248" />
        <MiniStat label="Downstream impact" value="2 customers" accent="var(--warn)" />
      </div>
    </AgentCard>
  );
}

function GenUI_SLAIntelligence() {
  const customers = [
    { name: 'Bharat Foods',       fail: 0.61, calls: 21944, plan: 'Starter',  vol: '$3.0M' },
    { name: 'Voltaire Logistics', fail: 0.18, calls: 94280, plan: 'Scale',    vol: '$12.1M' },
    { name: 'Norden Pharma',      fail: 0.07, calls: 56120, plan: 'Growth',   vol: '$8.4M' },
    { name: 'Indus Treasury',     fail: 0.04, calls: 184502, plan: 'Growth',  vol: '$24.6M' },
    { name: 'Lattice Pay',        fail: 0.02, calls: 312088, plan: 'Enterprise', vol: '$48.2M' },
  ];
  const maxFail = Math.max(...customers.map(c => c.fail));

  return (
    <AgentCard
      summary={<>
        Quarter-to-date payment failure rate by customer.
        <strong> Bharat Foods</strong> is 8.7× the channel average — concentrated in <span className="mono">RTGS&gt;₹2L</span> with the same beneficiary IFSC error.
      </>}
      sources="673,145 calls · Apr–May 2026 · 6 customers"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Send size={12} /> Send weekly digest to Bharat Foods</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.External size={12} /> Open customer drill-down</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {customers.map((c, i) => {
          const pct = (c.fail / maxFail) * 100;
          const isHigh = c.fail > 0.3;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 90px 70px', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{c.plan} · {c.calls.toLocaleString()} calls</div>
              </div>
              <div style={{ position: 'relative', height: 18, background: 'var(--bg-sunken)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: pct + '%', height: '100%',
                  background: isHigh ? 'var(--danger)' : pct > 25 ? 'var(--warn)' : 'var(--lime-dk)',
                  transition: 'width 600ms ease',
                }} />
              </div>
              <span className="mono tabular" style={{ fontSize: 12.5, fontWeight: 600, color: isHigh ? 'var(--danger)' : 'var(--fg-1)' }}>{c.fail.toFixed(2)}%</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', textAlign: 'right' }}>{c.vol}</span>
            </div>
          );
        })}
      </div>
    </AgentCard>
  );
}

// ── DEVELOPER: gen-UI cards ──────────────────────────────────────────────

function GenUI_APIExplorer() {
  return (
    <AgentCard
      summary={<>
        Here is a runnable sample for bulk SEPA. Resolves the NetSuite customer record, batches up to 1,000 instructions per call,
        and uses idempotency keys so retries are safe.
      </>}
      sources="Lynqx API v1 · NetSuite bundle 4.2"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Play size={12} /> Run in sandbox</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.Copy size={12} /> Copy curl</button>
        <button className="btn btn-ghost btn-sm">Switch language · TS</button>
      </>}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['curl', 'TypeScript', 'Python', 'Go'].map((l, i) => (
          <button key={l} className={`btn btn-sm ${i === 0 ? 'btn-secondary' : 'btn-ghost'}`} style={{ fontSize: 11.5 }}>{l}</button>
        ))}
      </div>
      <div className="code-block">
        <div><span className="tk-cmt"># 1. Fetch NetSuite vendor record (Lynqx normalises across ERPs)</span></div>
        <div><span className="tk-fn">curl</span> -X GET https://api.lynqx.io/<span className="tk-key">v1</span>/erp/netsuite/vendors/<span className="tk-str">"V-2041"</span> \</div>
        <div>{'  '}-H <span className="tk-str">"Authorization: Bearer $LYNQX_KEY"</span></div>
        <div></div>
        <div><span className="tk-cmt"># 2. Submit a SEPA bulk batch (idempotent, up to 1k items)</span></div>
        <div><span className="tk-fn">curl</span> -X POST https://api.lynqx.io/<span className="tk-key">v1</span>/payments/bulk \</div>
        <div>{'  '}-H <span className="tk-str">"Authorization: Bearer $LYNQX_KEY"</span> \</div>
        <div>{'  '}-H <span className="tk-str">"Idempotency-Key: $(uuidgen)"</span> \</div>
        <div>{'  '}-d <span className="tk-str">'&#123;</span></div>
        <div>{'    '}<span className="tk-key">"rail"</span>: <span className="tk-str">"SEPA"</span>,</div>
        <div>{'    '}<span className="tk-key">"debtor_account"</span>: <span className="tk-str">"acc_8821"</span>,</div>
        <div>{'    '}<span className="tk-key">"instructions"</span>: [&#123;</div>
        <div>{'      '}<span className="tk-key">"creditor_ref"</span>: <span className="tk-str">"V-2041"</span>,</div>
        <div>{'      '}<span className="tk-key">"amount"</span>: <span className="tk-num">12400</span>, <span className="tk-key">"ccy"</span>: <span className="tk-str">"EUR"</span></div>
        <div>{'    '}&#125;]</div>
        <div>{'  '}<span className="tk-str">&#125;'</span></div>
        <div></div>
        <div><span className="tk-cmt"># → returns batch_id; events stream via webhook payments.bulk.settled</span></div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <span className="tag tag-info">payments:write</span>
        <span className="tag tag-info">erp:read</span>
        <span className="tag tag-neutral">sandbox.lynqx.io</span>
        <span className="tag tag-success"><span className="dot dot-live" />8 webhooks listening</span>
      </div>
    </AgentCard>
  );
}

function GenUI_StressTester() {
  return (
    <AgentCard
      summary={<>
        Ran <strong>500 concurrent</strong> PAIN.001 submissions against <span className="mono">sandbox.lynqx.io</span>{' '}
        with 10% synthetic rejection. <strong>Throughput peaked at 612 rps</strong>; the bank-side rate limit kicked in at 480 rps —
        consider exponential backoff above 400.
      </>}
      sources="Zigflow scenario zs_stress_77a · 31.2s"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Bolt size={12} /> Apply recommended retry config</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.Refresh size={12} /> Re-run at 1,000 concurrent</button>
        <button className="btn btn-ghost btn-sm">Save as CI check</button>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <MiniStat label="Submitted" value="15,000" />
        <MiniStat label="Accepted" value="13,490" accent="var(--success)" />
        <MiniStat label="Rejected" value="1,510" accent="var(--warn)" />
        <MiniStat label="p95 latency" value="218 ms" />
      </div>

      {/* tiny throughput chart */}
      <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>Requests per second · 31s window</div>
        <svg viewBox="0 0 500 80" width="100%" height="80">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => <line key={i} x1="0" x2="500" y1={80 * p} y2={80 * p} stroke="var(--border-2)" strokeWidth="1" />)}
          <path d="M0,70 L60,55 L120,38 L180,22 L240,14 L260,11 L300,28 L340,30 L380,29 L440,28 L500,28" stroke="var(--lime-dk)" strokeWidth="2" fill="none" />
          <line x1="0" x2="500" y1="36" y2="36" stroke="var(--warn)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="500" y="34" textAnchor="end" fontSize="9" fill="var(--warn)" fontFamily="var(--font-mono)">480 rps · bank limit</text>
        </svg>
      </div>

      <div>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>Failure modes</div>
        <table className="dt">
          <tbody>
            <tr><td><span className="mono" style={{ fontSize: 12 }}>429 RateExceeded</span></td><td><span className="mono">1,142</span></td><td style={{ color: 'var(--fg-3)' }}>above bank's 480 rps ceiling</td></tr>
            <tr><td><span className="mono" style={{ fontSize: 12 }}>422 ValidationError</span></td><td><span className="mono">312</span></td><td style={{ color: 'var(--fg-3)' }}>synthetic — Cdtr/PstlAdr/Ctry omitted</td></tr>
            <tr><td><span className="mono" style={{ fontSize: 12 }}>504 BankTimeout</span></td><td><span className="mono">56</span></td><td style={{ color: 'var(--fg-3)' }}>HDFC channel · p99 spike at 28s mark</td></tr>
          </tbody>
        </table>
      </div>
    </AgentCard>
  );
}

function GenUI_WebhookDebug() {
  const trace = [
    { stage: 'Bank notif (Citi)',      status: 'ok',   t: '+0ms',    detail: 'CAMT.054 received' },
    { stage: 'Lynqx event bus',        status: 'ok',   t: '+12ms',   detail: 'payments.settled emitted' },
    { stage: 'Webhook dispatcher',     status: 'fail', t: '+18ms',   detail: 'TLS handshake failed · cert expired 2026-05-19' },
    { stage: 'Retry (1/8)',            status: 'fail', t: '+30s',    detail: 'same error · entered exponential backoff' },
    { stage: 'Listener',               status: 'idle', t: '—',       detail: 'never received' },
  ];
  return (
    <AgentCard
      summary={<>
        Citi <span className="mono">payments.settled</span> events are firing — your listener's TLS certificate at
        <span className="mono"> api.lattice.pay/lynqx/events</span> expired on 2026-05-19. 184 events queued; retry backoff has paused at attempt 4/8.
      </>}
      sources="Webhook delivery log · cert SNI check"
      footerActions={<>
        <button className="btn btn-primary btn-sm"><window.Icon.Refresh size={12} /> Replay 184 queued events</button>
        <button className="btn btn-secondary btn-sm"><window.Icon.External size={12} /> Open in webhook console</button>
        <button className="btn btn-ghost btn-sm">Generate corrected nginx config</button>
      </>}
    >
      {/* Pipeline trace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
        {trace.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < trace.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 50, flexShrink: 0 }}>{s.t}</span>
            <span style={{
              width: 18, height: 18, borderRadius: 999, flexShrink: 0,
              background: s.status === 'ok' ? 'rgba(43,168,74,0.18)' : s.status === 'fail' ? 'rgba(229,72,77,0.18)' : 'var(--bg-sunken)',
              color: s.status === 'ok' ? 'var(--success)' : s.status === 'fail' ? 'var(--danger)' : 'var(--fg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
            }}>
              {s.status === 'ok' ? <window.Icon.Check size={11} /> : s.status === 'fail' ? <window.Icon.X size={11} /> : <window.Icon.Dot size={11} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.stage}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="code-block">
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Generated listener fix · nginx</div>
        <div><span className="tk-key">server</span> &#123;</div>
        <div>{'  '}listen <span className="tk-num">443</span> ssl http2;</div>
        <div>{'  '}server_name api.lattice.pay;</div>
        <div style={{ background: 'rgba(159,232,112,0.10)', borderLeft: '2px solid var(--lime)', paddingLeft: 8, marginLeft: -10 }}>{'  '}<span className="tk-key">ssl_certificate</span>     /etc/letsencrypt/live/api.lattice.pay/fullchain.pem; <span className="tk-cmt">// renewed</span></div>
        <div style={{ background: 'rgba(159,232,112,0.10)', borderLeft: '2px solid var(--lime)', paddingLeft: 8, marginLeft: -10 }}>{'  '}<span className="tk-key">ssl_certificate_key</span> /etc/letsencrypt/live/api.lattice.pay/privkey.pem;</div>
        <div>{'  '}location /lynqx/events &#123; proxy_pass http://event_worker; &#125;</div>
        <div>&#125;</div>
      </div>
    </AgentCard>
  );
}

// ── Persona registries ───────────────────────────────────────────────────

const COPILOT_BY_PERSONA = {
  exec: {
    intro: 'Ask in plain language. Lynqx parses the intent, queries your live data layer, and renders a structured, actionable card — never a wall of text.',
    starters: [
      "What's our net USD position across HDFC and Citi as of this morning?",
      "Pay invoice INV-2041 to Tata Consulting, ₹12.4L from ICICI OpEx, approve by EOD",
      "30-day cash forecast if the Siemens payment delays by 2 weeks",
    ],
    transcript: [
      { q: "What's our net USD position across HDFC and Citi as of this morning?", render: <GenUI_TreasuryPosition /> },
      { q: "Pay invoice INV-2041 to Tata Consulting, ₹12.4L from our ICICI OpEx account, approve by EOD", render: <GenUI_PaymentInitiation /> },
      { q: "30-day cash forecast — what if the Siemens payment delays by 2 weeks?", render: <GenUI_CashForecast /> },
    ],
    catalog: [
      { t: 'Exception resolution desk', d: 'Failed payments arrive as a clickable card — error code, plain-English cause, retry / amend / reject actions.', icon: 'Bolt' },
      { t: 'Regulatory & audit copilot', d: 'Compiles audit-ready exports — every outbound payment above $100K, with approval chain attached.', icon: 'Shield' },
      { t: 'ERP reconciliation assistant', d: 'Finds SAP open items without matching statement lines and lets you investigate / write-off / escalate in line.', icon: 'Database' },
    ],
  },
  bank: {
    intro: 'Operate the channel in natural language. Diagnose failures, watch protocol drift, see customer health — every response renders as a structured card you can act on.',
    starters: [
      "Why did HDFC's SFTP batch fail last night?",
      "Diff today's ICICI pacs.002 against our registered schema",
      "Which enterprise customers have the highest payment failure rate this quarter?",
    ],
    transcript: [
      { q: "Why did HDFC's SFTP batch fail last night?", render: <GenUI_BankDiagnostic /> },
      { q: "Diff today's ICICI pacs.002 against our registered schema", render: <GenUI_ProtocolDrift /> },
      { q: "Which of our customers have the highest payment failure rate this quarter?", render: <GenUI_SLAIntelligence /> },
    ],
    catalog: [
      { t: 'Schema & onboarding copilot', d: 'Describe a new partner\'s API in plain English. Lynqx generates the DataWeave mapping, Zigflow config, and test payloads.', icon: 'Wand' },
      { t: 'Volume intelligence', d: 'Live drill-downs over your channel without a BI tool — slice by rail, time, or counterparty.', icon: 'TrendUp' },
      { t: 'Customer health digest', d: 'Auto-generated weekly summaries per customer, ready to send.', icon: 'Send' },
    ],
  },
  dev: {
    intro: 'Replace static docs and one-off scripts. Describe what you want; get a working sample, a generated mapping, a stress scenario, or a webhook trace — inline.',
    starters: [
      "Show me how to initiate a bulk SEPA payment for a NetSuite customer",
      "Simulate 500 concurrent PAIN.001 submissions with 10% rejection rate",
      "Why aren't my payment status webhooks firing for Citi?",
    ],
    transcript: [
      { q: "Show me how to initiate a bulk SEPA payment for a NetSuite customer", render: <GenUI_APIExplorer /> },
      { q: "Simulate 500 concurrent PAIN.001 submissions with 10% rejection rate", render: <GenUI_StressTester /> },
      { q: "Why aren't my payment status webhooks firing for Citi?", render: <GenUI_WebhookDebug /> },
    ],
    catalog: [
      { t: 'Reconciliation app builder', d: 'Map HDFC CAMT.053 lines to NetSuite journal entries. Confirm in a live field-mapping UI; export as DataWeave.', icon: 'Diff' },
      { t: 'Workflow composer', d: 'Describe a payment-init → approval → submit → reconcile flow. Copilot generates the Zigflow DSL and flags missing handlers.', icon: 'Branch' },
      { t: 'Code-sample sandbox', d: 'Every snippet is runnable against the sandbox — no copy-paste between Postman and your editor.', icon: 'Play' },
    ],
  },
};

// ── Main screen ──────────────────────────────────────────────────────────

function CopilotScreen({ persona, data, onScreen }) {
  const cfg = COPILOT_BY_PERSONA[persona] || COPILOT_BY_PERSONA.exec;
  const [query, setQuery] = React.useState('');
  const [feed, setFeed] = React.useState(cfg.transcript);
  const [thinking, setThinking] = React.useState(false);
  const transcriptRef = React.useRef(null);

  // Refresh transcript when persona changes
  React.useEffect(() => {
    setFeed(cfg.transcript);
    setQuery('');
  }, [persona]); // eslint-disable-line

  const submit = (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setQuery('');
    setThinking(true);
    // Pretend the agent is "thinking" then append a synthesized response card
    setTimeout(() => {
      // Try to match a known starter to one of the rendered cards;
      // otherwise show a generic stub.
      const match = cfg.transcript.find(t => t.q.toLowerCase().slice(0, 30) === q.toLowerCase().slice(0, 30));
      const next = match || { q, render: <GenericStubCard query={q} /> };
      setFeed(f => [...f, next]);
      setThinking(false);
      // scroll into view of the new card
      setTimeout(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
      }, 60);
    }, 700);
  };

  const personaCopy = {
    exec: { eyebrow: 'Treasury copilot · powered by CopilotKit + Zigflow', headline: 'Ask Lynqx anything about cash, payments, or reconciliation.' },
    bank: { eyebrow: 'Bank-ops copilot · powered by CopilotKit + Zigflow',  headline: 'Operate the channel in natural language.' },
    dev:  { eyebrow: 'Developer copilot · powered by CopilotKit + Zigflow', headline: 'Describe the integration. Ship the integration.' },
  }[persona] || {};

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero */}
      <div className="slide-up" style={{ marginBottom: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--lime-dk)' }}>
          <window.Icon.Wand size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
          {personaCopy.eyebrow}
        </div>
        <h1 className="h-display">{personaCopy.headline}</h1>
        <p className="body" style={{ marginTop: 8, maxWidth: 760 }}>{cfg.intro}</p>
      </div>

      {/* Composer */}
      <div className="slide-up" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-md)',
        padding: 14, marginBottom: 22,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: 'var(--forest)', color: 'var(--lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <window.Icon.Wand size={16} />
          </span>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Describe what you need — Lynqx will plan, query, and render a card you can act on…"
            rows={2}
            style={{
              flex: 1, resize: 'none',
              border: 0, outline: 0, background: 'transparent',
              color: 'var(--fg-1)',
              fontSize: 14.5, lineHeight: 1.5,
              fontFamily: 'var(--font-sans)', padding: 6,
            }}
          />
          <button
            className="btn btn-primary"
            disabled={!query.trim() || thinking}
            onClick={() => submit()}
            style={!query.trim() || thinking ? { opacity: 0.5, pointerEvents: 'none' } : {}}
          >
            {thinking ? <><window.Icon.Refresh size={13} /> Working…</> : <>Send <window.Icon.ArrowRight size={13} /></>}
          </button>
        </div>

        {/* Suggested starters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, paddingLeft: 46 }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase', marginRight: 4, alignSelf: 'center' }}>Try</span>
          {cfg.starters.map((s, i) => (
            <button
              key={i}
              onClick={() => submit(s)}
              style={{
                padding: '5px 10px',
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-1)',
                borderRadius: 999,
                fontSize: 11.5,
                color: 'var(--fg-2)',
                cursor: 'pointer',
                transition: 'all 140ms ease',
                textAlign: 'left',
                maxWidth: 380,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(159,232,112,0.10)'; e.currentTarget.style.borderColor = 'var(--lime-dk)'; e.currentTarget.style.color = 'var(--fg-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-sunken)'; e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
              title={s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Architecture strip */}
      <ArchitectureStrip />

      {/* Transcript */}
      <div ref={transcriptRef}>
        <div className="eyebrow" style={{ marginTop: 28, marginBottom: 14 }}>Live transcript · session 8f4a · this workspace</div>
        {feed.map((item, i) => (
          <div key={i}>
            <PromptLine text={item.q} />
            {item.render}
          </div>
        ))}
        {thinking && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 14,
            background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)',
            border: '1px dashed var(--border-strong)', marginBottom: 24,
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: 999,
              background: 'var(--lime)', animation: 'lx-pulse 1s ease-in-out infinite',
            }} />
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', letterSpacing: 0.4 }}>
              Planning · resolving entities · drafting structured response…
            </span>
          </div>
        )}
      </div>

      {/* Capability catalog */}
      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>More capabilities for this workspace</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cfg.catalog.map((c, i) => {
            const I = window.Icon[c.icon] || window.Icon.Sparkle;
            return (
              <div key={i} className="surface" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: 'rgba(159,232,112,0.16)', color: 'var(--lime-dk)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <I size={15} />
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{c.t}</div>
                </div>
                <div className="body" style={{ fontSize: 12.5, margin: 0 }}>{c.d}</div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: 0 }}>
                  Try it <window.Icon.ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GenericStubCard({ query }) {
  return (
    <AgentCard
      summary={<>
        I'd plan this as a multi-step agent run: <em>resolve entities</em> → <em>query Lynqx data layer</em> → <em>render component</em>.
        Wire me to your sandbox to see the live response — I'll fall through to a structured card here.
      </>}
      sources="stub · no data layer attached"
      footerActions={<>
        <button className="btn btn-secondary btn-sm">Connect sandbox</button>
        <button className="btn btn-ghost btn-sm">Edit prompt</button>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <MiniStat label="Resolved entities" value="—" />
        <MiniStat label="API calls planned" value="—" />
        <MiniStat label="Render target" value="card" mono={false} />
      </div>
      <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-sunken)', borderRadius: 6, fontSize: 12.5, color: 'var(--fg-2)' }}>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0.5, textTransform: 'uppercase', marginRight: 8 }}>Prompt</span>
        {query}
      </div>
    </AgentCard>
  );
}

function ArchitectureStrip() {
  const nodes = [
    { label: 'Natural language',    sub: 'user intent',         icon: 'Wand' },
    { label: 'CopilotKit',          sub: 'frontend',            icon: 'Sparkle' },
    { label: 'AG-UI ⇄ Zigflow',     sub: 'agent backend',       icon: 'Branch' },
    { label: 'Lynqx API',           sub: 'payments · balances', icon: 'Plug' },
    { label: 'Generative UI',       sub: 'rendered card',       icon: 'Layers' },
  ];
  return (
    <div className="surface-2" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase', marginRight: 6 }}>How it runs</span>
        {nodes.map((n, i, arr) => {
          const I = window.Icon[n.icon] || window.Icon.Dot;
          return (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-1)',
                borderRadius: 6,
              }}>
                <I size={13} style={{ color: 'var(--lime-dk)' }} />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)' }}>{n.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: 0.4 }}>{n.sub}</div>
                </div>
              </div>
              {i < arr.length - 1 && <window.Icon.ArrowRight size={11} style={{ color: 'var(--fg-3)' }} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

window.CopilotScreen = CopilotScreen;
