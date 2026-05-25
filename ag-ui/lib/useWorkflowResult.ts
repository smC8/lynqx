"use client";
import { useState, useEffect, useRef } from "react";

export type WFStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowStep {
  step: string;
  status: "running" | "done" | "error";
  timestamp: string;
}

export interface WorkflowResult {
  status: WFStatus;
  summary?: string;
  cardData?: unknown;
  steps: WorkflowStep[];
  currentStep?: string;
}

export function useWorkflowResult(workflowId?: string): WorkflowResult {
  const [result, setResult] = useState<WorkflowResult>({ status: "idle", steps: [] });
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!workflowId) return;
    setResult({ status: "running", steps: [] });
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/status/${workflowId}`).then(r => r.json()) as {
          status: string;
          steps?: WorkflowStep[];
          result?: { summary?: string; cardData?: unknown };
        };
        const steps = res.steps ?? [];
        const currentStep = steps.findLast?.(s => s.status === "running")?.step;
        if (res.status === "completed") {
          setResult({ status: "completed", summary: res.result?.summary, cardData: res.result?.cardData, steps, currentStep });
          clearInterval(intervalRef.current);
        } else if (res.status === "failed") {
          setResult({ status: "failed", steps, currentStep });
          clearInterval(intervalRef.current);
        } else {
          setResult(prev => ({ ...prev, status: "running", steps, currentStep }));
        }
      } catch { /* ignore transient errors */ }
    }, 600);
    return () => clearInterval(intervalRef.current);
  }, [workflowId]);

  return result;
}
