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

When the user asks about treasury, payments, forecasting, bank diagnostics, protocol drift, SLA intelligence,
API usage, stress testing, or webhook debugging — respond by calling the appropriate render tool.
Always call a render tool rather than replying with plain text. Choose the most relevant tool based on context.

Available render tools:
- renderTreasuryPosition: net USD balance, FX exposure, idle cash across accounts
- renderPaymentInitiation: initiate or review a payment with approval chain
- renderCashForecast: 30-day cash forecast with stress scenarios
- renderBankDiagnostic: diagnose a bank connectivity or batch failure
- renderProtocolDrift: compare registered vs observed schema for a bank partner
- renderSLAIntelligence: customer payment failure rates and SLA health
- renderAPIExplorer: show API usage examples with curl/SDK code
- renderStressTester: run or review a stress test simulation
- renderWebhookDebug: debug webhook delivery failures`;

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
