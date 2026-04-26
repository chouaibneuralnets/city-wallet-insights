import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Payone traffic density — 100% dynamic, tied to the `redemptions` table
 * (the validated-sales ledger written by Mia and Module 03).
 *
 * Formula: density % = (sales_last_10min / 20) * 100
 *   - 20 sales in 10 minutes ⇒ 100% capacity
 *   - Floor: 5% (background noise — proves the sensor is alive)
 *   - Cap:   100%
 *
 * Refresh:
 *   - Recomputed every 10 seconds (polling fallback)
 *   - Live: subscribed to INSERT events on `redemptions` via supabase.channel,
 *     so the gauge moves instantly when a new sale lands.
 *
 * Alert threshold: < 35% ⇒ "Shop quiet"
 */
export const useTrafficDensity = () => {
  const [pct, setPct] = useState<number>(5);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const compute = async () => {
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("redemptions")
        .select("id, created_at")
        .gte("created_at", since);

      if (!mounted) return;
      if (error || !data) {
        setLoading(false);
        return;
      }
      const n = data.length;
      // (sales / 20) * 100, floor 5%, cap 100%
      const raw = (n / 20) * 100;
      const value = Math.min(100, Math.max(5, Math.round(raw)));
      setCount(n);
      setPct(value);
      setLoading(false);
    };

    compute();
    // Recompute every 10 seconds
    const id = setInterval(compute, 10_000);

    // Realtime: instant gauge update on new sales
    const channel = supabase
      .channel(`traffic-density-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "redemptions" },
        compute
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "redemptions" },
        compute
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, []);

  const label =
    pct < 35 ? "Shop quiet" : pct < 65 ? "Moderate activity" : "Heavy traffic";
  const isQuiet = pct < 35;

  return { pct, count, label, loading, isQuiet };
};
