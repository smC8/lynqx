import { Icon } from "@/components/shell/Icons";

interface Props {
  label?: string;
  icon?: keyof typeof Icon;
}

export default function AgentBadge({ label = "Generated", icon = "Wand" }: Props) {
  const I = (Icon as Record<string, React.ComponentType<{ size?: number }>>)[icon] ?? Icon.Wand;
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "var(--lime-dk)",
        padding: "2px 7px",
        background: "rgba(159,232,112,0.14)",
        border: "1px solid rgba(159,232,112,0.32)",
        borderRadius: 999,
      }}
    >
      <I size={10} /> {label}
    </span>
  );
}
