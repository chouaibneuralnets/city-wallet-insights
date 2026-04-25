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
};

export const useStuttgartWeather = (pollMs = 60_000) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("get-weather");
      if (fnErr) throw fnErr;
      if (res?.error) throw new Error(res.error);
      setData(res as WeatherData);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
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
