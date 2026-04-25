import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Computes "Payone traffic density" as a percentage based on the number of
 * redemptions inserted in the last 10 minutes.
 *
 * Mapping: 0 events → 5%, then +9% per event, capped at 95%.
 * Reflects: more in-store transactions ⇒ higher density.
 */
export const useTrafficDensity = () => {
  const [pct, setPct] = useState<number>(15);
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
      const value = Math.min(95, Math.max(5, 5 + n * 9));
      setCount(n);
      setPct(value);
      setLoading(false);
    };

    compute();
    const id = setInterval(compute, 15000);

    const channel = supabase
      .channel(`traffic-density-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "redemptions" },
        compute
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, []);

  const label = pct < 35 ? "Boutique calme" : pct < 65 ? "Activité modérée" : "Forte affluence";
  return { pct, count, label, loading };
};
