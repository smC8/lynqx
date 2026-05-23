// Shell components — Sidebar, Header, CommandPalette
// (hooks accessed as React.* to avoid global-scope collisions across babel scripts)
const { useState, useEffect, useRef, useMemo } = React; // eslint-disable-line

// ── Logo ─────────────────────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', height: 56 }}>
      <div style={{ width: 8, height: 22, background: 'var(--lime)', borderRadius: 1 }} />
      {!collapsed && (
        <span style={{
          fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px',
          color: 'var(--fg-on-dark)', fontFamily: 'var(--font-sans)'
        }}>lynqx</span>
      )}
      {!collapsed && (
        <span className="mono" style={{
          marginLeft: 'auto', fontSize: 9, color: 'var(--fg-on-dark-3)',
          letterSpacing: 1.5, textTransform: 'uppercase',
          padding: '2px 6px', border: '1px solid var(--border-rail)', borderRadius: 3,
        }}>v2.4</span>
      )}
    </div>
  );
}

// ── Workspace switcher ──────────────────────────────────────────────────
function WorkspaceSwitcher({ workspaces, current, onChange, collapsed }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ws = workspaces.find(w => w.id === current) || workspaces[0];
  const Ic = window.Icon[ws.icon] || window.Icon.Building;

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', padding: '0 8px 12px', borderBottom: '1px solid var(--border-rail)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          background: open ? 'rgba(159,232,112,0.08)' : 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-rail)',
          borderRadius: 'var(--r-md)',
          color: 'var(--fg-on-dark)',
          transition: 'background 140ms ease',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{
          width: 26, height: 26, flexShrink: 0,
          borderRadius: 6,
          background: ws.color,
          color: '#1A1A4E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic size={14} />
        </span>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-on-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.label}</div>
              <div style={{ fontSize: 10.5, color: 'var(--fg-on-dark-3)', fontFamily: 'var(--font-mono)', letterSpacing: 0.4 }}>{ws.sub}</div>
            </div>
            <window.Icon.Chevron size={14} style={{ color: 'var(--fg-on-dark-3)', transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 160ms ease' }} />
          </>
        )}
      </button>

      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: '100%', left: 8, right: 8, marginTop: 4,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-pop)',
          zIndex: 30, padding: 4,
        }}>
          {workspaces.map(w => {
            const I = window.Icon[w.icon] || window.Icon.Building;
            const active = w.id === current;
            return (
              <button
                key={w.id}
                role="option"
                aria-selected={active}
                onClick={() => { onChange(w.id); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--r-sm)',
                  background: active ? 'var(--hover-wash)' : 'transparent',
                  color: 'var(--fg-1)',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hover-wash)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 24, height: 24, borderRadius: 5, background: w.color, color: '#1A1A4E', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <I size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-1)' }}>{w.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', letterSpacing: 0.4 }}>{w.sub}</div>
                </div>
                {active && <window.Icon.Check size={14} style={{ color: 'var(--lime)' }} />}
              </button>
            );
          })}
          <div style={{ height: 1, background: 'var(--border-2)', margin: '4px 0' }} />
          <button style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px',
            borderRadius: 'var(--r-sm)',
            color: 'var(--fg-2)', fontSize: 12.5,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-wash)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <window.Icon.Plus size={14} />
            New workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────
const NAV_BY_PERSONA = {
  exec: [
    { section: 'Operate', items: [
      { id: 'overview',  label: 'Overview',     icon: 'Home' },
      { id: 'copilot',   label: 'Copilot',      icon: 'Wand', badge: 'AI' },
      { id: 'accounts',  label: 'Accounts',     icon: 'Wallet' },
      { id: 'transactions', label: 'Transactions', icon: 'Activity' },
      { id: 'statements', label: 'Statements',   icon: 'Doc' },
      { id: 'accountlink', label: 'Link account', icon: 'Link' },
      { id: 'bankops',   label: 'Operations',   icon: 'Plug' },
    ]},
    { section: 'Develop', items: [
      { id: 'devconsole', label: 'Developer',   icon: 'Code' },
    ]},
    { section: 'Configure', items: [
      { id: 'marketplace', label: 'Marketplace', icon: 'Grid' },
      { id: 'team',        label: 'Team',        icon: 'Users' },
      { id: 'settings',    label: 'Settings',    icon: 'Settings' },
    ]},
  ],
  bank: [
    { section: 'Operate', items: [
      { id: 'overview', label: 'Overview',  icon: 'Home' },
      { id: 'copilot',  label: 'Copilot',   icon: 'Wand', badge: 'AI' },
      { id: 'bankops',  label: 'Operations',icon: 'Activity' },
    ]},
    { section: 'Configure', items: [
      { id: 'marketplace', label: 'Marketplace', icon: 'Grid' },
      { id: 'team',        label: 'Team',        icon: 'Users' },
      { id: 'settings',    label: 'Settings',    icon: 'Settings' },
    ]},
  ],
  dev: [
    { section: 'Develop', items: [
      { id: 'overview',  label: 'Overview',  icon: 'Home' },
      { id: 'copilot',   label: 'Copilot',   icon: 'Wand', badge: 'AI' },
      { id: 'devconsole',label: 'Developer', icon: 'Code' },
    ]},
    { section: 'Configure', items: [
      { id: 'marketplace', label: 'Marketplace',    icon: 'Grid' },
      { id: 'accountlink', label: 'Account linking', icon: 'Link' },
      { id: 'settings',    label: 'Settings',        icon: 'Settings' },
    ]},
  ],
};

function Sidebar({ persona, route, setRoute, collapsed, workspaces, currentWs, setCurrentWs }) {
  const groups = NAV_BY_PERSONA[persona] || NAV_BY_PERSONA.exec;
  return (
    <aside
      style={{
        width: collapsed ? 'var(--rail-w-collapsed)' : 'var(--rail-w)',
        background: 'var(--bg-rail)',
        color: 'var(--fg-on-dark)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid var(--border-rail)',
        transition: 'width 240ms cubic-bezier(.2,.8,.2,1)',
        overflow: 'hidden',
      }}
      aria-label="Primary navigation"
    >
      <Logo collapsed={collapsed} />
      {!collapsed && (
        <WorkspaceSwitcher
          workspaces={workspaces}
          current={currentWs}
          onChange={setCurrentWs}
          collapsed={collapsed}
        />
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0', marginTop: 4 }}>
        {groups.map((g, gi) => (
          <div key={gi}>
            {!collapsed && <div className="rail-section-label">{g.section}</div>}
            {g.items.map(it => {
              const I = window.Icon[it.icon] || window.Icon.Dot;
              const active = route === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setRoute(it.id)}
                  className={`rail-item ${active ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? it.label : undefined}
                >
                  <I size={16} />
                  {!collapsed && <span>{it.label}</span>}
                  {!collapsed && it.badge && (
                    <span className="tag tag-lime" style={{ marginLeft: 'auto', height: 18, fontSize: 10 }}>{it.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Help / status pinned at bottom */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border-rail)' }}>
        {!collapsed ? (
          <div style={{
            background: 'rgba(159,232,112,0.06)',
            border: '1px solid var(--border-rail)',
            borderRadius: 'var(--r-md)',
            padding: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="dot dot-live" />
              <span style={{ fontSize: 11.5, color: 'var(--lime)', fontWeight: 600, letterSpacing: 0.3 }}>All systems normal</span>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-on-dark-3)', letterSpacing: 0.4 }}>
              99.98% · 142ms p95
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="dot dot-live" />
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Header ─────────────────────────────────────────────────────────────
function Header({ title, onToggleSidebar, onCmdK, theme, setTheme, breadcrumb, persona }) {
  const personaPill = {
    exec: { label: 'Executive', color: '#9FE870' },
    bank: { label: 'Bank ops',  color: '#C0C8FF' },
    dev:  { label: 'Developer', color: '#D0D0F8' },
  }[persona] || { label: 'Executive', color: '#9FE870' };

  return (
    <header
      style={{
        height: 'var(--header-h)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--bg-surface)',
        zIndex: 5,
      }}
      role="banner"
    >
      <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle navigation">
        <window.Icon.Logs size={16} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.2,
          color: 'var(--fg-3)', textTransform: 'uppercase'
        }}>{breadcrumb}</span>
        <window.Icon.Chevron size={12} style={{ color: 'var(--fg-4)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.1px' }}>{title}</span>
      </div>

      {/* Spacer / cmd-k */}
      <button
        onClick={onCmdK}
        style={{
          marginLeft: 16,
          height: 30, padding: '0 10px',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--fg-3)',
          fontSize: 12.5, minWidth: 280,
          transition: 'border-color 160ms ease, background 160ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
        aria-label="Open command palette"
      >
        <window.Icon.Search size={14} />
        <span>Search · jump to · run command…</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          <span className="kbd">⌘</span><span className="kbd">K</span>
        </span>
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="tag" style={{ background: personaPill.color + '33', color: 'var(--fg-1)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: personaPill.color }} />
          {personaPill.label}
        </span>
        <button className="icon-btn" aria-label="Notifications">
          <window.Icon.Bell size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <window.Icon.Sun size={16} /> : <window.Icon.Moon size={16} />}
        </button>
        <button className="icon-btn" aria-label="Help">
          <window.Icon.Help size={16} />
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border-1)', margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="avatar">AK</span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)' }}>Aarti Khanna</div>
            <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>Treasury ops</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Command palette ─────────────────────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate, persona, setTheme, theme, setPersona }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const COMMANDS = useMemo(() => {
    const navItems = (NAV_BY_PERSONA[persona] || NAV_BY_PERSONA.exec).flatMap(g =>
      g.items.map(it => ({ kind: 'Navigate', label: it.label, hint: g.section, action: () => onNavigate(it.id), icon: it.icon }))
    );
    return [
      ...navItems,
      { kind: 'Action', label: 'Toggle theme',          hint: theme === 'dark' ? 'Light' : 'Dark', action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), icon: 'Moon' },
      { kind: 'Action', label: 'Switch to executive',   hint: 'Persona',  action: () => setPersona('exec'), icon: 'Building' },
      { kind: 'Action', label: 'Switch to bank ops',    hint: 'Persona',  action: () => setPersona('bank'), icon: 'Bank' },
      { kind: 'Action', label: 'Switch to developer',   hint: 'Persona',  action: () => setPersona('dev'),  icon: 'Code' },
      { kind: 'Action', label: 'Generate API key',      hint: 'Developer', action: () => onNavigate('devconsole'), icon: 'Key' },
      { kind: 'Action', label: 'Open API docs',         hint: 'Developer', action: () => onNavigate('docs'), icon: 'Doc' },
      { kind: 'Action', label: 'Connect HDFC',          hint: 'Marketplace', action: () => onNavigate('accountlink'), icon: 'Bank' },
      { kind: 'Action', label: 'Invite teammate',       hint: 'Team',     action: () => onNavigate('team'), icon: 'Users' },
    ];
  }, [persona, theme, onNavigate, setTheme, setPersona]);

  const filtered = useMemo(() => {
    if (!q) return COMMANDS;
    const ql = q.toLowerCase();
    return COMMANDS.filter(c => c.label.toLowerCase().includes(ql) || c.hint.toLowerCase().includes(ql));
  }, [q, COMMANDS]);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      else if (e.key === 'Enter')     { e.preventDefault(); const c = filtered[sel]; if (c) { c.action(); onClose(); } }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, sel, onClose]);

  if (!open) return null;

  // Group filtered by kind
  const grouped = filtered.reduce((acc, c, i) => {
    if (!acc[c.kind]) acc[c.kind] = [];
    acc[c.kind].push({ ...c, _i: i });
    return acc;
  }, {});

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="Type a command or search…"
          value={q}
          onChange={e => { setQ(e.target.value); setSel(0); }}
          aria-label="Command input"
        />
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '6px 0' }}>
          {Object.entries(grouped).map(([kind, items]) => (
            <div key={kind}>
              <div className="cmdk-section">{kind}</div>
              {items.map(c => {
                const I = window.Icon[c.icon] || window.Icon.Dot;
                const isSel = c._i === sel;
                return (
                  <div
                    key={c._i}
                    className={`cmdk-row ${isSel ? 'sel' : ''}`}
                    onMouseEnter={() => setSel(c._i)}
                    onClick={() => { c.action(); onClose(); }}
                  >
                    <span style={{ color: 'var(--fg-2)' }}><I size={15} /></span>
                    <span style={{ color: 'var(--fg-1)' }}>{c.label}</span>
                    <span style={{ color: 'var(--fg-3)', fontSize: 11.5, marginLeft: 6, fontFamily: 'var(--font-mono)' }}>{c.hint}</span>
                    {isSel && <window.Icon.ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--fg-3)' }} />}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px 18px', color: 'var(--fg-3)', fontSize: 13 }}>No matches.</div>
          )}
        </div>
        <div className="cmdk-foot">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="kbd">↑</span><span className="kbd">↓</span> navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="kbd">↵</span> select
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="kbd">esc</span> close
          </span>
          <span style={{ marginLeft: 'auto' }}>Lynqx · v2.4</span>
        </div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.Header = Header;
window.CommandPalette = CommandPalette;
window.NAV_BY_PERSONA = NAV_BY_PERSONA;
