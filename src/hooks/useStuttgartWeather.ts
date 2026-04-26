import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Weather } from "@/components/dashboard/IPhonePreview";

export type WeatherData = {
  city: string;
  weather: Weather;
  description: string;
  temperature: number;
  humidity: number;
  wind: number;
  timestamp: number;
  isFallback: boolean;
};

const FALLBACK: WeatherData = {
  city: "Stuttgart",
  weather: "rain",
  description: "Light rain",
  temperature: 8,
  humidity: 82,
  wind: 3.2,
  timestamp: Date.now(),
  isFallback: true,
};

const mapWeather = (main: string): Weather => {
  const m = main.toLowerCase();
  if (m.includes("rain") || m.includes("drizzle") || m.includes("thunder")) return "rain";
  if (m.includes("snow")) return "snow";
  if (m.includes("clear")) return "sun";
  return "cloud";
};

export const useStuttgartWeather = (pollMs = 60_000) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    // 1) Try the secure edge function (uses OPENWEATHERMAP_API_KEY server-side)
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("get-weather");
      if (fnErr) throw fnErr;
      if (res?.error) throw new Error(res.error);

      // Edge function already returns normalized fields
      if (res && typeof res.temperature === "number") {
        setData({
          city: res.city ?? "Stuttgart",
          weather: res.weather ?? "cloud",
          description: res.description ?? "",
          temperature: res.temperature,
          humidity: res.humidity ?? 0,
          wind: res.wind ?? 0,
          timestamp: res.timestamp ?? Date.now(),
          isFallback: false,
        });
        setError(null);
        setLoading(false);
        return;
      }
      throw new Error("invalid-response");
    } catch (edgeErr) {
      // 2) Fallback to direct client call if a VITE key is provided
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
      if (apiKey) {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=Stuttgart,DE&appid=${apiKey}&units=metric&lang=fr`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`OpenWeather ${res.status}`);
          const json = await res.json();
          setData({
            city: "Stuttgart",
            weather: mapWeather(json.weather?.[0]?.main ?? "Clouds"),
            description: json.weather?.[0]?.description ?? "",
            temperature: Math.round(json.main?.temp ?? 0),
            humidity: json.main?.humidity ?? 0,
            wind: Math.round((json.wind?.speed ?? 0) * 10) / 10,
            timestamp: Date.now(),
            isFallback: false,
          });
          setError(null);
          setLoading(false);
          return;
        } catch (clientErr) {
          // fallthrough to demo data
        }
      }

      // 3) Final fallback: demo data
      const msg = edgeErr instanceof Error ? edgeErr.message : "weather-unavailable";
      setData({ ...FALLBACK, timestamp: Date.now() });
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, pollMs);
    return () => clearInterval(id);
  }, [fetchWeather, pollMs]);

  return { data, loading, error, refresh: fetchWeather };
};
