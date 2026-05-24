"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icons";
import { WORKSPACES, type WorkspaceDef } from "@/lib/workspaces";
import type { WorkspaceId } from "@/lib/types";

interface Props {
  current: WorkspaceId;
  onChange: (id: WorkspaceId) => void;
}

export default function WorkspaceSwitcher({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ws: WorkspaceDef = WORKSPACES.find((w) => w.id === current) ?? WORKSPACES[0];
  const WsIcon = (Icon as Record<string, React.ComponentType<{ size?: number }>>)[ws.icon] ?? Icon.Building;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", padding: "0 8px 12px", borderBottom: "1px solid var(--border-rail)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          background: open ? "rgba(159,232,112,0.08)" : "rgba(255,255,255,0.03)",
          border: "1px solid var(--border-rail)",
          borderRadius: "var(--r-md)",
          color: "var(--fg-on-dark)",
          cursor: "pointer",
          transition: "background 140ms ease",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          style={{
            width: 26,
            height: 26,
            flexShrink: 0,
            borderRadius: 6,
            background: ws.color,
            color: "#1A1A4E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WsIcon size={14} />
        </span>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--fg-on-dark)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ws.label}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "var(--fg-on-dark-3)",
              fontFamily: "var(--font-mono)",
              letterSpacing: 0.4,
            }}
          >
            {ws.sub}
          </div>
        </div>
        <Icon.Chevron
          size={14}
          style={{
            color: "var(--fg-on-dark-3)",
            transform: open ? "rotate(90deg)" : "rotate(0)",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 8,
            right: 8,
            marginTop: 4,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-1)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-pop)",
            zIndex: 30,
            padding: 4,
          }}
        >
          {WORKSPACES.map((w) => {
            const WIcon = (Icon as Record<string, React.ComponentType<{ size?: number }>>)[w.icon] ?? Icon.Building;
            const active = w.id === current;
            return (
              <button
                key={w.id}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(w.id as WorkspaceId);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: "var(--r-sm)",
                  background: active ? "var(--hover-wash)" : "transparent",
                  color: "var(--fg-1)",
                  cursor: "pointer",
                  border: "none",
                  transition: "background 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--hover-wash)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    background: w.color,
                    color: "#1A1A4E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WIcon size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-1)" }}>{w.label}</div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--fg-3)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: 0.4,
                    }}
                  >
                    {w.sub}
                  </div>
                </div>
                {active && <Icon.Check size={14} style={{ color: "var(--lime)" }} />}
              </button>
            );
          })}
          <div style={{ height: 1, background: "var(--border-2)", margin: "4px 0" }} />
          <button
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: "var(--r-sm)",
              color: "var(--fg-2)",
              fontSize: 12.5,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-wash)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon.Plus size={14} />
            New workspace
          </button>
        </div>
      )}
    </div>
  );
}
