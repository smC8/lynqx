export default function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0",
          borderBottom: i < rows - 1 ? "1px solid var(--border-2)" : "none" }}>
          <div style={{ width: 56, height: 11, background: "var(--bg-sunken)", borderRadius: 3,
            animation: "lx-pulse 1.4s ease-in-out infinite" }} />
          <div style={{ width: 20, height: 20, borderRadius: 999, background: "var(--bg-sunken)",
            animation: "lx-pulse 1.4s ease-in-out infinite" }} />
          <div style={{ flex: 1, height: 11, background: "var(--bg-sunken)", borderRadius: 3,
            animation: "lx-pulse 1.4s ease-in-out infinite" }} />
        </div>
      ))}
    </div>
  );
}
