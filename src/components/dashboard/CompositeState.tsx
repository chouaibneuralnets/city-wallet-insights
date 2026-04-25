import { CloudRain, Sun, Cloud, Clock, Users, Sparkles, ArrowRight, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SignalLevel = "active" | "passive";

type Signal = {
  key: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  level: SignalLevel;
};

export const CompositeState = () => {
  const { data: weather } = useStuttgartWeather();
  const [proximityCount, setProximityCount] = useState(3);

  // Listen to offers_config inserts as proxy for "client à proximité détecté"
  useEffect(() => {
    const channel = supabase
      .channel("composite-state-proximity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers_config" },
        () => setProximityCount((c) => Math.min(c + 1, 12))
      )
      .subscribe();
    const id = setInterval(() => {
      setProximityCount((c) => Math.max(1, c + (Math.random() > 0.5 ? 1 : -1)));
    }, 8000);
    return () => {
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, []);

  const hour = new Date().getHours();
  const isOffPeak = (hour >= 10 && hour < 12) || (hour >= 14 && hour < 17);
  const isRain = weather?.weather === "rain";
  const isCloud = weather?.weather === "cloud";

  const signals: Signal[] = [
    {
      key: "weather",
      label: isRain ? "Pluie détectée" : isCloud ? "Couvert" : weather?.weather === "snow" ? "Neige" : "Ciel dégagé",
      detail: weather ? `${weather.temperature?.toFixed(0)}°C · Stuttgart` : "Capteur météo",
      icon: isRain ? CloudRain : isCloud ? Cloud : Sun,
      level: isRain || isCloud ? "active" : "passive",
    },
    {
      key: "time",
      label: isOffPeak ? "Heure creuse" : "Heure standard",
      detail: `${hour.toString().padStart(2, "0")}h${new Date().getMinutes().toString().padStart(2, "0")}`,
      icon: Clock,
      level: isOffPeak ? "active" : "passive",
    },
    {
      key: "proximity",
      label: `${proximityCount} client${proximityCount > 1 ? "s" : ""} à proximité`,
      detail: "Rayon 200m · géofence",
      icon: Users,
      level: proximityCount >= 2 ? "active" : "passive",
    },
  ];

  const activeCount = signals.filter((s) => s.level === "active").length;
  const opportunityLevel =
    activeCount >= 3 ? "haute" : activeCount === 2 ? "moyenne" : "basse";
  const opportunityColor =
    activeCount >= 3 ? "success" : activeCount === 2 ? "warning" : "muted";

  const colorMap = {
    success: {
      ring: "ring-success/40",
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/40",
      glow: "shadow-[0_0_30px_-5px_hsl(var(--success)/0.5)]",
    },
    warning: {
      ring: "ring-warning/40",
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/40",
      glow: "shadow-[0_0_30px_-5px_hsl(var(--warning)/0.4)]",
    },
    muted: {
      ring: "ring-border",
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
      glow: "",
    },
  } as const;

  const c = colorMap[opportunityColor];

  return (
    <Card className={cn("p-0 shadow-md border-border/70 overflow-hidden", c.glow)}>
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative size-7 rounded-lg bg-primary/10 grid place-items-center">
            <Brain className="size-3.5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-success animate-pulse" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight">Diagnostic du contexte actuel</h2>
        </div>
        <Badge variant="outline" className="gap-1.5 font-mono text-[10px] border-border/60">
          {activeCount}/3 signaux actifs
        </Badge>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Signal pills */}
          <div className="space-y-2">
            {signals.map((s) => {
              const cls =
                s.level === "active"
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/60 bg-secondary/40 text-muted-foreground";
              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                    cls
                  )}
                >
                  <div className={cn("size-8 rounded-md grid place-items-center shrink-0",
                    s.level === "active" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                  )}>
                    <s.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold leading-tight truncate">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{s.detail}</div>
                  </div>
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      s.level === "active" ? "bg-success animate-pulse" : "bg-muted-foreground/40"
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Arrow */}
          <div className="hidden md:flex flex-col items-center text-muted-foreground">
            <ArrowRight className="size-5" />
            <span className="text-[9px] font-mono uppercase tracking-widest mt-1">SLM fuse</span>
          </div>

          {/* Result */}
          <div className={cn("rounded-xl border-2 p-5 text-center", c.border, c.bg)}>
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ring-1 mb-2", c.ring, c.bg)}>
              <Sparkles className={cn("size-3", c.text)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", c.text)}>
                Composite state
              </span>
            </div>
            <div className={cn("text-3xl font-bold tracking-tight capitalize", c.text)}>
              Opportunité {opportunityLevel}
            </div>
            <p className="text-[12px] text-muted-foreground mt-2 leading-snug">
              {activeCount >= 3
                ? "Tous les signaux convergent — déclenchement offre auto-recommandé."
                : activeCount === 2
                ? "2 conditions remplies — règle prête à se déclencher."
                : "Veille active — en attente de signaux contextuels."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
