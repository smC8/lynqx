import { NextRequest } from "next/server";
import type { PaymentSubmitRequest, PaymentSubmitResponse } from "@/lib/types";

function makeTxRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Date.now()).slice(-5);
  return `TXN-${date}-${seq}`;
}

export const POST = async (req: NextRequest) => {
  const body = await req.json() as PaymentSubmitRequest;
  const { workflowId, paymentData } = body;

  if (!workflowId || !paymentData?.beneficiary || !paymentData?.amount) {
    return new Response(
      JSON.stringify({ error: "workflowId, paymentData.beneficiary, and paymentData.amount are required" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const response: PaymentSubmitResponse = {
    txRef: makeTxRef(),
    status: "accepted",
  };
  return new Response(JSON.stringify(response), {
    headers: { "content-type": "application/json" },
  });
};
