import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live proximity tracker — counts City-Wallet pings within 200m of the
 * Café Müller (48.7758° N, 9.1829° E) over the last 5 minutes.
 *
 * Backed by the `wallet_pings` Supabase table + Realtime channel so the
 * counter updates instantly whenever a wallet moves into the geofence.
 */

const CAFE_LAT = 48.7758;
const CAFE_LNG = 9.1829;
const RADIUS_M = 200;
const FRESHNESS_MS = 5 * 60 * 1000; // 5 minutes

export type ProximityPing = {
  id: string;
  wallet_id: string;
  lat: number;
  lng: number;
  is_mia: boolean;
  created_at: string;
};

// Haversine distance in meters
const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const useProximityPings = () => {
  const [pings, setPings] = useState<ProximityPing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPings = async () => {
      const since = new Date(Date.now() - FRESHNESS_MS).toISOString();
      const { data, error } = await supabase
        .from("wallet_pings")
        .select("id, wallet_id, lat, lng, is_mia, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error || !data) {
        setLoading(false);
        return;
      }

      // Keep only the most recent ping per wallet, within the geofence.
      // Robust Mia detection: trust the `is_mia` flag OR a wallet_id starting with "mia".
      const seen = new Set<string>();
      const fresh = data
        .map((p) => ({
          ...p,
          is_mia: p.is_mia || /^mia[-_]?/i.test(p.wallet_id),
        }))
        .filter((p) => {
          if (seen.has(p.wallet_id)) return false;
          seen.add(p.wallet_id);
          return distanceMeters(CAFE_LAT, CAFE_LNG, p.lat, p.lng) <= RADIUS_M;
        });

      setPings(fresh);
      setLoading(false);
    };

    fetchPings();
    const id = setInterval(fetchPings, 10000);

    const channel = supabase
      .channel(`wallet-pings-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallet_pings" },
        fetchPings
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, []);

  const miaPing = pings.find((p) => p.is_mia) ?? null;
  const nonMia = pings.filter((p) => !p.is_mia);

  return {
    pings,
    nonMiaPings: nonMia,
    miaPing,
    miaDetected: !!miaPing,
    count: pings.length,
    loading,
    cafe: { lat: CAFE_LAT, lng: CAFE_LNG, radius: RADIUS_M },
  };
};
