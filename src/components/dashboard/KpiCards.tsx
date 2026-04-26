import { TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { useEffect, useRef, useState } from "react";

type Accent = "primary" | "mint" | "peach";

const accentMap: Record<Accent, { bg: string; ring: string; glow: string; text: string }> = {
  primary: {
    bg: "bg-gradient-primary",
    ring: "ring-primary/20",
    glow: "shadow-glow",
    text: "text-primary",
  },
  mint: {
    bg: "bg-gradient-mint",
    ring: "ring-accent/20",
    glow: "shadow-glow-mint",
    text: "text-accent-foreground",
  },
  peach: {
    bg: "bg-gradient-peach",
    ring: "ring-peach/20",
    glow: "shadow-glow-peach",
    text: "text-foreground",
  },
};

const formatEuro = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

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
  }> = [
    {
      label: "Revenue saved",
      value: formatEuro(revenueSaved),
      sub: `${offersAccepted} accepted payments`,
      delta: offersAccepted > 0 ? `+${offersAccepted}` : "—",
      trend: "up",
      icon: ShieldCheck,
      accent: "primary",
      flash: flashRevenue,
    },
    {
      label: "Conversion rate",
      value: `${conversionRate.toFixed(1)}%`,
      sub: `${offersAccepted} of ${offersSent} sent`,
      delta: conversionRate >= 25 ? "Excellent" : conversionRate > 0 ? "Active" : "—",
      trend: conversionRate >= 25 ? "up" : "down",
      icon: Zap,
      accent: "mint",
      flash: flashConv,
    },
    {
      label: "Payone volume",
      value: formatEuro(payoneVolume),
      sub: "Secure transactions today",
      delta: payoneVolume > 0 ? "Live" : "—",
      trend: "up",
      icon: ArrowUpRight,
      accent: "peach",
      flash: flashPayone,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((kpi, idx) => {
        const a = accentMap[kpi.accent];
        return (
          <div
            key={kpi.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl glass-strong p-5 shadow-sm-elegant hover:shadow-md-elegant transition-all duration-300 animate-slide-up",
              kpi.flash && cn("ring-2", a.ring, a.glow)
            )}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Decorative blob */}
            <div
              className={cn(
                "absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity",
                a.bg
              )}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div
                  className={cn(
                    "size-11 rounded-2xl flex items-center justify-center text-white shadow-md-elegant",
                    a.bg
                  )}
                >
                  <kpi.icon className="size-5" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full",
                    kpi.trend === "up"
                      ? "bg-accent-soft text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {kpi.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {kpi.delta}
                </div>
              </div>

              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5">
                {kpi.label}
              </div>
              <div
                className={cn(
                  "text-[28px] font-bold text-foreground tabular tracking-tight leading-none transition-colors",
                  kpi.flash && "gradient-text"
                )}
              >
                {loading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : kpi.value}
              </div>
              <div className="text-xs text-muted-foreground mt-2">{kpi.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
