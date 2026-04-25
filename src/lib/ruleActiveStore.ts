/**
 * Cross-page "rule active" gate, backed by Supabase `system_state.rules_enabled`.
 *
 * The user-facing toggle lives in /automations (Module 02) but several
 * background tickers (Module 01 LiveOpportunities, autopilot, …) and the
 * iPhone preview need to read the same kill-switch.
 *
 * Single source of truth:    public.system_state where id='global'
 * Local mirror (sync read):  module-level cache + localStorage
 * Live updates:              supabase realtime channel on system_state
 *
 * Why a sync getter?  Background ticker code paths (e.g. inside a setInterval
 * callback) need to decide "send / don't send" without awaiting a network
 * round-trip.  We keep a cache that is hydrated once on import and refreshed
 * by the realtime subscription.
 */
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "module2.ruleActive";
const EVENT = "rule-active-change";
const ROW_ID = "global";

let cached: boolean = (() => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
})();
let hydrated = false;

const writeCache = (v: boolean) => {
  cached = v;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* ignore quota errors */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
};

/** Hydrate the cache from Supabase + subscribe to realtime updates.
 *  Called lazily on the first hook usage. */
const hydrate = () => {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  void supabase
    .from("system_state")
    .select("rules_enabled")
    .eq("id", ROW_ID)
    .maybeSingle()
    .then(({ data }) => {
      if (data && typeof data.rules_enabled === "boolean" && data.rules_enabled !== cached) {
        writeCache(data.rules_enabled);
      }
    });
  supabase
    .channel("system-state-rules-enabled")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "system_state", filter: `id=eq.${ROW_ID}` },
      (payload) => {
        const next = (payload.new as { rules_enabled?: boolean })?.rules_enabled;
        if (typeof next === "boolean" && next !== cached) writeCache(next);
      },
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "system_state", filter: `id=eq.${ROW_ID}` },
      (payload) => {
        const next = (payload.new as { rules_enabled?: boolean })?.rules_enabled;
        if (typeof next === "boolean" && next !== cached) writeCache(next);
      },
    )
    .subscribe();
};

/** Synchronous read — safe to call from inside dispatch handlers and tickers. */
export const isRuleActive = (): boolean => cached;

/** Update the flag in Supabase (single source of truth). The realtime channel
 *  + local cache write below keeps every subscriber in sync. */
export const setRuleActiveValue = async (v: boolean): Promise<void> => {
  // Optimistic local update so consumers see the change immediately.
  if (cached !== v) writeCache(v);
  try {
    // Upsert so the row always exists, even on a fresh project.
    await supabase
      .from("system_state")
      .upsert({ id: ROW_ID, rules_enabled: v }, { onConflict: "id" });
  } catch {
    /* network errors leave the optimistic value in place */
  }
};

const subscribe = (cb: () => void) => {
  hydrate();
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  // Cross-tab sync (other tabs use the storage event).
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

/** React hook — re-renders when the flag changes anywhere in the app. */
export const useRuleActive = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => cached,
    () => false,
  );

/** Helper to mirror a React state value into the store. */
export const useSyncRuleActive = (value: boolean) => {
  useEffect(() => {
    void setRuleActiveValue(value);
  }, [value]);
};
