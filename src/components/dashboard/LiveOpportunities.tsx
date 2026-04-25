import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Coffee, GraduationCap, Briefcase, Radar, Zap, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import { useSignals } from "@/context/SignalsContext";

type OpportunityStatus = "scanning" | "sending" | "converted";
type Segment = "loyals" | "newcomers" | "commuters";

type Opportunity = {
  id: string;
  time: string;
  profile: string;
  action: string;
  status: OpportunityStatus;
  segment: Segment;
  icon: React.ReactNode;
  highlight?: boolean;
};

const fmtTime = (d = new Date()) =>
  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin" });

const SEGMENT_META: Record<Segment, { label: string; color: string; icon: React.ReactNode }> = {
  loyals: { label: "Loyals", color: "hsl(var(--chart-1))", icon: <Sparkles className="size-3" /> },
  newcomers: { label: "Newcomers", color: "hsl(var(--chart-3))", icon: <GraduationCap className="size-3" /> },
  commuters: { label: "Commuters", color: "hsl(var(--chart-4))", icon: <Briefcase className="size-3" /> },
};

const STATUS_META: Record<OpportunityStatus, { label: string; cls: string; dot: string }> = {
  scanning: {
    label: "Scanning",
    cls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  sending: {
    label: "Sending",
    cls: "bg-warning/15 text-warning-foreground border-warning/40",
    dot: "bg-warning",
  },
  converted: {
    label: "Converted",
    cls: "bg-success/15 text-success border-success/40",
    dot: "bg-success",
  },
};

const SEED: Omit<Opportunity, "id" | "time">[] = [
  {
    profile: "Travailleur matinal détecté (8:05)",
    action: "Envoi offre Espresso rapide",
    status: "sending",
    segment: "commuters",
    icon: <Briefcase className="size-3.5" />,
  },
  {
    profile: "Étudiant détecté sous la pluie",
    action: "Offre Cappuccino +25%",
    status: "scanning",
    segment: "newcomers",
    icon: <GraduationCap className="size-3.5" />,
  },
  {
    profile: "Client fidèle (12 visites/mois)",
    action: "Push pré-réservation",
    status: "converted",
    segment: "loyals",
    icon: <Sparkles className="size-3.5" />,
  },
  {
    profile: "Alerte fréquentation -30%",
    action: "Extension géo-fence → 500m",
    status: "sending",
    segment: "newcomers",
    icon: <Radar className="size-3.5" />,
  },
];

const RANDOM_OPPS: Omit<Opportunity, "id" | "time">[] = [
  {
    profile: "Profil Commuter — quartier S-Bahn",
    action: "Café & croissant -15%",
    status: "sending",
    segment: "commuters",
    icon: <Briefcase className="size-3.5" />,
  },
  {
    profile: "Nouveau passant détecté (1ère fois)",
    action: "Welcome offer Cappuccino",
    status: "scanning",
    segment: "newcomers",
    icon: <GraduationCap className="size-3.5" />,
  },
  {
    profile: "Loyal — historique 30j positif",
    action: "Pré-commande prioritaire",
    status: "converted",
    segment: "loyals",
    icon: <Sparkles className="size-3.5" />,
  },
  {
    profile: "Pic météo détecté — 4 wallets proches",
    action: "Offre boisson chaude groupée",
    status: "sending",
    segment: "commuters",
    icon: <Coffee className="size-3.5" />,
  },
  {
    profile: "Étudiant proche campus — pause 14h",
    action: "Cookie + café -20%",
    status: "scanning",
    segment: "newcomers",
    icon: <GraduationCap className="size-3.5" />,
  },
];

export const LiveOpportunities = () => {
  const [opps, setOpps] = useState<Opportunity[]>(() =>
    SEED.map((s, i) => ({
      ...s,
      id: `seed-${i}`,
      time: fmtTime(new Date(Date.now() - (SEED.length - i) * 11000)),
    })).reverse()
  );
  const [counts, setCounts] = useState<Record<Segment, number>>({
    loyals: 8,
    newcomers: 14,
    commuters: 11,
  });
  const counterRef = useRef(0);
  const { data: weather } = useStuttgartWeather();

  const push = (entry: Omit<Opportunity, "id" | "time">) => {
    counterRef.current += 1;
    setOpps((prev) =>
      [
        { ...entry, id: `opp-${Date.now()}-${counterRef.current}`, time: fmtTime() },
        ...prev,
      ].slice(0, 25)
    );
    setCounts((c) => ({ ...c, [entry.segment]: c[entry.segment] + 1 }));
  };

  // Background ticker — autonomous AI scanning
  useEffect(() => {
    const id = setInterval(() => {
      const entry = RANDOM_OPPS[Math.floor(Math.random() * RANDOM_OPPS.length)];
      push(entry);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  // Special "Mia" opportunity → triggers Supabase insert into offers_config
  useEffect(() => {
    const id = setInterval(async () => {
      // 1 in 4 chance to trigger the Mia scenario
      if (Math.random() > 0.25) return;

      const isRain = weather?.weather === "rain";
      push({
        profile: "Profil Mia détecté · étudiante, zone campus",
        action: isRain
          ? "Pluie — Cappuccino +25% envoyé"
          : "Pause étudiante — Cappuccino +20%",
        status: "sending",
        segment: "newcomers",
        icon: <GraduationCap className="size-3.5" />,
        highlight: true,
      });

      // Trigger the actual Supabase insert (links to Mia's app via realtime)
      try {
        await supabase.from("offers_config").insert({
          weather: isRain ? "rain" : "cloud",
          discount_percent: isRain ? 25 : 20,
          product: "Cappuccino",
          traffic_condition: "low",
          active: true,
        });
        setTimeout(() => {
          push({
            profile: "Mia — offre acceptée dans l'app",
            action: "Paiement Payone confirmé €3.80",
            status: "converted",
            segment: "newcomers",
            icon: <CheckCircle2 className="size-3.5" />,
            highlight: true,
          });
        }, 2200);
      } catch (e) {
        // Silent fail — UI continues
      }
    }, 18000);
    return () => clearInterval(id);
  }, [weather?.weather]);

  const total = counts.loyals + counts.newcomers + counts.commuters;
  const pieData = (Object.keys(counts) as Segment[]).map((k) => ({
    name: SEGMENT_META[k].label,
    value: counts[k],
    color: SEGMENT_META[k].color,
    key: k,
  }));

  return (
    <Card className="p-0 shadow-md border-border/70 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="relative size-8 rounded-lg bg-primary/10 grid place-items-center">
            <Brain className="size-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-success ring-2 ring-card animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight leading-tight">
              Opportunités détectées en direct
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              IA · scan continu · {total} profils analysés aujourd'hui
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 border-success/40 bg-success/10 text-success font-mono text-[10px]">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          AI ACTIVE
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Live feed */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border/60">
          <div className="max-h-[380px] overflow-y-auto">
            <ul className="divide-y divide-border/50">
              {opps.map((opp, idx) => {
                const status = STATUS_META[opp.status];
                const seg = SEGMENT_META[opp.segment];
                return (
                  <li
                    key={opp.id}
                    className={cn(
                      "px-5 py-3 flex items-start gap-3 transition-colors",
                      idx === 0 && "bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300",
                      opp.highlight && "bg-accent/40 border-l-2 border-l-primary"
                    )}
                  >
                    <span
                      className="shrink-0 mt-0.5 size-7 rounded-md grid place-items-center"
                      style={{ background: `${seg.color}20`, color: seg.color }}
                    >
                      {opp.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground tabular">
                          {opp.time}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: `${seg.color}18`, color: seg.color }}
                        >
                          {seg.label}
                        </span>
                        {opp.highlight && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                            ★ Mia
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-foreground leading-snug truncate">
                        {opp.profile}
                      </p>
                      <p className="text-[12px] text-muted-foreground leading-snug truncate flex items-center gap-1">
                        <Zap className="size-3 shrink-0" />
                        <span className="truncate">{opp.action}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        status.cls
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", status.dot, opp.status !== "converted" && "animate-pulse")} />
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Audience segmentation */}
        <div className="lg:col-span-2 p-5 bg-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Segmentation audience
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">{total} offres</span>
          </div>

          <div className="h-[160px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2 mt-4">
            {pieData.map((entry) => {
              const pct = total ? Math.round((entry.value / total) * 100) : 0;
              return (
                <li key={entry.key} className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 rounded-sm shrink-0"
                    style={{ background: entry.color }}
                  />
                  <span className="flex-1 text-[12px] font-medium text-foreground">
                    {entry.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular">
                    {entry.value}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-foreground tabular w-9 text-right">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Modèle ML actif · latence 42ms
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
