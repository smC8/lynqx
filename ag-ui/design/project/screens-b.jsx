// Screens — Settings + Developer console + Bank customer list

// ──────────────────────────────────────────────────────────────────────────
//  SETTINGS
// ──────────────────────────────────────────────────────────────────────────
function SettingsScreen({ data }) {
  const sections = [
    { id: 'profile',     label: 'Profile',          icon: 'User' },
    { id: 'org',         label: 'Organisation',     icon: 'Building' },
    { id: 'team',        label: 'Team & roles',     icon: 'Users' },
    { id: 'security',    label: 'Security',         icon: 'Shield' },
    { id: 'notifications', label: 'Notifications',  icon: 'Bell' },
    { id: 'billing',     label: 'Billing & plan',   icon: 'Wallet' },
    { id: 'compliance',  label: 'Compliance',       icon: 'Lock' },
    { id: 'audit',       label: 'Audit log',        icon: 'Logs' },
  ];
  const [active, setActive] = React.useState('profile');

  return (
    <div style={{ padding: 24, maxWidth: 1400 }}>
      <div className="slide-up" style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Workspace settings</div>
        <h1 className="h-display">Settings</h1>
        <p className="body" style={{ marginTop: 6, marginBottom: 0 }}>Manage profile, security, billing and compliance for {data.org.name}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Side nav */}
        <nav className="surface" style={{ padding: 6, position: 'sticky', top: 16 }}>
          {sections.map(s => {
            const I = window.Icon[s.icon];
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 'var(--r-sm)',
                  background: isActive ? 'var(--hover-wash)' : 'transparent',
                  color: isActive ? 'var(--fg-1)' : 'var(--fg-2)',
                  fontSize: 13, fontWeight: 500,
                  borderLeft: '2px solid ' + (isActive ? 'var(--lime)' : 'transparent'),
                  transition: 'all 140ms ease',
                  marginBottom: 1,
                }}
              >
                <I size={14} /> {s.label}
              </button>
            );
          })}
        </nav>

        <div>
          {active === 'profile'     && <SettingsProfile data={data} />}
          {active === 'org'         && <SettingsOrg     data={data} />}
          {active === 'team'        && <SettingsTeam />}
          {active === 'security'    && <SettingsSecurity />}
          {active === 'notifications' && <SettingsNotifications />}
          {active === 'billing'     && <SettingsBilling data={data} />}
          {active === 'compliance'  && <SettingsCompliance />}
          {active === 'audit'       && <SettingsAudit />}
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, footer, children }) {
  return (
    <section className="surface" style={{ padding: 24, marginBottom: 16 }}>
      <header style={{ marginBottom: 18 }}>
        <h2 className="h-section" style={{ marginBottom: 4 }}>{title}</h2>
        {desc && <p className="body" style={{ margin: 0 }}>{desc}</p>}
      </header>
      {children}
      {footer && (
        <footer style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-2)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {footer}
        </footer>
      )}
    </section>
  );
}

function SettingsProfile({ data }) {
  return (
    <>
      <Card
        title="Profile"
        desc="Your personal account information, visible to teammates."
        footer={<><button className="btn btn-ghost">Cancel</button><button className="btn btn-primary">Save changes</button></>}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-2)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--mint)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>AK</div>
          <div>
            <button className="btn btn-secondary btn-sm">Upload photo</button>
            <span className="caption" style={{ marginLeft: 10 }}>JPG, PNG up to 2MB.</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full name"     defaultValue="Aarti Khanna" />
          <Field label="Display name"  defaultValue="aarti" />
          <Field label="Work email"    defaultValue="aarti@indus.co" type="email" />
          <Field label="Phone"         defaultValue="+91 98203 21441" />
          <Field label="Role"          defaultValue="Treasury operations" />
          <Field label="Time zone"     defaultValue="Asia/Kolkata (UTC+05:30)" />
        </div>
      </Card>
    </>
  );
}

function SettingsOrg({ data }) {
  return (
    <Card
      title="Organisation"
      desc="Shared by everyone in your workspace. Only admins can edit."
      footer={<><button className="btn btn-ghost">Cancel</button><button className="btn btn-primary">Save changes</button></>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Field label="Legal name"   defaultValue="Indus Treasury Services Pvt Ltd" />
        <Field label="Workspace ID" defaultValue="ws_indus_2u8q" mono readonly />
        <Field label="Country"      defaultValue="India" />
        <Field label="Tax / GSTIN"  defaultValue="27AABCI4551L1ZX" mono />
        <Field label="Primary currency" defaultValue="INR · ₹" />
        <Field label="Reporting calendar" defaultValue="Apr–Mar (IN FY)" />
      </div>

      <h3 className="h-card" style={{ marginBottom: 8 }}>Default routing</h3>
      <p className="body" style={{ marginBottom: 12 }}>Lynqx will route new payments through these channels unless overridden.</p>
      <div className="surface-2" style={{ padding: 12 }}>
        {[
          { type: 'NEFT / RTGS / IMPS', bank: 'HDFC Bank · ****8821' },
          { type: 'Cross-border SWIFT', bank: 'Citi · ****0042' },
          { type: 'Collections',        bank: 'ICICI · ****5510' },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
            <window.Icon.Branch size={14} style={{ color: 'var(--fg-2)', marginRight: 10 }} />
            <span style={{ fontSize: 13, fontWeight: 500, width: 200 }}>{r.type}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', flex: 1 }}>{r.bank}</span>
            <button className="btn btn-ghost btn-sm">Change</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsTeam() {
  const team = [
    { name: 'Aarti Khanna',  email: 'aarti@indus.co',     role: 'Owner',      lastActive: 'Now' },
    { name: 'Rohan Mehra',   email: 'rohan@indus.co',     role: 'Admin',      lastActive: '12m ago' },
    { name: 'Lin Chen',      email: 'lin@indus.co',       role: 'Treasurer',  lastActive: '4h ago' },
    { name: 'Kiran Pillai',  email: 'kiran@indus.co',     role: 'Developer',  lastActive: 'Yesterday' },
    { name: 'Maya Iyer',     email: 'maya@indus.co',      role: 'Viewer',     lastActive: '3 days ago' },
  ];
  return (
    <Card
      title="Team & roles"
      desc="Invite teammates and manage their access. RBAC scopes follow least-privilege."
      footer={<button className="btn btn-primary"><window.Icon.Plus size={13} /> Invite teammate</button>}
    >
      <table className="dt">
        <thead>
          <tr><th>Name</th><th>Role</th><th>Last active</th><th></th></tr>
        </thead>
        <tbody>
          {team.map(t => (
            <tr key={t.email}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="avatar">{t.name.split(' ').map(s => s[0]).join('').slice(0,2)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.email}</div>
                  </div>
                </div>
              </td>
              <td><span className={`tag ${t.role === 'Owner' ? 'tag-lime' : 'tag-neutral'}`}>{t.role}</span></td>
              <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{t.lastActive}</span></td>
              <td style={{ textAlign: 'right' }}>
                <button className="icon-btn"><window.Icon.Settings size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SettingsSecurity() {
  return (
    <>
      <Card title="Authentication" desc="How you and your team sign in.">
        <ToggleRow label="Two-factor authentication" desc="Required for all admin accounts. TOTP & WebAuthn supported." defaultOn />
        <ToggleRow label="SSO via SAML" desc="indus.co · last sync 4h ago" defaultOn />
        <ToggleRow label="Enforce SSO for all users" desc="Block password login. Requires verified domain." />
        <ToggleRow label="Session timeout" desc="Sign out idle sessions after 30 minutes" defaultOn />
      </Card>
      <Card title="Network" desc="Restrict access by IP range. Lynqx supports allow-lists per environment.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Field label="Production IP allow-list" defaultValue="103.21.244.0/22, 198.41.128.0/17" mono />
          <Field label="Staging IP allow-list"    defaultValue="0.0.0.0/0 (open)" mono />
        </div>
        <div className="caption">Last enforcement event: 14:02 IST · 0 blocked requests today.</div>
      </Card>
    </>
  );
}

function SettingsNotifications() {
  const rows = [
    { label: 'Payment settled',           channels: ['email','slack','webhook'] },
    { label: 'Statement received',        channels: ['email','webhook'] },
    { label: 'Connection failure',        channels: ['email','slack','webhook','sms'] },
    { label: 'API quota threshold (80%)', channels: ['email','slack'] },
    { label: 'Audit event (admin only)',  channels: ['email'] },
  ];
  const all = ['email','slack','webhook','sms'];
  return (
    <Card title="Notifications" desc="Pick how Lynqx routes events to your team.">
      <table className="dt">
        <thead>
          <tr><th>Event</th>{all.map(c => <th key={c} style={{ textAlign: 'center', textTransform: 'uppercase' }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <td style={{ fontWeight: 500 }}>{r.label}</td>
              {all.map(c => (
                <td key={c} style={{ textAlign: 'center' }}>
                  <CheckboxStatic checked={r.channels.includes(c)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SettingsBilling({ data }) {
  return (
    <>
      <Card title="Plan" desc="You are on the Growth plan, billed monthly.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 18, background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)' }}>
          <div style={{ width: 4, height: 56, background: 'var(--lime)', borderRadius: 999 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-1)' }}>Growth</div>
            <div className="caption">Unlimited banks · 250k API calls · 5 environments</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }}>$1,499 <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 400 }}>/mo</span></div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 6 }}>Upgrade plan</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
          <Usage label="API calls"       used={184502} total={250000} />
          <Usage label="Webhooks fired"  used={8421}    total={50000} />
          <Usage label="Connected banks" used={4}       total={'∞'} />
        </div>
      </Card>
      <Card title="Payment method" desc="Visa ending 4242 · expires 09/27">
        <button className="btn btn-secondary btn-sm">Update card</button>
      </Card>
    </>
  );
}

function Usage({ label, used, total }) {
  const pct = typeof total === 'number' ? Math.min((used/total)*100, 100) : 50;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="caption">{label}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
          {used.toLocaleString()} / {typeof total === 'number' ? total.toLocaleString() : total}
        </span>
      </div>
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function SettingsCompliance() {
  const items = [
    { name: 'SOC 2 Type II',     state: 'active', date: 'Renewed 2025-03-12', icon: 'Shield' },
    { name: 'ISO 27001',         state: 'active', date: 'Renewed 2024-11-04', icon: 'Shield' },
    { name: 'PCI DSS Level 1',   state: 'active', date: 'Renewed 2025-01-20', icon: 'Lock' },
    { name: 'RBI Data Localisation', state: 'active', date: 'Asia-South-1 region', icon: 'Globe' },
    { name: 'GDPR / DPDP',       state: 'active', date: 'DPO appointed', icon: 'Lock' },
  ];
  return (
    <Card title="Compliance" desc="Lynqx maintains the following certifications and frameworks.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {items.map(it => {
          const I = window.Icon[it.icon];
          return (
            <div key={it.name} className="surface-2" style={{ padding: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <I size={18} style={{ color: 'var(--lime-dk)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
                <div className="caption" style={{ fontFamily: 'var(--font-mono)' }}>{it.date}</div>
              </div>
              <span className="tag tag-success" style={{ marginLeft: 'auto', height: 18, fontSize: 10 }}>Active</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SettingsAudit() {
  const events = [
    { t: '14:02:03', who: 'aarti@indus.co', action: 'Generated API key', target: 'sk_live_AfX2…', ip: '103.21.244.18' },
    { t: '13:48:21', who: 'rohan@indus.co', action: 'Updated webhook',   target: '/lynqx/events',   ip: '103.21.244.21' },
    { t: '12:17:55', who: 'kiran@indus.co', action: 'Linked account',    target: 'ICICI · pending', ip: '103.21.244.43' },
    { t: '09:02:11', who: 'system',         action: 'Statement fetched', target: 'HDFC · MT940',    ip: 'lynqx-edge-3' },
    { t: 'Yesterday',who: 'aarti@indus.co', action: 'Invited teammate',  target: 'maya@indus.co',   ip: '103.21.244.18' },
  ];
  return (
    <Card title="Audit log" desc="Tamper-evident, exportable, retained 7 years.">
      <table className="dt">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>Source IP</th></tr></thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td><span className="mono" style={{ fontSize: 12 }}>{e.t}</span></td>
              <td><span style={{ fontWeight: 500 }}>{e.who}</span></td>
              <td>{e.action}</td>
              <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{e.target}</span></td>
              <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{e.ip}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── Field / Toggle / Checkbox helpers ────────────────────────────────────
function Field({ label, defaultValue, type = 'text', mono, readonly }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input
        className="field"
        type={type}
        defaultValue={defaultValue}
        readOnly={readonly}
        style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: mono ? 12.5 : 13 }}
      />
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-2)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-1)' }}>{label}</div>
        <div className="caption" style={{ marginTop: 2 }}>{desc}</div>
      </div>
      <button className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(o => !o)} aria-pressed={on}>
        <span className="knob" />
      </button>
    </div>
  );
}

function CheckboxStatic({ checked }) {
  return (
    <span style={{
      display: 'inline-flex', width: 16, height: 16,
      border: '1.5px solid ' + (checked ? 'var(--lime-dk)' : 'var(--border-strong)'),
      background: checked ? 'var(--lime-dk)' : 'transparent',
      borderRadius: 3,
      alignItems: 'center', justifyContent: 'center',
      color: 'white',
    }}>
      {checked && <window.Icon.Check size={11} strokeWidth={3} />}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  DEVELOPER CONSOLE — API keys, logs, webhooks
// ──────────────────────────────────────────────────────────────────────────
function DevConsoleScreen({ data, initialTab }) {
  const [tab, setTab] = React.useState(initialTab || 'keys');
  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <div className="slide-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Developer console</div>
          <h1 className="h-display">API & integrations</h1>
          <p className="body" style={{ marginTop: 6 }}>Keys, logs, and webhooks for the Lattice Pay sandbox and live environments.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><window.Icon.Doc size={14} /> API docs</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> Generate key</button>
        </div>
      </div>

      <div className="tabbar" style={{ marginBottom: 20 }}>
        {[
          { id: 'keys',     label: 'API keys' },
          { id: 'logs',     label: 'Request logs' },
          { id: 'webhooks', label: 'Webhooks' },
          { id: 'sdk',      label: 'SDK & quickstart' },
          { id: 'docs',     label: 'API docs' },
        ].map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'keys'     && <DevKeys     data={data} />}
      {tab === 'logs'     && <DevLogs     data={data} />}
      {tab === 'webhooks' && <DevWebhooks data={data} />}
      {tab === 'sdk'      && <DevSdk />}
      {tab === 'docs'     && <window.DocsInline />}
    </div>
  );
}

function DevKeys({ data }) {
  const [reveal, setReveal] = React.useState({});
  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <table className="dt">
        <thead>
          <tr>
            <th>Label</th><th>Key</th><th>Scope</th><th>Created</th><th>Last used</th><th></th>
          </tr>
        </thead>
        <tbody>
          {data.dev.apiKeys.map(k => {
            const isRev = reveal[k.id];
            const env = k.label === 'staging' ? 'tag-info' : 'tag-success';
            return (
              <tr key={k.id}>
                <td>
                  <span className="tag" style={{ background: k.label === 'staging' ? 'var(--info-soft)' : 'var(--success-soft)', color: k.label === 'staging' ? 'var(--info)' : 'var(--success)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {k.label}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-1)' }}>
                      {k.prefix}{isRev ? '_rest_of_key_redacted_in_prototype' : k.masked}
                    </span>
                    <button className="icon-btn" onClick={() => setReveal(r => ({ ...r, [k.id]: !r[k.id] }))} aria-label="Reveal" style={{ width: 24, height: 24 }}>
                      {isRev ? <window.Icon.EyeOff size={13} /> : <window.Icon.Eye size={13} />}
                    </button>
                    <button className="icon-btn" aria-label="Copy" style={{ width: 24, height: 24 }}><window.Icon.Copy size={13} /></button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {k.scope.map(s => <span key={s} className="tag tag-neutral" style={{ height: 18, fontSize: 10 }}>{s}</span>)}
                  </div>
                </td>
                <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{k.created}</span></td>
                <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{k.lastUsed}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm">Rotate</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Revoke</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: 14, borderTop: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface-2)' }}>
        <window.Icon.Shield size={14} style={{ color: 'var(--fg-2)' }} />
        <span className="caption" style={{ flex: 1 }}>Keys are shown only once on creation. Lynqx stores them hashed; rotate every 90 days.</span>
        <button className="btn btn-secondary btn-sm">Key policy</button>
      </div>
    </div>
  );
}

function DevLogs({ data }) {
  const [env, setEnv] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(null);
  const filt = data.dev.logs.filter(l =>
    (env === 'all' || l.env === env) &&
    (!q || l.path.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 420 }}>
          <window.Icon.Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }} />
          <input className="field" style={{ paddingLeft: 32 }} placeholder="Filter by path or status…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="tabs">
          {['all','live','test'].map(e => <button key={e} className={env === e ? 'active' : ''} onClick={() => setEnv(e)}>{e}</button>)}
        </div>
        <span className="caption" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{filt.length} requests · auto-refresh 5s</span>
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr><th style={{ width: 100 }}>Time</th><th style={{ width: 78 }}>Method</th><th>Path</th><th style={{ width: 80 }}>Status</th><th style={{ width: 80 }}>Latency</th><th style={{ width: 70 }}>Env</th></tr>
          </thead>
          <tbody>
            {filt.map((l, i) => {
              const s = l.status, sCls = s < 300 ? 'tag-success' : s < 400 ? 'tag-info' : s < 500 ? 'tag-warn' : 'tag-danger';
              const mCol = { GET: 'var(--info)', POST: 'var(--lime-dk)', DELETE: 'var(--danger)', PUT: 'var(--warn)' }[l.method] || 'var(--fg-2)';
              return (
                <tr key={i} onClick={() => setSel(l)} style={{ cursor: 'pointer' }}>
                  <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{l.time}</span></td>
                  <td><span className="mono" style={{ fontSize: 11, fontWeight: 600, color: mCol, letterSpacing: 0.5 }}>{l.method}</span></td>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{l.path}</span></td>
                  <td><span className={`tag ${sCls}`} style={{ height: 20 }}>{s}</span></td>
                  <td><span className="mono" style={{ fontSize: 12, color: l.ms > 200 ? 'var(--warn)' : 'var(--fg-2)' }}>{l.ms}ms</span></td>
                  <td><span className="tag tag-neutral" style={{ height: 18, fontSize: 10, fontFamily: 'var(--font-mono)' }}>{l.env}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sel && (
        <>
          <div className="drawer-overlay" onClick={() => setSel(null)} />
          <aside className="drawer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderBottom: '1px solid var(--border-1)' }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: 13, color: 'var(--lime-dk)' }}>{sel.method}</span>
              <span className="mono" style={{ fontSize: 13 }}>{sel.path}</span>
              <span className={`tag ${sel.status < 400 ? 'tag-success' : 'tag-warn'}`} style={{ marginLeft: 'auto' }}>{sel.status}</span>
              <button className="icon-btn" onClick={() => setSel(null)}><window.Icon.X size={16} /></button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              <Row2 label="Request ID" value="req_8YTQ2plk_99XX" />
              <Row2 label="Time"       value={`${sel.time} IST`} />
              <Row2 label="Duration"   value={`${sel.ms}ms`} />
              <Row2 label="Environment"value={sel.env} />
              <Row2 label="API key"    value="sk_live_AfX2…" />

              <div style={{ marginTop: 16, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="eyebrow">Request body</div>
                <button className="icon-btn" style={{ width: 24, height: 24 }}><window.Icon.Copy size={12} /></button>
              </div>
              <pre className="code-block">{`{
  "${'amount'.padEnd(8)}": ${'8420000'},
  "${'currency'.padEnd(8)}": "INR",
  "${'channel'.padEnd(8)}": "rtgs",
  "${'source'.padEnd(8)}": "acc_8821",
  "${'beneficiary'.padEnd(8)}": {
    "name": "Voltaire Logistics",
    "ifsc": "ICIC0001234",
    "account": "00540210000231"
  }
}`}</pre>

              <div style={{ marginTop: 16, marginBottom: 6 }} className="eyebrow">Response · {sel.status}</div>
              <pre className="code-block">{`{
  "id": "p_77a8_kQp",
  "status": "${sel.status === 200 ? 'accepted' : 'pending'}",
  "rail":   "rtgs",
  "route":  "sap → lynqx → hdfc",
  "eta":    "T+0h"
}`}</pre>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Row2({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid var(--border-2)', fontSize: 13 }}>
      <span style={{ width: 110, fontSize: 11.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-1)' }}>{value}</span>
    </div>
  );
}

function DevWebhooks({ data }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead><tr><th>Endpoint</th><th>Events</th><th>p95</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.dev.webhooks.map((w, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ fontSize: 12.5 }}>{w.url}</span></td>
                <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{w.events}</span></td>
                <td><span className="mono" style={{ fontSize: 12, color: w.p95.includes('892') ? 'var(--warn)' : 'var(--fg-2)' }}>{w.p95}</span></td>
                <td><span className={`tag ${w.status === 'healthy' ? 'tag-success' : 'tag-warn'}`}>{w.status}</span></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-ghost btn-sm">Configure</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="surface" style={{ padding: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Subscribed events</div>
        <h3 className="h-card" style={{ marginBottom: 14 }}>16 events · across 2 endpoints</h3>
        {[
          'payments.created','payments.settled','payments.failed',
          'statements.received','statements.partial',
          'accounts.linked','accounts.unlinked','quota.threshold',
        ].map(e => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-2)' }}>
            <span className="dot" style={{ background: 'var(--lime)', marginRight: 10 }} />
            <span className="mono" style={{ fontSize: 12.5 }}>{e}</span>
            <span className="caption" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{Math.floor(Math.random() * 30) + 4}/h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevSdk() {
  const [lang, setLang] = React.useState('node');
  const samples = {
    node: `import Lynqx from '@lynqx/node';

const lynqx = new Lynqx({ apiKey: process.env.LYNQX_KEY });

// Create a payment from your SAP system → HDFC
const payment = await lynqx.payments.create({
  amount:      8_420_000,           // paise / cents
  currency:    'INR',
  channel:     'rtgs',
  source:      'acc_8821',          // your HDFC account
  beneficiary: {
    name:    'Voltaire Logistics',
    ifsc:    'ICIC0001234',
    account: '00540210000231',
  },
});

console.log(payment.status); // 'accepted'`,
    python: `import lynqx

client = lynqx.Client(api_key=os.environ["LYNQX_KEY"])

payment = client.payments.create(
    amount=8_420_000,
    currency="INR",
    channel="rtgs",
    source="acc_8821",
    beneficiary={
        "name":    "Voltaire Logistics",
        "ifsc":    "ICIC0001234",
        "account": "00540210000231",
    },
)
print(payment.status)  # 'accepted'`,
    curl: `curl -X POST https://api.lynqx.io/v1/payments \\
  -H "Authorization: Bearer $LYNQX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":      8420000,
    "currency":    "INR",
    "channel":     "rtgs",
    "source":      "acc_8821",
    "beneficiary": {
      "name":    "Voltaire Logistics",
      "ifsc":    "ICIC0001234",
      "account": "00540210000231"
    }
  }'`
  };

  // syntax-tinted version
  const tint = (code) => code
    .replace(/(\/\/.*)/g, '<span class="tk-cmt">$1</span>')
    .replace(/(#.*)/g, '<span class="tk-cmt">$1</span>')
    .replace(/'([^']*)'/g, '<span class="tk-str">\'$1\'</span>')
    .replace(/"([^"]*)"/g, '<span class="tk-str">"$1"</span>')
    .replace(/\b(\d[\d_]*)\b/g, '<span class="tk-num">$1</span>')
    .replace(/\b(import|from|const|new|await|async|print|process|env)\b/g, '<span class="tk-key">$1</span>')
    .replace(/(\bawait\s+)?(lynqx\.[a-z.]+)/g, '$1<span class="tk-fn">$2</span>');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface-2)' }}>
            <div className="tabs" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              {['node','python','curl'].map(l => (
                <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>{l}</button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}><window.Icon.Copy size={12} /> Copy</button>
          </div>
          <pre className="code-block" style={{ borderRadius: 0, margin: 0 }} dangerouslySetInnerHTML={{ __html: tint(samples[lang]) }} />
        </div>
      </div>

      <div>
        <div className="surface" style={{ padding: 18, marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Quickstart</div>
          <h3 className="h-card" style={{ marginBottom: 14 }}>5-minute setup</h3>
          {[
            { n: 1, label: 'Generate an API key', sub: 'Use the staging key first', done: true },
            { n: 2, label: 'Install the SDK',     sub: 'npm install @lynqx/node',   done: true },
            { n: 3, label: 'Make your first call',sub: 'POST /v1/payments',         done: true },
            { n: 4, label: 'Subscribe to webhooks',sub: 'Required for production',  done: false },
            { n: 5, label: 'Switch to live key',  sub: 'After review by your bank', done: false },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                background: s.done ? 'var(--lime)' : 'transparent',
                border: s.done ? 'none' : '1px solid var(--border-strong)',
                color: s.done ? 'var(--forest)' : 'var(--fg-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>{s.done ? <window.Icon.Check size={12} /> : s.n}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                <div className="caption" style={{ fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="surface" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Embedded UI</div>
          <h3 className="h-card" style={{ marginBottom: 8 }}>Drop-in account linking</h3>
          <p className="body" style={{ marginBottom: 12 }}>Render Lynqx's bank-link widget inside your own product — no PCI scope, full white-label.</p>
          <pre className="code-block" style={{ fontSize: 11.5 }}>{`<script src="https://js.lynqx.io/v1.js"></script>
<button onclick="Lynqx.link({ token: ... })">
  Link bank account
</button>`}</pre>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
//  BANK CUSTOMER LIST (used when persona = bank)
// ──────────────────────────────────────────────────────────────────────────
function BankCustomersScreen({ data }) {
  return (
    <div style={{ padding: 24, maxWidth: 1500 }}>
      <div className="slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>HDFC · Lynqx Hub</div>
          <h1 className="h-display">Customers</h1>
          <p className="body" style={{ marginTop: 6 }}>Track per-customer usage, channels, and SLAs across {data.bank.customers.length} live tenants.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><window.Icon.Download size={14} /> Export</button>
          <button className="btn btn-primary"><window.Icon.Plus size={14} /> Onboard customer</button>
        </div>
      </div>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="dt">
          <thead>
            <tr>
              <th>Customer</th><th>Plan</th><th>Accounts</th><th style={{ textAlign: 'right' }}>API calls (30d)</th><th style={{ textAlign: 'right' }}>Volume</th><th>Error rate</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.bank.customers.map(c => (
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
    </div>
  );
}

window.SettingsScreen      = SettingsScreen;
window.DevConsoleScreen    = DevConsoleScreen;
window.BankCustomersScreen = BankCustomersScreen;
