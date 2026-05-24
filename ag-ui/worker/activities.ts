const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const SIGNOZ_API_URL = process.env.SIGNOZ_API_URL ?? "";
const SIGNOZ_API_KEY = process.env.SIGNOZ_API_KEY ?? "";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ?? "";
const GOOGLE_MODEL = process.env.GOOGLE_MODEL ?? "gemini-2.5-flash";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

function toNs(msOffset = 0): number {
  return Math.floor((Date.now() + msOffset) * 1_000_000);
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

export async function querySignozForCard(input: {
  query: string;
  cardType: string;
  workflowId: string;
  services?: string[];
}): Promise<unknown> {
  if (!SIGNOZ_API_URL || !SIGNOZ_API_KEY) {
    return { status: "no-config", data: { result: [] } };
  }

  const endNs = toNs();
  const startNs = toNs(-3 * 24 * 60 * 60 * 1000); // 3 days ago

  const serviceFilter = (input.services ?? []).map(s => ({
    key: { key: "service.name", dataType: "string", type: "tag" as const },
    op: "=",
    value: s,
  }));

  const body = {
    start: startNs,
    end: endNs,
    step: 3600,
    compositeQuery: {
      queryType: "builder",
      panelType: "list",
      builderQueries: {
        A: {
          dataSource: "logs",
          queryName: "A",
          expression: "A",
          filters: { items: serviceFilter, op: "AND" },
          limit: 200,
          orderBy: [{ columnName: "timestamp", order: "desc" }],
        },
      },
    },
  };

  try {
    const res = await fetch(`${SIGNOZ_API_URL}/api/v3/query_range`, {
      method: "POST",
      headers: { "SIGNOZ-API-KEY": SIGNOZ_API_KEY, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { error: `SigNoz ${res.status}: ${errText.slice(0, 400)}`, data: { result: [] } };
    }
    return res.json();
  } catch (e) {
    return { error: String(e), data: { result: [] } };
  }
}

const CARD_SCHEMAS: Record<string, string> = {
  BankDiagnostic: `{"summary":"string","cardData":{"steps":[{"t":"HH:MM:SS","label":"error type or event","status":"ok|fail","detail":"count and specifics"}],"patch":"optional one-line fix"}}`,
  SLAIntelligence: `{"summary":"string","cardData":{"rows":[{"name":"service name","fail":0.05,"calls":10000,"tag":"type","vol":"N/A"}]}}`,
  StressTester: `{"summary":"string","cardData":{"submitted":15000,"accepted":13490,"rejected":1510,"p95ms":218,"rps":[10,20,30,40,50,60,55,50,48,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25],"failures":[{"code":"429","count":100,"reason":"rate exceeded"}]}}`,
  WebhookDebug: `{"summary":"string","cardData":{"trace":[{"stage":"step name","status":"ok|fail|idle","t":"+0ms","detail":"what happened"}],"fix":"optional fix"}}`,
  TreasuryPosition: `{"summary":"string","cardData":{"positions":[{"acc":"BANK ****1234","curr":"USD","value":2180000,"fx":0}]}}`,
  CashForecast: `{"summary":"string","cardData":{"base":[72,73,74,75,76,77,78,79,80,79,78,77,76,75,76,77,78,79,80,79,78,77,76,75,76,77,78,79,80,80],"stress":[72,71,70,69,68,67,66,65,64,63,62,61,60,59,60,61,62,61,60,61,62,63,64,65,66,67,68,69,70,70],"events":[{"label":"Payment delay · amount · timing","tag":"warn"}]}}`,
  PaymentInitiation: `{"summary":"string","cardData":{"beneficiary":"Company Name","beneficiaryBank":"BANK ****1234 · IFSC CODE","amount":1240000,"currency":"INR","debitAccount":"BANK ****5678 — Account Type","reference":"INV-XXXX","rail":"RTGS","deadline":"EOD · Date · 18:00 IST (Xh remaining)"}}`,
  ProtocolDrift: `{"summary":"string","cardData":{"bank":"Bank Name","protocol":"pacs.002","registeredVersion":"v2.3","newFields":[{"field":"NewField","path":"Parent/NewField"}],"affectedCustomers":2,"payloadsSampled":248,"firstSeenHoursAgo":14}}`,
  APIExplorer: `{"summary":"string","cardData":{"endpoint":"POST /v1/payments/bulk","description":"what it does","steps":[{"comment":"step description","code":"curl -X POST ..."}],"scopes":["payments:write"]}}`,
};

async function callLLM(prompt: string): Promise<string> {
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  }
  if (ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2048, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json() as { content?: Array<{ text: string }> };
    return data.content?.[0]?.text ?? "{}";
  }
  return JSON.stringify({ summary: "No LLM configured.", cardData: {} });
}

export async function analyzeAndStructure(
  query: string,
  cardType: string,
  observabilityData: unknown
): Promise<{ summary: string; cardData: unknown }> {
  const schema = CARD_SCHEMAS[cardType] ?? CARD_SCHEMAS.BankDiagnostic;
  const dataStr = JSON.stringify(observabilityData).slice(0, 8000);
  const hasData = dataStr.includes('"list"') && dataStr.length > 100;

  const prompt = `You are a payment infrastructure observability expert.
User query: "${query}"
Render card: ${cardType}

${hasData ? `Live SigNoz observability data:\n${dataStr}` : "No SigNoz data available. Generate contextually plausible data for the query."}

Return ONLY valid JSON with no markdown fences, matching this schema exactly:
${schema}

Rules:
- Use real timestamps/counts/names from SigNoz data when available
- "fail" in SLAIntelligence must be a decimal fraction (0.05 = 5%)
- Keep "summary" to 2-3 sentences
- For BankDiagnostic: each step = a distinct error type/event found in the logs
- Generate plausible contextual data when SigNoz has no relevant logs`;

  const raw = await callLLM(prompt);
  // Strip markdown fences if present
  const jsonStr = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();

  try {
    const parsed = JSON.parse(jsonStr) as { summary?: string; cardData?: unknown };
    return { summary: parsed.summary ?? "Analysis complete.", cardData: parsed.cardData ?? {} };
  } catch {
    // Try extracting first JSON object
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { summary?: string; cardData?: unknown };
        return { summary: parsed.summary ?? "Analysis complete.", cardData: parsed.cardData ?? {} };
      } catch { /* fall through */ }
    }
    return { summary: raw.slice(0, 300), cardData: {} };
  }
}
