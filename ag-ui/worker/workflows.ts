import { proxyActivities } from "@temporalio/workflow";
import type * as Acts from "./activities";

const acts = proxyActivities<typeof Acts>({ startToCloseTimeout: "5 minutes" });

interface InvestigationInput {
  query: string;
  workflowId?: string;
  cardType?: string;
  timeRange?: { start: string; end: string };
  services?: string[];
  createTicket?: boolean;
}

export async function copilotInvestigation(
  input: InvestigationInput
): Promise<{ summary: string; cardData?: unknown }> {
  const workflowId = input.workflowId ?? "unknown";
  const cardType = input.cardType ?? "BankDiagnostic";

  await acts.notifyStep(workflowId, "Querying SigNoz", "running");
  const obsData = await acts.querySignozForCard({ ...input, workflowId, cardType });
  await acts.notifyStep(workflowId, "Querying SigNoz", "done");

  await acts.notifyStep(workflowId, "Structuring analysis", "running");
  const result = await acts.analyzeAndStructure(input.query, cardType, obsData);
  await acts.notifyStep(workflowId, "Structuring analysis", "done");

  await acts.notifyStep(workflowId, "Complete", "done");
  return result;
}
