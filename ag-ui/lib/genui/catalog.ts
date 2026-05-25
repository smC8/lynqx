"use client";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const columnSchema = z.object({
  label: z.string(),
  value: z.string(),
  default: z.string().optional(),
  accent: z.enum(["warning", "danger", "success", "info"]).optional(),
});

const fieldRowSchema = z.object({
  label: z.string(),
  value: z.string(),
  default: z.string().optional(),
  mono: z.boolean().optional(),
  bold: z.boolean().optional(),
  tag: z.string().optional(),
});

export const lynqxCatalog = defineCatalog(schema, {
  components: {
    CardShell: {
      props: z.object({
        // Legacy: plain title in header
        title: z.string().nullable().optional(),
        // New style: sources shown next to badge; summary shown as prose
        sources: z.string().nullable().optional(),
        summary: z.string().nullable().optional(),
        footerHint: z.string().nullable().optional(),
      }),
      slots: ["default"],
      description: "Root card container with AgentCard styling — lime stripe, badge, prose summary",
    },
    CardFooter: {
      props: z.object({}),
      slots: ["default"],
      description: "Footer strip inside a CardShell — lighter background, border-top, flex row for actions",
    },
    MetricRow: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        valueStyle: z.enum(["normal", "mono", "danger", "success"]).optional(),
      }),
      description: "Simple label-value row (legacy — prefer FieldGrid for new designs)",
    },
    MetricGrid: {
      props: z.object({
        columns: z.array(columnSchema),
      }),
      description: "3-column big-number stat grid (MiniStat style)",
    },
    FieldGrid: {
      props: z.object({
        rows: z.array(fieldRowSchema),
      }),
      description: "2-column label/value grid — supports mono, bold, and tag variants",
    },
    TagBadge: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["success", "warning", "danger", "info", "neutral"]).optional(),
      }),
      description: "Inline colored tag badge",
    },
    StackedBar: {
      props: z.object({
        label: z.string().optional(),
        segments: z.array(z.object({
          label: z.string(),
          pct: z.number(),
          color: z.string().optional(),
        })).optional(),
      }),
      description: "Horizontal proportional bar chart with legend",
    },
    StatusBadge: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["success", "warning", "error", "info", "neutral"]),
      }),
      description: "Colored status tag",
    },
    ProgressStep: {
      props: z.object({
        label: z.string(),
        status: z.enum(["pending", "running", "done", "error"]),
      }),
      description: "Workflow step indicator with status dot",
    },
    ActionButton: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "danger", "ghost"]),
        disabled: z.boolean().optional(),
      }),
      description: "Interactive button that fires press event",
    },
    SectionHeader: {
      props: z.object({
        title: z.string(),
        eyebrow: z.string().nullable().optional(),
      }),
      description: "Section divider with optional eyebrow label",
    },
    CodeBlock: {
      props: z.object({
        code: z.string(),
        language: z.string().optional(),
      }),
      description: "Monospace code display block",
    },
    BarList: {
      props: z.object({
        items: z.array(z.object({
          label: z.string(),
          subtitle: z.string().optional(),
          value: z.string(),
          pct: z.number(),
          accent: z.enum(["success", "warning", "danger"]).optional(),
          tag: z.string().optional(),
        })).optional(),
      }),
      description: "Ranked list rows — label, subtitle, proportional fill bar, value, optional tag",
    },
    Spacer: {
      props: z.object({ size: z.enum(["sm", "md", "lg"]).optional() }),
      description: "Vertical spacer",
    },
  },
  actions: {
    approvePayment: {
      params: z.object({
        workflowId: z.string(),
        beneficiary: z.string(),
        amount: z.number(),
        currency: z.string(),
        debitAccount: z.string(),
        reference: z.string(),
        rail: z.string(),
        deadline: z.string().optional(),
      }),
      description: "Submit a payment for approval",
    },
    cancelPayment: {
      params: z.object({ workflowId: z.string() }),
      description: "Cancel a pending payment",
    },
    retryWorkflow: {
      params: z.object({
        workflowId: z.string(),
        query: z.string(),
        cardType: z.string(),
      }),
      description: "Retry a failed investigation workflow",
    },
  },
});

export type LynqxCatalog = typeof lynqxCatalog;
