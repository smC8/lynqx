"use client";
import { useState, useEffect, useRef } from "react";

export type WFStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowResult {
  status: WFStatus;
  summary?: string;
  cardData?: unknown;
}

export function useWorkflowResult(workflowId?: string): WorkflowResult {
  const [result, setResult] = useState<WorkflowResult>({ status: "idle" });
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!workflowId) return;
    setResult({ status: "running" });
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/status/${workflowId}`).then(r => r.json()) as {
          status: string;
          result?: { summary?: string; cardData?: unknown };
        };
        if (res.status === "completed") {
          setResult({ status: "completed", summary: res.result?.summary, cardData: res.result?.cardData });
          clearInterval(intervalRef.current);
        } else if (res.status === "failed") {
          setResult({ status: "failed" });
          clearInterval(intervalRef.current);
        }
      } catch { /* ignore transient errors */ }
    }, 1500);
    return () => clearInterval(intervalRef.current);
  }, [workflowId]);

  return result;
}
