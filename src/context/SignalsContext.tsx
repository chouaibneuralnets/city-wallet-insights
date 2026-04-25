import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStuttgartWeather, type WeatherData } from "@/hooks/useStuttgartWeather";
import { useProximityPings, type ProximityPing } from "@/hooks/useProximityPings";
import { supabase } from "@/integrations/supabase/client";
import { getStuttgartParts, type StuttgartParts } from "@/lib/stuttgartTime";

/**
 * Single Source of Truth for live IoT signals.
 *
 * - Weather: shared, rounded to integer (12°C identique partout)
 * - Proximity: real Supabase `wallet_pings` within 200m & last 5 min
 * - Time: live ticker each second so `21:24` updates to `21:25` in real time
 */

export type Wallet = {
  id: string;
  /** 0..1 normalized coordinates inside the map */
  x: number;
  y: number;
  isMia?: boolean;
};

type SignalsContextValue = {
  weather: WeatherData | null;
  weatherLoading: boolean;
  /** Always rounded to nearest integer — single source of truth */
  temperatureC: number | null;
  /** Live wall-clock — updates every second */
  now: Date;
  /** Real wallet pings from Supabase */
  pings: ProximityPing[];
  /** Wallets normalized to map coordinates */
  wallets: Wallet[];
  miaDetected: boolean;
  proximityCount: number;
  pingsLoading: boolean;
};

const SignalsContext = createContext<SignalsContextValue | null>(null);

const CAFE_LAT = 48.7758;
const CAFE_LNG = 9.1829;
// At Stuttgart latitude, ~200m corresponds to ~0.0018° lat / ~0.0027° lng.
// Map area covers ~400m diameter (200m radius geofence + margin).
const LAT_RANGE = 0.0036;
const LNG_RANGE = 0.0054;

const pingToWallet = (p: ProximityPing): Wallet => {
  // Normalize geo coords → 0..1 viewport coords (centered on Café Müller)
  const dx = (p.lng - CAFE_LNG) / LNG_RANGE;
  const dy = (CAFE_LAT - p.lat) / LAT_RANGE; // flip Y for screen coords
  return {
    id: p.id,
    x: Math.min(0.92, Math.max(0.08, 0.5 + dx)),
    y: Math.min(0.92, Math.max(0.08, 0.5 + dy)),
    isMia: p.is_mia,
  };
};

export const SignalsProvider = ({ children }: { children: ReactNode }) => {
  const { data: weather, loading: weatherLoading } = useStuttgartWeather();
  const { pings, miaDetected, count, loading: pingsLoading } = useProximityPings();

  const [now, setNow] = useState(() => new Date());
  const lastPingRef = useRef<number>(0);

  // Live wall-clock ticking every second.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Keep the geofence "alive" — if fewer than 5 fresh pings, insert a new
  // anonymous wallet ping every ~30s. Simulates real foot-traffic around
  // Café Müller and feeds the realtime channel.
  useEffect(() => {
    const id = setInterval(async () => {
      if (Date.now() - lastPingRef.current < 25_000) return;
      if (count >= 5) return;
      lastPingRef.current = Date.now();

      // Random GPS within ~150m of Café Müller (48.7758, 9.1829)
      const r = Math.sqrt(Math.random()) * 0.0014;
      const a = Math.random() * Math.PI * 2;
      const lat = CAFE_LAT + r * Math.cos(a);
      const lng = CAFE_LNG + r * Math.sin(a) * 1.5;
      await supabase.from("wallet_pings").insert({
        wallet_id: `w-live-${Math.random().toString(36).slice(2, 8)}`,
        lat,
        lng,
        is_mia: false,
      });
    }, 10_000);
    return () => clearInterval(id);
  }, [count]);

  const temperatureC = useMemo(() => {
    if (!weather || typeof weather.temperature !== "number") return null;
    return Math.round(weather.temperature);
  }, [weather]);

  const wallets = useMemo(() => pings.map(pingToWallet), [pings]);

  const value: SignalsContextValue = {
    weather,
    weatherLoading,
    temperatureC,
    now,
    pings,
    wallets,
    miaDetected,
    proximityCount: count,
    pingsLoading,
  };

  return <SignalsContext.Provider value={value}>{children}</SignalsContext.Provider>;
};

export const useSignals = () => {
  const ctx = useContext(SignalsContext);
  if (!ctx) {
    throw new Error("useSignals must be used inside <SignalsProvider />");
  }
  return ctx;
};
