import { useEffect } from "react";
import {
  Activity,
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  Droplets,
  Wind,
  Loader2,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignals } from "@/context/SignalsContext";
import { useTrafficDensity } from "@/hooks/useTrafficDensity";
import { cn } from "@/lib/utils";
import type { Weather } from "./IPhonePreview";

const weatherIcon = (w?: string) => {
  switch (w) {
    case "rain":
      return CloudRain;
    case "sun":
      return Sun;
    case "snow":
      return Snowflake;
    default:
      return Cloud;
  }
};

const weatherLabel = (w?: string) => {
  switch (w) {
    case "rain":
      return "Rain";
    case "sun":
      return "Clear sky";
    case "snow":
      return "Snow";
    case "cloud":
      return "Cloudy";
    default:
      return "—";
  }
};

type Props = {
  /** Push the API-detected weather UP so the rule + iPhone preview reflect it. */
  onWeatherDetected: (w: Weather) => void;
  /** Push live "trafficLow" (density < 35%) so the rule auto-validates. */
  onTrafficLowDetected: (low: boolean) => void;
  /** Notify parent about live signals (used by the AI Strategy Log display). */
  onLiveStateChange?: (state: {
    trafficPct: number;
    weatherLabel: string;
  }) => void;
};

/**
 * Module 02 mirror of Module 01's "Signaux entrants".
 * Same data sources (OpenWeather edge function, redemptions gauge, wallet_pings).
 * Drives the rule automatically — no manual selectors.
 */
export const Module2Signals = ({
  onWeatherDetected,
  onTrafficLowDetected,
  onLiveStateChange,
}: Props) => {
  const { weather, weatherLoading, temperatureC, proximityCount } = useSignals();
  const { pct: trafficPct, count: salesCount } = useTrafficDensity();

  const liveWeather = weather?.weather;
  const trafficLow = trafficPct < 35;

  // Mirror Module 01 → Module 02 (auto-bind).
  useEffect(() => {
    if (liveWeather) onWeatherDetected(liveWeather);
  }, [liveWeather, onWeatherDetected]);

  useEffect(() => {
    onTrafficLowDetected(trafficLow);
  }, [trafficLow, onTrafficLowDetected]);

  // Notify parent (Automations) so the AI Strategy Log can display live context.
  useEffect(() => {
    onLiveStateChange?.({
      trafficPct,
      weatherLabel: weatherLabel(liveWeather),
    });
  }, [trafficPct, liveWeather, onLiveStateChange]);


  const WIcon = weatherIcon(liveWeather);
  const trafficColor =
    trafficPct < 35 ? "text-warning" : trafficPct < 65 ? "text-primary" : "text-success";
  const trafficBar =
    trafficPct < 35 ? "bg-warning" : trafficPct < 65 ? "bg-primary" : "bg-success";

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Incoming Signals — IoT Sensors</h3>
          <span className="text-[10px] font-mono text-muted-foreground">Module 01 → 02 · live mirror</span>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 border-success/40 bg-success/10 text-success font-mono text-[10px]"
        >
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          STREAMING
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Météo — same source as Module 01 (OpenWeather edge function) */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Weather · Stuttgart
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {weather?.isFallback ? "demo" : "live API"}
            </span>
          </div>
          {weatherLoading ? (
            <div className="h-20 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3">
                <WIcon className="size-10 text-primary" />
                <div>
                  <div className="text-3xl font-bold tabular leading-none text-foreground">
                    {temperatureC ?? "—"}°C
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {weather?.description ?? weatherLabel(liveWeather)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Droplets className="size-3" /> {weather?.humidity ?? "—"}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="size-3" /> {weather?.wind?.toFixed(1) ?? "—"} m/s
                </span>
              </div>
            </>
          )}
        </div>

        {/* Densité Payone — same redemptions hook */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Payone traffic density
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {salesCount} sales / 10min
            </span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div className={cn("text-3xl font-bold tabular leading-none", trafficColor)}>
              {trafficPct}%
            </div>
            <span className={cn("text-[11px] font-semibold", trafficColor)}>
              {trafficLow ? "Shop quiet" : trafficPct < 65 ? "Moderate activity" : "Heavy traffic"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", trafficBar)}
              style={{ width: `${trafficPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>0%</span>
            <span>AI offer threshold · 35%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Nearby customers — wallet_pings (same as Module 01 map) */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Nearby customers
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">geofence 200m</span>
          </div>
          <div className="flex items-end gap-3">
            <Users className="size-10 text-primary" />
            <div>
              <div className="text-3xl font-bold tabular leading-none text-foreground">
                {proximityCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                active wallets around Café Müller
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground font-mono">
            source: <span className="text-foreground">wallet_pings · realtime</span>
          </div>
        </div>
      </div>

    </Card>
  );
};
