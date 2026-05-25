# Data Model: Lynqx Copilot — Interactive Experience (json-render + A2UI)

**Date**: 2026-05-25 | **Feature**: 001-interactive-copilot | **Revision**: 2

---

## A2UI Message Types (`lib/types.ts` additions)

```typescript
// A2UI adjacency-list component
export interface A2UIComponent {
  id: string;
  component: Record<string, Record<string, unknown>>; // { ComponentType: props }
}

export interface A2UISurfaceUpdate {
  surfaceId?: string;
  components: A2UIComponent[];
}

export interface A2UIDataModelUpdate {
  surfaceId?: string;
  path?: string;
  contents: Array<{
    key: string;
    valueString?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
    valueMap?: unknown[];
  }>;
}

export interface A2UIBeginRendering {
  surfaceId?: string;
  root: string;
  catalogId?: string;
}

export interface A2UIMessage {
  workflowId: string;
  surfaceUpdate?: A2UISurfaceUpdate;
  dataModelUpdate?: A2UIDataModelUpdate;
  beginRendering?: A2UIBeginRendering;
  deleteSurface?: { surfaceId: string };
}
```

---

## Catalog Component Props (`lib/genui/catalog.ts`)

```typescript
// Lynqx Catalog — what the AI / Temporal workers can assemble

CardShell: {
  title: string;
  sources?: string;          // e.g. "SigNoz · Temporal"
  footerHint?: string;
}

MetricRow: {
  label: string;
  value: BoundString;        // literal or $state path
  valueStyle?: "normal" | "mono" | "danger" | "success";
}

StatusBadge: {
  label: BoundString;
  variant: BoundString;      // "success" | "warning" | "error" | "info" | "neutral"
}

DataTable: {
  rows: Array<{ label: string; value: BoundString }>;
}

ProgressStep: {
  label: string;
  status: BoundString;       // "pending" | "running" | "done" | "error"
}

ActionButton: {
  label: BoundString;
  variant: "primary" | "secondary" | "danger";
  action: {
    name: string;
    context?: Array<{ key: string; value: BoundString }>;
  };
  disabled?: BoundString;    // bound to "true"/"false" string
}

SectionHeader: {
  title: string;
  eyebrow?: string;
}

CodeBlock: {
  code: BoundString;
  language?: string;
}
```

Where `BoundString = { literalString?: string; path?: string }` (path resolves against the data model).

---

## Catalog Actions

```typescript
approvePayment: {
  params: {
    workflowId: string;
    paymentData: {
      beneficiary: string;
      amount: number;
      currency: string;
      debitAccount: string;
      reference: string;
      rail: string;
    };
  };
}

cancelPayment: {
  params: {
    workflowId: string;
  };
}

retryWorkflow: {
  params: {
    workflowId: string;
    query: string;
    cardType: string;
  };
}
```

---

## A2UI Client State (`A2UICard.tsx`)

```typescript
interface A2UICardState {
  componentMap: Map<string, A2UIComponent>;
  dataModel: Record<string, unknown>;
  rootId: string | null;
  cursor: number;             // last-acknowledged message index
  polling: boolean;
}

// dataModel special keys (set by Temporal worker / demo simulation)
// __complete: boolean  — stop polling when true
// __error: string      — display error card when set
// submitPhase: "idle" | "submitting" | "success" | "error" | "cancelled"
// txRef: string        — transaction reference after payment approval
// errorReason: string  — error message after rejected payment
```

---

## Messages API Response (`/api/agent/messages/[id]`)

```typescript
interface MessagesResponse {
  workflowId: string;
  messages: A2UIMessage[];
  nextCursor: number;
}
```

---

## Payment Submit Request/Response

```typescript
// POST /api/payments/submit
interface PaymentSubmitRequest {
  workflowId: string;
  paymentData: {
    beneficiary: string;
    beneficiaryBank?: string;
    amount: number;
    currency: string;
    debitAccount: string;
    reference: string;
    rail: string;
    deadline?: string;
  };
}

interface PaymentSubmitResponse {
  txRef: string;
  status: "accepted" | "rejected" | "processing";
  reason?: string;
}
```

---

## Conversation Context

```typescript
// lib/conversation-context.ts
export interface ContextEntry {
  query: string;
  cardType: string;
  summary: string;
}

// buildConversationContext(feed: FeedItem[], limit?: number): string
// Example output:
// "Prior turns (most recent first):
// 1. Q: 'most used routes yesterday?' → BankDiagnostic: '/v1/charges led 3.2k calls, 47 errors'
// 2. Q: 'show treasury position' → TreasuryPosition: 'Net USD 4.1M across HDFC and Citi'"
```

---

## FeedItem (extended)

```typescript
interface FeedItem {
  q: string;
  cardType: string;
  summary?: string;
  workflowId?: string;
  // NEW
  conversationContext?: string;  // context string sent to Temporal for this turn
}
```
