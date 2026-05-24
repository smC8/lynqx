interface Props {
  text: string;
}

export default function PromptLine({ text }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          background: "var(--mint)",
          color: "var(--forest)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        AK
      </span>
      <div
        style={{
          flex: 1,
          padding: "8px 12px",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-2)",
          borderRadius: "var(--r-md)",
          fontSize: 13.5,
          color: "var(--fg-1)",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}
