"use client";
import React from "react";
import { defineRegistry } from "@json-render/react";
import { lynqxCatalog } from "./catalog";
import { Icon } from "@/components/shell/Icons";
import AgentBadge from "@/components/copilot/AgentBadge";
import { resolveSpecTokens } from "./a2ui";
import type { LynqxSpec } from "./a2ui";

const BAR_COLORS = ["var(--lime)", "var(--lime-dk)", "var(--info)", "#7AB8FF", "var(--amber)"];

// ─── Primitive kernel ───────────────────────────────────────────────────────────
// ~10 raw HTML primitives that stay in code permanently.
// Every named component ABOVE this level can be a JSON spec over these primitives
// and stored in a Supabase `components` table — zero deploys required for new types.

type PP = { props: Record<string, unknown>; children?: React.ReactNode; emit?: (event: string) => void };

// PRIMITIVES is populated after StoredRenderer is defined (mutual recursion via PList)
const PRIMITIVES: Record<string, React.FC<PP>> = {};

// ─── Stored-component runtime ───────────────────────────────────────────────────

// Item-level token resolver for PList templates.
// Uses @fieldName sigil (NOT $field) so component-level resolveSpecTokens leaves them untouched.
// Falls back to "" (empty) so PText can hide missing optional fields.
function resolveItemTokens(value: unknown, item: Record<string, unknown>): unknown {
  if (typeof value === "string") {
    if (/^@[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      const raw = item[value.slice(1)];
      return raw !== undefined && raw !== null ? raw : "";
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(v => resolveItemTokens(v, item));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveItemTokens(v, item)])
    );
  }
  return value;
}

// Recursively render a stored-component spec using only PRIMITIVES.
// `$slot` child ID is replaced with the component's passed `children` (slot support).
function StoredRenderer({
  spec, id, emit, slotChildren,
}: {
  spec: LynqxSpec;
  id?: string;
  emit?: (event: string) => void;
  slotChildren?: React.ReactNode;
}): React.ReactElement | null {
  const nodeId = id ?? spec.root;
  const el = spec.elements[nodeId];
  if (!el) return null;
  const Comp = PRIMITIVES[el.type];
  if (!Comp) return null;

  const childNodes = el.children?.map(childId => {
    if (childId === "$slot") return slotChildren;
    return <StoredRenderer key={childId} spec={spec} id={childId} emit={emit} slotChildren={slotChildren} />;
  });

  return <Comp props={el.props ?? {}} emit={emit}>{childNodes}</Comp>;
}

// Factory: turns a LynqxSpec (storable in Supabase `components`) into a registry component.
// Component's own props resolve $token strings inside the spec (e.g. $label → props.label).
// Slot children are threaded in via $slot child references.
export function createStoredComponent(componentSpec: LynqxSpec) {
  return ({
    props = {},
    children,
    emit,
  }: {
    props?: Record<string, unknown>;
    children?: React.ReactNode;
    emit?: (event: string) => void;
  }) => {
    const resolved = resolveSpecTokens(componentSpec, String(props.summary ?? ""), props) as LynqxSpec;
    for (const el of Object.values(resolved.elements)) {
      if (!el.props) el.props = {};
    }
    return <StoredRenderer spec={resolved} emit={emit} slotChildren={children} />;
  };
}

// ─── Populate primitives (after StoredRenderer is defined) ─────────────────────

Object.assign(PRIMITIVES, {
  // CSS-grid container
  PGrid: ({ props, children }: PP) => (
    <div style={{
      display: "grid",
      gridTemplateColumns: String(props.columns ?? "1fr"),
      columnGap:    props.columnGap  != null ? Number(props.columnGap)  : props.gap != null ? Number(props.gap) : undefined,
      rowGap:       props.rowGap     != null ? Number(props.rowGap)     : props.gap != null ? Number(props.gap) : undefined,
      gap:          props.columnGap == null && props.rowGap == null && props.gap != null ? Number(props.gap) : undefined,
      alignItems:   props.alignItems   ? String(props.alignItems)   : undefined,
      padding:      props.padding      ? String(props.padding)      : undefined,
      borderBottom: props.borderBottom ? String(props.borderBottom) : undefined,
      fontSize:     props.fontSize != null ? Number(props.fontSize) : undefined,
      marginBottom: props.marginBottom != null ? Number(props.marginBottom) : undefined,
    }}>
      {children}
    </div>
  ),

  // Flexbox container
  PFlex: ({ props, children }: PP) => (
    <div style={{
      display:        "flex",
      flexDirection:  props.direction    as React.CSSProperties["flexDirection"] ?? "row",
      alignItems:     props.alignItems   ? String(props.alignItems)   : undefined,
      justifyContent: props.justifyContent ? String(props.justifyContent) : undefined,
      gap:            props.gap    != null ? Number(props.gap)    : undefined,
      flexWrap:       props.flexWrap     as React.CSSProperties["flexWrap"],
      padding:        props.padding      ? String(props.padding)      : undefined,
      margin:         props.margin       ? String(props.margin)       : undefined,
      marginTop:      props.marginTop    != null ? Number(props.marginTop)    : undefined,
      marginBottom:   props.marginBottom != null ? Number(props.marginBottom) : undefined,
      borderTop:      props.borderTop    ? String(props.borderTop)    : undefined,
      borderBottom:   props.borderBottom ? String(props.borderBottom) : undefined,
      background:     props.background   ? String(props.background)   : undefined,
      height:         props.height       ? String(props.height)       : undefined,
      borderRadius:   props.borderRadius ? String(props.borderRadius) : undefined,
      overflow:       props.overflow     ? String(props.overflow)     : undefined,
    }}>
      {children}
    </div>
  ),

  // Generic div — for wrappers, containers with overflow/background
  PBox: ({ props, children }: PP) => (
    <div style={{
      display:      props.display      ? String(props.display)      : undefined,
      background:   props.background   ? String(props.background)   : undefined,
      borderRadius: props.borderRadius ? String(props.borderRadius) : undefined,
      height:       props.height       ? String(props.height)       : undefined,
      overflow:     props.overflow     ? String(props.overflow)     : undefined,
      padding:      props.padding      ? String(props.padding)      : undefined,
      margin:       props.margin       ? String(props.margin)       : undefined,
      marginTop:    props.marginTop    != null ? Number(props.marginTop)    : undefined,
      marginBottom: props.marginBottom != null ? Number(props.marginBottom) : undefined,
      lineHeight:   props.lineHeight   != null ? Number(props.lineHeight)   : undefined,
    }}>
      {children}
    </div>
  ),

  // Text span — with design-system styleVariant shorthand
  PText: ({ props }: PP) => {
    const content = String(props.content ?? "");
    if (!content) return null; // hide empty / unresolved optional fields
    const variant = String(props.styleVariant ?? "");
    const variantStyle: React.CSSProperties =
      variant === "danger"  ? { color: "var(--danger)" } :
      variant === "success" ? { color: "var(--lime-dk)" } :
      variant === "mono"    ? { fontFamily: "var(--font-mono)", fontSize: 12 } :
      {};
    return (
      <span style={{
        display:       props.display       as React.CSSProperties["display"],
        fontSize:      props.fontSize      != null ? Number(props.fontSize)      : undefined,
        color:         props.color         ? String(props.color)         : undefined,
        fontFamily:    props.fontFamily    ? String(props.fontFamily)    : undefined,
        fontWeight:    props.fontWeight    != null ? Number(props.fontWeight)    : undefined,
        letterSpacing: props.letterSpacing != null ? Number(props.letterSpacing) : undefined,
        textTransform: props.textTransform as React.CSSProperties["textTransform"],
        textAlign:     props.textAlign     as React.CSSProperties["textAlign"],
        alignSelf:     props.alignSelf     as string,
        marginTop:     props.marginTop     != null ? Number(props.marginTop)     : undefined,
        lineHeight:    props.lineHeight    != null ? Number(props.lineHeight)    : undefined,
        ...variantStyle,
      }}>
        {content}
      </span>
    );
  },

  // Proportional fill bar — used inside BarList rows
  PBar: ({ props }: PP) => {
    const accent = String(props.accent ?? "");
    const bg =
      accent === "danger"  ? "var(--danger)" :
      accent === "warning" ? "var(--amber)"  :
      "var(--lime-dk)";
    return (
      <div style={{
        width: `${Math.min(Number(props.pct ?? 0), 100)}%`,
        height: "100%",
        borderRadius: 3,
        background: bg,
        transition: "width 0.5s ease",
      }} />
    );
  },

  // Inline colored badge — wraps the `tag tag-{variant}` CSS class
  PBadge: ({ props }: PP) => {
    const label = String(props.label ?? props.content ?? "");
    if (!label) return null;
    return (
      <span
        className={`tag tag-${props.variant ?? "neutral"}`}
        style={{ fontSize: props.fontSize != null ? Number(props.fontSize) : 11.5, letterSpacing: props.letterSpacing != null ? Number(props.letterSpacing) : undefined }}
      >
        {label}
      </span>
    );
  },

  // Clickable button that emits an event — threads emit from parent component
  PButton: ({ props, emit }: PP) => {
    const disabled = props.disabled === true;
    return (
      <button
        className={`btn btn-${props.variant ?? "secondary"} btn-sm`}
        disabled={disabled}
        onClick={() => emit?.("press")}
        style={disabled ? { opacity: 0.5, pointerEvents: "none" } : {}}
      >
        {String(props.label ?? "")}
      </button>
    );
  },

  // Vertical spacer — sm=6px md=12px lg=20px
  PSpacer: ({ props }: PP) => (
    <div style={{ height: props.size === "lg" ? 20 : props.size === "sm" ? 6 : 12 }} />
  ),

  // Monospace code block
  PCode: ({ props }: PP) => (
    <pre style={{
      background: "var(--bg-sunken)",
      border: "1px solid var(--border-1)",
      borderRadius: "var(--r-md)",
      padding: "12px 14px",
      overflowX: "auto",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      color: "var(--fg-1)",
      margin: "8px 0",
    }}>
      <code>{String(props.code ?? "")}</code>
    </pre>
  ),

  // List iterator — renders itemSpec once per item, resolving @fieldName tokens from each item
  PList: ({ props }: PP) => {
    const items = (props.items as Record<string, unknown>[]) ?? [];
    const itemSpec = props.itemSpec as LynqxSpec | undefined;
    if (!itemSpec || items.length === 0) return null;
    return (
      <div>
        {items.map((item, i) => {
          const resolved = resolveItemTokens(itemSpec, item) as LynqxSpec;
          for (const el of Object.values(resolved.elements)) {
            if (!el.props) el.props = {};
          }
          return <StoredRenderer key={i} spec={resolved} />;
        })}
      </div>
    );
  },
} satisfies Record<string, React.FC<PP>>);

// ─── Stored-component specs ─────────────────────────────────────────────────────
// These JSON objects are the source of truth. The same shape lives in the Supabase
// `components` table — at startup, `useDynamicRegistry` fetches rows and registers them,
// so adding a new component type requires only an INSERT, no code change.

const metricRowSpec: LynqxSpec = {
  root: "row",
  elements: {
    row: {
      type: "PGrid",
      props: { columns: "160px 1fr", columnGap: 16, padding: "7px 0", borderBottom: "1px solid var(--border-1)", fontSize: 13 },
      children: ["cell-label", "cell-value"],
    },
    "cell-label": {
      type: "PText",
      props: { content: "$label", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase", alignSelf: "center" },
    },
    "cell-value": {
      type: "PText",
      props: { content: "$value", styleVariant: "$valueStyle", fontWeight: 500 },
    },
  },
};

const cardFooterSpec: LynqxSpec = {
  root: "footer",
  elements: {
    footer: {
      type: "PFlex",
      props: { margin: "10px -18px -18px", padding: "10px 16px", borderTop: "1px solid var(--border-2)", background: "var(--bg-surface-2)", gap: 8, flexWrap: "wrap" },
      children: ["$slot"],
    },
  },
};

const statusBadgeSpec: LynqxSpec = {
  root: "badge",
  elements: {
    badge: { type: "PBadge", props: { label: "$label", variant: "$variant", fontSize: 11, letterSpacing: 0.3 } },
  },
};

const tagBadgeSpec: LynqxSpec = {
  root: "badge",
  elements: {
    badge: { type: "PBadge", props: { label: "$label", variant: "$variant", fontSize: 11.5 } },
  },
};

const actionButtonSpec: LynqxSpec = {
  root: "btn",
  elements: {
    btn: { type: "PButton", props: { label: "$label", variant: "$variant", disabled: "$disabled" } },
  },
};

const spacerSpec: LynqxSpec = {
  root: "s",
  elements: {
    s: { type: "PSpacer", props: { size: "$size" } },
  },
};

const codeBlockSpec: LynqxSpec = {
  root: "code",
  elements: {
    code: { type: "PCode", props: { code: "$code" } },
  },
};

// BarList: each item uses @token (item-level) resolved by PList, not component-level $token
const barListSpec: LynqxSpec = {
  root: "list",
  elements: {
    list: {
      type: "PList",
      props: {
        items: "$items",
        itemSpec: {
          root: "row",
          elements: {
            row: {
              type: "PGrid",
              props: { columns: "180px 1fr 56px 72px", columnGap: 14, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-1)" },
              children: ["label-col", "bar-wrap", "value-col", "tag-col"],
            },
            "label-col": { type: "PBox", props: {}, children: ["lbl-name", "lbl-sub"] },
            "lbl-name":  { type: "PText",  props: { content: "@label",    fontSize: 13,   fontWeight: 600, color: "var(--fg-1)", display: "block" } },
            "lbl-sub":   { type: "PText",  props: { content: "@subtitle", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.3, display: "block", marginTop: 2 } },
            "bar-wrap":  { type: "PBox",   props: { background: "var(--bg-sunken)", borderRadius: "3px", height: "7px", overflow: "hidden" }, children: ["bar-fill"] },
            "bar-fill":  { type: "PBar",   props: { pct: "@pct", accent: "@accent" } },
            "value-col": { type: "PText",  props: { content: "@value", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--fg-1)", textAlign: "right" } },
            "tag-col":   { type: "PText",  props: { content: "@tag",   fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.3, textAlign: "right" } },
          },
        },
      },
    },
  },
};

// Exported so dynamicRegistry can register fetched Supabase rows using the same factory
export const STORED_SPECS: Record<string, LynqxSpec> = {
  MetricRow:    metricRowSpec,
  CardFooter:   cardFooterSpec,
  StatusBadge:  statusBadgeSpec,
  TagBadge:     tagBadgeSpec,
  ActionButton: actionButtonSpec,
  Spacer:       spacerSpec,
  CodeBlock:    codeBlockSpec,
  BarList:      barListSpec,
};

// ─── Registry ──────────────────────────────────────────────────────────────────

function stored(spec: LynqxSpec) {
  return ({ props = {}, children, emit }: { props?: Record<string, unknown>; children?: React.ReactNode; emit?: (e: string) => void }) =>
    createStoredComponent(spec)({ props, children, emit });
}

export const { registry, handlers, executeAction } = defineRegistry(lynqxCatalog, {
  components: {
    // ─── Shell (kept in code — imports AgentBadge, Icon, has brand logic) ──────
    CardShell: ({ props, children }) => (
      <div
        className="slide-up"
        style={{ position: "relative", background: "var(--bg-surface)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: 28 }}
      >
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, var(--lime), var(--lime-dk))" }} />
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--border-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: props.summary ? 6 : 0 }}>
            <AgentBadge />
            {props.sources && <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.4 }}>· sourced from {String(props.sources)}</span>}
            {!props.summary && props.title && <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.4 }}>· {String(props.title)}</span>}
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 4 }}>
              <button className="icon-btn" style={{ width: 24, height: 24 }} title="Copy"><Icon.Copy size={12} /></button>
              <button className="icon-btn" style={{ width: 24, height: 24 }} title="Regenerate"><Icon.Refresh size={12} /></button>
            </span>
          </div>
          {props.summary && <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.55 }}>{String(props.summary)}</div>}
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    ),

    // ─── Kept in code (dynamic column count / conditional logic) ───────────────
    MetricGrid: ({ props }) => {
      type Col = { label: string; value: string; accent?: string };
      const columns = (props.columns as Col[]) ?? [];
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, 1fr)`, gap: 16, marginBottom: 16 }}>
          {columns.map((col, i) => (
            <div key={i}>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 }}>{col.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: col.accent === "warning" ? "var(--amber)" : col.accent === "danger" ? "var(--danger)" : col.accent === "success" ? "var(--lime-dk)" : col.accent === "info" ? "var(--info)" : "var(--fg-1)" }}>{col.value}</div>
            </div>
          ))}
        </div>
      );
    },

    FieldGrid: ({ props }) => {
      type Row = { label: string; value: string; mono?: boolean; bold?: boolean; tag?: string };
      const rows = (props.rows as Row[]) ?? [];
      return (
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 10, columnGap: 16, fontSize: 13 }}>
          {rows.map((row, i) => (
            <React.Fragment key={i}>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: 0.6, textTransform: "uppercase", alignSelf: "center" }}>{row.label}</span>
              <span style={{ fontFamily: row.mono ? "var(--font-mono)" : "var(--font-sans)", fontWeight: row.bold ? 600 : 400, fontSize: row.mono ? 12 : 13 }}>
                {row.tag ? <span className={`tag tag-${row.tag}`} style={{ fontSize: 11.5 }}>{row.value}</span> : row.value}
              </span>
            </React.Fragment>
          ))}
        </div>
      );
    },

    StackedBar: ({ props }) => {
      type Seg = { label: string; pct: number; color?: string };
      const segments = (props.segments as Seg[]) ?? [];
      if (segments.length === 0) return null;
      return (
        <div style={{ marginBottom: 12 }}>
          {props.label && <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--fg-3)", textTransform: "uppercase", marginBottom: 6 }}>{String(props.label)}</div>}
          <div style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", background: "var(--bg-sunken)" }}>
            {segments.map((s, i) => (
              <div key={i} title={`${s.label} · ${s.pct.toFixed(0)}%`} style={{ width: `${s.pct}%`, background: s.color ?? BAR_COLORS[i % BAR_COLORS.length], borderRight: i < segments.length - 1 ? "1px solid var(--bg-surface)" : "none", transition: "width 0.4s ease" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {segments.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color ?? BAR_COLORS[i % BAR_COLORS.length] }} />
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },

    ProgressStep: ({ props }) => {
      const isRunning = props.status === "running";
      const isDone    = props.status === "done";
      const isError   = props.status === "error";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: isDone ? "var(--lime-dk)" : isError ? "var(--danger)" : isRunning ? "var(--lime)" : "var(--border-strong)", animation: isRunning ? "lx-pulse 1s ease-in-out infinite" : "none" }} />
          <span className="mono" style={{ fontSize: 12, color: isDone ? "var(--fg-2)" : isRunning ? "var(--fg-1)" : "var(--fg-3)", letterSpacing: 0.3 }}>
            {isDone ? `✓ ${String(props.label)}` : String(props.label)}
          </span>
        </div>
      );
    },

    SectionHeader: ({ props }) => (
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        {props.eyebrow && <div className="eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>{String(props.eyebrow)}</div>}
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-2)" }}>{String(props.title)}</div>
      </div>
    ),

    // ─── Stored specs (JSON over primitives — same shape as Supabase rows) ──────
    MetricRow:    stored(metricRowSpec),
    CardFooter:   stored(cardFooterSpec),
    StatusBadge:  stored(statusBadgeSpec),
    TagBadge:     stored(tagBadgeSpec),
    ActionButton: stored(actionButtonSpec),
    Spacer:       stored(spacerSpec),
    CodeBlock:    stored(codeBlockSpec),
    BarList:      stored(barListSpec),
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
