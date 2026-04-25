import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Bucket = { time: string; accepted: number; revenue: number };

const SLOTS = 12; // 12 buckets affichés (~1 minute si tick = 5s)

const seed = (): Bucket[] => {
  const now = Date.now();
  return Array.from({ length: SLOTS }, (_, i) => {
    const t = new Date(now - (SLOTS - 1 - i) * 5000);
    return {
      time: t.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      accepted: Math.floor(Math.random() * 3),
      revenue: Math.floor(Math.random() * 12 + 4),
    };
  });
};

export const LiveAnalytics = () => {
  const [data, setData] = useState<Bucket[]>(seed());
  const [pulse, setPulse] = useState(false);
  const [totalAccepted, setTotalAccepted] = useState(247);
  const [totalRevenue, setTotalRevenue] = useState(3842);
  const pendingRef = useRef({ accepted: 0, revenue: 0 });

  // Tick: every 5s, push a new bucket using accumulated events
  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date();
      const baseAccepted = Math.floor(Math.random() * 2);
      const baseRevenue = Math.floor(Math.random() * 8 + 2);
      const accepted = baseAccepted + pendingRef.current.accepted;
      const revenue = baseRevenue + pendingRef.current.revenue;
      pendingRef.current = { accepted: 0, revenue: 0 };

      setData((prev) => [
        ...prev.slice(1),
        {
          time: t.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          accepted,
          revenue,
        },
      ]);
      setTotalAccepted((v) => v + accepted);
      setTotalRevenue((v) => v + revenue);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Realtime: any change in offers_config simulates an accepted offer
  useEffect(() => {
    const channel = supabase
      .channel("live-analytics-offers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers_config" },
        (payload: any) => {
          const discount = payload.new?.discount_percent ?? 20;
          const revenueImpact = Math.round(8 + discount * 0.6);
          pendingRef.current.accepted += 1;
          pendingRef.current.revenue += revenueImpact;
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const lastBucket = data[data.length - 1];

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Live analytics — Offres acceptées</h2>
            <div className="flex items-center gap-1.5 ml-2">
              <span className={cn("size-2 rounded-full bg-success", pulse ? "animate-ping" : "animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-success">Live</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Réagit en temps réel à chaque acceptation côté <span className="font-semibold text-foreground">app Mia</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-right">
          <div className="rounded-md bg-secondary/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Acceptées</div>
            <div className="flex items-center justify-end gap-1 text-lg font-bold tabular text-foreground">
              <Zap className="size-3.5 text-warning" />
              {totalAccepted}
            </div>
          </div>
          <div className="rounded-md bg-secondary/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenu live</div>
            <div className="flex items-center justify-end gap-1 text-lg font-bold tabular text-success">
              <TrendingUp className="size-3.5" />€{totalRevenue.toLocaleString("fr-FR")}
            </div>
          </div>
        </div>
      </div>

      <div className="h-48 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="liveAccepted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="liveRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#liveRevenue)" />
            <Area type="monotone" dataKey="accepted" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#liveAccepted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-success" />
            <span>Acceptations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-primary" />
            <span>Revenu (€)</span>
          </div>
        </div>
        <div className="tabular">
          Dernier tick · <span className="font-semibold text-foreground">{lastBucket?.accepted ?? 0}</span> offres ·{" "}
          <span className="font-semibold text-success">€{lastBucket?.revenue ?? 0}</span>
        </div>
      </div>
    </Card>
  );
};
