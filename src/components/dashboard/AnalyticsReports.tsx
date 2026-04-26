import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Thermometer, Users, TrendingUp } from "lucide-react";

const WEATHER_PERF = [
  { weather: "Rain", offers: 142, accepted: 98, conv: 69 },
  { weather: "Sun", offers: 88, accepted: 41, conv: 47 },
  { weather: "Cloudy", offers: 110, accepted: 61, conv: 55 },
  { weather: "Snow", offers: 64, accepted: 49, conv: 77 },
];

const TEMP_PERF = [
  { temp: "0°", conv: 38 },
  { temp: "5°", conv: 45 },
  { temp: "10°", conv: 58 },
  { temp: "15°", conv: 71 },
  { temp: "20°", conv: 64 },
  { temp: "25°", conv: 52 },
  { temp: "30°", conv: 41 },
];

const COHORTS = [
  { trait: "Reactivity <2min", mia: 88, baseline: 42 },
  { trait: "Push acceptance", mia: 71, baseline: 28 },
  { trait: "Repeat visit", mia: 64, baseline: 31 },
  { trait: "Avg basket", mia: 78, baseline: 50 },
  { trait: "Geoloc <500m", mia: 92, baseline: 60 },
  { trait: "Weather sensitivity", mia: 81, baseline: 22 },
];

export const AnalyticsReports = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 shadow-sm-elegant border-border/70 lg:col-span-2">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="size-4 text-primary" />
              <h3 className="text-base font-semibold tracking-tight">Performance by weather condition</h3>
            </div>
            <p className="text-xs text-muted-foreground">AI offer conversion rate by real weather (last 30 days)</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEATHER_PERF} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="weather" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="offers" name="Offers sent" fill="hsl(var(--muted-foreground) / 0.4)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="accepted" name="Accepted" radius={[3, 3, 0, 0]}>
                {WEATHER_PERF.map((d, i) => (
                  <Cell key={i} fill={d.conv >= 65 ? "hsl(var(--success))" : "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 shadow-sm-elegant border-border/70">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="text-base font-semibold tracking-tight">Conversion vs Temperature</h3>
            </div>
            <p className="text-xs text-muted-foreground">Receptiveness peak around 15°C (cool weather)</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TEMP_PERF}>
              <defs>
                <linearGradient id="tempLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="temp" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Conversion"]}
              />
              <Line
                type="monotone"
                dataKey="conv"
                stroke="url(#tempLine)"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 shadow-sm-elegant border-border/70">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-4 text-primary" />
              <h3 className="text-base font-semibold tracking-tight">Mia vs Baseline customer behavior</h3>
            </div>
            <p className="text-xs text-muted-foreground">Radar profile: City-Wallet users vs standard customers</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={COHORTS}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="trait" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={30} />
              <Radar name="Mia (City-Wallet)" dataKey="mia" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
              <Radar name="Baseline" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.15} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
