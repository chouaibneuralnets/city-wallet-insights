import { CloudRain, Sun, Snowflake, Users, TrendingUp, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

const conditions = [
  { icon: CloudRain, label: "Weather", value: "Light rain", trend: "12°C", active: true },
  { icon: Users, label: "Traffic", value: "Low", trend: "-32% vs avg.", active: true },
  { icon: TrendingUp, label: "Peak hour", value: "Off-peak", trend: "14:30", active: false },
  { icon: MapPin, label: "Zone", value: "Downtown", trend: "847 active", active: false },
];

export const ContextPanel = () => {
  return (
    <Card className="p-5 shadow-sm-elegant border-border/70">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Real-time context</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Currently detected conditions</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {conditions.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
              c.active ? "bg-primary-soft/50 border-primary/20" : "bg-secondary/40 border-transparent"
            }`}
          >
            <div
              className={`size-8 rounded-md flex items-center justify-center ${
                c.active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
              }`}
            >
              <c.icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-muted-foreground font-medium">{c.label}</div>
              <div className="text-sm font-semibold text-foreground truncate">{c.value}</div>
            </div>
            <div className="text-xs text-muted-foreground tabular shrink-0">{c.trend}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gradient-primary text-primary-foreground">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Recommendation</div>
        <div className="text-sm font-semibold mt-0.5">2 conditions met — rule ready to trigger</div>
      </div>
    </Card>
  );
};
