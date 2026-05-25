# API Contract: POST /api/payments/submit

**Feature**: 001-interactive-copilot (US3 — Actionable Payment Cards)  
**Consumer**: json-render `approvePayment` action handler in `lib/genui/registry.tsx`  
**Provider**: `app/api/payments/submit/route.ts` (new)

---

## Request

```
POST /api/payments/submit
Content-Type: application/json
```

```json
{
  "workflowId": "string",
  "paymentData": {
    "beneficiary": "Safaricom Ltd",
    "beneficiaryBank": "NCBA Kenya",
    "amount": 5000,
    "currency": "USD",
    "debitAccount": "HDFC-CORP-4521",
    "reference": "INV-2024-0891",
    "rail": "SWIFT",
    "deadline": "EOD"
  }
}
```

**Required**: `workflowId`, `paymentData.beneficiary`, `paymentData.amount`, `paymentData.currency`

---

## Response: Accepted (200)

```json
{
  "txRef": "TXN-20260525-00123",
  "status": "accepted"
}
```

## Response: Rejected (200)

```json
{
  "txRef": "TXN-20260525-00124",
  "status": "rejected",
  "reason": "Insufficient funds in debit account HDFC-CORP-4521"
}
```

## Response: Gateway Error (503)

```json
{ "error": "Payment gateway unavailable" }
```

---

## Behavior

- **Demo mode** (`TEMPORAL_ADDRESS` not set): returns mock accepted response after ~1s delay
- **Temporal mode**: starts `submitPayment` workflow; polls for result up to 10s; returns result or 503
- The `approvePayment` action handler disables the button and shows "Submitting…" before calling this endpoint (via A2UI `dataModelUpdate` setting `submitPhase = "submitting"`)
- Double-submission prevented by checking `submitPhase !== "idle"` before dispatching
