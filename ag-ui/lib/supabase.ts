import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export interface CopilotTool {
  id: string;
  name: string;
  description: string;
  parameters: Array<{ name: string; type: string; description: string }>;
  card_type: string;
  persona: string[];
  enabled: boolean;
  sort_order: number;
}

export interface CardTemplateRow {
  label: string;
  value: string;       // "$summary" | "$fieldName"
  default?: string;
  style?: "mono" | "danger" | "success";
}

export interface CardTemplate {
  id: string;
  card_type: string;
  title: string;
  sources?: string;
  rows: CardTemplateRow[];
  // Full json-render spec stored in Supabase — overrides `rows` when present.
  // $fieldName tokens in props are resolved against cardData at render time.
  spec?: Record<string, unknown>;
  enabled: boolean;
}

export async function fetchCopilotConfig(): Promise<{
  tools: CopilotTool[];
  templates: Record<string, CardTemplate>;
}> {
  const [toolsRes, templatesRes] = await Promise.all([
    supabase.from("copilot_tools").select("*").eq("enabled", true).order("sort_order"),
    supabase.from("card_templates").select("*").eq("enabled", true),
  ]);
  const tools: CopilotTool[] = toolsRes.data ?? [];
  const templates: Record<string, CardTemplate> = {};
  for (const t of (templatesRes.data ?? []) as CardTemplate[]) {
    templates[t.card_type] = t;
  }
  return { tools, templates };
}
