import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type KpiMetrics = {
  revenueSaved: number;       // Sum of accepted redemptions amount
  offersSent: number;         // Count of redemptions with status 'sent' or 'accepted'
  offersAccepted: number;     // Count of redemptions with status 'accepted'
  conversionRate: number;     // accepted / sent * 100
  payoneVolume: number;       // Sum of all amounts (gross)
  loading: boolean;
};

const initial: KpiMetrics = {
  revenueSaved: 0,
  offersSent: 0,
  offersAccepted: 0,
  conversionRate: 0,
  payoneVolume: 0,
  loading: true,
};

export const useKpiMetrics = () => {
  const [metrics, setMetrics] = useState<KpiMetrics>(initial);

  const compute = (rows: Array<{ amount: number; status: string }>) => {
    const sent = rows.length;
    const accepted = rows.filter((r) => r.status === "accepted");
    const revenueSaved = accepted.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const payoneVolume = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const conversionRate = sent > 0 ? (accepted.length / sent) * 100 : 0;

    setMetrics({
      revenueSaved,
      offersSent: sent,
      offersAccepted: accepted.length,
      conversionRate,
      payoneVolume,
      loading: false,
    });
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("redemptions")
      .select("amount, status")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!error && data) compute(data as any);
    else setMetrics((m) => ({ ...m, loading: false }));
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("kpi-redemptions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "redemptions" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return metrics;
};
