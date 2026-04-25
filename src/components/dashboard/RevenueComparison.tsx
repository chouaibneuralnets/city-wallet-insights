import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";

// Données inspirées du PDF City-Wallet : heures creuses (10h, 14h-16h) qui deviennent rentables grâce à l'IA
const HOURLY = [
  { hour: "08h", baseline: 420, boosted: 480, peak: false },
  { hour: "09h", baseline: 380, boosted: 460, peak: false },
  { hour: "10h", baseline: 180, boosted: 540, peak: true },  // creuse
  { hour: "11h", baseline: 240, boosted: 590, peak: true },  // creuse
  { hour: "12h", baseline: 720, boosted: 810, peak: false }, // pic naturel
  { hour: "13h", baseline: 680, boosted: 760, peak: false },
  { hour: "14h", baseline: 210, boosted: 620, peak: true },  // creuse
  { hour: "15h", baseline: 160, boosted: 590, peak: true },  // creuse
  { hour: "16h", baseline: 220, boosted: 640, peak: true },  // creuse
  { hour: "17h", baseline: 480, boosted: 580, peak: false },
  { hour: "18h", baseline: 540, boosted: 660, peak: false },
  { hour: "19h", baseline: 380, boosted: 510, peak: false },
];

const totalBaseline = HOURLY.reduce((s, h) => s + h.baseline, 0);
const totalBoosted = HOURLY.reduce((s, h) => s + h.boosted, 0);
const uplift = totalBoosted - totalBaseline;
const upliftPct = ((uplift / totalBaseline) * 100).toFixed(1);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const base = payload.find((p: any) => p.dataKey === "baseline")?.value ?? 0;
  const boost = payload.find((p: any) => p.dataKey === "boosted")?.value ?? 0;
  const diff = boost - base;
  const pct = base > 0 ? ((diff / base) * 100).toFixed(0) : "0";
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md-elegant min-w-[200px]">
      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label}</div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-sm bg-muted-foreground/60" /> Sans IA
          </span>
          <span className="tabular font-semibold text-foreground">€{base}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-sm bg-primary" /> Avec City-Wallet
          </span>
          <span className="tabular font-semibold text-primary">€{boost}</span>
        </div>
        <div className="border-t border-border/60 pt-1.5 mt-1.5 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Uplift IA</span>
          <span className="tabular font-bold text-success">+€{diff} (+{pct}%)</span>
        </div>
      </div>
    </div>
  );
};

export const RevenueComparison = () => {
  return (
    <Card className="p-6 shadow-sm-elegant border-border/70">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Performance — Sans IA vs City-Wallet (IA Boosted)</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Les <span className="font-semibold text-foreground">heures creuses</span> (zones surlignées) deviennent rentables grâce aux offres contextuelles
          </p>
        </div>
      </div>

      {/* KPI columns */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Revenu sans IA</div>
          <div className="text-2xl font-bold tabular text-foreground">€{totalBaseline.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Baseline POS classique · journée</div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5">
            <ArrowUpRight className="size-3 text-success" />
            <span className="text-[10px] font-bold text-success tabular">+{upliftPct}%</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-primary/80 mb-1">Avec City-Wallet (IA)</div>
          <div className="text-2xl font-bold tabular text-foreground">€{totalBoosted.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Uplift : <span className="font-semibold text-success">+€{uplift.toLocaleString("fr-FR")}</span> sur la journée
          </div>
        </div>
      </div>

      <div className="h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={HOURLY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }} />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(v) => <span className="text-muted-foreground">{v}</span>}
            />
            <Bar dataKey="baseline" name="Sans IA" radius={[3, 3, 0, 0]}>
              {HOURLY.map((d, i) => (
                <Cell key={i} fill="hsl(var(--muted-foreground) / 0.4)" />
              ))}
            </Bar>
            <Bar dataKey="boosted" name="Avec City-Wallet" radius={[3, 3, 0, 0]}>
              {HOURLY.map((d, i) => (
                <Cell key={i} fill={d.peak ? "hsl(var(--success))" : "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-muted-foreground/40" />
          <span>Sans IA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-primary" />
          <span>Avec City-Wallet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-success" />
          <span>Heures creuses re-monétisées</span>
        </div>
      </div>
    </Card>
  );
};
