// Screens — additional pages: accounts, transactions, statements, team, channels, incidents, docs

// ── Reusable bits ────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub, actions }) {
  return (
    <div className="slide-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        <h1 className="h-display">{title}</h1>
        {sub && <p className="body" style={{ marginTop: 6, marginBottom: 0 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  ACCOUNTS — list of connected bank accounts, with balances
// ──────────────────────────────────────────────────────────────────────────
function AccountsScreen({ data }) {
  const accounts = [
    { id: 'a1', bank: 'HDFC Bank',    nick: 'Operating · INR',     num: '****8821', curr: 'INR', bal: 184_220_440, available: 174_120_000, status: 'live',  prods: ['Statements','Payments','Virtual'] },
    { id: 'a2', bank: 'HDFC Bank',    nick: 'Tax reserve',         num: '****3310', curr: 'INR', bal:  52_004_120, available:  52_004_120, status: 'live',  prods: ['Statements'] },
    { id: 'a3', bank: 'Citi',         nick: 'USD nostro',          num: '****0042', curr: 'USD', bal:   2_184_910, available:   2_180_000, status: 'live',  prods: ['SWIFT','FX'] },
    { id: 'a4', bank: 'ICICI Bank',   nick: 'Vendor collections',  num: '****5510', curr: 'INR', bal:   8_410_000, available:   8_410_000, status: 'pending', prods: ['Collections'] },
    { id: 'a5', bank: 'Kyriba',       nick: 'Group cashpool',      num: 'POOL-001', curr: 'USD', bal:  12_640_400, available:  12_640_400, status: 'live',  prods: ['Cashpool'] },
  ];
  const fmt = (v, c) => c === 'USD' ? '$' + v.toLocaleString() : '₹' + v.toLocaleString();

  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader
        eyebrow="Treasury · live balances"
        title="Accounts"
        sub={`${accounts.length} connected · last refresh 2 min ago · auto-sync every 4h`}
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Download size={14} /> Export CSV</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> Link account</button>
        </>}
      />

      {/* Aggregate strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Net cash · INR',  value: '₹2.45 Cr' },
          { label: 'Net cash · USD',  value: '$14.8 M' },
          { label: 'Pending settlement', value: '₹84.2 L' },
          { label: 'Forecast horizon', value: '14 days' },
        ].map((k, i) => (
          <div key={i} className="kpi slide-up" style={{ animationDelay: `${i*40}ms` }}>
            <span className="kpi-label">{k.label}</span>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th>Bank · Account</th>
              <th>Number</th>
              <th>Products</th>
              <th style={{ textAlign: 'right' }}>Available</th>
              <th style={{ textAlign: 'right' }}>Ledger</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{a.bank.charAt(0)}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.nick}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.bank}</div>
                    </div>
                  </div>
                </td>
                <td><span className="mono" style={{ fontSize: 12 }}>{a.num}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {a.prods.map(p => <span key={p} className="tag tag-neutral" style={{ height: 18, fontSize: 10 }}>{p}</span>)}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}><span className="mono tabular" style={{ fontWeight: 600 }}>{fmt(a.available, a.curr)}</span></td>
                <td style={{ textAlign: 'right' }}><span className="mono tabular" style={{ color: 'var(--fg-2)' }}>{fmt(a.bal, a.curr)}</span></td>
                <td>
                  <span className={`tag ${a.status === 'live' ? 'tag-success' : 'tag-warn'}`}>
                    {a.status === 'live' ? <span className="dot dot-live" /> : null}
                    {a.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm">Open <window.Icon.ArrowRight size={11} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  TRANSACTIONS
// ──────────────────────────────────────────────────────────────────────────
function TransactionsScreen({ data }) {
  const [tab, setTab] = React.useState('all');
  const txns = [
    { id: 'tx1', t: '14:08:22', dir: 'out', amt: 8_420_000, curr: 'INR', cpty: 'Voltaire Logistics', rail: 'RTGS',  acc: 'HDFC ****8821', state: 'settled' },
    { id: 'tx2', t: '13:54:11', dir: 'in',  amt: 1_204_000, curr: 'INR', cpty: 'Norden Pharma',      rail: 'NEFT',  acc: 'HDFC ****8821', state: 'settled' },
    { id: 'tx3', t: '13:22:09', dir: 'out', amt:    44_300, curr: 'USD', cpty: 'Acme GmbH',          rail: 'SWIFT', acc: 'Citi ****0042', state: 'in-flight' },
    { id: 'tx4', t: '11:18:33', dir: 'in',  amt:   612_000, curr: 'INR', cpty: 'Bharat Foods',       rail: 'IMPS',  acc: 'ICICI ****5510', state: 'settled' },
    { id: 'tx5', t: '10:02:47', dir: 'out', amt:   180_000, curr: 'INR', cpty: 'GST · CBDT',         rail: 'RTGS',  acc: 'HDFC ****3310', state: 'settled' },
    { id: 'tx6', t: '09:48:01', dir: 'out', amt:    16_200, curr: 'USD', cpty: 'AWS Inc',            rail: 'SWIFT', acc: 'Citi ****0042', state: 'failed', reason: 'IBAN mismatch' },
    { id: 'tx7', t: '09:14:55', dir: 'in',  amt:   320_000, curr: 'INR', cpty: 'Saffron Capital',    rail: 'NEFT',  acc: 'HDFC ****8821', state: 'settled' },
    { id: 'tx8', t: '08:52:30', dir: 'out', amt: 2_100_000, curr: 'INR', cpty: 'Payroll · Razorpay', rail: 'NEFT',  acc: 'HDFC ****8821', state: 'queued' },
  ];
  const filt = tab === 'all' ? txns : txns.filter(x => tab === 'flow' ? x.state === 'in-flight' || x.state === 'queued' : x.state === tab);
  const fmt = (v, c) => (c === 'USD' ? '$' : '₹') + v.toLocaleString();

  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader
        eyebrow="Activity"
        title="Transactions"
        sub="Live across 5 connected accounts. Failures auto-retry by policy."
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Filter size={14} /> Filter</button>
          <button className="btn btn-primary"><window.Icon.Send size={14} /> New payment</button>
        </>}
      />

      <div className="tabbar" style={{ marginBottom: 16 }}>
        {[
          { id: 'all',       label: `All · ${txns.length}` },
          { id: 'settled',   label: `Settled · ${txns.filter(x => x.state==='settled').length}` },
          { id: 'flow',      label: `In flight · ${txns.filter(x => x.state==='in-flight' || x.state==='queued').length}` },
          { id: 'failed',    label: `Failed · ${txns.filter(x => x.state==='failed').length}` },
        ].map(t => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Time</th>
              <th style={{ width: 50 }}></th>
              <th>Counterparty</th>
              <th>Account</th>
              <th>Rail</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filt.map(x => {
              const stCls = x.state === 'settled' ? 'tag-success' : x.state === 'failed' ? 'tag-danger' : 'tag-warn';
              return (
                <tr key={x.id}>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{x.t}</span></td>
                  <td>
                    <span style={{
                      display: 'inline-flex', width: 24, height: 24, borderRadius: 999,
                      background: x.dir === 'in' ? 'var(--success-soft)' : 'var(--bg-sunken)',
                      color: x.dir === 'in' ? 'var(--success)' : 'var(--fg-2)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {x.dir === 'in' ? <window.Icon.ArrowDown size={13} /> : <window.Icon.ArrowUp size={13} />}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 500 }}>{x.cpty}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{x.acc}</span></td>
                  <td><span className="tag tag-neutral" style={{ fontFamily: 'var(--font-mono)', height: 18, fontSize: 10, letterSpacing: 0.6 }}>{x.rail}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono tabular" style={{ fontWeight: 600, color: x.dir === 'in' ? 'var(--success)' : 'var(--fg-1)' }}>
                      {x.dir === 'in' ? '+' : '−'}{fmt(x.amt, x.curr)}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${stCls}`}>{x.state}</span>
                    {x.reason && <span className="caption" style={{ display: 'block', marginTop: 2, color: 'var(--danger)' }}>{x.reason}</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}><button className="icon-btn" style={{ width: 24, height: 24 }}><window.Icon.ArrowRight size={13} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  STATEMENTS
// ──────────────────────────────────────────────────────────────────────────
function StatementsScreen({ data }) {
  const stmts = [
    { id: 's1', acc: 'HDFC · Operating', period: 'Apr 2026', format: 'MT940', size: '142 KB', txns: 892,  state: 'reconciled',  date: '2026-05-01' },
    { id: 's2', acc: 'HDFC · Tax',       period: 'Apr 2026', format: 'BAI2',  size: '38 KB',  txns: 102,  state: 'reconciled',  date: '2026-05-01' },
    { id: 's3', acc: 'Citi · USD nostro',period: 'Apr 2026', format: 'camt.053', size: '88 KB', txns: 412, state: 'partial', date: '2026-05-02' },
    { id: 's4', acc: 'ICICI · Vendor',   period: 'Apr 2026', format: 'MT940', size: '24 KB',  txns: 64,   state: 'pending',     date: '2026-05-03' },
    { id: 's5', acc: 'HDFC · Operating', period: 'Mar 2026', format: 'MT940', size: '186 KB', txns: 1042, state: 'reconciled',  date: '2026-04-01' },
    { id: 's6', acc: 'HDFC · Tax',       period: 'Mar 2026', format: 'BAI2',  size: '40 KB',  txns: 96,   state: 'reconciled',  date: '2026-04-01' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader
        eyebrow="Reconciliation"
        title="Statements"
        sub="MT940, BAI2, and ISO 20022 camt.053 — fetched on bank schedule, retained 7 years."
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Filter size={14} /> Filter</button>
          <button className="btn btn-primary"><window.Icon.Download size={14} /> Bulk export</button>
        </>}
      />

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th>Account</th><th>Period</th><th>Format</th>
              <th style={{ textAlign: 'right' }}>Transactions</th><th>Size</th>
              <th>Status</th><th>Fetched</th><th></th>
            </tr>
          </thead>
          <tbody>
            {stmts.map(s => {
              const cls = s.state === 'reconciled' ? 'tag-success' : s.state === 'partial' ? 'tag-warn' : 'tag-neutral';
              return (
                <tr key={s.id}>
                  <td><span style={{ fontWeight: 500 }}>{s.acc}</span></td>
                  <td><span className="mono" style={{ fontSize: 12 }}>{s.period}</span></td>
                  <td><span className="tag tag-neutral" style={{ fontFamily: 'var(--font-mono)', height: 18, fontSize: 10 }}>{s.format}</span></td>
                  <td style={{ textAlign: 'right' }}><span className="mono tabular">{s.txns.toLocaleString()}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{s.size}</span></td>
                  <td><span className={`tag ${cls}`}>{s.state}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{s.date}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm"><window.Icon.Download size={11} /> Download</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  TEAM (standalone — same content as Settings · Team for now, but with header)
// ──────────────────────────────────────────────────────────────────────────
function TeamScreen({ data }) {
  const team = [
    { name: 'Aarti Khanna',  email: 'aarti@indus.co',     role: 'Owner',      lastActive: 'Now',          mfa: true  },
    { name: 'Rohan Mehra',   email: 'rohan@indus.co',     role: 'Admin',      lastActive: '12m ago',      mfa: true  },
    { name: 'Lin Chen',      email: 'lin@indus.co',       role: 'Treasurer',  lastActive: '4h ago',       mfa: true  },
    { name: 'Kiran Pillai',  email: 'kiran@indus.co',     role: 'Developer',  lastActive: 'Yesterday',    mfa: true  },
    { name: 'Maya Iyer',     email: 'maya@indus.co',      role: 'Viewer',     lastActive: '3 days ago',   mfa: false },
    { name: 'Pending invite',email: 'cfo@indus.co',       role: 'Admin',      lastActive: 'Sent yesterday', mfa: false, pending: true },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1300 }}>
      <PageHeader
        eyebrow="Workspace"
        title="Team"
        sub={`${team.filter(t => !t.pending).length} active members · ${team.filter(t => t.pending).length} pending invite`}
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Shield size={14} /> Roles policy</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> Invite</button>
        </>}
      />

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead><tr><th>Name</th><th>Role</th><th>2FA</th><th>Last active</th><th></th></tr></thead>
          <tbody>
            {team.map(t => (
              <tr key={t.email} style={t.pending ? { opacity: 0.7 } : {}}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="avatar" style={t.pending ? { background: 'var(--bg-sunken)', color: 'var(--fg-3)' } : {}}>
                      {t.pending ? '?' : t.name.split(' ').map(s => s[0]).join('').slice(0,2)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`tag ${t.role === 'Owner' ? 'tag-lime' : 'tag-neutral'}`}>{t.role}</span></td>
                <td>
                  {t.mfa
                    ? <span className="tag tag-success" style={{ height: 18, fontSize: 10 }}><window.Icon.Check size={10} /> on</span>
                    : <span className="tag tag-warn" style={{ height: 18, fontSize: 10 }}>off</span>}
                </td>
                <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{t.lastActive}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {t.pending
                    ? <button className="btn btn-ghost btn-sm">Resend</button>
                    : <button className="icon-btn"><window.Icon.Settings size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  CHANNELS (bank persona) — host-to-host & API channels health
// ──────────────────────────────────────────────────────────────────────────
function ChannelsScreen({ data }) {
  const channels = [
    { id: 'h2h', name: 'Host-to-host SFTP',  type: 'SFTP/PGP',     uptime: 99.99, rps: 12,    p95: 88,  state: 'healthy' },
    { id: 'rest',name: 'REST · Payments',    type: 'OAuth2 mTLS',  uptime: 99.97, rps: 412,   p95: 142, state: 'healthy' },
    { id: 'rt',  name: 'REST · Statements',  type: 'OAuth2 mTLS',  uptime: 99.94, rps: 88,    p95: 168, state: 'healthy' },
    { id: 'va',  name: 'Virtual accounts',   type: 'Webhook',      uptime: 99.81, rps: 56,    p95: 224, state: 'degraded' },
    { id: 'swft',name: 'SWIFT gateway',      type: 'MT/MX',        uptime: 99.99, rps:  4,    p95: 312, state: 'healthy' },
    { id: 'upi', name: 'UPI · Collect',      type: 'NPCI bridge',  uptime: 100,   rps: 1820,  p95:  44, state: 'healthy' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader
        eyebrow="HDFC · channel health"
        title="Channels"
        sub="Per-channel uptime, throughput, and SLA against the last 30 days."
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Doc size={14} /> SLA report</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> New channel</button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {channels.map((c, i) => (
          <div key={c.id} className="surface slide-up" style={{ padding: 18, animationDelay: `${i*40}ms` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.4, marginTop: 2 }}>{c.type}</div>
              </div>
              <span className={`tag ${c.state === 'healthy' ? 'tag-success' : 'tag-warn'}`}>
                {c.state === 'healthy' ? <span className="dot dot-live" /> : null}
                {c.state}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>
              <Stat label="Uptime" value={`${c.uptime}%`} />
              <Stat label="Throughput" value={`${c.rps} rps`} />
              <Stat label="p95" value={`${c.p95} ms`} warn={c.p95 > 200} />
            </div>

            {/* Sparkline of uptime */}
            <div style={{ marginTop: 12 }}>
              <window.Sparkline
                data={Array.from({ length: 24 }, (_, k) => c.uptime - Math.abs(Math.sin(k * 1.3 + i)) * (100 - c.uptime) * 4 - (k === 14 && c.state === 'degraded' ? 0.4 : 0))}
                w={280}
                h={32}
                color={c.state === 'healthy' ? 'var(--lime)' : 'var(--warn)'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div>
      <div className="caption" style={{ marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: warn ? 'var(--warn)' : 'var(--fg-1)' }}>{value}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  INCIDENTS (bank persona)
// ──────────────────────────────────────────────────────────────────────────
function IncidentsScreen({ data }) {
  const incidents = [
    { id: 'INC-2841', sev: 'P2', title: 'Virtual accounts webhook delays',   started: 'Today 11:02', dur: '2h 14m', state: 'open',       owner: 'Channels team', impact: '3 customers · 1.2k events' },
    { id: 'INC-2840', sev: 'P3', title: 'Statement fetch retry-storm',       started: 'Today 04:12', dur: '38m',     state: 'monitoring', owner: 'Platform',      impact: '1 customer · MT940' },
    { id: 'INC-2832', sev: 'P1', title: 'RTGS cut-off mis-aligned (resolved)', started: 'Yesterday',started_full: '2026-05-09 16:48', dur: '1h 02m', state: 'resolved', owner: 'On-call', impact: '6 customers · ₹14.2 Cr held' },
    { id: 'INC-2820', sev: 'P3', title: 'OAuth token expiry drift',          started: 'May 6',       dur: '22m',     state: 'resolved',   owner: 'Platform',      impact: '0 customer impact' },
  ];
  const sevTag = { P1: 'tag-danger', P2: 'tag-warn', P3: 'tag-info' };
  return (
    <div style={{ padding: 24, maxWidth: 1300 }}>
      <PageHeader
        eyebrow="HDFC · operations"
        title="Incidents"
        sub="2 open, 1 monitoring, 14 resolved in the last 30 days. SLA: P1 ack < 5 min, resolve < 4h."
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Doc size={14} /> Runbooks</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> Declare incident</button>
        </>}
      />

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Owner</th><th>Started</th><th>Duration</th><th>Impact</th><th>State</th></tr></thead>
          <tbody>
            {incidents.map(i => (
              <tr key={i.id}>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{i.id}</span></td>
                <td><span className={`tag ${sevTag[i.sev]}`}>{i.sev}</span></td>
                <td><span style={{ fontWeight: 500 }}>{i.title}</span></td>
                <td><span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{i.owner}</span></td>
                <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{i.started}</span></td>
                <td><span className="mono" style={{ fontSize: 12 }}>{i.dur}</span></td>
                <td><span className="caption" style={{ fontFamily: 'var(--font-mono)' }}>{i.impact}</span></td>
                <td>
                  <span className={`tag ${
                    i.state === 'open' ? 'tag-danger' :
                    i.state === 'monitoring' ? 'tag-warn' :
                    'tag-success'
                  }`}>{i.state}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  API DOCS (dev persona) — three-pane reference
// ──────────────────────────────────────────────────────────────────────────
function DocsScreen({ data }) {
  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader
        eyebrow="Developer · reference"
        title="API docs"
        sub="OpenAPI 3.1 · v2.4 · last updated 2026-05-08"
        actions={<>
          <button className="btn btn-secondary"><window.Icon.Download size={14} /> openapi.yaml</button>
          <button className="btn btn-primary"><window.Icon.External size={14} /> Postman</button>
        </>}
      />
      <DocsInline />
    </div>
  );
}

function DocsInline() {
  const groups = [
    { id: 'gs',  label: 'Getting started', items: ['Quickstart','Authentication','Idempotency','Pagination','Errors'] },
    { id: 'pay', label: 'Payments',        items: ['Create payment','Cancel','Status','Bulk payments','Beneficiary lookup'] },
    { id: 'st',  label: 'Statements',      items: ['Fetch statement','Stream events','Reconciliation'] },
    { id: 'acc', label: 'Accounts',        items: ['Link account','List balances','Virtual accounts'] },
    { id: 'wh',  label: 'Webhooks',        items: ['Endpoint setup','Event types','Signature verification','Replay'] },
  ];
  const [active, setActive] = React.useState('Create payment');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Side nav */}
        <nav className="surface" style={{ padding: 8, position: 'sticky', top: 16 }}>
          {groups.map(g => (
            <div key={g.id} style={{ marginBottom: 8 }}>
              <div className="eyebrow" style={{ padding: '6px 8px 4px' }}>{g.label}</div>
              {g.items.map(it => (
                <button
                  key={it}
                  onClick={() => setActive(it)}
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: 'var(--r-sm)', textAlign: 'left',
                    background: active === it ? 'var(--hover-wash)' : 'transparent',
                    color: active === it ? 'var(--fg-1)' : 'var(--fg-2)',
                    fontSize: 12.5, fontWeight: 500,
                    borderLeft: '2px solid ' + (active === it ? 'var(--lime)' : 'transparent'),
                  }}
                >{it}</button>
              ))}
            </div>
          ))}
        </nav>

        {/* Reference pane */}
        <div className="surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime-dk)', letterSpacing: 0.6 }}>POST</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--fg-1)' }}>/v1/payments</span>
          </div>
          <h2 className="h-section" style={{ marginBottom: 6 }}>{active}</h2>
          <p className="body">Initiates a payment from a connected account. Idempotent on <code className="mono" style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>Idempotency-Key</code>; replays return the original response within 24 hours.</p>

          <h3 className="h-card" style={{ marginTop: 20, marginBottom: 8 }}>Body</h3>
          <table className="dt">
            <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Notes</th></tr></thead>
            <tbody>
              {[
                { f: 'amount',      t: 'integer', r: true,  n: 'Minor units (paise / cents).' },
                { f: 'currency',    t: 'string',  r: true,  n: 'ISO-4217. Must match source account.' },
                { f: 'channel',     t: 'enum',    r: true,  n: 'rtgs · neft · imps · ach · swift' },
                { f: 'source',      t: 'string',  r: true,  n: 'Lynqx account id, e.g. acc_8821' },
                { f: 'beneficiary', t: 'object',  r: true,  n: 'See Beneficiary lookup' },
                { f: 'metadata',    t: 'object',  r: false, n: 'Free-form. Up to 16 keys, 2 KB.' },
              ].map(r => (
                <tr key={r.f}>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{r.f}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{r.t}</span></td>
                  <td>{r.r ? <span className="tag tag-warn" style={{ height: 18, fontSize: 10 }}>required</span> : <span className="caption">optional</span>}</td>
                  <td><span className="caption" style={{ color: 'var(--fg-2)' }}>{r.n}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="h-card" style={{ marginTop: 24, marginBottom: 8 }}>Returns</h3>
          <p className="body">A <code className="mono" style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>Payment</code> object. Status begins as <code className="mono" style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>accepted</code> and progresses via <code className="mono" style={{ background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>payments.settled</code> webhook events.</p>
        </div>

        {/* Code pane */}
        <div style={{ position: 'sticky', top: 16 }}>
          <div className="surface" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center' }}>
              <span className="eyebrow">Request · curl</span>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}><window.Icon.Copy size={12} /> Copy</button>
            </div>
            <pre className="code-block" style={{ borderRadius: 0, margin: 0 }}>{`curl -X POST https://api.lynqx.io/v1/payments \\
  -H "Authorization: Bearer $LYNQX_KEY" \\
  -H "Idempotency-Key: 9f1c-44a2" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":   8420000,
    "currency": "INR",
    "channel":  "rtgs",
    "source":   "acc_8821",
    "beneficiary": {
      "name":    "Voltaire Logistics",
      "ifsc":    "ICIC0001234",
      "account": "00540210000231"
    }
  }'`}</pre>
          </div>

          <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center' }}>
              <span className="eyebrow">Response · 202</span>
              <span className="tag tag-success" style={{ marginLeft: 'auto' }}>accepted</span>
            </div>
            <pre className="code-block" style={{ borderRadius: 0, margin: 0 }}>{`{
  "id":       "p_77a8_kQp",
  "status":   "accepted",
  "amount":   8420000,
  "currency": "INR",
  "rail":     "rtgs",
  "route":    "sap → lynqx → hdfc",
  "eta":      "T+0h",
  "created":  "2026-05-10T14:08:22Z"
}`}</pre>
          </div>
        </div>
      </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  Wrappers that re-use DevConsole tabs for Logs / Webhooks shortcuts
// ──────────────────────────────────────────────────────────────────────────
function LogsScreen({ data })     { return <window.DevConsoleScreen data={data} initialTab="logs" />; }
function WebhooksScreen({ data }) { return <window.DevConsoleScreen data={data} initialTab="webhooks" />; }

// ──────────────────────────────────────────────────────────────────────────
//  BANK OPS — single shell, tabbed (Customers / Channels / Incidents / Logs)
// ──────────────────────────────────────────────────────────────────────────
function BankOpsScreen({ data, initialTab }) {
  const [tab, setTab] = React.useState(initialTab || 'customers');

  const tabs = [
    { id: 'customers', label: `Customers · ${data.bank.customers.length}` },
    { id: 'channels',  label: 'Channel health' },
    { id: 'incidents', label: 'Incidents · 2 open' },
    { id: 'logs',      label: 'Channel logs' },
  ];

  // Top-of-page actions vary per tab
  const actions = {
    customers: <>
      <button className="btn btn-secondary"><window.Icon.Download size={14} /> Export</button>
      <button className="btn btn-primary"><window.Icon.Plus size={14} /> Onboard customer</button>
    </>,
    channels: <>
      <button className="btn btn-secondary"><window.Icon.Doc size={14} /> SLA report</button>
      <button className="btn btn-primary"><window.Icon.Plus size={14} /> New channel</button>
    </>,
    incidents: <>
      <button className="btn btn-secondary"><window.Icon.Doc size={14} /> Runbooks</button>
      <button className="btn btn-primary"><window.Icon.Plus size={14} /> Declare incident</button>
    </>,
    logs: <>
      <button className="btn btn-secondary"><window.Icon.Refresh size={14} /> Refresh</button>
      <button className="btn btn-secondary"><window.Icon.Download size={14} /> Export</button>
    </>,
  };

  // Headline metadata per tab
  const meta = {
    customers: { eyebrow: 'HDFC · Lynqx Hub', title: 'Operations',  sub: `Track per-customer usage, channels, and SLAs across ${data.bank.customers.length} live tenants.` },
    channels:  { eyebrow: 'HDFC · Lynqx Hub', title: 'Operations',  sub: 'Per-channel uptime, throughput, and SLA against the last 30 days.' },
    incidents: { eyebrow: 'HDFC · Lynqx Hub', title: 'Operations',  sub: '2 open, 1 monitoring, 14 resolved in the last 30 days. SLA: P1 ack < 5 min, resolve < 4h.' },
    logs:      { eyebrow: 'HDFC · Lynqx Hub', title: 'Operations',  sub: 'Real-time channel events across all customer tenants.' },
  }[tab];

  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} sub={meta.sub} actions={actions[tab]} />

      <div className="tabbar" style={{ marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'customers' && <BankCustomersTable data={data} />}
      {tab === 'channels'  && <BankChannelsGrid />}
      {tab === 'incidents' && <BankIncidentsTable />}
      {tab === 'logs'      && <BankLogsTable />}
    </div>
  );
}

// ── Customers table (inline, no page chrome) ─────────────────────────────
function BankCustomersTable({ data }) {
  const [q, setQ] = React.useState('');
  const [planFilter, setPlanFilter] = React.useState('All');
  const rows = data.bank.customers.filter(c =>
    (!q || c.name.toLowerCase().includes(q.toLowerCase())) &&
    (planFilter === 'All' || c.plan === planFilter)
  );
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 380 }}>
          <window.Icon.Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
          <input className="field" style={{ paddingLeft: 32 }} placeholder="Search customers…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="tabs">
          {['All','Starter','Growth','Scale','Enterprise'].map(p => (
            <button key={p} className={planFilter === p ? 'active' : ''} onClick={() => setPlanFilter(p)}>{p}</button>
          ))}
        </div>
        <span className="caption" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{rows.length} of {data.bank.customers.length}</span>
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th>Customer</th><th>Plan</th><th>Accounts</th>
              <th style={{ textAlign: 'right' }}>API calls (30d)</th>
              <th style={{ textAlign: 'right' }}>Volume</th>
              <th>Error rate</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{c.name.charAt(0)}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`tag ${c.plan === 'Enterprise' ? 'tag-lime' : 'tag-neutral'}`}>{c.plan}</span></td>
                <td><span className="mono">{c.accounts}</span></td>
                <td style={{ textAlign: 'right' }}><span className="mono tabular">{c.calls.toLocaleString()}</span></td>
                <td style={{ textAlign: 'right' }}><span className="mono tabular">{c.vol}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: 'var(--bg-sunken)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(c.err * 80, 100)}%`, height: '100%', background: c.err > 0.3 ? 'var(--warn)' : 'var(--lime)' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11.5, color: c.err > 0.3 ? 'var(--warn)' : 'var(--fg-2)' }}>{c.err.toFixed(2)}%</span>
                  </div>
                </td>
                <td>
                  <span className={`tag ${c.status === 'active' ? 'tag-success' : c.status === 'warn' ? 'tag-warn' : 'tag-neutral'}`}>
                    {c.status === 'active' ? <span className="dot dot-live" /> : null}
                    {c.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm">Open <window.Icon.ArrowRight size={11} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Channels grid (inline) ───────────────────────────────────────────────
function BankChannelsGrid() {
  const channels = [
    { id: 'h2h', name: 'Host-to-host SFTP', type: 'SFTP/PGP',    uptime: 99.99, rps: 12,    p95: 88,  state: 'healthy' },
    { id: 'rest',name: 'REST · Payments',   type: 'OAuth2 mTLS', uptime: 99.97, rps: 412,   p95: 142, state: 'healthy' },
    { id: 'rt',  name: 'REST · Statements', type: 'OAuth2 mTLS', uptime: 99.94, rps: 88,    p95: 168, state: 'healthy' },
    { id: 'va',  name: 'Virtual accounts',  type: 'Webhook',     uptime: 99.81, rps: 56,    p95: 224, state: 'degraded' },
    { id: 'swft',name: 'SWIFT gateway',     type: 'MT/MX',       uptime: 99.99, rps:  4,    p95: 312, state: 'healthy' },
    { id: 'upi', name: 'UPI · Collect',     type: 'NPCI bridge', uptime: 100,   rps: 1820,  p95:  44, state: 'healthy' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
      {channels.map((c, i) => (
        <div key={c.id} className="surface slide-up" style={{ padding: 18, animationDelay: `${i*40}ms` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{c.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.4, marginTop: 2 }}>{c.type}</div>
            </div>
            <span className={`tag ${c.state === 'healthy' ? 'tag-success' : 'tag-warn'}`}>
              {c.state === 'healthy' ? <span className="dot dot-live" /> : null}
              {c.state}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>
            <Stat label="Uptime" value={`${c.uptime}%`} />
            <Stat label="Throughput" value={`${c.rps} rps`} />
            <Stat label="p95" value={`${c.p95} ms`} warn={c.p95 > 200} />
          </div>
          <div style={{ marginTop: 12 }}>
            <window.Sparkline
              data={Array.from({ length: 24 }, (_, k) => c.uptime - Math.abs(Math.sin(k * 1.3 + i)) * (100 - c.uptime) * 4 - (k === 14 && c.state === 'degraded' ? 0.4 : 0))}
              w={280} h={32}
              color={c.state === 'healthy' ? 'var(--lime)' : 'var(--warn)'}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Incidents table (inline) ─────────────────────────────────────────────
function BankIncidentsTable() {
  const incidents = [
    { id: 'INC-2841', sev: 'P2', title: 'Virtual accounts webhook delays',  started: 'Today 11:02', dur: '2h 14m', state: 'open',       owner: 'Channels team', impact: '3 customers · 1.2k events' },
    { id: 'INC-2840', sev: 'P3', title: 'Statement fetch retry-storm',      started: 'Today 04:12', dur: '38m',     state: 'monitoring', owner: 'Platform',      impact: '1 customer · MT940' },
    { id: 'INC-2832', sev: 'P1', title: 'RTGS cut-off mis-aligned (resolved)', started: 'Yesterday', dur: '1h 02m', state: 'resolved',   owner: 'On-call',       impact: '6 customers · ₹14.2 Cr held' },
    { id: 'INC-2820', sev: 'P3', title: 'OAuth token expiry drift',         started: 'May 6',       dur: '22m',     state: 'resolved',   owner: 'Platform',      impact: '0 customer impact' },
  ];
  const sevTag = { P1: 'tag-danger', P2: 'tag-warn', P3: 'tag-info' };
  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <table className="dt">
        <thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Owner</th><th>Started</th><th>Duration</th><th>Impact</th><th>State</th></tr></thead>
        <tbody>
          {incidents.map(i => (
            <tr key={i.id}>
              <td><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{i.id}</span></td>
              <td><span className={`tag ${sevTag[i.sev]}`}>{i.sev}</span></td>
              <td><span style={{ fontWeight: 500 }}>{i.title}</span></td>
              <td><span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{i.owner}</span></td>
              <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{i.started}</span></td>
              <td><span className="mono" style={{ fontSize: 12 }}>{i.dur}</span></td>
              <td><span className="caption" style={{ fontFamily: 'var(--font-mono)' }}>{i.impact}</span></td>
              <td>
                <span className={`tag ${
                  i.state === 'open' ? 'tag-danger' :
                  i.state === 'monitoring' ? 'tag-warn' :
                  'tag-success'
                }`}>{i.state}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Channel logs (live feed) ─────────────────────────────────────────────
function BankLogsTable() {
  const logs = [
    { time: '14:08:22', channel: 'REST · Payments',   customer: 'Indus Treasury',     event: 'payment.accepted',     status: 200, ms:  87 },
    { time: '14:08:14', channel: 'REST · Statements', customer: 'Voltaire Logistics', event: 'statement.fetched',    status: 200, ms: 121 },
    { time: '14:07:58', channel: 'Virtual accounts',  customer: 'Lattice Pay',        event: 'webhook.delayed',      status: 202, ms: 6_240 },
    { time: '14:07:42', channel: 'UPI · Collect',     customer: 'Bharat Foods',       event: 'collect.completed',    status: 200, ms:  44 },
    { time: '14:07:33', channel: 'REST · Payments',   customer: 'Norden Pharma',      event: 'payment.accepted',     status: 200, ms:  92 },
    { time: '14:07:11', channel: 'SWIFT gateway',     customer: 'Indus Treasury',     event: 'mt103.sent',           status: 200, ms: 318 },
    { time: '14:06:58', channel: 'Virtual accounts',  customer: 'Lattice Pay',        event: 'webhook.retry',        status: 503, ms:    9 },
    { time: '14:06:42', channel: 'REST · Payments',   customer: 'Voltaire Logistics', event: 'payment.failed',       status: 422, ms:  18, reason: 'IFSC invalid' },
    { time: '14:06:24', channel: 'REST · Statements', customer: 'Indus Treasury',     event: 'statement.scheduled',  status: 202, ms:  14 },
    { time: '14:06:11', channel: 'Host-to-host SFTP', customer: 'Saffron Capital',    event: 'file.dropped',         status: 200, ms: 988 },
    { time: '14:05:54', channel: 'UPI · Collect',     customer: 'Bharat Foods',       event: 'collect.completed',    status: 200, ms:  47 },
    { time: '14:05:31', channel: 'REST · Payments',   customer: 'Lattice Pay',        event: 'payment.accepted',     status: 200, ms:  79 },
  ];
  const [q, setQ] = React.useState('');
  const [chFilter, setChFilter] = React.useState('All');
  const channels = ['All', ...Array.from(new Set(logs.map(l => l.channel)))];
  const filt = logs.filter(l =>
    (chFilter === 'All' || l.channel === chFilter) &&
    (!q || l.customer.toLowerCase().includes(q.toLowerCase()) || l.event.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 380 }}>
          <window.Icon.Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
          <input className="field" style={{ paddingLeft: 32 }} placeholder="Filter by customer or event…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="field" style={{ height: 32, paddingRight: 24, fontSize: 12.5, width: 'auto' }} value={chFilter} onChange={e => setChFilter(e.target.value)}>
          {channels.map(c => <option key={c} value={c}>Channel · {c}</option>)}
        </select>
        <span className="caption" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{filt.length} events · auto-refresh 5s</span>
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Time</th>
              <th>Channel</th>
              <th>Customer</th>
              <th>Event</th>
              <th style={{ width: 80 }}>Status</th>
              <th style={{ width: 90 }}>Latency</th>
            </tr>
          </thead>
          <tbody>
            {filt.map((l, i) => {
              const s = l.status, sCls = s < 300 ? 'tag-success' : s < 400 ? 'tag-info' : s < 500 ? 'tag-warn' : 'tag-danger';
              return (
                <tr key={i}>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{l.time}</span></td>
                  <td><span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{l.channel}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{l.customer}</span></td>
                  <td>
                    <span className="mono" style={{ fontSize: 12.5 }}>{l.event}</span>
                    {l.reason && <span className="caption" style={{ display: 'block', marginTop: 2, color: 'var(--danger)' }}>{l.reason}</span>}
                  </td>
                  <td><span className={`tag ${sCls}`} style={{ height: 20 }}>{l.status}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: l.ms > 1000 ? 'var(--warn)' : 'var(--fg-2)' }}>{l.ms.toLocaleString()}ms</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

window.BankOpsScreen      = BankOpsScreen;
window.AccountsScreen     = AccountsScreen;
window.TransactionsScreen = TransactionsScreen;
window.StatementsScreen   = StatementsScreen;
window.TeamScreen         = TeamScreen;
window.ChannelsScreen     = ChannelsScreen;
window.IncidentsScreen    = IncidentsScreen;
window.DocsScreen         = DocsScreen;
window.DocsInline         = DocsInline;
