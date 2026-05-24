import AgentCard from "./AgentCard";
import MiniStat from "./MiniStat";

interface Props {
  query: string;
}

export default function GenericStubCard({ query }: Props) {
  return (
    <AgentCard
      summary={
        <>
          I&apos;d plan this as a multi-step agent run: <em>resolve entities</em> →{" "}
          <em>query Lynqx data layer</em> → <em>render component</em>. Wire me to your sandbox to see the live
          response — I&apos;ll fall through to a structured card here.
        </>
      }
      sources="stub · no data layer attached"
      footerActions={
        <>
          <button className="btn btn-secondary btn-sm">Connect sandbox</button>
          <button className="btn btn-ghost btn-sm">Edit prompt</button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MiniStat label="Resolved entities" value="—" />
        <MiniStat label="API calls planned" value="—" />
        <MiniStat label="Render target" value="card" mono={false} />
      </div>
      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: "var(--bg-sunken)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "var(--fg-2)",
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            color: "var(--fg-3)",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginRight: 8,
          }}
        >
          Prompt
        </span>
        {query}
      </div>
    </AgentCard>
  );
}
