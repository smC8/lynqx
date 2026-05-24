import {
  CopilotRuntime,
  AnthropicAdapter,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are Lynqx Copilot, an AI assistant embedded in the Lynqx corporate banking console.
Lynqx connects enterprises to banks across emerging markets via ISO 20022, SWIFT, and proprietary rails.

CRITICAL RULE: You must ALWAYS respond by calling one of the render tools below. Never reply with plain text.
Always pass a concise, insightful 1-2 sentence summary as the "summary" argument — this is displayed as the
card headline. Make it specific to the user's query, not generic.

Available render tools (choose the most relevant):
- renderTreasuryPosition: net USD balance, FX exposure, idle cash — for any "position", "balance", "FX" query
- renderPaymentInitiation: initiate or review a payment with approval chain — for "pay", "transfer", "invoice" queries
- renderCashForecast: 30-day cash forecast with stress scenarios — for "forecast", "projection", "what-if" queries
- renderBankDiagnostic: bank connectivity/batch failures AND API health/error analysis — for "error", "failure", "status codes", "diagnostic", "why is X failing" queries
- renderProtocolDrift: registered vs observed schema differences — for "schema", "protocol", "drift", "mapping" queries
- renderSLAIntelligence: customer failure rates and SLA health — for "SLA", "customer failures", "success rate" queries
- renderAPIExplorer: API usage examples with curl/SDK code — for "how do I", "show me code", "API example" queries
- renderStressTester: stress test results with RPS chart — for "load test", "stress test", "capacity", "throughput" queries
- renderWebhookDebug: webhook delivery failures and fixes — for "webhook", "event not received", "listener" queries

When the user asks about API response statuses, error breakdowns, or observability data — use renderBankDiagnostic
with a summary describing the error pattern found.`;

function buildAdapter() {
  if (process.env.GOOGLE_API_KEY) {
    return new GoogleGenerativeAIAdapter({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
      apiVersion: "v1beta",
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new AnthropicAdapter({ anthropic: anthropic as any, model: "claude-sonnet-4-6" });
  }
  return null;
}

export const GET = async () => {
  return new Response(JSON.stringify({ status: "ok", version: "1.0.0" }), {
    headers: { "content-type": "application/json" },
  });
};

export const POST = async (req: NextRequest) => {
  const adapter = buildAdapter();

  if (!adapter) {
    return new Response(
      JSON.stringify({ error: "No LLM API key set. Add GOOGLE_API_KEY or ANTHROPIC_API_KEY to .env.local" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const runtime = new CopilotRuntime();
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: adapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
