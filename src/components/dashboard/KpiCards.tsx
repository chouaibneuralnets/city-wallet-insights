import { TrendingUp, TrendingDown, ArrowUpRight, Sparkles, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { useEffect, useRef, useState } from "react";

type Accent = "primary" | "success" | "warning";

const accentMap: Record<Accent, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const formatEuro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

// Hook to detect value changes and trigger a flash animation
const useFlashOnChange = (value: number) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value && prev.current !== 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  return flash;
};

export const KpiCards = () => {
  const { revenueSaved, offersSent, offersAccepted, conversionRate, payoneVolume, loading } =
    useKpiMetrics();

  const flashRevenue = useFlashOnChange(revenueSaved);
  const flashConv = useFlashOnChange(conversionRate);
  const flashPayone = useFlashOnChange(payoneVolume);

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    delta: string;
    trend: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
    accent: Accent;
    flash?: boolean;
    live?: boolean;
  }> = [
    {
      label: "CA sauvé",
      value: formatEuro(revenueSaved),
      sub: `${offersAccepted} paiements acceptés`,
      delta: offersAccepted > 0 ? `+${offersAccepted}` : "—",
      trend: "up",
      icon: ShieldCheck,
      accent: "primary",
      flash: flashRevenue,
      live: true,
    },
    {
      label: "Taux de conversion",
      value: `${conversionRate.toFixed(1)}%`,
      sub: `${offersAccepted} acceptées / ${offersSent} envoyées`,
      delta: conversionRate >= 25 ? "Excellent" : conversionRate > 0 ? "En cours" : "—",
      trend: conversionRate >= 25 ? "up" : "down",
      icon: Zap,
      accent: "success",
      flash: flashConv,
      live: true,
    },
    {
      label: "Volume Payone total",
      value: formatEuro(payoneVolume),
      sub: "Transactions sécurisées",
      delta: payoneVolume > 0 ? "Live" : "—",
      trend: "up",
      icon: ArrowUpRight,
      accent: "primary",
      flash: flashPayone,
      live: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((kpi) => (
        <Card
          key={kpi.label}
          className={cn(
            "p-5 shadow-sm-elegant hover:shadow-md-elegant transition-all border-border/70 relative overflow-hidden",
            kpi.flash && "ring-2 ring-primary/60 shadow-md-elegant"
          )}
        >
          {kpi.live && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold text-success">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-success" />
              </span>
              LIVE
            </span>
          )}
          <div className="flex items-start justify-between mb-4">
            <div className={cn("size-9 rounded-lg flex items-center justify-center", accentMap[kpi.accent])}>
              <kpi.icon className="size-4" />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md mt-4",
                kpi.trend === "up" ? "text-success bg-success/10" : "text-muted-foreground bg-muted"
              )}
            >
              {kpi.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {kpi.delta}
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium mb-1">{kpi.label}</div>
          <div
            className={cn(
              "text-2xl font-bold text-foreground tabular tracking-tight transition-colors",
              kpi.flash && "text-primary"
            )}
          >
            {loading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : kpi.value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
        </Card>
      ))}
    </div>
  );
};
