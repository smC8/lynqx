# Quickstart: Lynqx Console Copilot

**Feature**: 001-copilot-ui | **Date**: 2026-05-23

---

## Prerequisites

- Node.js 20+
- Temporal cluster running locally (`temporal server start-dev`) or remote
- Zigflow CLI installed: `npm install -g @zigflow/cli` (or use npx)
- Anthropic API key
- SigNoz running (for observability tool)

---

## Environment Setup

Create `.env.local` at the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-...
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=copilot-agents
SIGNOZ_API_URL=http://localhost:3301
SIGNOZ_API_KEY=your-signoz-api-key
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-jira-token
JIRA_PROJECT_KEY=LNX
```

---

## Install & Run

```bash
# Install dependencies
npm install

# Terminal 1: Start the Next.js dev server
npm run dev

# Terminal 2: Start the Temporal worker (Zigflow)
npm run worker
# or: npx zigflow run workflows/copilot-investigation.yaml
```

Open [http://localhost:3000](http://localhost:3000) — the Lynqx Console loads with the copilot sidebar.

---

## App Structure

```
ag-ui/
├── app/
│   ├── api/copilotkit/route.ts   # CopilotRuntime — handles LLM + tool routing
│   ├── api/agent/
│   │   ├── start/route.ts        # POST: starts a Temporal workflow
│   │   └── status/[id]/route.ts  # GET: returns current AgentState
│   ├── layout.tsx                 # CopilotKit provider + dark theme
│   └── page.tsx                   # Console shell + CopilotSidebar
├── components/
│   ├── copilot/
│   │   ├── AgentStatePanel.tsx    # Renders live workflow steps
│   │   ├── ApprovalCard.tsx       # Human-in-the-loop confirmation UI
│   │   └── ResultCard.tsx         # Structured investigation result display
│   └── console/
│       ├── Layout.tsx             # Sidebar nav + header
│       └── Dashboard.tsx          # Placeholder main content
├── lib/
│   ├── temporal.ts                # Temporal client (singleton)
│   └── signoz.ts                  # SigNoz HTTP query helpers
└── workflows/
    └── copilot-investigation.yaml # Zigflow DSL workflow
```

---

## How to Use the Copilot

1. **Click the copilot icon** (bottom-right or sidebar toggle) to open the chat panel
2. **Ask a question**: e.g., "What errors has the payment service had in the last hour?"
3. **Watch the agent work**: If a workflow is triggered, the Agent State Panel shows live steps
4. **Approve actions**: For Jira ticket creation, an approval card appears — click "Approve" to confirm
5. **See results**: Investigation results appear as a structured card in the chat thread

---

## Try These Prompts

```
"What is the current error rate for the payment service?"
"Investigate why the checkout service was slow between 2-3pm today"
"Create a Jira ticket for the memory leak in the auth service"
"Show me the top 5 slowest API operations in the last 24 hours"
"List all running Temporal workflows"
```

---

## Zigflow Workflow Manually

To trigger the investigation workflow directly (bypassing the copilot chat):

```bash
# Start a workflow via Temporal CLI
temporal workflow start \
  --task-queue copilot-agents \
  --type copilot-investigation \
  --input '{"query":"check payment service errors","timeRange":{"start":"now-1h","end":"now"}}'
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "ANTHROPIC_API_KEY not set" | Add it to `.env.local` and restart the dev server |
| Copilot sidebar not appearing | Ensure `<CopilotKit>` wraps the app in `layout.tsx` |
| Workflow not starting | Check Temporal is running: `temporal server start-dev` |
| SigNoz queries returning empty | Verify `SIGNOZ_API_URL` and that SigNoz has data |
| Worker not picking up tasks | Check `TEMPORAL_TASK_QUEUE` matches in both `.env.local` and the workflow YAML |
