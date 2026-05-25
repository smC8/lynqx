"use client";
import React from "react";
import { defineRegistry } from "@json-render/react";
import { lynqxCatalog } from "./catalog";
import { Icon } from "@/components/shell/Icons";
import AgentBadge from "@/components/copilot/AgentBadge";

const BAR_COLORS = ["var(--lime)", "var(--lime-dk)", "var(--info)", "#7AB8FF", "var(--amber)"];

export const { registry, handlers, executeAction } = defineRegistry(lynqxCatalog, {
  components: {
    // ─── Card shell ────────────────────────────────────────────────────────────
    CardShell: ({ props, children }) => (
      <div
        className="slide-up"
        style={{
          position: "relative",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
          marginBottom: 28,
        }}
      >
        {/* Lime accent stripe */}
        <span
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 3,
            background: "linear-gradient(180deg, var(--lime), var(--lime-dk))",
          }}
        />

        {/* Header */}
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--border-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: props.summary ? 6 : 0 }}>
            <AgentBadge />
            {props.sources && (
              <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.4 }}>
                · sourced from {String(props.sources)}
              </span>
            )}
            {!props.summary && props.title && (
              <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.4 }}>
                · {String(props.title)}
              </span>
            )}
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 4 }}>
              <button className="icon-btn" style={{ width: 24, height: 24 }} title="Copy">
                <Icon.Copy size={12} />
              </button>
              <button className="icon-btn" style={{ width: 24, height: 24 }} title="Regenerate">
                <Icon.Refresh size={12} />
              </button>
            </span>
          </div>
          {props.summary && (
            <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.55 }}>
              {String(props.summary)}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    ),

    // ─── Card footer (bleeds to card edges) ────────────────────────────────────
    CardFooter: ({ children }) => (
      <div
        style={{
          margin: "10px -18px -18px",
          padding: "10px 16px",
          borderTop: "1px solid var(--border-2)",
          background: "var(--bg-surface-2)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {children}
      </div>
    ),

    // ─── 3-column big-number stats ─────────────────────────────────────────────
    MetricGrid: ({ props }) => {
      type Col = { label: string; value: string; accent?: string };
      const columns = (props.columns as Col[]) ?? [];
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, 1fr)`,
            gap: 16,
            marginBottom: 16,
          }}
        >
          {columns.map((col, i) => (
            <div key={i}>
              <div
                className="mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--fg-3)",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {col.label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
                  color:
                    col.accent === "warning" ? "var(--amber)"
                    : col.accent === "danger" ? "var(--danger)"
                    : col.accent === "success" ? "var(--lime-dk)"
                    : col.accent === "info" ? "var(--info)"
                    : "var(--fg-1)",
                }}
              >
                {col.value}
              </div>
            </div>
          ))}
        </div>
      );
    },

    // ─── 2-column label / value grid ───────────────────────────────────────────
    FieldGrid: ({ props }) => {
      type Row = { label: string; value: string; mono?: boolean; bold?: boolean; tag?: string };
      const rows = (props.rows as Row[]) ?? [];
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            rowGap: 10,
            columnGap: 16,
            fontSize: 13,
          }}
        >
          {rows.map((row, i) => (
            <React.Fragment key={i}>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--fg-3)",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  alignSelf: "center",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: row.mono ? "var(--font-mono)" : "var(--font-sans)",
                  fontWeight: row.bold ? 600 : 400,
                  fontSize: row.mono ? 12 : 13,
                }}
              >
                {row.tag ? (
                  <span className={`tag tag-${row.tag}`} style={{ fontSize: 11.5 }}>
                    {row.value}
                  </span>
                ) : (
                  row.value
                )}
              </span>
            </React.Fragment>
          ))}
        </div>
      );
    },

    // ─── Inline tag badge ──────────────────────────────────────────────────────
    TagBadge: ({ props }) => (
      <span
        className={`tag tag-${props.variant ?? "neutral"}`}
        style={{ fontSize: 11.5 }}
      >
        {String(props.label)}
      </span>
    ),

    // ─── Horizontal stacked bar ────────────────────────────────────────────────
    StackedBar: ({ props }) => {
      type Seg = { label: string; pct: number; color?: string };
      const segments = (props.segments as Seg[]) ?? [];
      if (segments.length === 0) return null;
      return (
        <div style={{ marginBottom: 12 }}>
          {props.label && (
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                letterSpacing: 0.5,
                color: "var(--fg-3)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {String(props.label)}
            </div>
          )}
          <div
            style={{
              display: "flex",
              height: 28,
              borderRadius: 4,
              overflow: "hidden",
              background: "var(--bg-sunken)",
            }}
          >
            {segments.map((s, i) => (
              <div
                key={i}
                title={`${s.label} · ${s.pct.toFixed(0)}%`}
                style={{
                  width: `${s.pct}%`,
                  background: s.color ?? BAR_COLORS[i % BAR_COLORS.length],
                  borderRight: i < segments.length - 1 ? "1px solid var(--bg-surface)" : "none",
                  transition: "width 0.4s ease",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {segments.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: s.color ?? BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },

    // ─── Legacy row (keep for existing specs) ──────────────────────────────────
    MetricRow: ({ props }) => {
      const mono = props.valueStyle === "mono";
      const danger = props.valueStyle === "danger";
      const success = props.valueStyle === "success";
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            columnGap: 16,
            padding: "7px 0",
            borderBottom: "1px solid var(--border-1)",
            fontSize: 13,
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase", alignSelf: "center" }}
          >
            {props.label}
          </span>
          <span
            style={{
              color: danger ? "var(--danger)" : success ? "var(--lime-dk)" : "var(--fg-1)",
              fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
              fontSize: mono ? 12 : 13,
              fontWeight: 500,
            }}
          >
            {props.value}
          </span>
        </div>
      );
    },

    StatusBadge: ({ props }) => (
      <span className={`tag tag-${props.variant}`} style={{ fontSize: 11, letterSpacing: 0.3 }}>
        {String(props.label)}
      </span>
    ),

    ProgressStep: ({ props }) => {
      const isRunning = props.status === "running";
      const isDone = props.status === "done";
      const isError = props.status === "error";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
          <span
            style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: isDone ? "var(--lime-dk)" : isError ? "var(--danger)" : isRunning ? "var(--lime)" : "var(--border-strong)",
              animation: isRunning ? "lx-pulse 1s ease-in-out infinite" : "none",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: 12,
              color: isDone ? "var(--fg-2)" : isRunning ? "var(--fg-1)" : "var(--fg-3)",
              letterSpacing: 0.3,
            }}
          >
            {isDone ? `✓ ${String(props.label)}` : String(props.label)}
          </span>
        </div>
      );
    },

    ActionButton: ({ props, emit }) => (
      <button
        className={`btn btn-${props.variant === "ghost" ? "ghost" : props.variant} btn-sm`}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
        style={props.disabled ? { opacity: 0.5, pointerEvents: "none" } : {}}
      >
        {String(props.label)}
      </button>
    ),

    SectionHeader: ({ props }) => (
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        {props.eyebrow && (
          <div className="eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>
            {String(props.eyebrow)}
          </div>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-2)" }}>{String(props.title)}</div>
      </div>
    ),

    CodeBlock: ({ props }) => (
      <pre
        style={{
          background: "var(--bg-sunken)",
          border: "1px solid var(--border-1)",
          borderRadius: "var(--r-md)",
          padding: "12px 14px",
          overflowX: "auto",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "var(--fg-1)",
          margin: "8px 0",
        }}
      >
        <code>{String(props.code)}</code>
      </pre>
    ),

    BarList: ({ props }) => {
      type BarItem = { label: string; subtitle?: string; value: string; pct: number; accent?: "success" | "warning" | "danger"; tag?: string };
      const items = (props.items as BarItem[]) ?? [];
      return (
        <div>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 56px 72px",
                alignItems: "center",
                columnGap: 14,
                padding: "10px 0",
                borderBottom: i < items.length - 1 ? "1px solid var(--border-1)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-1)", lineHeight: 1.3 }}>
                  {item.label}
                </div>
                {item.subtitle && (
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.3, marginTop: 2 }}>
                    {item.subtitle}
                  </div>
                )}
              </div>
              <div style={{ background: "var(--bg-sunken)", borderRadius: 3, height: 7, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(item.pct, 100)}%`,
                    height: "100%",
                    borderRadius: 3,
                    background:
                      item.accent === "danger" ? "var(--danger)"
                      : item.accent === "warning" ? "var(--amber)"
                      : "var(--lime-dk)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div
                className="mono"
                style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)", fontVariantNumeric: "tabular-nums", textAlign: "right" }}
              >
                {item.value}
              </div>
              {item.tag && (
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "right", letterSpacing: 0.3 }}>
                  {item.tag}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },

    Spacer: ({ props }) => {
      const h = props.size === "lg" ? 20 : props.size === "sm" ? 6 : 12;
      return <div style={{ height: h }} />;
    },
  },

  actions: {
    approvePayment: async (_params, _setState) => {
      // Implemented in A2UICard via custom ActionProvider handlers
    },
    cancelPayment: async (_params, _setState) => {
      // Implemented in A2UICard via custom ActionProvider handlers
    },
    retryWorkflow: async (_params, _setState) => {
      // Implemented in A2UICard via custom ActionProvider handlers
    },
  },
});
