import { NextRequest } from "next/server";

const TEMPORAL_AVAILABLE = Boolean(process.env.TEMPORAL_ADDRESS);

export const POST = async (req: NextRequest) => {
  const body = await req.json() as { workflowType?: string; input: Record<string, unknown> };
  // Temporal resolves by exported function name (camelCase), not kebab alias
  const rawType = body.workflowType ?? "copilot-investigation";
  const workflowType = rawType.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const input = body.input ?? {};

  if (!TEMPORAL_AVAILABLE) {
    // Demo: return a mock workflowId; state-update will drive the UI
    const workflowId = `${workflowType}-demo-${Date.now()}`;
    // Simulate state progression asynchronously via fetch to state-update
    simulateDemoWorkflow(workflowId, input).catch(() => {});
    return new Response(JSON.stringify({ workflowId, status: "started" }), {
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { startWorkflow } = await import("@/lib/temporal");
    // Pre-compute the workflowId so the workflow can use it for state-update callbacks
    const workflowId = `${workflowType}-${Date.now()}`;
    await startWorkflow(workflowType, { ...input, workflowId }, workflowId);
    return new Response(JSON.stringify({ workflowId, status: "started" }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Temporal unavailable: ${msg}` }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
};

async function simulateDemoWorkflow(workflowId: string, input: Record<string, unknown>) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const post = (step: string, status: string) =>
    fetch(`${appUrl}/api/agent/state-update`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workflowId, step, status, timestamp: new Date().toISOString() }),
    }).catch(() => {});

  await delay(400);
  await post("Querying observability data", "running");
  await delay(1200);
  await post("Querying observability data", "done");
  await post("Analyzing with Claude", "running");
  await delay(1500);
  await post("Analyzing with Claude", "done");
  await post("Complete", "done");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
