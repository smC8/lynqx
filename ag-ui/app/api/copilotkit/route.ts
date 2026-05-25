import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are Lynqx Copilot, an AI assistant embedded in the Lynqx corporate banking console.
Lynqx connects enterprises to banks across emerging markets via ISO 20022, SWIFT, and proprietary rails.

CRITICAL RULE: You must ALWAYS respond by calling one of the render tools below. Never reply with plain text.
There are NO exceptions — every user message must trigger exactly one tool call.
Always pass a concise, insightful 1-2 sentence summary as the "summary" argument.

Tool selection guide (pick the BEST match, default to renderBankDiagnostic if unsure):
- renderTreasuryPosition — "position", "balance", "FX", "exposure", "idle cash", "liquidity"
- renderPaymentInitiation — "pay", "transfer", "send", "invoice", "wire", "remit"
- renderCashForecast — "forecast", "projection", "30-day", "what-if", "scenario", "outlook"
- renderBankDiagnostic — "error", "failure", "status codes", "diagnostic", "routes", "traffic", "usage", "requests", "API calls", "most used", "top endpoints", "throughput", "latency", "observability", "metrics", "breakdown", "response"
- renderProtocolDrift — "schema", "protocol", "drift", "mapping", "ISO 20022", "pacs", "camt"
- renderSLAIntelligence — "SLA", "customer failures", "success rate", "uptime", "availability"
- renderAPIExplorer — "how do I", "show me code", "example", "curl", "SDK", "integrate"
- renderStressTester — "load test", "stress test", "capacity", "concurrency", "performance test"
- renderWebhookDebug — "webhook", "event not received", "listener", "delivery", "callback"

DEFAULT: If the query involves any API, route, endpoint, or traffic data — use renderBankDiagnostic.`;

function buildRuntime() {
  if (process.env.MISTRAL_API_KEY) {
    const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
    return new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({
          model: mistral(process.env.MISTRAL_MODEL ?? "mistral-large-latest"),
          prompt: SYSTEM_PROMPT,
          forwardSystemMessages: true,
        }),
      },
    });
  }
  if (process.env.GOOGLE_API_KEY) {
    return new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({
          model: `google/${process.env.GOOGLE_MODEL ?? "gemini-2.0-flash"}`,
          prompt: SYSTEM_PROMPT,
          forwardSystemMessages: true,
        }),
      },
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({
          model: "anthropic/claude-sonnet-4-6",
          prompt: SYSTEM_PROMPT,
          forwardSystemMessages: true,
        }),
      },
    });
  }
  return null;
}

export const GET = async () => {
  return new Response(JSON.stringify({ status: "ok", version: "1.0.0" }), {
    headers: { "content-type": "application/json" },
  });
};

export const POST = async (req: NextRequest) => {
  const runtime = buildRuntime();

  if (!runtime) {
    return new Response(
      JSON.stringify({ error: "No LLM API key set. Add MISTRAL_API_KEY, GOOGLE_API_KEY, or ANTHROPIC_API_KEY to .env" }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
