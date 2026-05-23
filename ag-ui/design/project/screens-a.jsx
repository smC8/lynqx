// Screens — Overview + Marketplace + Account linking

// ── Tiny sparkline component (reused) ────────────────────────────────────
function Sparkline({ data, color = 'var(--lime)', w = 100, h = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${i*step},${h - ((v - min)/span)*(h-2) - 1}`).join(' ');
  const area = path + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <path d={area} fill={color} fillOpacity="0.12" />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  OVERVIEW SCREEN — varies by persona
// ──────────────────────────────────────────────────────────────────────────
function OverviewScreen({ persona, data }) {
  const config = {
    exec: {
      eyebrow: 'Treasury overview',
      headline: 'Good afternoon, Aarti.',
      sub: '4 connected accounts · 2 ERPs · last sync 2 minutes ago',
      kpis: [
        { label: 'Connected accounts', value: '4',         trend: '+1 this week', dir: 'up',   spark: data.spark.apiCalls },
        { label: 'API calls (30d)',    value: '184,502',   trend: '+12.4%',       dir: 'up',   spark: data.spark.apiCalls },
        { label: 'Volume processed',   value: '$24.6M',    trend: '+8.1%',        dir: 'up',   spark: data.spark.volume },
        { label: 'Error rate',         value: '0.04%',     trend: '−0.02pp',      dir: 'down', spark: data.spark.errors, isErr: true },
      ],
    },
    bank: {
      eyebrow: 'HDFC · Lynqx Hub',
      headline: 'Customer health, today.',
      sub: '6 active customers · 673,145 calls last 30 days',
      kpis: [
        { label: 'Active customers',  value: '6',        trend: '+1 this month', dir: 'up',   spark: [4,5,5,6,6,6,6,6,6,6,6,6,6,6,6] },
        { label: 'Total API calls',   value: '673,145',  trend: '+18.0%',        dir: 'up',   spark: data.spark.apiCalls },
        { label: 'Aggregate volume',  value: '$96.7M',   trend: '+11.2%',        dir: 'up',   spark: data.spark.volume },
        { label: 'Channel error rate',value: '0.14%',    trend: '+0.04pp',       dir: 'up',   spark: data.spark.errors, isErr: true },
      ],
    },
    dev: {
      eyebrow: 'Lattice Pay · Sandbox',
      headline: 'Build status, live.',
      sub: '3 keys active · last deploy 4 hours ago · webhooks healthy',
      kpis: [
        { label: 'Requests (24h)',  value: '38,221',  trend: '+6.4%', dir: 'up',   spark: data.spark.apiCalls },
        { label: 'p95 latency',     value: '142ms',   trend: '−18ms', dir: 'down', spark: [180,170,160,165,150,155,148,142,140,138,142,140,142,141,142] },
        { label: '4xx rate',        value: '0.32%',   trend: '+0.08pp', dir: 'up', spark: data.spark.errors, isErr: true },
        { label: 'Webhook success', value: '99.94%',  trend: 'stable',  dir: 'up', spark: [99.9,99.92,99.95,99.94,99.93,99.95,99.94,99.94,99.95,99.94,99.94,99.95,99.94,99.94,99.94] },
      ],
    },
  }[persona];

  return (
    <div style={{ padding: 24, maxWidth: 1400 }}>
      {/* Hero */}
      <div className="slide-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{config.eyebrow}</div>
          <h1 className="h-display">{config.headline}</h1>
          <p className="body" style={{ marginTop: 6, marginBottom: 0 }}>{config.sub}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><window.Icon.Download size={14} /> Export</button>
          <button className="btn btn-primary">
            {persona === 'dev' ? <><window.Icon.Plus size={14} /> New API key</> :
             persona === 'bank' ? <><window.Icon.Plus size={14} /> Onboard customer</> :
             <><window.Icon.Plus size={14} /> Link account</>}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {config.kpis.map((k, i) => (
          <div key={i} className="kpi slide-up" style={{ animationDelay: `${60 + i*40}ms` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="kpi-label">{k.label}</span>
              <span className={`kpi-trend ${k.dir === 'down' && !k.isErr ? 'down' : ''} ${k.dir === 'up' && k.isErr ? 'down' : ''}`}>
                {k.dir === 'up' ? <window.Icon.ArrowUp size={11} /> : <window.Icon.ArrowDown size={11} />}
                {k.trend}
              </span>
            </div>
            <div className="kpi-value">{k.value}</div>
            <Sparkline data={k.spark} w={140} h={32} color={k.isErr ? 'var(--warn)' : 'var(--lime)'} />
          </div>
        ))}
      </div>

      {/* Lower row: connection map + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12 }}>
        <ConnectionMap persona={persona} />
        <ActivityStream activity={data.activity} />
      </div>
    </div>
  );
}

// ── Connection map: a diagrammatic SVG of ERP ↔ Lynqx ↔ Banks ────────────
function ConnectionMap({ persona }) {
  const left = persona === 'dev'
    ? [{ id: 'app',    label: 'Lattice Pay app' }]
    : [{ id: 'sap',    label: 'SAP S/4HANA' }, { id: 'kyriba', label: 'Kyriba' }];
  const right = persona === 'dev'
    ? [{ id: 'sandbox', label: 'Sandbox' }, { id: 'live', label: 'Live' }]
    : [{ id: 'hdfc',  label: 'HDFC' }, { id: 'icici', label: 'ICICI' }, { id: 'citi', label: 'Citi' }, { id: 'kyrb', label: 'Kyriba' }];

  return (
    <div className="surface" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Live connection map</div>
          <h3 className="h-card">Routing topology</h3>
        </div>
        <span className="tag tag-success"><span className="dot dot-live" />Live</span>
      </div>

      <svg viewBox="0 0 600 260" width="100%" height="240" style={{ display: 'block' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fg-3)" />
          </marker>
        </defs>

        {/* Left column nodes */}
        {left.map((n, i) => {
          const y = 60 + i * (left.length === 1 ? 0 : 100);
          const yC = left.length === 1 ? 130 : y;
          return (
            <g key={n.id}>
              <rect x="20" y={yC - 22} width="140" height="44" rx="6" fill="var(--bg-surface-2)" stroke="var(--border-1)" />
              <text x="90" y={yC + 4} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--fg-1)">{n.label}</text>
            </g>
          );
        })}

        {/* Center: Lynqx */}
        <g>
          <rect x="240" y="100" width="120" height="60" rx="8" fill="var(--forest)" />
          <rect x="247" y="118" width="6" height="24" fill="var(--lime)" />
          <text x="305" y="135" fill="var(--lime)" fontSize="14" fontWeight="700" fontFamily="var(--font-sans)">lynqx</text>
          <text x="305" y="150" fill="var(--fg-on-dark-3)" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1.4">UNIFIED API</text>
        </g>

        {/* Right column nodes */}
        {right.map((n, i) => {
          const y = 30 + i * (200 / Math.max(right.length - 1, 1));
          return (
            <g key={n.id}>
              <rect x="440" y={y - 14} width="140" height="28" rx="5" fill="var(--bg-surface-2)" stroke="var(--border-1)" />
              <text x="510" y={y + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--fg-1)">{n.label}</text>
            </g>
          );
        })}

        {/* Animated connection lines */}
        {left.map((n, i) => {
          const y1 = left.length === 1 ? 130 : 60 + i * 100;
          return <path key={`l-${i}`} d={`M160 ${y1} C 200 ${y1}, 220 130, 240 130`} stroke="var(--lime)" strokeWidth="1.5" fill="none" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
          </path>;
        })}
        {right.map((n, i) => {
          const y2 = 30 + i * (200 / Math.max(right.length - 1, 1));
          return <path key={`r-${i}`} d={`M360 130 C 400 130, 410 ${y2}, 440 ${y2}`} stroke="var(--info)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.6s" repeatCount="indefinite" />
          </path>;
        })}

        {/* Endpoint dots — pulsing */}
        {right.map((n, i) => {
          const y = 30 + i * (200 / Math.max(right.length - 1, 1));
          return <circle key={`d-${i}`} cx="440" cy={y} r="3" fill="var(--success)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>;
        })}
      </svg>

      {/* Footer mini-stats */}
      <div style={{ display: 'flex', gap: 24, paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>
        <div>
          <div className="caption" style={{ marginBottom: 2 }}>Latency p95</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>142ms</div>
        </div>
        <div>
          <div className="caption" style={{ marginBottom: 2 }}>Throughput</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>2,184 rps</div>
        </div>
        <div>
          <div className="caption" style={{ marginBottom: 2 }}>Active routes</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{left.length + right.length}</div>
        </div>
      </div>
    </div>
  );
}

// ── Activity stream ──────────────────────────────────────────────────────
function ActivityStream({ activity }) {
  return (
    <div className="surface" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Activity</div>
          <h3 className="h-card">Recent events</h3>
        </div>
        <button className="btn btn-ghost btn-sm">View all <window.Icon.ArrowRight size={12} /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {activity.map((a, i) => {
          const tag = { live: 'tag-success', ok: 'tag-info', warn: 'tag-warn' }[a.tag] || 'tag-neutral';
          return (
            <div key={a.id} className="slide-up" style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 0',
              borderBottom: i < activity.length - 1 ? '1px solid var(--border-2)' : 'none',
              animationDelay: `${i * 50}ms`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--lime)', marginTop: 7 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.4, marginBottom: 2 }}>{a.mono}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{a.text}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{a.value}</span>
                  <span className={`tag ${tag}`} style={{ height: 18, fontSize: 10 }}>{a.tag}</span>
                </div>
              </div>
              <span className="caption" style={{ flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  MARKETPLACE
// ──────────────────────────────────────────────────────────────────────────
function MarketplaceScreen({ data, onScreen }) {
  const [cat, setCat] = React.useState('All');
  const [q, setQ] = React.useState('');
  const [region, setRegion] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [detail, setDetail] = React.useState(null);
  const [manage, setManage] = React.useState(null);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [pendingMap, setPendingMap] = React.useState({}); // local optimistic state for "Connect"

  const regions = ['All', ...Array.from(new Set(data.marketplace.featured.map(i => i.region)))];
  const items = data.marketplace.featured
    .map(i => pendingMap[i.id] ? { ...i, status: pendingMap[i.id] } : i)
    .filter(i =>
      (cat === 'All' || i.cat === cat) &&
      (region === 'All' || i.region === region) &&
      (statusFilter === 'All' || i.status === statusFilter) &&
      (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.desc.toLowerCase().includes(q.toLowerCase()))
    );
  const connectedCount = data.marketplace.featured.filter(i => i.status === 'connected').length;

  const startConnect = (item) => {
    setDetail(null);
    // mark as pending optimistically and navigate to account-link wizard
    setPendingMap(m => ({ ...m, [item.id]: 'pending' }));
    if (onScreen) onScreen('accountlink');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400 }}>
      <div className="slide-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Connectivity catalogue</div>
          <h1 className="h-display">Marketplace</h1>
          <p className="body" style={{ marginTop: 6, marginBottom: 0 }}>
            {connectedCount} connected · {data.marketplace.featured.length - connectedCount} available across banks, ERPs, treasury, and analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><window.Icon.External size={14} /> Browse all</button>
          <button className="btn btn-primary" onClick={() => setRequestOpen(true)}><window.Icon.Plus size={14} /> Request integration</button>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
          <window.Icon.Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
          <input
            className="field"
            style={{ paddingLeft: 32 }}
            placeholder="Search integrations…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="tabs">
          {data.marketplace.categories.map(c => (
            <button key={c} className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="field" style={{ height: 30, paddingRight: 24, fontSize: 12.5, width: 'auto' }} value={region} onChange={e => setRegion(e.target.value)}>
            {regions.map(r => <option key={r} value={r}>Region · {r}</option>)}
          </select>
          <select className="field" style={{ height: 30, paddingRight: 24, fontSize: 12.5, width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">Status · All</option>
            <option value="connected">Connected</option>
            <option value="pending">Pending</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 6 }}>No integrations match.</div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setCat('All'); setRegion('All'); setStatusFilter('All'); }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {items.map((it, i) => (
            <IntegrationCard
              key={it.id}
              item={it}
              delay={i * 30}
              onOpen={() => setDetail(it)}
              onConnect={(e) => { e.stopPropagation(); startConnect(it); }}
              onManage={(e) => { e.stopPropagation(); setManage(it); }}
              onPending={(e) => { e.stopPropagation(); setDetail(it); }}
            />
          ))}
        </div>
      )}

      {detail   && <IntegrationDetail item={detail} onClose={() => setDetail(null)} onConnect={() => startConnect(detail)} onManage={() => { setManage(detail); setDetail(null); }} />}
      {manage   && <IntegrationManage  item={manage} onClose={() => setManage(null)} />}
      {requestOpen && <RequestIntegrationModal onClose={() => setRequestOpen(false)} />}
    </div>
  );
}

function IntegrationCard({ item, delay = 0, onOpen, onConnect, onManage, onPending }) {
  const statusTag = {
    connected: { cls: 'tag-success', label: 'Connected' },
    pending:   { cls: 'tag-warn',    label: 'Pending review' },
    available: { cls: 'tag-neutral', label: 'Available' },
  }[item.status];

  return (
    <div
      className="surface slide-up"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen?.(); }}
      style={{
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14,
        animationDelay: `${delay}ms`,
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: item.color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 16, flexShrink: 0,
          letterSpacing: '-0.5px',
        }}>
          {item.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{item.name}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>· {item.cat}</span>
          </div>
          <div className="caption" style={{ fontFamily: 'var(--font-mono)', letterSpacing: 0.4 }}>{item.region}</div>
        </div>
        <span className={`tag ${statusTag.cls}`}>{statusTag.label}</span>
      </div>

      <p className="body" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5 }}>{item.desc}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-2)' }}>
        {item.status === 'connected' ? (
          <>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
              {item.accounts} {item.accounts === 1 ? 'account' : 'accounts'} · since {item.since}
            </span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onManage}>Manage <window.Icon.ArrowRight size={11} /></button>
          </>
        ) : item.status === 'pending' ? (
          <>
            <span className="mono" style={{ fontSize: 11, color: 'var(--warn)' }}>Bank review · est. 2 days</span>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={onPending}>View status</button>
          </>
        ) : (
          <>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Setup · ~5 min</span>
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={onConnect}>Connect <window.Icon.ArrowRight size={11} /></button>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  ACCOUNT LINKING — wizard
// ──────────────────────────────────────────────────────────────────────────
function AccountLinkScreen({ data }) {
  const [step, setStep] = React.useState(0);
  const [bank, setBank] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [credEntered, setCredEntered] = React.useState(false);

  const steps = [
    { id: 'bank',     label: 'Bank' },
    { id: 'products', label: 'Products' },
    { id: 'auth',     label: 'Authenticate' },
    { id: 'confirm',  label: 'Review' },
  ];

  const canNext =
    (step === 0 && bank) ||
    (step === 1 && products.length > 0) ||
    (step === 2 && credEntered) ||
    step === 3;

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div className="slide-up" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>New connection</div>
        <h1 className="h-display">Link a banking account</h1>
        <p className="body" style={{ marginTop: 6 }}>Securely connect a corporate bank to push payments, pull statements, and reconcile in real time.</p>
      </div>

      {/* Stepper */}
      <ol style={{
        display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        gap: 4, listStyle: 'none', padding: 0, margin: '0 0 24px',
      }}>
        {steps.map((s, i) => {
          const done = i < step, active = i === step;
          return (
            <li key={s.id} style={{
              padding: '12px 14px',
              background: active ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
              border: '1px solid ' + (active ? 'var(--forest)' : 'var(--border-2)'),
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 200ms ease',
              opacity: i > step ? 0.55 : 1,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                background: done ? 'var(--lime)' : (active ? 'var(--forest)' : 'transparent'),
                color: done ? 'var(--forest)' : (active ? 'var(--lime)' : 'var(--fg-3)'),
                border: !done && !active ? '1px solid var(--border-strong)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>
                {done ? <window.Icon.Check size={12} /> : (i + 1)}
              </span>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: 1, textTransform: 'uppercase' }}>Step {i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--fg-1)' : 'var(--fg-2)' }}>{s.label}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="surface" style={{ padding: 28, minHeight: 380 }}>
        {step === 0 && <StepBank   data={data} bank={bank} onPick={setBank} />}
        {step === 1 && <StepProducts bank={bank} selected={products} onChange={setProducts} />}
        {step === 2 && <StepAuth     bank={bank} onReady={() => setCredEntered(true)} ready={credEntered} />}
        {step === 3 && <StepReview   bank={bank} products={products} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, gap: 8 }}>
        <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0} style={step === 0 ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
          ← Back
        </button>
        <span className="caption" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
          Step {step + 1} of {steps.length}
        </span>
        {step < steps.length - 1 ? (
          <button className="btn btn-primary" onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext} style={!canNext ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
            Continue <window.Icon.ArrowRight size={13} />
          </button>
        ) : (
          <button className="btn btn-primary"><window.Icon.Check size={13} /> Submit for review</button>
        )}
      </div>
    </div>
  );
}

function StepBank({ data, bank, onPick }) {
  const [q, setQ] = React.useState('');
  const list = data.bankFlow.catalogue.filter(b => !q || b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h3 className="h-card" style={{ marginBottom: 4 }}>Choose a bank</h3>
      <p className="body" style={{ marginTop: 0, marginBottom: 16 }}>Search by name or BIC. We support {data.bankFlow.catalogue.length}+ corporate channels across India, SEA, and global gateways.</p>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <window.Icon.Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
        <input className="field" style={{ paddingLeft: 36, height: 38 }} placeholder="Search 8 banks…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {list.map(b => {
          const active = bank?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onPick(b)}
              style={{
                padding: 14,
                textAlign: 'left',
                background: active ? 'rgba(159,232,112,0.10)' : 'var(--bg-surface-2)',
                border: '1px solid ' + (active ? 'var(--lime-dk)' : 'var(--border-1)'),
                borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 140ms ease',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: 'var(--bg-sunken)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'var(--fg-1)', fontSize: 13,
              }}>
                {b.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{b.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.4 }}>{b.country} · {b.products.length} products</div>
              </div>
              {active && <window.Icon.Check size={14} style={{ color: 'var(--lime-dk)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepProducts({ bank, selected, onChange }) {
  if (!bank) return null;
  const toggle = (p) => onChange(selected.includes(p) ? selected.filter(x => x !== p) : [...selected, p]);
  return (
    <div>
      <h3 className="h-card" style={{ marginBottom: 4 }}>Pick products for {bank.name}</h3>
      <p className="body" style={{ marginTop: 0, marginBottom: 20 }}>Choose what Lynqx should sync. You can add more later.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {bank.products.map(p => {
          const active = selected.includes(p);
          const meta = {
            'Statements':       { icon: 'Doc',     desc: 'MT940, BAI2, ISO 20022 camt.053' },
            'Payments':         { icon: 'Send',    desc: 'NEFT, RTGS, IMPS, ACH, SWIFT' },
            'Virtual accounts': { icon: 'Wallet',  desc: 'Per-payer reconciliation' },
            'Collections':      { icon: 'Download',desc: 'Mandate-based debits' },
            'SWIFT':            { icon: 'Globe',   desc: 'Cross-border MT103/202' },
            'FX':               { icon: 'TrendUp', desc: 'Multi-currency conversion' },
          }[p] || { icon: 'Layers', desc: '' };
          const I = window.Icon[meta.icon];
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              style={{
                padding: 16, textAlign: 'left',
                background: active ? 'rgba(159,232,112,0.10)' : 'var(--bg-surface-2)',
                border: '1px solid ' + (active ? 'var(--lime-dk)' : 'var(--border-1)'),
                borderRadius: 'var(--r-md)',
                display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'all 140ms ease',
                position: 'relative',
              }}
            >
              <I size={20} style={{ color: active ? 'var(--lime-dk)' : 'var(--fg-2)' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{p}</div>
              <div className="caption">{meta.desc}</div>
              {active && (
                <span style={{ position: 'absolute', top: 12, right: 12, width: 18, height: 18, borderRadius: 999, background: 'var(--lime)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <window.Icon.Check size={11} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAuth({ bank, ready, onReady }) {
  return (
    <div>
      <h3 className="h-card" style={{ marginBottom: 4 }}>Authenticate with {bank?.name}</h3>
      <p className="body" style={{ marginTop: 0, marginBottom: 20 }}>Lynqx never stores credentials. Tokens are kept in your bank's vault.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="field-group" style={{ marginBottom: 12 }}>
            <label className="field-label">Customer ID</label>
            <input className="field" placeholder="e.g. INDUS-CORP-001" onChange={() => onReady()} />
          </div>
          <div className="field-group" style={{ marginBottom: 12 }}>
            <label className="field-label">API key</label>
            <input className="field" type="password" placeholder="Provided by your bank" onChange={() => onReady()} />
          </div>
          <div className="field-group" style={{ marginBottom: 12 }}>
            <label className="field-label">Webhook callback URL</label>
            <input className="field" defaultValue="https://api.lynqx.io/wh/indus-treasury" />
            <span className="field-hint">Lynqx will POST event notifications here.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, padding: 10, background: 'var(--bg-sunken)', borderRadius: 'var(--r-sm)' }}>
            <window.Icon.Lock size={14} style={{ color: 'var(--fg-2)' }} />
            <span className="caption" style={{ color: 'var(--fg-2)' }}>End-to-end encrypted · ISO 27001 · SOC 2 Type II</span>
          </div>
        </div>

        <div className="surface-2" style={{ padding: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>What happens next</div>
          <ol style={{ paddingLeft: 18, margin: 0, color: 'var(--fg-2)', fontSize: 13, lineHeight: 1.7 }}>
            <li>We open a TLS tunnel to the {bank?.name} channel.</li>
            <li>Bank authorises Lynqx as your treasury agent.</li>
            <li>Webhooks fire when transactions or statements arrive.</li>
            <li>Your ERP starts seeing live balances within minutes.</li>
          </ol>
          {ready && (
            <div className="slide-up" style={{
              marginTop: 14, padding: 10,
              background: 'var(--success-soft)',
              borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12.5, color: 'var(--success)'
            }}>
              <window.Icon.Check size={14} /> Credentials look valid — ready to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepReview({ bank, products }) {
  return (
    <div>
      <h3 className="h-card" style={{ marginBottom: 4 }}>Review and submit</h3>
      <p className="body" style={{ marginTop: 0, marginBottom: 20 }}>{bank?.name} typically approves new connections in under 24 hours.</p>

      <div className="surface-2" style={{ padding: 18 }}>
        <Row label="Bank"     value={bank?.name} />
        <Row label="Country"  value={bank?.country} />
        <Row label="Products" value={products.join(', ')} />
        <Row label="Webhook"  value="https://api.lynqx.io/wh/indus-treasury" mono />
        <Row label="Encryption" value="AES-256 · keys held by HDFC vault" mono noBorder />
      </div>

      <div style={{ marginTop: 16, padding: 14, background: 'rgba(159,232,112,0.08)', borderRadius: 'var(--r-md)', border: '1px solid rgba(159,232,112,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <window.Icon.Sparkle size={14} style={{ color: 'var(--forest)' }} />
          <strong style={{ fontSize: 12.5, color: 'var(--fg-1)' }}>Lynqx automation</strong>
        </div>
        <div className="caption" style={{ color: 'var(--fg-2)' }}>Once live, your SAP instance will receive bank statements every 4 hours and can release payments via API.</div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, noBorder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 16,
      padding: '10px 0',
      borderBottom: noBorder ? 'none' : '1px solid var(--border-2)',
    }}>
      <span style={{ fontSize: 11.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: 1, width: 110, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--fg-1)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }}>{value || '—'}</span>
    </div>
  );
}

window.OverviewScreen     = OverviewScreen;
window.MarketplaceScreen  = MarketplaceScreen;
window.AccountLinkScreen  = AccountLinkScreen;
window.Sparkline          = Sparkline;

// ──────────────────────────────────────────────────────────────────────────
//  MARKETPLACE — detail / manage / request
// ──────────────────────────────────────────────────────────────────────────

function MetaRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid var(--border-2)', gap: 16 }}>
      <span style={{ width: 110, flexShrink: 0, fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--fg-1)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }}>{value}</span>
    </div>
  );
}

function IntegrationDetail({ item, onClose, onConnect, onManage }) {
  const [tab, setTab] = React.useState('overview');
  const meta = window.INTEGRATION_META[item.id] || window.INTEGRATION_META._default;
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const statusTag = {
    connected: { cls: 'tag-success', label: 'Connected' },
    pending:   { cls: 'tag-warn',    label: 'Pending review' },
    available: { cls: 'tag-neutral', label: 'Available' },
  }[item.status];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" style={{ width: 'min(560px, 92vw)' }}>
        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: item.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 20,
            }}>{item.logo}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '-0.2px' }}>{item.name}</h2>
                <span className={`tag ${statusTag.cls}`}>{statusTag.label}</span>
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {item.cat} · {item.region} · by {meta.vendor}
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><window.Icon.X size={16} /></button>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {item.status === 'connected' && (
              <>
                <button className="btn btn-primary" onClick={onManage}><window.Icon.Settings size={13} /> Manage connection</button>
                <button className="btn btn-secondary"><window.Icon.External size={13} /> Open dashboard</button>
              </>
            )}
            {item.status === 'pending' && (
              <>
                <button className="btn btn-secondary"><window.Icon.Logs size={13} /> View review log</button>
                <button className="btn btn-ghost" style={{ color: 'var(--danger)' }}>Cancel request</button>
              </>
            )}
            {item.status === 'available' && (
              <>
                <button className="btn btn-primary" onClick={onConnect}><window.Icon.Plus size={13} /> Connect {item.name}</button>
                <button className="btn btn-secondary"><window.Icon.Doc size={13} /> Read docs</button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabbar" style={{ padding: '0 20px', borderRadius: 0 }}>
          {[
            { id: 'overview',     label: 'Overview' },
            { id: 'capabilities', label: 'Capabilities' },
            { id: 'requirements', label: 'Requirements' },
            { id: 'pricing',      label: 'Pricing & SLA' },
          ].map(t => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {tab === 'overview' && (
            <>
              <p className="body" style={{ marginTop: 0 }}>{item.desc}</p>
              <p className="body" style={{ color: 'var(--fg-2)' }}>{meta.long}</p>

              <h3 className="h-card" style={{ marginTop: 20, marginBottom: 10 }}>Highlights</h3>
              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, fontSize: 13, color: 'var(--fg-2)' }}>
                {meta.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>

              <h3 className="h-card" style={{ marginTop: 20, marginBottom: 10 }}>At a glance</h3>
              <div className="surface-2" style={{ padding: 14 }}>
                <MetaRow label="Vendor"      value={meta.vendor} />
                <MetaRow label="Setup time"  value={meta.setup} />
                <MetaRow label="Auth method" value={meta.auth} mono />
                <MetaRow label="Data resid." value={meta.residency} />
                <MetaRow label="Compliance"  value={meta.compliance.join(' · ')} mono />
                {item.status === 'connected' && <MetaRow label="Connected on" value={item.since} mono />}
              </div>
            </>
          )}

          {tab === 'capabilities' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {meta.capabilities.map((c, i) => (
                <div key={i} className="surface-2" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: c.supported ? 'rgba(159,232,112,0.18)' : 'var(--bg-sunken)',
                    color: c.supported ? 'var(--lime-dk)' : 'var(--fg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {c.supported ? <window.Icon.Check size={12} /> : <window.Icon.X size={12} />}
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-1)' }}>{c.name}</div>
                    <div className="caption" style={{ marginTop: 2 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'requirements' && (
            <>
              <p className="body" style={{ marginTop: 0 }}>To connect {item.name}, your organisation needs:</p>
              <div className="surface-2" style={{ padding: 14 }}>
                {meta.requirements.map((r, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--lime)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <window.Icon.Check size={11} />
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{r.title}</div>
                      <div className="caption" style={{ marginTop: 2 }}>{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: 12, background: 'var(--info-soft)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <window.Icon.Lock size={14} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
                <span className="caption" style={{ color: 'var(--info)' }}>{meta.security}</span>
              </div>
            </>
          )}

          {tab === 'pricing' && (
            <>
              <div className="surface-2" style={{ padding: 18, marginBottom: 14 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Bundled in your plan</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }}>{meta.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{meta.priceNote}</span>
                </div>
              </div>
              <h3 className="h-card" style={{ marginBottom: 10 }}>Service-level commitments</h3>
              <div className="surface-2" style={{ padding: 14 }}>
                {meta.sla.map((s, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{s.label}</span>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-1)', fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function IntegrationManage({ item, onClose }) {
  const [confirmDisconnect, setConfirmDisconnect] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" style={{ width: 'min(520px, 92vw)' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{item.logo}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Manage {item.name}</h2>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0.4 }}>{item.accounts} {item.accounts === 1 ? 'account' : 'accounts'} · since {item.since}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><window.Icon.X size={16} /></button>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          <h3 className="h-card" style={{ marginTop: 0, marginBottom: 10 }}>Health</h3>
          <div className="surface-2" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div><div className="caption">Uptime · 30d</div><div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>99.97%</div></div>
            <div><div className="caption">p95 latency</div><div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>118ms</div></div>
            <div><div className="caption">Last sync</div><div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>2m ago</div></div>
          </div>

          <h3 className="h-card" style={{ marginTop: 20, marginBottom: 10 }}>Connected accounts</h3>
          <div className="surface-2" style={{ padding: 0, overflow: 'hidden' }}>
            {window.INTEGRATION_ACCOUNTS(item).map((a, i, arr) => (
              <div key={a.num} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
                <window.Icon.Wallet size={14} style={{ color: 'var(--fg-2)', marginRight: 10 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.num} · {a.products.join(' · ')}</div>
                </div>
                <span className="tag tag-success"><span className="dot dot-live" />live</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}><window.Icon.Plus size={12} /> Add account</button>

          <h3 className="h-card" style={{ marginTop: 20, marginBottom: 10 }}>Settings</h3>
          <ManageToggle label="Auto-reconcile statements" desc="Match incoming statements to ERP postings every 4 hours." defaultOn />
          <ManageToggle label="Send webhook on settlement" desc="POST payments.settled to https://api.lynqx.io/wh/indus" defaultOn />
          <ManageToggle label="Alert on connection drop" desc="Page on-call after 60s of API failure." defaultOn />
          <ManageToggle label="Pause sync" desc="Temporarily stop pulling data without disconnecting." />

          <h3 className="h-card" style={{ marginTop: 20, marginBottom: 10, color: 'var(--danger)' }}>Danger zone</h3>
          <div className="surface-2" style={{ padding: 14, borderColor: 'rgba(220,80,80,0.25)' }}>
            {!confirmDisconnect ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>Disconnect {item.name}</div>
                  <div className="caption">Stops all data flow. Bank tokens are revoked.</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(220,80,80,0.4)' }} onClick={() => setConfirmDisconnect(true)}>Disconnect</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>Are you sure?</div>
                <div className="caption" style={{ marginBottom: 12 }}>This cannot be undone. You'll need to repeat the {item.name} bank review to reconnect.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDisconnect(false)}>Cancel</button>
                  <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }} onClick={onClose}>Yes, disconnect</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function ManageToggle({ label, desc, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-2)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{label}</div>
        <div className="caption" style={{ marginTop: 2 }}>{desc}</div>
      </div>
      <button className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(o => !o)} aria-pressed={on}><span className="knob" /></button>
    </div>
  );
}

function RequestIntegrationModal({ onClose }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', cat: 'Banking', region: '', useCase: '', priority: 'normal', email: 'aarti@indus.co' });
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.region.trim() && form.useCase.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Request integration">
        {!submitted ? (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Marketplace · Request</div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Request a new integration</h2>
                <p className="body" style={{ marginTop: 6, marginBottom: 0 }}>Tell us what to build. We'll usually scope new banks or ERPs in 2–3 weeks.</p>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close"><window.Icon.X size={16} /></button>
            </div>

            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div className="field-group">
                <label className="field-label">Integration name *</label>
                <input className="field" placeholder="e.g. Standard Chartered, Workday Adaptive" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-group">
                  <label className="field-label">Category *</label>
                  <select className="field" value={form.cat} onChange={e => update('cat', e.target.value)}>
                    {['Banking','ERP','Treasury','Analytics','Compliance','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Region / country *</label>
                  <input className="field" placeholder="e.g. Singapore, EMEA" value={form.region} onChange={e => update('region', e.target.value)} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Use case *</label>
                <textarea className="field" rows="4" placeholder="What workflows would this enable? Volumes? Required products?" value={form.useCase} onChange={e => update('useCase', e.target.value)} style={{ resize: 'vertical', minHeight: 96, padding: '10px 12px', lineHeight: 1.5 }} />
              </div>
              <div className="field-group">
                <label className="field-label">Priority</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { v: 'normal',   l: 'Nice to have' },
                    { v: 'high',     l: 'Important' },
                    { v: 'critical', l: 'Blocking go-live' },
                  ].map(p => (
                    <button key={p.v} type="button" onClick={() => update('priority', p.v)} style={{
                      flex: 1, padding: '8px 12px', fontSize: 12.5, fontWeight: 500,
                      background: form.priority === p.v ? 'rgba(159,232,112,0.10)' : 'var(--bg-surface-2)',
                      border: '1px solid ' + (form.priority === p.v ? 'var(--lime-dk)' : 'var(--border-1)'),
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--fg-1)',
                    }}>{p.l}</button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Reply to</label>
                <input className="field" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="caption" style={{ flex: 1 }}>Reviewed by Lynqx integrations within 1 business day.</span>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => valid && setSubmitted(true)} disabled={!valid} style={!valid ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
                <window.Icon.Send size={13} /> Submit request
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--lime)', color: 'var(--forest)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <window.Icon.Check size={26} strokeWidth={3} />
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Request received</h2>
            <p className="body" style={{ marginTop: 8 }}>We'll email <span className="mono" style={{ color: 'var(--fg-1)' }}>{form.email}</span> with scoping notes within 1 business day. Tracking ID <span className="mono" style={{ color: 'var(--fg-1)' }}>req_{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

window.IntegrationDetail        = IntegrationDetail;
window.IntegrationManage        = IntegrationManage;
window.RequestIntegrationModal  = RequestIntegrationModal;
