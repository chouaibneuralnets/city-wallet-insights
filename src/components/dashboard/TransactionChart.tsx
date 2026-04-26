import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const data = [
  { day: "Lun", payone: 4200, contextuel: 1100, total: 5300 },
  { day: "Mar", payone: 3800, contextuel: 1450, total: 5250 },
  { day: "Mer", payone: 5100, contextuel: 1820, total: 6920 },
  { day: "Jeu", payone: 4700, contextuel: 2100, total: 6800 },
  { day: "Ven", payone: 6800, contextuel: 2950, total: 9750 },
  { day: "Sam", payone: 8200, contextuel: 3400, total: 11600 },
  { day: "Dim", payone: 5400, contextuel: 2200, total: 7600 },
];

const ranges = ["7j", "30j", "90j"] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md-elegant">
      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label}</div>
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-sm" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}</span>
            <span className="ml-auto font-semibold tabular text-foreground">€{p.value.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TransactionChart = () => {
  const [range, setRange] = useState<(typeof ranges)[number]>("7j");
  const [view, setView] = useState<"area" | "bar">("area");

  const total = data.reduce((s, d) => s + d.total, 0);
  const contextual = data.reduce((s, d) => s + d.contextuel, 0);

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight mb-1">Payone transaction volume</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground tabular">€{total.toLocaleString("en-US")}</span>
            <span className="text-sm text-success font-semibold">+18.2%</span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-primary" />
              <span className="text-muted-foreground">Payone standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm" style={{ background: "hsl(var(--chart-3))" }} />
              <span className="text-muted-foreground">
                Contextual offers · <span className="font-semibold text-foreground">€{contextual.toLocaleString("en-US")}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg bg-secondary p-0.5">
            {(["area", "bar"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                  view === v ? "bg-card text-foreground shadow-sm-elegant" : "text-muted-foreground"
                )}
              >
                {v === "area" ? "Area" : "Bars"}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center rounded-lg bg-secondary p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  range === r ? "bg-card text-foreground shadow-sm-elegant" : "text-muted-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          {view === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="payoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="contextGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="payone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#payoneGrad)"
              />
              <Area
                type="monotone"
                dataKey="contextuel"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                fill="url(#contextGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
              <Bar dataKey="payone" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="contextuel" stackId="a" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
