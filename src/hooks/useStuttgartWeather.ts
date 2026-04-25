import { useEffect, useState, useCallback } from "react";
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
  description: "Pluie légère",
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
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

    if (!apiKey) {
      setData({ ...FALLBACK, timestamp: Date.now() });
      setError("missing-key");
      setLoading(false);
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Stuttgart,DE&appid=${apiKey}&units=metric&lang=fr`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OpenWeather ${res.status}`);
      const json = await res.json();

      const result: WeatherData = {
        city: "Stuttgart",
        weather: mapWeather(json.weather?.[0]?.main ?? "Clouds"),
        description: json.weather?.[0]?.description ?? "",
        temperature: Math.round(json.main?.temp ?? 0),
        humidity: json.main?.humidity ?? 0,
        wind: Math.round((json.wind?.speed ?? 0) * 10) / 10,
        timestamp: Date.now(),
        isFallback: false,
      };
      setData(result);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setData({ ...FALLBACK, timestamp: Date.now() });
      setError(msg);
    } finally {
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
