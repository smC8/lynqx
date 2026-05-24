import { ReactNode } from "react";
import AgentBadge from "./AgentBadge";
import { Icon } from "@/components/shell/Icons";

interface Props {
  children: ReactNode;
  summary?: ReactNode;
  sources?: ReactNode;
  footerActions?: ReactNode;
  dense?: boolean;
}

export default function AgentCard({ children, summary, sources, footerActions, dense }: Props) {
  return (
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
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "linear-gradient(180deg, var(--lime), var(--lime-dk))",
        }}
      />

      <div
        style={{
          padding: dense ? "14px 16px 12px" : "16px 18px 14px",
          borderBottom: "1px solid var(--border-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: summary ? 6 : 0,
          }}
        >
          <AgentBadge />
          {sources && (
            <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.4 }}>
              · sourced from {sources}
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
        {summary && (
          <div style={{ fontSize: 13, color: "var(--fg-1)", lineHeight: 1.55 }}>{summary}</div>
        )}
      </div>

      <div style={{ padding: dense ? 14 : 18 }}>{children}</div>

      {footerActions && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border-2)",
            background: "var(--bg-surface-2)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {footerActions}
        </div>
      )}
    </div>
  );
}
