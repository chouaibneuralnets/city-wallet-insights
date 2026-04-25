import { Cloud, CloudRain, Sun, Snowflake, Wind, Droplets, Activity, Trophy, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const { data: weather, loading } = useStuttgartWeather();
  const [trafficPct, setTrafficPct] = useState(20);

  // Compute "Payone traffic density" from accepted vs sent redemptions (last hour-ish)
  useEffect(() => {
    let mounted = true;
    const compute = async () => {
      const { data } = await supabase
        .from("redemptions")
        .select("status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!mounted || !data) return;
      const accepted = data.filter((d: any) => d.status === "accepted").length;
      // map 0..50 events → 5..95 %
      const pct = Math.min(95, Math.max(5, 5 + accepted * 8 + Math.floor(Math.random() * 10)));
      setTrafficPct(pct);
    };
    compute();
    const id = setInterval(compute, 12000);
    const channel = supabase
      .channel("input-signals-payone")
      .on("postgres_changes", { event: "*", schema: "public", table: "redemptions" }, compute)
      .subscribe();
    return () => {
      mounted = false;
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, []);

  const trafficLabel =
    trafficPct < 30 ? "Boutique calme" : trafficPct < 65 ? "Activité modérée" : "Forte affluence";
  const trafficColor =
    trafficPct < 30 ? "text-warning" : trafficPct < 65 ? "text-primary" : "text-success";
  const trafficBar =
    trafficPct < 30 ? "bg-warning" : trafficPct < 65 ? "bg-primary" : "bg-success";

  const WIcon = weatherIcon(weather?.weather);

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Signaux entrants — Capteurs IoT</h3>
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
              Météo · Stuttgart
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">live API</span>
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
                  <div className="text-3xl font-bold tabular leading-none text-foreground">
                    {weather?.temperature?.toFixed(0) ?? "—"}°C
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
              Densité trafic Payone
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">in-store</span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div className={cn("text-3xl font-bold tabular leading-none", trafficColor)}>
              {trafficPct}%
            </div>
            <span className={cn("text-[11px] font-semibold", trafficColor)}>{trafficLabel}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", trafficBar)}
              style={{ width: `${trafficPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>0%</span>
            <span>seuil offre IA · 35%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Event badge */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Événements à proximité
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">geo-feed</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-warning/10 border border-warning/30">
              <Trophy className="size-4 text-warning mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-foreground leading-tight">
                  VfB Stuttgart — match à 1km
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Coup d'envoi 18h30 · MHPArena
                </div>
              </div>
              <Badge className="ml-auto shrink-0 text-[9px] bg-warning text-warning-foreground hover:bg-warning">HOT</Badge>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border/60">
              <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-foreground leading-tight">
                  Marché de Schillerplatz — actif
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Flux piéton +18% · 350m
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
