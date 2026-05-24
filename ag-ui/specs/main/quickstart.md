# Quickstart: Lynqx Console Copilot

**Feature**: 001-copilot-ui | **Date**: 2026-05-23 | **Updated**: 2026-05-24

---

## Prerequisites

- Node.js 20+
- `npm install` to restore dependencies
- An Anthropic API key for real Claude responses (optional — see Demo Mode below)
- Temporal + SigNoz for the full Zigflow agent loop (optional)

---

## Environment Variables

Create `.env.local` at the project root (`ag-ui/.env.local`):

```bash
# ── Demo mode (no API calls, mock 700ms responses) ──────────────────────────
NEXT_PUBLIC_DEMO_MODE=true

# ── Real CopilotKit mode (unset DEMO_MODE or set to false) ──────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Zigflow agent loop ────────────────────────────────────────────────────────
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_TASK_QUEUE=copilot-agents
NEXT_PUBLIC_APP_URL=http://localhost:3001   # Used by worker to callback state-update
SIGNOZ_API_URL=http://localhost:3301
SIGNOZ_API_KEY=your-signoz-api-key

# ── Optional: Jira ticket creation ───────────────────────────────────────────
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
# → Opens at http://localhost:3001 (port 3000 taken by parent project)

# Terminal 2: Start the Temporal worker (required for runInvestigation action)
npm run worker
# Requires Temporal running: temporal server start-dev
```

---

## Demo Mode (no API key needed)

Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`. All queries respond with realistic mock
GenUI cards after a 700ms delay. Starter chips map directly to the matching card type.

---

## App Structure

```
ag-ui/
├── app/
│   ├── api/
│   │   ├── copilotkit/route.ts        # CopilotRuntime: AnthropicAdapter + claude-sonnet-4-6
│   │   └── agent/
│   │       ├── start/route.ts          # POST: start Temporal workflow (or demo sim)
│   │       ├── status/[id]/route.ts    # GET: AgentState with steps
│   │       └── state-update/route.ts   # POST: worker step callback
│   ├── CopilotProvider.tsx             # <CopilotKit showDevConsole={false}>
│   ├── layout.tsx                      # Google Fonts + CopilotKit styles
│   └── page.tsx                        # Shell: Sidebar + CopilotScreen
├── components/
│   ├── shell/
│   │   ├── Icons.tsx                   # 50+ SVG icon set
│   │   ├── Sidebar.tsx                 # Forest navy rail, workspace-aware nav
│   │   └── WorkspaceSwitcher.tsx       # Exec / Bank / Dev dropdown
│   └── copilot/
│       ├── CopilotScreen.tsx           # Main copilot UI + all 10 useCopilotAction hooks
│       ├── AgentCard.tsx               # Card shell with lime accent stripe
│       ├── AgentStatePanel.tsx         # Live Zigflow step progress + result display
│       ├── ArchitectureStrip.tsx       # 5-node pipeline strip
│       ├── GenericStubCard.tsx         # Fallback card for unrecognised queries
│       ├── MiniStat.tsx / PromptLine.tsx / AgentBadge.tsx
│       └── genui/
│           ├── exec/TreasuryPosition.tsx / PaymentInitiation.tsx / CashForecast.tsx
│           ├── bank/BankDiagnostic.tsx / ProtocolDrift.tsx / SLAIntelligence.tsx
│           └── dev/APIExplorer.tsx / StressTester.tsx / WebhookDebug.tsx
├── lib/
│   ├── types.ts                        # WorkspaceId, AgentState, ChatMessage…
│   ├── personas.ts                     # COPILOT_BY_PERSONA — starters, transcript, catalog
│   ├── workspaces.ts                   # NAV_BY_WORKSPACE — sidebar nav per workspace
│   └── temporal.ts                     # Temporal Client singleton
├── worker/
│   ├── index.ts                        # Temporal Worker entry point
│   ├── workflows.ts                    # copilotInvestigation workflow
│   └── activities.ts                   # notifyStep, querySignoz, analyzeWithClaude
└── workflows/
    └── copilot-investigation.yaml      # Zigflow DSL (canonical workflow definition)
```

---

## Try These Prompts

### Executive Workspace (Exec)
```
"What's our net USD position across HDFC and Citi as of this morning?"
"Pay invoice INV-2041 to Tata Consulting, ₹12.4L from ICICI OpEx, approve by EOD"
"30-day cash forecast if the Siemens payment delays by 2 weeks"
```

### Bank-Ops Workspace (Bank)
```
"Why did HDFC's SFTP batch fail last night?"
"Diff today's ICICI pacs.002 against our registered schema"
"Which enterprise customers have the highest payment failure rate this quarter?"
```

### Developer Workspace (Dev)
```
"Show me how to initiate a bulk SEPA payment for a NetSuite customer"
"Simulate 500 concurrent PAIN.001 submissions with 10% rejection rate"
"Why aren't my payment status webhooks firing for Citi?"
```

### Agent Loop (triggers Zigflow/Temporal)
```
"Investigate why the payment service is failing"
"Run a full SigNoz investigation on checkout latency for the last hour"
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3001 not loading | Check `npm run dev` is running in `ag-ui/` |
| "ANTHROPIC_API_KEY not set" | Add to `.env.local`, restart dev server |
| Demo chips show stub card | Make sure `NEXT_PUBLIC_DEMO_MODE=true` and restart |
| Workflow not starting | Check `temporal server start-dev` and `npm run worker` |
| SigNoz queries empty | Verify `SIGNOZ_API_URL` / `SIGNOZ_API_KEY` and SigNoz data ingestion |
| Worker not picking tasks | Ensure `TEMPORAL_TASK_QUEUE=copilot-agents` in `.env.local` |
