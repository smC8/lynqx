# Research: Lynqx Console Copilot

**Feature**: 001-copilot-ui | **Date**: 2026-05-23 | **Updated**: based on actual design file

---

## Decision 1: Framework

**Decision**: Next.js 14 App Router

**Rationale**: CopilotKit's quickstart and `copilotRuntimeNextJSAppRouterEndpoint` helper are optimised for Next.js App Router. API routes for `CopilotRuntime` and agent endpoints sit naturally alongside the UI. No separate backend server needed for the demo.

**Alternatives considered**: Vite + Express — works but adds a separate server process.

---

## Decision 2: No Custom Design System Library

**Decision**: Import `design/project/styles.css` and `design/project/lynqx-tokens.css` directly as global CSS. No shadcn/ui, no Radix primitives.

**Rationale**: The design already provides a complete, production-quality component system with classes `.btn`, `.btn-primary`, `.tag`, `.code-block`, `.surface`, `.surface-2`, `.dt` (data table), `.mono`, `.eyebrow`, etc. Installing a second component library would create conflicts. The design tokens include light + dark mode via `[data-theme]` attribute.

**Tailwind**: Keep for layout utilities (flex, grid, padding) but never override Lynqx token classes.

---

## Decision 3: Copilot Screen is Full-Page (Not Sidebar)

**Decision**: `CopilotScreen` is a full-page route rendered in `.app-canvas`. No `CopilotSidebar` widget.

**Rationale**: The design (`screens-copilot.jsx`) shows a full-page experience — hero, composer, architecture strip, transcript, catalog. The sidebar chat pattern would destroy the visual design intent. CopilotKit's `useCopilotChat` and `useCopilotAction` hooks work independently of the UI widget components.

---

## Decision 4: LLM Provider

**Decision**: Anthropic Claude claude-sonnet-4-6 via `AnthropicAdapter` in CopilotRuntime

**Rationale**: Project is in the Anthropic ecosystem. The design's architecture strip shows CopilotKit → AG-UI ⇄ Zigflow, not OpenAI. claude-sonnet-4-6 has excellent tool use for generating structured GenUI card data.

---

## Decision 5: GenUI Cards via `useCopilotAction` with `render` Prop

**Decision**: Each GenUI card type is registered as a CopilotKit action with a `render` prop that returns the matching React component.

**Rationale**: This is the canonical CopilotKit pattern for generative UI — the LLM decides which tool to call, passes structured params, and the `render` function maps to the design's components. This replicates the design's architecture strip flow: `CopilotKit → AG-UI → Generative UI`.

**Example**:
```typescript
useCopilotAction({
  name: "renderTreasuryPosition",
  description: "Show net USD position across accounts",
  parameters: [
    { name: "netUSD", type: "number" },
    { name: "accounts", type: "object[]" },
  ],
  render: (args) => <TreasuryPosition {...args} />,
});
```

---

## Decision 6: Zigflow Architecture — Orchestration Layer

**Decision**: Zigflow/Temporal handles the `copilot-investigation` workflow (query SigNoz + call Claude + optional Jira). CopilotKit handles the conversational loop. The two are bridged via HTTP.

**Rationale**: The design explicitly labels the backend "AG-UI ⇄ Zigflow" in the Architecture Strip. Zigflow provides durable execution, retries, parallel fan-out (SigNoz logs + traces in parallel), and the Temporal approval workflow already depicted in `GenUI_PaymentInitiation` (the approval chain labeled "Approval workflow · Zigflow"). This is not just a demo choice — it's what the design says to build.

**Flow**:
```
useCopilotAction("runInvestigation")
    → POST /api/agent/start
    → Temporal: start copilot-investigation workflow
    → Zigflow: fork(queryLogs, queryTraces) → analyzeWithClaude → emitResult
    → Callbacks: POST /api/agent/state-update (per step)
    → CopilotScreen: AgentStatePanel polls /api/agent/status/:id
```

---

## Decision 7: Persona Content is Client-Side (No API)

**Decision**: `COPILOT_BY_PERSONA` (starters, transcript, catalog) is a static registry in `lib/personas.ts`. No server fetch.

**Rationale**: All nine GenUI card components are pre-rendered with mock data matching the design. When real CopilotKit integration runs, the LLM drives which card renders and with what data — the static registry serves as the fallback/demo content.

---

## Decision 8: MCP Connections (Server-Side Only)

**Decision**: SigNoz, Temporal, and Jira integrations are called from within CopilotRuntime tool handlers — never from the browser.

| Integration | How connected | Tool action name |
|-------------|---------------|-----------------|
| SigNoz | REST API (`/api/v3/query_range`) from Next.js API route | `queryObservability` |
| Temporal | `@temporalio/client` from Next.js API route | `getWorkflowStatus`, `runInvestigation` |
| Jira | Atlassian REST API v3 from Next.js API route | `createJiraTicket` |

All API keys stay server-side.

---

## Decision 9: Prototype Mode vs Real Mode

The app boots in **prototype mode** (mock 700ms delay, pre-rendered cards from `COPILOT_BY_PERSONA`) when `ANTHROPIC_API_KEY` is not set. This lets the UI be developed and demoed without any external services.

When `ANTHROPIC_API_KEY` is set, it switches to **real mode** (CopilotKit + real Claude). The `NEXT_PUBLIC_DEMO_MODE=true` env var can force prototype mode even with an API key.
