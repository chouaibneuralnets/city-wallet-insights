/**
 * Cross-page "rule active" gate.
 *
 * The user-facing toggle lives in /automations (Module 02) but several
 * background tickers (Module 01 LiveOpportunities, autopilot, …) also try
 * to insert offers into Supabase. They must respect the same kill-switch.
 *
 * We persist the flag in localStorage so it survives navigation, and emit
 * a custom event ("rule-active-change") so listeners on the same tab react
 * immediately (the native `storage` event only fires on OTHER tabs).
 */
import { useEffect, useSyncExternalStore } from "react";

const KEY = "module2.ruleActive";
const EVENT = "rule-active-change";

/** Synchronous read — safe to call from inside dispatch handlers. */
export const isRuleActive = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/** Update the flag and broadcast the change to all subscribers. */
export const setRuleActiveValue = (v: boolean) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* ignore quota errors */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
};

const subscribe = (cb: () => void) => {
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
    () => isRuleActive(),
    () => false,
  );

/** Helper to mirror a React state value into the store. */
export const useSyncRuleActive = (value: boolean) => {
  useEffect(() => {
    setRuleActiveValue(value);
  }, [value]);
};
