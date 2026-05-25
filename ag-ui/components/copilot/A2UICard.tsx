"use client";
import React, { useMemo, useRef, useState } from "react";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";
import { registry } from "@/lib/genui/registry";
import { buildLoadingSpec, buildResultSpec, buildPaymentSpec, buildSpecFromTemplate, type LynqxSpec } from "@/lib/genui/a2ui";
import type { CardTemplate } from "@/lib/supabase";
import { useWorkflowResult } from "@/lib/useWorkflowResult";
import type { PaymentSubmitRequest, PaymentSubmitResponse } from "@/lib/types";
import type { SetState } from "@json-render/react";
import type { StateModel } from "@json-render/core";

type PaymentPhase = "idle" | "submitting" | "success" | "error" | "cancelled";

interface Props {
  workflowId?: string;
  summary?: string;
  cardType?: string;
  query?: string;
  template?: CardTemplate;   // from Supabase — takes priority over hardcoded buildResultSpec
}

export default function A2UICard({ workflowId, summary, cardType, query, template }: Props) {
  const wf = useWorkflowResult(workflowId);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle");
  const [txRef, setTxRef] = useState<string | undefined>();
  const [paymentError, setPaymentError] = useState<string | undefined>();

  const spec = useMemo((): LynqxSpec | null => {
    // No workflow yet — render card with defaults and the AI's summary
    if (!workflowId) {
      if (template) return buildSpecFromTemplate(template, summary ?? "", {});
      if (cardType) return buildResultSpec(cardType, summary ?? "", {});
      return null;
    }

    const isLoading = wf.status === "running" || wf.status === "idle";

    if (isLoading) {
      return buildLoadingSpec(wf.steps);
    }

    if (wf.status === "failed") {
      return {
        root: "card-root",
        elements: {
          "card-root": {
            type: "CardShell",
            props: { title: "Error", sources: "Temporal" },
            children: ["m1"],
          },
          "m1": {
            type: "MetricRow",
            props: { label: "Status", value: "Workflow failed — retry or contact support", valueStyle: "danger" },
          },
        },
      };
    }

    const effectiveSummary = wf.summary ?? summary ?? "";
    const data = (wf.cardData ?? {}) as Record<string, unknown>;

    if (cardType === "PaymentInitiation") {
      return buildPaymentSpec(effectiveSummary, data, {
        workflowId,
        submitPhase: paymentPhase,
        txRef,
        errorReason: paymentError,
      });
    }

    // Prefer Supabase template if provided, fall back to hardcoded builders
    if (template) {
      return buildSpecFromTemplate(template, effectiveSummary, data);
    }

    return buildResultSpec(cardType ?? "Generic", effectiveSummary, data);
  }, [wf, workflowId, cardType, summary, paymentPhase, txRef, paymentError, template]);

  const stateRef = useRef<Record<string, unknown>>({});
  const setStateRef = useRef<SetState | undefined>(undefined);

  const actionHandlers = useMemo(
    () => ({
      approvePayment: async (params: Record<string, unknown>) => {
        setPaymentPhase("submitting");
        try {
          const req: PaymentSubmitRequest = {
            workflowId: String(params.workflowId ?? workflowId ?? ""),
            paymentData: {
              beneficiary: String(params.beneficiary ?? ""),
              amount: Number(params.amount ?? 0),
              currency: String(params.currency ?? "USD"),
              debitAccount: String(params.debitAccount ?? ""),
              reference: String(params.reference ?? ""),
              rail: String(params.rail ?? ""),
              deadline: params.deadline ? String(params.deadline) : undefined,
            },
          };
          const res = await fetch("/api/payments/submit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(req),
          }).then(r => r.json()) as PaymentSubmitResponse | { error: string };

          if ("error" in res) {
            setPaymentPhase("error");
            setPaymentError((res as { error: string }).error);
          } else {
            const result = res as PaymentSubmitResponse;
            if (result.status === "accepted") {
              setPaymentPhase("success");
              setTxRef(result.txRef);
            } else {
              setPaymentPhase("error");
              setPaymentError(result.reason ?? `Status: ${result.status}`);
            }
          }
        } catch (e) {
          setPaymentPhase("error");
          setPaymentError(e instanceof Error ? e.message : "Network error");
        }
      },
      cancelPayment: async (_params: Record<string, unknown>) => {
        setPaymentPhase("cancelled");
      },
      retryWorkflow: async (_params: Record<string, unknown>) => {
        // Handled externally — component would need to be remounted with a new workflowId
        console.log("[A2UICard] retryWorkflow not yet implemented");
      },
    }),
    [workflowId]
  );

  const wrappedHandlers = useMemo(
    () => (getSetState: () => SetState | undefined, getState: () => StateModel) =>
      Object.fromEntries(
        Object.entries(actionHandlers).map(([name, fn]) => [
          name,
          async (params: Record<string, unknown>) => {
            setStateRef.current = getSetState();
            stateRef.current = getState() as Record<string, unknown>;
            await fn(params);
          },
        ])
      ),
    [actionHandlers]
  );

  const isLoading = !!workflowId && (wf.status === "running" || wf.status === "idle");

  const providerHandlers = useMemo(
    () => wrappedHandlers(() => setStateRef.current, () => stateRef.current as StateModel),
    [wrappedHandlers]
  );

  if (!spec || !spec.elements) return null;

  return (
    <StateProvider initialState={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={providerHandlers}>
          <Renderer
            spec={spec as Parameters<typeof Renderer>[0]["spec"]}
            registry={registry}
            loading={isLoading}
          />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
