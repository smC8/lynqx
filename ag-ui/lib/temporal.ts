import { Connection, Client, WorkflowHandle } from "@temporalio/client";

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (client) return client;
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const connection = await Connection.connect({ address });
  client = new Client({ connection });
  return client;
}

export async function startWorkflow(
  workflowType: string,
  input: Record<string, unknown>,
  workflowId?: string
): Promise<string> {
  const c = await getClient();
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE ?? "copilot-agents";
  const id = workflowId ?? `${workflowType}-${Date.now()}`;
  const handle = await c.workflow.start(workflowType, {
    taskQueue,
    args: [input],
    workflowId: id,
  });
  return handle.workflowId;
}

export async function describeWorkflow(
  workflowId: string
): Promise<{ status: string; runId?: string }> {
  const c = await getClient();
  const handle: WorkflowHandle = c.workflow.getHandle(workflowId);
  const desc = await handle.describe();
  const status = desc.status.name.toLowerCase();
  return { status, runId: desc.runId };
}

export async function getWorkflowResult(
  workflowId: string
): Promise<unknown> {
  const c = await getClient();
  const handle: WorkflowHandle = c.workflow.getHandle(workflowId);
  return handle.result();
}
