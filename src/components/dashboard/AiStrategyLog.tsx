import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Terminal,
  Zap,
  Radar,
  Gauge,
  Brain,
  Send,
  Pause,
  Bot,
  CheckCircle2,
  AlertCircle,
  Hand,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LogLevel = "scan" | "detect" | "compute" | "send" | "idle" | "manual";

type LogEntry = {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
  icon: React.ReactNode;
};

const fmtTime = (d = new Date()) =>
  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin" });

const levelMeta: Record<LogLevel, { tag: string; cls: string }> = {
  scan: { tag: "SCAN", cls: "text-primary bg-primary/10" },
  detect: { tag: "DETECT", cls: "text-warning bg-warning/10" },
  compute: { tag: "COMPUTE", cls: "text-foreground bg-foreground/10" },
  send: { tag: "SEND", cls: "text-success bg-success/10" },
  idle: { tag: "IDLE", cls: "text-muted-foreground bg-muted-foreground/10" },
  manual: { tag: "MANUAL", cls: "text-warning bg-warning/15" },
};

type Props = {
  /** Are the live conditions matching the active rule right now? */
  ruleSatisfied: boolean;
  /** Live density in % (0-100). */
  trafficPct: number;
  /** Live weather label, e.g. "Ciel dégagé". */
  weatherLabel: string;
  /** Last AI-generated message text (kept in sync with iPhone preview). */
  message: string;
  /** Currently selected product (Café, Croissant…). */
  product: string;
  /** Active discount (0-50). */
  discount: number;
};

export const AiStrategyLog = ({
  ruleSatisfied,
  trafficPct,
  weatherLabel,
  message,
  product,
  discount,
}: Props) => {
  const [autopilot, setAutopilot] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const counterRef = useRef(0);
  const lastAutoPushRef = useRef<number>(0);
  const lastSatisfiedRef = useRef<boolean>(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const push = (entry: Omit<LogEntry, "id" | "time">) => {
    counterRef.current += 1;
    setLogs((prev) =>
      [
        { ...entry, id: `strat-${Date.now()}-${counterRef.current}`, time: fmtTime() },
        ...prev,
      ].slice(0, 60),
    );
  };

  // Seed a few "boot" lines on first mount
  useEffect(() => {
    push({ level: "scan", message: "Initialisation de l'AI Strategy Engine…", icon: <Bot className="size-3.5" /> });
    push({ level: "scan", message: "Connexion stream postgres_changes (offers_config)", icon: <Terminal className="size-3.5" /> });
  }, []);

  // Heartbeat: log the AI "thinking" steps every 6s based on live signals
  useEffect(() => {
    const id = setInterval(() => {
      push({
        level: "scan",
        message: `Scan zone géo — capteurs IoT actifs · ${trafficPct}% densité`,
        icon: <Radar className="size-3.5" />,
      });
      push({
        level: "detect",
        message: `Détection densité Payone : ${trafficPct}% (seuil 35%)`,
        icon: <Gauge className="size-3.5" />,
      });
      push({
        level: "compute",
        message: `Composite State = [${weatherLabel}] × [Densité ${trafficPct}%] × [${product}]`,
        icon: <Brain className="size-3.5" />,
      });
    }, 6500);
    return () => clearInterval(id);
  }, [trafficPct, weatherLabel, product]);

  // React when conditions become satisfied / lost
  useEffect(() => {
    if (ruleSatisfied && !lastSatisfiedRef.current) {
      push({
        level: "detect",
        message: `Conditions remplies — règle déclenchée automatiquement`,
        icon: <CheckCircle2 className="size-3.5" />,
      });
    } else if (!ruleSatisfied && lastSatisfiedRef.current) {
      push({
        level: "idle",
        message: `Conditions perdues — passage en veille`,
        icon: <AlertCircle className="size-3.5" />,
      });
    }
    lastSatisfiedRef.current = ruleSatisfied;
  }, [ruleSatisfied]);

  // Autopilot: when ON + conditions satisfied → auto-deploy every 25s max
  useEffect(() => {
    if (!autopilot || !ruleSatisfied || !message) return;
    const tick = async () => {
      const now = Date.now();
      if (now - lastAutoPushRef.current < 25000) return;
      lastAutoPushRef.current = now;
      push({
        level: "send",
        message: `Envoi auto vers Supabase · "${message.slice(0, 60)}${message.length > 60 ? "…" : ""}"`,
        icon: <Send className="size-3.5" />,
      });
      const { error } = await supabase.from("offers_config").insert({
        weather: "sun",
        discount_percent: discount,
        product,
        traffic_condition: trafficPct < 35 ? "low" : "normal",
        active: true,
        tone: "Amical",
        message,
        generated_text: message,
      });
      if (error) {
        push({
          level: "idle",
          message: `Erreur d'envoi auto : ${error.message}`,
          icon: <AlertCircle className="size-3.5" />,
        });
      }
    };
    tick();
    const id = setInterval(tick, 25000);
    return () => clearInterval(id);
  }, [autopilot, ruleSatisfied, message, product, discount, trafficPct]);

  // When autopilot is OFF and conditions become satisfied → suggest manual
  useEffect(() => {
    if (autopilot) return;
    if (!ruleSatisfied) return;
    push({
      level: "manual",
      message: `Offre suggérée par l'IA — En attente de validation manuelle`,
      icon: <Hand className="size-3.5" />,
    });
    toast("Offre suggérée par l'IA", {
      description: "En attente de validation manuelle (Pilote auto OFF).",
      icon: <Hand className="size-4 text-warning" />,
    });
  }, [autopilot, ruleSatisfied]);

  // Realtime feedback: every offers_config INSERT (including manual deploys)
  useEffect(() => {
    const channel = supabase
      .channel("ai-strategy-log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers_config" },
        (payload: any) => {
          const text = (payload.new?.generated_text ?? payload.new?.message ?? "") as string;
          push({
            level: "send",
            message: `Offre envoyée vers Supabase · ${payload.new?.product ?? "Café"} -${payload.new?.discount_percent ?? 20}% · "${text.slice(0, 50)}${text.length > 50 ? "…" : ""}"`,
            icon: <Zap className="size-3.5" />,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to top (newest at top, so we scroll the container to top)
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = 0;
  }, [logs.length]);

  const handleClear = () => setLogs([]);

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between gap-3 bg-foreground text-background">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="size-4 text-success" />
          <h3 className="text-sm font-semibold tracking-tight truncate">
            AI Strategy Log — Console temps réel
          </h3>
          <span className="font-mono text-[10px] text-background/60 hidden sm:inline">
            module-02 · strategist.ts
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                autopilot ? "bg-success animate-pulse" : "bg-warning",
              )}
            />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pilote automatique IA
            </span>
            <Switch checked={autopilot} onCheckedChange={setAutopilot} />
            <Badge
              className={cn(
                "font-mono text-[9px]",
                autopilot
                  ? "bg-success text-success-foreground hover:bg-success"
                  : "bg-warning text-warning-foreground hover:bg-warning",
              )}
            >
              {autopilot ? "ON" : "OFF"}
            </Badge>
          </div>
        </div>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 max-h-[360px] min-h-[260px] overflow-y-auto bg-[#0b0f17] font-mono"
      >
        {logs.length === 0 ? (
          <div className="px-5 py-8 text-center text-[11px] text-muted-foreground/70 font-mono">
            $ waiting for AI signals…
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {logs.map((log, idx) => (
              <li
                key={log.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-2 text-[11.5px] leading-snug",
                  idx === 0 && "bg-white/5 animate-in fade-in slide-in-from-top-1 duration-300",
                )}
              >
                <span className="tabular text-success/70 shrink-0 mt-0.5">{log.time}</span>
                <span
                  className={cn(
                    "shrink-0 mt-0.5 size-5 rounded grid place-items-center",
                    levelMeta[log.level].cls,
                  )}
                >
                  {log.icon}
                </span>
                <span
                  className={cn(
                    "flex-1 break-words",
                    log.level === "send" && "text-success",
                    log.level === "detect" && "text-warning",
                    log.level === "compute" && "text-white/90",
                    log.level === "scan" && "text-white/70",
                    log.level === "idle" && "text-white/50",
                    log.level === "manual" && "text-warning",
                  )}
                >
                  {log.message}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                    levelMeta[log.level].cls,
                  )}
                >
                  {levelMeta[log.level].tag}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 py-2.5 border-t border-border/60 bg-card text-[10px] text-muted-foreground flex items-center justify-between font-mono gap-3">
        <span className="truncate">
          ● {logs.length} événements · stream postgres_changes · {ruleSatisfied ? "rule=match" : "rule=idle"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {!autopilot && (
            <span className="inline-flex items-center gap-1 text-warning">
              <Pause className="size-3" /> validation manuelle requise
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={handleClear}
          >
            clear
          </Button>
        </div>
      </div>
    </Card>
  );
};
