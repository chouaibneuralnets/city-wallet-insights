import { CloudRain, Sun, Snowflake, Cloud, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import type { Weather } from "./IPhonePreview";
import { cn } from "@/lib/utils";

const weatherMeta: Record<
  Weather,
  { icon: React.ComponentType<{ className?: string }>; label: string; tone: string }
> = {
  rain: { icon: CloudRain, label: "Pluie", tone: "text-primary" },
  sun: { icon: Sun, label: "Soleil", tone: "text-warning" },
  snow: { icon: Snowflake, label: "Neige", tone: "text-primary" },
  cloud: { icon: Cloud, label: "Nuageux", tone: "text-muted-foreground" },
};

export const MarketStatus = ({
  onWeatherDetected,
}: {
  onWeatherDetected?: (w: Weather) => void;
}) => {
  const { data, loading, error, refresh } = useStuttgartWeather();

  const w = data?.weather ?? "cloud";
  const meta = weatherMeta[w];
  const Icon = meta.icon;

  return (
    <Card className="p-5 shadow-sm-elegant border-border/70">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Statut actuel du marché</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="size-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Stuttgart, DE · OpenWeatherMap</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10">
            <span className={cn("size-1.5 rounded-full bg-success", !loading && "animate-pulse")} />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">
              {loading ? "Sync" : "Live"}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-xs text-destructive">
            Impossible de récupérer la météo réelle. {error}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-primary-soft/60 to-secondary/40 border border-primary/15">
            <div className="size-14 rounded-xl bg-background flex items-center justify-center shadow-sm">
              <Icon className={cn("size-7", meta.tone)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Conditions réelles
              </div>
              <div className="text-xl font-semibold text-foreground tracking-tight">
                {meta.label}
              </div>
              <div className="text-xs text-muted-foreground capitalize truncate">
                {data?.description || "—"}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-foreground tabular leading-none">
                {data ? `${data.temperature}°` : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Ressenti</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-transparent">
              <div className="text-[10px] text-muted-foreground font-medium">Humidité</div>
              <div className="text-sm font-semibold text-foreground tabular">
                {data ? `${data.humidity}%` : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-transparent">
              <div className="text-[10px] text-muted-foreground font-medium">Vent</div>
              <div className="text-sm font-semibold text-foreground tabular">
                {data ? `${data.wind} km/h` : "—"}
              </div>
            </div>
          </div>

          {data && onWeatherDetected && (
            <button
              onClick={() => onWeatherDetected(data.weather)}
              className="mt-3 w-full text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Appliquer cette météo à la règle
            </button>
          )}
        </>
      )}
    </Card>
  );
};
