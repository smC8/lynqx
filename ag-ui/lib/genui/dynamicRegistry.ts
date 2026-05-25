"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { registry as staticRegistry, createStoredComponent } from "./registry";
import type { LynqxSpec } from "./a2ui";

// Module-level cache — one fetch per app session, shared across all A2UICard instances
let _cached: typeof staticRegistry | null = null;
let _promise: Promise<typeof staticRegistry> | null = null;

async function buildRegistry(): Promise<typeof staticRegistry> {
  if (_cached) return _cached;

  const { data, error } = await supabase
    .from("components")
    .select("name, spec")
    .order("name");

  if (error || !data?.length) {
    _cached = staticRegistry;
    return _cached;
  }

  // Build stored component functions from Supabase rows.
  // json-render calls registry components with { element, children, emit, ... }
  // (same shape the defineRegistry wrapper produces), so we must extract element.props.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dynamic: Record<string, (ctx: any) => React.ReactElement | null> = {};

  for (const row of data) {
    const spec = row.spec as LynqxSpec;
    dynamic[row.name] = (ctx: { element?: { props?: Record<string, unknown> }; children?: React.ReactNode; emit?: (e: string) => void }) =>
      createStoredComponent(spec)({ props: ctx?.element?.props ?? {}, children: ctx?.children, emit: ctx?.emit });
  }

  // Merge: Supabase rows take precedence over hardcoded fallbacks
  _cached = { ...staticRegistry, ...dynamic } as typeof staticRegistry;
  return _cached;
}

// Force a re-fetch (call after inserting/updating a row in `components`)
export function invalidateDynamicRegistry() {
  _cached = null;
  _promise = null;
}

// React hook — returns the static registry immediately, swaps to dynamic once loaded.
// Components render with the static fallback first (no flash), then upgrade silently.
export function useDynamicRegistry() {
  const [reg, setReg] = useState<typeof staticRegistry>(staticRegistry);

  useEffect(() => {
    if (!_promise) _promise = buildRegistry();
    _promise.then(r => {
      if (r !== staticRegistry) setReg(r);
    });
  }, []);

  return reg;
}
