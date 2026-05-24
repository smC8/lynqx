import { NextRequest } from "next/server";
import { getSteps } from "../../state-update/route";

const TEMPORAL_AVAILABLE = Boolean(process.env.TEMPORAL_ADDRESS);

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: workflowId } = await params;
  const steps = getSteps(workflowId);

  let workflowStatus = "running";
  let result: unknown = undefined;

  if (TEMPORAL_AVAILABLE) {
    try {
      const { describeWorkflow, getWorkflowResult } = await import("@/lib/temporal");
      const desc = await describeWorkflow(workflowId);
      workflowStatus = desc.status;
      if (workflowStatus === "completed") {
        result = await getWorkflowResult(workflowId);
      }
    } catch {
      // Temporal unreachable — derive from steps
    }
  }

  // Derive status from steps if Temporal not available
  if (!TEMPORAL_AVAILABLE) {
    const last = steps[steps.length - 1];
    if (!last) workflowStatus = "running";
    else if (last.status === "error") workflowStatus = "failed";
    else if (last.step === "Complete" && last.status === "done") workflowStatus = "completed";
    else workflowStatus = "running";
  }

  return new Response(
    JSON.stringify({ workflowId, status: workflowStatus, steps, result }),
    { headers: { "content-type": "application/json" } }
  );
};
