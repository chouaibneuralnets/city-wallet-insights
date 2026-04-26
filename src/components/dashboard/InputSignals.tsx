import { Cloud, CloudRain, Sun, Snowflake, Wind, Droplets, Activity, Trophy, MapPin, Loader2, CalendarDays, Music, ShoppingBasket, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrafficDensity } from "@/hooks/useTrafficDensity";
import { getCurrentStuttgartEvent, type StuttgartEvent } from "@/data/stuttgartEvents";
import { useEffect, useState } from "react";
import { useSignals } from "@/context/SignalsContext";
import { cn } from "@/lib/utils";

const weatherIcon = (w?: string) => {
  switch (w) {
    case "rain": return CloudRain;
    case "sun": return Sun;
    case "snow": return Snowflake;
    default: return Cloud;
  }
};

const weatherLabel = (w?: string) => {
  switch (w) {
    case "rain": return "Pluie";
    case "sun": return "Ensoleillé";
    case "snow": return "Neige";
    case "cloud": return "Nuageux";
    default: return "—";
  }
};

export const InputSignals = () => {
  const { weather, weatherLoading: loading, temperatureC } = useSignals();
  const { pct: trafficPct, count: salesCount, isQuiet } = useTrafficDensity();
  const [event, setEvent] = useState<StuttgartEvent | null>(() => getCurrentStuttgartEvent());

  // Refresh "current event" each minute so the displayed event reflects system time.
  useEffect(() => {
    const id = setInterval(() => setEvent(getCurrentStuttgartEvent()), 60_000);
    return () => clearInterval(id);
  }, []);

  const trafficLabel =
    trafficPct < 35 ? "Shop quiet" : trafficPct < 65 ? "Moderate activity" : "Heavy traffic";
  const trafficColor =
    trafficPct < 35 ? "text-warning" : trafficPct < 65 ? "text-primary" : "text-success";
  const trafficBar =
    trafficPct < 35 ? "bg-warning" : trafficPct < 65 ? "bg-primary" : "bg-success";

  const WIcon = weatherIcon(weather?.weather);

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Incoming Signals — IoT Sensors</h3>
        </div>
        <Badge variant="outline" className="gap-1.5 border-success/40 bg-success/10 text-success font-mono text-[10px]">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          STREAMING
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Weather widget */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Weather · Stuttgart
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {weather?.isFallback ? "demo" : "live API"}
            </span>
          </div>
          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3">
                <WIcon className="size-10 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold tabular leading-none text-foreground">
                      {temperatureC ?? "—"}°C
                    </div>
                    {weather?.isFallback && (
                      <span
                        title="API key missing or unavailable — simulated values"
                        className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-warning"
                      >
                        <span className="size-1 rounded-full bg-warning animate-pulse" />
                        Demo data
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {weather?.description ?? weatherLabel(weather?.weather)}
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

        {/* Payone traffic gauge */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Payone traffic density
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{salesCount} sales / 10min</span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div className={cn("text-3xl font-bold tabular leading-none", trafficColor)}>
              {trafficPct}%
            </div>
            <div className="flex items-center gap-2">
              {isQuiet && (
                <Badge
                  variant="outline"
                  className="gap-1 border-warning/40 bg-warning/10 text-warning text-[9px] font-bold uppercase tracking-widest animate-pulse"
                >
                  <span className="size-1.5 rounded-full bg-warning" />
                  Shop quiet
                </Badge>
              )}
              <span className={cn("text-[11px] font-semibold", trafficColor)}>{trafficLabel}</span>
            </div>
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

        {/* Event badge — dynamic based on system time */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Current event — Stuttgart
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">geo-feed</span>
          </div>
          {event ? (() => {
            const Icon =
              event.category === "sport" ? Trophy
              : event.category === "culture" ? Music
              : event.category === "festival" ? PartyPopper
              : ShoppingBasket;
            const tone =
              event.level === "hot"
                ? { wrap: "bg-warning/10 border-warning/30", icon: "text-warning", badge: "bg-warning text-warning-foreground hover:bg-warning", label: "HOT" }
                : event.level === "warm"
                ? { wrap: "bg-primary/10 border-primary/30", icon: "text-primary", badge: "bg-primary text-primary-foreground hover:bg-primary", label: "LIVE" }
                : { wrap: "bg-secondary/40 border-border/60", icon: "text-primary", badge: "bg-secondary text-foreground hover:bg-secondary", label: "INFO" };
            return (
              <div className="space-y-2">
                <div className={cn("flex items-start gap-2.5 p-2.5 rounded-lg border", tone.wrap)}>
                  <Icon className={cn("size-4 mt-0.5 shrink-0", tone.icon)} />
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-foreground leading-tight">
                      {event.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {event.start}–{event.end} · {event.venue} · {event.distanceKm.toFixed(1)}km
                    </div>
                  </div>
                  <Badge className={cn("ml-auto shrink-0 text-[9px]", tone.badge)}>{tone.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <CalendarDays className="size-3" />
                  <MapPin className="size-3" /> Stuttgart-Mitte · weekly agenda
                </div>
              </div>
            );
          })() : (
            <div className="text-xs text-muted-foreground">No nearby events.</div>
          )}
        </div>
      </div>
    </Card>
  );
};
