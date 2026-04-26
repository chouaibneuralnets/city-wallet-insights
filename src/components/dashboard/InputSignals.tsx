import { Cloud, CloudRain, Sun, Snowflake, Wind, Droplets, Activity, Trophy, MapPin, Loader2, CalendarDays, Music, ShoppingBasket, PartyPopper } from "lucide-react";
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
    case "rain": return "Rainy";
    case "sun": return "Sunny";
    case "snow": return "Snowy";
    case "cloud": return "Cloudy";
    default: return "—";
  }
};

const weatherGradient = (w?: string) => {
  switch (w) {
    case "rain": return "from-sky-300/30 to-indigo-400/30";
    case "sun": return "from-amber-300/40 to-orange-400/40";
    case "snow": return "from-cyan-200/40 to-blue-300/40";
    default: return "from-slate-300/30 to-slate-400/30";
  }
};

export const InputSignals = () => {
  const { weather, weatherLoading: loading, temperatureC } = useSignals();
  const { pct: trafficPct, count: salesCount, isQuiet } = useTrafficDensity();
  const [event, setEvent] = useState<StuttgartEvent | null>(() => getCurrentStuttgartEvent());

  useEffect(() => {
    const id = setInterval(() => setEvent(getCurrentStuttgartEvent()), 60_000);
    return () => clearInterval(id);
  }, []);

  const trafficLabel =
    trafficPct < 35 ? "Shop quiet" : trafficPct < 65 ? "Moderate" : "Heavy traffic";
  const trafficGradient =
    trafficPct < 35 ? "from-peach to-orange-400"
    : trafficPct < 65 ? "from-primary to-primary-glow"
    : "from-accent to-emerald-400";

  const WIcon = weatherIcon(weather?.weather);

  return (
    <div className="rounded-3xl glass-strong shadow-sm-elegant overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Activity className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Incoming signals</h3>
            <div className="text-[10px] text-muted-foreground font-mono">IoT sensors · realtime</div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-accent-soft text-accent-foreground text-[10px] font-bold uppercase tracking-[0.14em]">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          Streaming
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/30">
        {/* Weather widget */}
        <div className="relative p-5 bg-card/40 backdrop-blur overflow-hidden group">
          <div className={cn(
            "absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-50 bg-gradient-to-br transition-opacity group-hover:opacity-70",
            weatherGradient(weather?.weather)
          )} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Weather · Stuttgart
              </span>
              <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/60">
                {weather?.isFallback ? "demo" : "live"}
              </span>
            </div>
            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <div className="size-14 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center shadow-sm-elegant border border-border/40">
                    <WIcon className="size-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-4xl font-bold tabular leading-none text-foreground tracking-tight">
                      {temperatureC ?? "—"}°
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 capitalize font-medium">
                      {weather?.description ?? weatherLabel(weather?.weather)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 text-foreground border border-border/30">
                    <Droplets className="size-3 text-primary" /> {weather?.humidity ?? "—"}%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 text-foreground border border-border/30">
                    <Wind className="size-3 text-primary" /> {weather?.wind?.toFixed(1) ?? "—"} m/s
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payone traffic gauge */}
        <div className="relative p-5 bg-card/40 backdrop-blur overflow-hidden group">
          <div className={cn(
            "absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br transition-opacity group-hover:opacity-50",
            trafficGradient
          )} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Payone density
              </span>
              <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/60">
                {salesCount}/10min
              </span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div className="text-4xl font-bold tabular leading-none tracking-tight text-foreground">
                {trafficPct}<span className="text-xl text-muted-foreground">%</span>
              </div>
              {isQuiet && (
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-peach-soft text-peach text-[10px] font-bold uppercase tracking-wider animate-pulse-soft">
                  <span className="size-1.5 rounded-full bg-peach" />
                  Quiet
                </div>
              )}
            </div>
            {/* Glassy gauge */}
            <div className="relative h-3 w-full rounded-full bg-white/50 border border-border/30 overflow-hidden shadow-inset-soft">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 shadow-md-elegant", trafficGradient)}
                style={{ width: `${trafficPct}%` }}
              />
              {/* Threshold marker */}
              <div className="absolute inset-y-0 left-[35%] w-px bg-foreground/30" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>0%</span>
              <span className="text-primary font-semibold">▲ AI threshold 35%</span>
              <span>100%</span>
            </div>
            <div className="mt-3 text-xs font-semibold text-foreground">{trafficLabel}</div>
          </div>
        </div>

        {/* Event badge */}
        <div className="relative p-5 bg-card/40 backdrop-blur overflow-hidden group">
          <div className="absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary/40 to-accent/40" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Live event
              </span>
              <span className="font-mono text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/60">geo-feed</span>
            </div>
            {event ? (() => {
              const Icon =
                event.category === "sport" ? Trophy
                : event.category === "culture" ? Music
                : event.category === "festival" ? PartyPopper
                : ShoppingBasket;
              const tone =
                event.level === "hot"
                  ? { ring: "ring-peach/30", icon: "bg-gradient-peach text-white", badge: "bg-peach text-white", label: "HOT" }
                  : event.level === "warm"
                  ? { ring: "ring-primary/30", icon: "bg-gradient-primary text-white", badge: "bg-primary text-primary-foreground", label: "LIVE" }
                  : { ring: "ring-border", icon: "bg-secondary text-foreground", badge: "bg-secondary text-foreground", label: "INFO" };
              return (
                <div className="space-y-2.5">
                  <div className={cn("flex items-start gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur border border-border/40 ring-1", tone.ring)}>
                    <div className={cn("size-9 rounded-xl flex items-center justify-center shadow-sm-elegant shrink-0", tone.icon)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md", tone.badge)}>
                          {tone.label}
                        </span>
                      </div>
                      <div className="text-[12px] font-semibold text-foreground leading-tight">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {event.start}–{event.end} · {event.distanceKm.toFixed(1)}km
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono pl-1">
                    <CalendarDays className="size-3" />
                    <MapPin className="size-3" />
                    {event.venue} · Stuttgart-Mitte
                  </div>
                </div>
              );
            })() : (
              <div className="text-xs text-muted-foreground py-8 text-center">No nearby events.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
