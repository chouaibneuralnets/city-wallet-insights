import { useState } from "react";
import {
  CloudRain,
  Sun,
  Snowflake,
  Cloud,
  Users,
  Clock,
  Calendar,
  Plus,
  X,
  ArrowRight,
  Tag,
  Bell,
  Percent,
  Sparkles,
  ChevronDown,
  Coffee,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Weather } from "./IPhonePreview";

const weatherMeta: Record<
  Weather,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  rain: { icon: CloudRain, label: "Pluie" },
  sun: { icon: Sun, label: "Soleil" },
  snow: { icon: Snowflake, label: "Neige" },
  cloud: { icon: Cloud, label: "Nuageux" },
};

type Action = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
};

const initialActions: Action[] = [
  { id: "a1", icon: Percent, label: "Générer offre", detail: "Max 25%" },
  { id: "a2", icon: Bell, label: "Push notification", detail: "Clients à <500m" },
];

const conditionLibrary = [
  { icon: Clock, field: "Heure", operator: "entre", value: "14h - 17h" },
  { icon: Calendar, field: "Jour", operator: "=", value: "Mardi" },
  { icon: Tag, field: "Stock", operator: ">", value: "20 unités" },
];

type Tone = "Amical" | "Urgent" | "Exclusif";

const tones: { value: Tone; emoji: string; preview: string }[] = [
  { value: "Amical", emoji: "☕", preview: "Hey ! Petit café offert juste pour toi 😊" },
  { value: "Urgent", emoji: "⚡", preview: "OFFRE FLASH 30min : -25% Cappuccino, dépêche-toi !" },
  { value: "Exclusif", emoji: "✨", preview: "Membre privilégié — cappuccino signature -25%" },
];

export const RuleBuilder = ({
  discount,
  onDiscountChange,
  weather,
  onWeatherChange,
}: {
  discount: number;
  onDiscountChange: (v: number) => void;
  weather: Weather;
  onWeatherChange: (w: Weather) => void;
}) => {
  const [trafficLow, setTrafficLow] = useState(true);
  const [actions] = useState(initialActions);
  const [active, setActive] = useState(true);
  const [product, setProduct] = useState("Café");
  const [tone, setTone] = useState<Tone>("Amical");
  const [publishing, setPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<Date | null>(null);

  const WeatherIcon = weatherMeta[weather].icon;
  const discountAction = actions.find((a) => a.id === "a1");
  const currentTone = tones.find((t) => t.value === tone)!;

  const products = ["Café", "Pâtisserie", "Boissons fraîches", "Plat du jour", "Brunch"];

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { error } = await supabase.from("offers_config").insert({
        weather,
        discount_percent: discount,
        product,
        traffic_condition: trafficLow ? "low" : "normal",
        active,
      });
      if (error) throw error;
      setLastPublishedAt(new Date());
      toast.success("Offre synchronisée sur le réseau City-Wallet", {
        description: `Règle "${weatherMeta[weather].label} → -${discount}% sur ${product}" propagée à tous les commerçants partenaires.`,
        icon: <CheckCircle2 className="size-4 text-success" />,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      toast.error("Impossible de publier la règle", { description: msg });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Constructeur de règle
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-soft text-primary">
              If-Then
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-foreground/5 text-muted-foreground">
              Module 02 · Generative Engine
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            L'IA traduit vos conditions contextuelles en offres personnalisées selon le ton de la marque.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Règle active</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>

      {/* IF block */}
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center pt-2">
            <div className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-wider">
              IF
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-2 min-h-12" />
          </div>

          <div className="flex-1 pb-6">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Weather chip with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-primary-soft border border-primary/20 text-sm hover:bg-primary/10 transition-colors">
                    <WeatherIcon className="size-3.5 text-primary" />
                    <span className="font-medium text-foreground">Météo</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="font-semibold text-primary">{weatherMeta[weather].label}</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-36">
                  {(Object.keys(weatherMeta) as Weather[]).map((w) => {
                    const I = weatherMeta[w].icon;
                    return (
                      <DropdownMenuItem
                        key={w}
                        onClick={() => onWeatherChange(w)}
                        className={cn(
                          "gap-2 cursor-pointer",
                          w === weather && "bg-primary-soft text-primary font-medium"
                        )}
                      >
                        <I className="size-4" /> {weatherMeta[w].label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1.5">
                AND
              </span>

              {trafficLow ? (
                <div className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-primary-soft border border-primary/20 text-sm">
                  <Users className="size-3.5 text-primary" />
                  <span className="font-medium text-foreground">Fréquentation</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="font-semibold text-primary">Basse</span>
                  <button
                    onClick={() => setTrafficLow(false)}
                    className="ml-1 size-5 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-8 gap-1 border-dashed"
                onClick={() => setTrafficLow(true)}
              >
                <Plus className="size-3.5" /> Ajouter
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1 self-center">Suggestions :</span>
              {conditionLibrary.map((s) => (
                <button
                  key={s.field}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  <s.icon className="size-3" />
                  {s.field} {s.operator} {s.value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center gap-3 my-2 ml-1">
          <div className="size-7 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center">
            <ArrowRight className="size-3.5 text-primary" />
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* THEN block */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center pt-2">
            <div className="px-3 py-1 rounded-md bg-foreground text-background text-xs font-bold tracking-wider">
              THEN
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {discountAction && (
                <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-foreground text-background text-sm">
                  <discountAction.icon className="size-3.5" />
                  <span className="font-medium">{discountAction.label}</span>
                  <span className="text-background/60">·</span>
                  <span className="font-semibold tabular">{discount}%</span>
                </div>
              )}

              {/* Product selector chip */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors">
                    <Coffee className="size-3.5" />
                    <span className="font-medium">Sur</span>
                    <span className="text-background/60">·</span>
                    <span className="font-semibold">{product}</span>
                    <ChevronDown className="size-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  {products.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => setProduct(p)}
                      className={cn(
                        "cursor-pointer",
                        p === product && "bg-primary-soft text-primary font-medium"
                      )}
                    >
                      {p}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {actions
                .filter((a) => a.id !== "a1")
                .map((act) => (
                  <div
                    key={act.id}
                    className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-foreground text-background text-sm"
                  >
                    <act.icon className="size-3.5" />
                    <span className="font-medium">{act.label}</span>
                    <span className="text-background/60">·</span>
                    <span className="font-semibold">{act.detail}</span>
                  </div>
                ))}
              <Button variant="outline" size="sm" className="rounded-full h-8 gap-1 border-dashed">
                <Plus className="size-3.5" /> Action
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Discount slider */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Remise maximale autorisée</span>
          </div>
          <span className="text-2xl font-bold text-primary tabular">{discount}%</span>
        </div>
        <Slider
          value={[discount]}
          onValueChange={(v) => onDiscountChange(v[0])}
          max={50}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Publish */}
      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {lastPublishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              Synchronisé à {lastPublishedAt.toLocaleTimeString("fr-FR")}
            </span>
          ) : (
            <span>La règle sera enregistrée dans le réseau City-Wallet.</span>
          )}
        </div>
        <Button
          onClick={handlePublish}
          disabled={publishing || !active}
          className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {publishing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {publishing ? "Publication..." : "Publier l'offre"}
        </Button>
      </div>
    </Card>
  );
};
