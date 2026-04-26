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
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin" });

const WEATHER_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  rain: { label: "Rain detected", icon: <CloudRain className="size-3.5" /> },
  sun: { label: "Sun detected", icon: <Sun className="size-3.5" /> },
  cloud: { label: "Clouds detected", icon: <Cloud className="size-3.5" /> },
  snow: { label: "Snow detected", icon: <Snowflake className="size-3.5" /> },
};

const SEED: Omit<LogEntry, "id" | "time">[] = [
  {
    level: "trigger",
    message: "Rain detected over Stuttgart Zentrum — weather rule triggered",
    icon: <CloudRain className="size-3.5" />,
  },
  {
    level: "info",
    message: "Offer generated for 1 nearby user (Müller Coffee, -20%)",
    icon: <Users className="size-3.5" />,
  },
  {
    level: "success",
    message: "User accepted · Payone payment €4.20",
    icon: <Zap className="size-3.5" />,
  },
  {
    level: "info",
    message: "Geo zone scan — 12 active wallets within 200m",
    icon: <Radio className="size-3.5" />,
  },
  {
    level: "trigger",
    message: "Off-peak hour 14:32 — +5% boost applied automatically",
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
  { level: "info", message: "Geo zone scan — 8 active wallets within 200m", icon: <Radio className="size-3.5" /> },
  { level: "success", message: "User accepted · Payone payment €3.80", icon: <Zap className="size-3.5" /> },
  { level: "info", message: "ML model recalibrated (latency 42ms)", icon: <Bot className="size-3.5" /> },
  { level: "info", message: "Offer generated for 3 nearby users", icon: <Users className="size-3.5" /> },
  { level: "success", message: "Conversion confirmed · avg ticket +18%", icon: <Zap className="size-3.5" /> },
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
          const product = payload.new?.product ?? "Coffee";
          const discount = payload.new?.discount_percent ?? 20;
          const meta = WEATHER_LABEL[w] ?? { label: `Condition ${w}`, icon: <Cloud className="size-3.5" /> };
          push({
            level: "trigger",
            message: `${meta.label} — rule published: ${product} -${discount}%`,
            icon: meta.icon,
          });
          setTimeout(() => {
            push({
              level: "info",
              message: `Offer broadcast to ${Math.floor(Math.random() * 12 + 3)} nearby users`,
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
            message: `Rule updated automatically (${payload.new?.product ?? "offer"})`,
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
          <h2 className="text-base font-semibold tracking-tight">AI Log — Autonomous Activity</h2>
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
        <span>● {logs.length} events · postgres_changes stream</span>
        <span className="tabular">offers_config · public</span>
      </div>
    </Card>
  );
};
