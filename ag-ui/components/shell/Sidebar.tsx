"use client";

import { Icon } from "./Icons";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { NAV_BY_WORKSPACE } from "@/lib/workspaces";
import type { WorkspaceId } from "@/lib/types";

interface Props {
  activeWorkspace: WorkspaceId;
  onWorkspaceChange: (id: WorkspaceId) => void;
  activeRoute: string;
  onRouteChange: (id: string) => void;
}

export default function Sidebar({ activeWorkspace, onWorkspaceChange, activeRoute, onRouteChange }: Props) {
  const groups = NAV_BY_WORKSPACE[activeWorkspace] ?? NAV_BY_WORKSPACE.exec;

  return (
    <aside
      style={{
        width: "var(--rail-w)",
        background: "var(--bg-rail)",
        color: "var(--fg-on-dark)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid var(--border-rail)",
        overflow: "hidden",
      }}
      aria-label="Primary navigation"
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", height: 56 }}>
        <div style={{ width: 8, height: 22, background: "var(--lime)", borderRadius: 1 }} />
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.4px",
            color: "var(--fg-on-dark)",
            fontFamily: "var(--font-sans)",
          }}
        >
          lynqx
        </span>
        <span
          className="mono"
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "var(--fg-on-dark-3)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "2px 6px",
            border: "1px solid var(--border-rail)",
            borderRadius: 3,
          }}
        >
          v2.4
        </span>
      </div>

      <WorkspaceSwitcher current={activeWorkspace} onChange={onWorkspaceChange} />

      <nav style={{ flex: 1, overflowY: "auto", padding: "4px 0", marginTop: 4 }}>
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="rail-section-label">{g.section}</div>
            {g.items.map((it) => {
              const NavIcon = (Icon as Record<string, React.ComponentType<{ size?: number }>>)[it.icon] ?? Icon.Dot;
              const active = activeRoute === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => onRouteChange(it.id)}
                  className={`rail-item${active ? " active" : ""}`}
                  style={{ width: "100%" }}
                  aria-current={active ? "page" : undefined}
                >
                  <NavIcon size={16} />
                  <span>{it.label}</span>
                  {it.badge && (
                    <span className="tag tag-lime" style={{ marginLeft: "auto", height: 18, fontSize: 10 }}>
                      {it.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status pill */}
      <div style={{ padding: 12, borderTop: "1px solid var(--border-rail)" }}>
        <div
          style={{
            background: "rgba(159,232,112,0.06)",
            border: "1px solid var(--border-rail)",
            borderRadius: "var(--r-md)",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="dot dot-live" />
            <span style={{ fontSize: 11.5, color: "var(--lime)", fontWeight: 600, letterSpacing: 0.3 }}>
              All systems normal
            </span>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-on-dark-3)", letterSpacing: 0.4 }}>
            99.98% · 142ms p95
          </div>
        </div>
      </div>
    </aside>
  );
}
