const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const SIGNOZ_API_URL = process.env.SIGNOZ_API_URL ?? "";
const SIGNOZ_API_KEY = process.env.SIGNOZ_API_KEY ?? "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

interface InvestigationInput {
  query: string;
  workflowId: string;
  timeRange?: { start: string; end: string };
  services?: string[];
  createTicket?: boolean;
}

async function postStateUpdate(workflowId: string, step: string, status: string) {
  await fetch(`${APP_URL}/api/agent/state-update`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workflowId, step, status, timestamp: new Date().toISOString() }),
  });
}

export async function notifyStep(workflowId: string, step: string, status: "running" | "done" | "error") {
  await postStateUpdate(workflowId, step, status);
}

export async function querySignoz(input: InvestigationInput): Promise<unknown> {
  if (!SIGNOZ_API_URL || !SIGNOZ_API_KEY) return { data: { result: [] } };
  const body = {
    start: input.timeRange?.start ?? "now-1h",
    end: input.timeRange?.end ?? "now",
    step: 60,
    compositeQuery: {
      queryType: "builder",
      panelType: "list",
      builderQueries: {
        A: {
          dataSource: "logs",
          queryName: "A",
          expression: "A",
          filters: { items: (input.services ?? []).map(s => ({ key: { key: "service.name" }, op: "in", value: [s] })) },
        },
      },
    },
  };
  const res = await fetch(`${SIGNOZ_API_URL}/api/v3/query_range`, {
    method: "POST",
    headers: { "SIGNOZ-API-KEY": SIGNOZ_API_KEY, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function analyzeWithClaude(
  query: string,
  observabilityData: unknown
): Promise<string> {
  const prompt = `You are an expert payment infrastructure engineer. Analyze the observability data and answer: ${query}\n\nData: ${JSON.stringify(observabilityData, null, 2)}\n\nProvide a 2-3 sentence summary.`;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ?? "";
  const GOOGLE_MODEL = process.env.GOOGLE_MODEL ?? "gemini-2.5-flash";

  if (GOOGLE_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json() as { candidates?: Array<{ content: { parts: Array<{ text: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No analysis returned.";
  }

  if (ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json() as { content?: Array<{ text: string }> };
    return data.content?.[0]?.text ?? "No analysis returned.";
  }

  return "Analysis unavailable — set GOOGLE_API_KEY or ANTHROPIC_API_KEY.";
}
