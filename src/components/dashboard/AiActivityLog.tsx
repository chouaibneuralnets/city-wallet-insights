import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Cloud, CloudRain, Sun, Snowflake, Users, Zap, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type LogLevel = "info" | "success" | "trigger";
type LogEntry = {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
  icon: React.ReactNode;
};

const fmtTime = (d = new Date()) =>
  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const WEATHER_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  rain: { label: "Pluie détectée", icon: <CloudRain className="size-3.5" /> },
  sun: { label: "Soleil détecté", icon: <Sun className="size-3.5" /> },
  cloud: { label: "Nuages détectés", icon: <Cloud className="size-3.5" /> },
  snow: { label: "Neige détectée", icon: <Snowflake className="size-3.5" /> },
};

const SEED: Omit<LogEntry, "id" | "time">[] = [
  {
    level: "trigger",
    message: "Pluie détectée sur Stuttgart Zentrum — déclenchement règle météo",
    icon: <CloudRain className="size-3.5" />,
  },
  {
    level: "info",
    message: "Offre générée pour 1 utilisateur proche (Café Müller, -20%)",
    icon: <Users className="size-3.5" />,
  },
  {
    level: "success",
    message: "Acceptation utilisateur · paiement Payone €4.20",
    icon: <Zap className="size-3.5" />,
  },
  {
    level: "info",
    message: "Scan zone géo — 12 portefeuilles actifs dans 200m",
    icon: <Radio className="size-3.5" />,
  },
  {
    level: "trigger",
    message: "Heure creuse 14h32 — boost +5% appliqué automatiquement",
    icon: <Bot className="size-3.5" />,
  },
];

const seedLogs = (): LogEntry[] => {
  const now = Date.now();
  return SEED.map((s, i) => ({
    ...s,
    id: `seed-${i}`,
    time: fmtTime(new Date(now - (SEED.length - i) * 17000)),
  })).reverse();
};

const RANDOM_INFO: Omit<LogEntry, "id" | "time">[] = [
  { level: "info", message: "Scan zone géo — 8 portefeuilles actifs dans 200m", icon: <Radio className="size-3.5" /> },
  { level: "success", message: "Acceptation utilisateur · paiement Payone €3.80", icon: <Zap className="size-3.5" /> },
  { level: "info", message: "Modèle ML re-calibré (latence 42ms)", icon: <Bot className="size-3.5" /> },
  { level: "info", message: "Offre générée pour 3 utilisateurs proches", icon: <Users className="size-3.5" /> },
  { level: "success", message: "Conversion confirmée · ticket moyen +18%", icon: <Zap className="size-3.5" /> },
];

export const AiActivityLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>(seedLogs());
  const counterRef = useRef(0);

  const push = (entry: Omit<LogEntry, "id" | "time">) => {
    counterRef.current += 1;
    setLogs((prev) =>
      [
        { ...entry, id: `log-${Date.now()}-${counterRef.current}`, time: fmtTime() },
        ...prev,
      ].slice(0, 40)
    );
  };

  // Realtime: react to offers_config changes (= IA published a rule)
  useEffect(() => {
    const channel = supabase
      .channel("ai-activity-log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers_config" },
        (payload: any) => {
          const w = payload.new?.weather as string;
          const product = payload.new?.product ?? "Café";
          const discount = payload.new?.discount_percent ?? 20;
          const meta = WEATHER_LABEL[w] ?? { label: `Condition ${w}`, icon: <Cloud className="size-3.5" /> };
          push({
            level: "trigger",
            message: `${meta.label} — règle publiée : ${product} -${discount}%`,
            icon: meta.icon,
          });
          setTimeout(() => {
            push({
              level: "info",
              message: `Offre diffusée à ${Math.floor(Math.random() * 12 + 3)} utilisateurs proches`,
              icon: <Users className="size-3.5" />,
            });
          }, 1200);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "offers_config" },
        (payload: any) => {
          push({
            level: "info",
            message: `Règle mise à jour automatiquement (${payload.new?.product ?? "offre"})`,
            icon: <Bot className="size-3.5" />,
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Background activity ticker — proves the system works alone
  useEffect(() => {
    const id = setInterval(() => {
      const entry = RANDOM_INFO[Math.floor(Math.random() * RANDOM_INFO.length)];
      push(entry);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="size-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-success animate-pulse" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">Journal IA — Activité autonome</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-success">Streaming</span>
        </div>
      </div>

      <div className="flex-1 max-h-[420px] overflow-y-auto bg-secondary/20 font-mono">
        <ul className="divide-y divide-border/50">
          {logs.map((log, idx) => (
            <li
              key={log.id}
              className={cn(
                "flex items-start gap-3 px-5 py-2.5 text-[12px] leading-snug transition-colors",
                idx === 0 && "bg-primary/5 animate-in fade-in slide-in-from-top-1 duration-300"
              )}
            >
              <span className="tabular text-muted-foreground/80 shrink-0 mt-0.5">{log.time}</span>
              <span
                className={cn(
                  "shrink-0 mt-0.5 size-5 rounded grid place-items-center",
                  log.level === "trigger" && "bg-primary/15 text-primary",
                  log.level === "success" && "bg-success/15 text-success",
                  log.level === "info" && "bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {log.icon}
              </span>
              <span
                className={cn(
                  "flex-1",
                  log.level === "trigger" && "text-foreground font-medium",
                  log.level === "success" && "text-foreground",
                  log.level === "info" && "text-muted-foreground"
                )}
              >
                {log.message}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                  log.level === "trigger" && "bg-primary/10 text-primary",
                  log.level === "success" && "bg-success/10 text-success",
                  log.level === "info" && "bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {log.level === "trigger" ? "AI" : log.level === "success" ? "TX" : "INFO"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-2.5 border-t border-border/60 bg-card text-[10px] text-muted-foreground flex items-center justify-between font-mono">
        <span>● {logs.length} événements · stream postgres_changes</span>
        <span className="tabular">offers_config · public</span>
      </div>
    </Card>
  );
};
