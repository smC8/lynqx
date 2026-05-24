import { NextRequest } from "next/server";

export interface AgentStep {
  step: string;
  status: "running" | "done" | "error";
  timestamp: string;
}

// Module-level map: workflowId → step history
const stateMap = new Map<string, AgentStep[]>();

export function getSteps(workflowId: string): AgentStep[] {
  return stateMap.get(workflowId) ?? [];
}

export const POST = async (req: NextRequest) => {
  const body = await req.json() as { workflowId: string; step: string; status: string; timestamp?: string };
  const { workflowId, step, status, timestamp } = body;
  if (!workflowId || !step) {
    return new Response(JSON.stringify({ error: "workflowId and step required" }), { status: 400 });
  }
  const entry: AgentStep = { step, status: status as AgentStep["status"], timestamp: timestamp ?? new Date().toISOString() };
  const existing = stateMap.get(workflowId) ?? [];
  stateMap.set(workflowId, [...existing, entry]);
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
};
