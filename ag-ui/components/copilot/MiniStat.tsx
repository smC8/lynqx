interface Props {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}

export default function MiniStat({ label, value, mono = true, accent }: Props) {
  return (
    <div>
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
        {label}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: accent ?? "var(--fg-1)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}
