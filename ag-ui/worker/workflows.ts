import { proxyActivities, defineSignal, setHandler } from "@temporalio/workflow";
import type * as Acts from "./activities";

const acts = proxyActivities<typeof Acts>({
  startToCloseTimeout: "5 minutes",
});

interface InvestigationInput {
  query: string;
  workflowId?: string;
  timeRange?: { start: string; end: string };
  services?: string[];
  createTicket?: boolean;
}

export async function copilotInvestigation(input: InvestigationInput): Promise<{ summary: string }> {
  const workflowId = input.workflowId ?? "unknown";

  await acts.notifyStep(workflowId, "Querying observability data", "running");
  const obsData = await acts.querySignoz({ ...input, workflowId });
  await acts.notifyStep(workflowId, "Querying observability data", "done");

  await acts.notifyStep(workflowId, "Analyzing with Claude", "running");
  const summary = await acts.analyzeWithClaude(input.query, obsData);
  await acts.notifyStep(workflowId, "Analyzing with Claude", "done");

  await acts.notifyStep(workflowId, "Complete", "done");

  return { summary };
}
