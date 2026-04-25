import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStuttgartWeather, type WeatherData } from "@/hooks/useStuttgartWeather";

/**
 * Single Source of Truth for live IoT signals.
 *
 * - Weather is shared (same temperature everywhere, rounded to integer).
 * - Proximity wallets are owned by this context so the map and the
 *   "X clients à proximité" counter NEVER disagree.
 */

export type Wallet = {
  id: string;
  /** 0..1 normalized coordinates inside the geofence area */
  x: number;
  y: number;
  isMia?: boolean;
};

type SignalsContextValue = {
  weather: WeatherData | null;
  weatherLoading: boolean;
  /** Always rounded to nearest integer — single source of truth */
  temperatureC: number | null;
  wallets: Wallet[];
  miaDetected: boolean;
  /** Number of wallets currently rendered (== dot count on the mini-map) */
  proximityCount: number;
};

const SignalsContext = createContext<SignalsContextValue | null>(null);

const randomWallet = (id: string, isMia = false): Wallet => {
  const r = Math.sqrt(Math.random()) * 0.85;
  const a = Math.random() * Math.PI * 2;
  return { id, x: 0.5 + (r * Math.cos(a)) / 2, y: 0.5 + (r * Math.sin(a)) / 2, isMia };
};

export const SignalsProvider = ({ children }: { children: ReactNode }) => {
  const { data: weather, loading: weatherLoading } = useStuttgartWeather();

  const [wallets, setWallets] = useState<Wallet[]>(() => [
    randomWallet("w1"),
    randomWallet("w2"),
    randomWallet("w3"),
  ]);
  const [miaDetected, setMiaDetected] = useState(false);

  // Drift wallets so the dots feel "alive" without changing the count.
  useEffect(() => {
    const id = setInterval(() => {
      setWallets((prev) =>
        prev.map((w) =>
          w.isMia
            ? w
            : {
                ...w,
                x: Math.min(0.92, Math.max(0.08, w.x + (Math.random() - 0.5) * 0.02)),
                y: Math.min(0.92, Math.max(0.08, w.y + (Math.random() - 0.5) * 0.02)),
              }
        )
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Slowly fluctuate population (1..6 non-Mia wallets) to mimic a live geofence.
  useEffect(() => {
    const id = setInterval(() => {
      setWallets((prev) => {
        const others = prev.filter((w) => !w.isMia);
        const mia = prev.find((w) => w.isMia);
        const direction = Math.random() > 0.5 ? 1 : -1;
        let nextOthers = others;
        if (direction > 0 && others.length < 6) {
          nextOthers = [...others, randomWallet(`w-${Date.now()}`)];
        } else if (direction < 0 && others.length > 1) {
          nextOthers = others.slice(1);
        }
        return mia ? [...nextOthers, mia] : nextOthers;
      });
    }, 9000);
    return () => clearInterval(id);
  }, []);

  // Mia is detected when an offer is dispatched (Project 2 simulator).
  useEffect(() => {
    const channel = supabase
      .channel(`signals-mia-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers_config" },
        () => {
          setMiaDetected(true);
          setWallets((prev) => {
            const without = prev.filter((w) => !w.isMia);
            return [...without, randomWallet(`mia-${Date.now()}`, true)];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-clear Mia after 15s of inactivity (re-arm whenever miaDetected flips true).
  useEffect(() => {
    if (!miaDetected) return;
    const t = setTimeout(() => {
      setMiaDetected(false);
      setWallets((prev) => prev.filter((w) => !w.isMia));
    }, 15000);
    return () => clearTimeout(t);
  }, [miaDetected]);

  const temperatureC = useMemo(() => {
    if (!weather || typeof weather.temperature !== "number") return null;
    return Math.round(weather.temperature);
  }, [weather]);

  const value: SignalsContextValue = {
    weather,
    weatherLoading,
    temperatureC,
    wallets,
    miaDetected,
    proximityCount: wallets.length,
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
