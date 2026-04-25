import { TrendingUp, TrendingDown, ArrowUpRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Kpi = {
  label: string;
  value: string;
  sub: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "success" | "warning";
};

const kpis: Kpi[] = [
  {
    label: "Chiffre d'affaires sauvé",
    value: "€12,847",
    sub: "30 derniers jours",
    delta: "+18.2%",
    trend: "up",
    icon: ShieldCheck,
    accent: "primary",
  },
  {
    label: "Taux de conversion",
    value: "27.4%",
    sub: "Offres contextuelles",
    delta: "+4.1 pts",
    trend: "up",
    icon: Zap,
    accent: "success",
  },
  {
    label: "Offres IA déclenchées",
    value: "1,284",
    sub: "Cette semaine",
    delta: "+312",
    trend: "up",
    icon: Sparkles,
    accent: "warning",
  },
  {
    label: "Volume Payone",
    value: "€48,512",
    sub: "Transactions traitées",
    delta: "-2.4%",
    trend: "down",
    icon: ArrowUpRight,
    accent: "primary",
  },
];

const accentMap = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export const KpiCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className="p-5 shadow-sm-elegant hover:shadow-md-elegant transition-shadow border-border/70"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn("size-9 rounded-lg flex items-center justify-center", accentMap[kpi.accent])}>
              <kpi.icon className="size-4" />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md",
                kpi.trend === "up" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
              )}
            >
              {kpi.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {kpi.delta}
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium mb-1">{kpi.label}</div>
          <div className="text-2xl font-bold text-foreground tabular tracking-tight">{kpi.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
        </Card>
      ))}
    </div>
  );
};
