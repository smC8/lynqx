import { Icon } from "@/components/shell/Icons";

const NODES = [
  { label: "Natural language", sub: "user intent",         icon: "Wand" },
  { label: "CopilotKit",       sub: "frontend",            icon: "Sparkle" },
  { label: "AG-UI ⇄ Zigflow",  sub: "agent backend",       icon: "Branch" },
  { label: "Lynqx API",        sub: "payments · balances", icon: "Plug" },
  { label: "Generative UI",    sub: "rendered card",       icon: "Layers" },
];

export default function ArchitectureStrip() {
  return (
    <div className="surface-2" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            color: "var(--fg-3)",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            marginRight: 6,
          }}
        >
          How it runs
        </span>
        {NODES.map((n, i, arr) => {
          const NodeIcon = (Icon as Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>>)[n.icon] ?? Icon.Dot;
          return (
            <span key={i} style={{ display: "contents" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-1)",
                  borderRadius: 6,
                }}
              >
                <NodeIcon size={13} style={{ color: "var(--lime-dk)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-1)" }}>{n.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", letterSpacing: 0.4 }}>
                    {n.sub}
                  </div>
                </div>
              </div>
              {i < arr.length - 1 && <Icon.ArrowRight size={11} style={{ color: "var(--fg-3)" }} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
