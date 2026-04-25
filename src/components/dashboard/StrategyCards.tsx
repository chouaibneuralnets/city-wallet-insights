import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CloudRain,
  Sun,
  Snowflake,
  Cloud,
  Plus,
  Trash2,
  Rocket,
  Loader2,
  CheckCircle2,
  Trophy,
  Brain,
  Users,
  Calendar,
  Percent,
  Sparkles,
  Coffee,
  X,
  Lock,
  Unlock,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Weather } from "./IPhonePreview";
import {
  generateMessage,
  productMeta,
  tonesMeta,
  type Tone,
} from "@/lib/aiGenerator";
import { useSignals } from "@/context/SignalsContext";
import { useTrafficDensity } from "@/hooks/useTrafficDensity";
import { getStuttgartParts } from "@/lib/stuttgartTime";

export type Segment = "Commuters" | "Loyals" | "Newcomers" | "Tous";

export type Strategy = {
  id: string;
  name: string;
  weather: Weather | "any";
  /** Day predicate — "weekday" Mon-Fri, "weekend" Sat-Sun, "any" or specific French day */
  day: "any" | "weekday" | "weekend" | string;
  /** Density operator vs threshold (in %) */
  densityOp: "<" | ">" | "any";
  densityThreshold: number;
  segment: Segment;
  product: string;
  tone: Tone;
  discount: number;
  active: boolean;
};

const weatherMeta: Record<
  Weather,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  rain: { icon: CloudRain, label: "Pluie" },
  sun: { icon: Sun, label: "Soleil" },
  snow: { icon: Snowflake, label: "Neige" },
  cloud: { icon: Cloud, label: "Nuageux" },
};

const dayLabel = (d: Strategy["day"]) => {
  if (d === "any") return "Tous les jours";
  if (d === "weekday") return "Lun → Ven";
  if (d === "weekend") return "Week-end";
  return d;
};

const segmentMeta: Record<Segment, { color: string; bg: string; emoji: string }> = {
  Commuters: { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-500/10 border-blue-500/30", emoji: "🚆" },
  Loyals: { color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10 border-amber-500/30", emoji: "💛" },
  Newcomers: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/30", emoji: "✨" },
  Tous: { color: "text-foreground", bg: "bg-muted/40 border-border", emoji: "👥" },
};

const initialStrategies: Strategy[] = [
  {
    id: "s1",
    name: "Boost Commuters matin",
    weather: "any",
    day: "weekday",
    densityOp: "<",
    densityThreshold: 35,
    segment: "Commuters",
    product: "Café",
    tone: "Urgent",
    discount: 15,
    active: true,
  },
  {
    id: "s2",
    name: "Pluie & réconfort",
    weather: "rain",
    day: "any",
    densityOp: "<",
    densityThreshold: 50,
    segment: "Loyals",
    product: "Chocolat",
    tone: "Amical",
    discount: 25,
    active: true,
  },
  {
    id: "s3",
    name: "Week-end terrasse",
    weather: "sun",
    day: "weekend",
    densityOp: "<",
    densityThreshold: 60,
    segment: "Newcomers",
    product: "Boissons fraîches",
    tone: "Élégant",
    discount: 20,
    active: true,
  },
];

const dayMatches = (rule: Strategy["day"], current: { dayNameFr: string; day: number }) => {
  if (rule === "any") return true;
  if (rule === "weekday") return current.day >= 1 && current.day <= 5;
  if (rule === "weekend") return current.day === 0 || current.day === 6;
  return rule === current.dayNameFr;
};

const densityMatches = (op: Strategy["densityOp"], threshold: number, pct: number) => {
  if (op === "any") return true;
  if (op === "<") return pct < threshold;
  return pct > threshold;
};

const segmentMatchesContext = (segment: Segment, isWeekend: boolean) => {
  if (segment === "Tous") return true;
  if (isWeekend) return segment === "Loyals" || segment === "Newcomers";
  return segment === "Commuters";
};

type Props = {
  /** Live weather from OpenWeather signal. */
  liveWeather: Weather;
  /** Notify parent which strategy currently wins (for iPhone preview + log). */
  onWinningChange?: (winning: {
    strategy: Strategy | null;
    message: string;
  }) => void;
};

export const StrategyCards = ({ liveWeather, onWinningChange }: Props) => {
  const { temperatureC } = useSignals();
  const { pct: trafficPct } = useTrafficDensity();
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Live Stuttgart context
  const [stuttgart, setStuttgart] = useState(() => getStuttgartParts());
  useEffect(() => {
    const id = setInterval(() => setStuttgart(getStuttgartParts()), 1000);
    return () => clearInterval(id);
  }, []);
  const isWeekend = stuttgart.day === 0 || stuttgart.day === 6;

  // Evaluate each strategy against the live context
  const evaluations = useMemo(() => {
    return strategies.map((s) => {
      const wOk = s.weather === "any" || s.weather === liveWeather;
      const dOk = dayMatches(s.day, stuttgart);
      const densOk = densityMatches(s.densityOp, s.densityThreshold, trafficPct);
      const segOk = segmentMatchesContext(s.segment, isWeekend);
      const matched = s.active && wOk && dOk && densOk;
      // AI relevance score: higher discount = more impactful, segment alignment = +30 bonus
      const score =
        (matched ? 100 : 0) +
        s.discount * 1.2 +
        (segOk ? 30 : 0) +
        (s.weather === liveWeather ? 10 : 0);
      return { strategy: s, matched, score, segOk, wOk, dOk, densOk };
    });
  }, [strategies, liveWeather, stuttgart, trafficPct, isWeekend]);

  const matchingEvals = evaluations.filter((e) => e.matched);
  const winner = matchingEvals.length
    ? matchingEvals.reduce((a, b) => (a.score >= b.score ? a : b))
    : null;

  // Bubble winning offer up (for iPhone preview & autopilot log)
  useEffect(() => {
    if (!winner) {
      onWinningChange?.({ strategy: null, message: "" });
      return;
    }
    const msg = generateMessage(winner.strategy.tone, liveWeather, winner.strategy.product, winner.strategy.discount, {
      day: stuttgart.dayNameFr,
    });
    onWinningChange?.({ strategy: winner.strategy, message: msg });
  }, [winner?.strategy.id, winner?.strategy.discount, winner?.strategy.product, winner?.strategy.tone, liveWeather, stuttgart.dayNameFr, onWinningChange, winner]);

  const removeStrategy = (id: string) =>
    setStrategies((prev) => prev.filter((s) => s.id !== id));

  const toggleActive = (id: string, v: boolean) =>
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, active: v } : s)));

  const addStrategy = (s: Omit<Strategy, "id">) =>
    setStrategies((prev) => [...prev, { ...s, id: `s-${Date.now()}` }]);

  const handleDeploy = async (s: Strategy) => {
    setPublishingId(s.id);
    try {
      const message = generateMessage(s.tone, liveWeather, s.product, s.discount, {
        day: stuttgart.dayNameFr,
      });
      const { error } = await supabase.from("offers_config").insert({
        weather: s.weather === "any" ? liveWeather : s.weather,
        discount_percent: s.discount,
        product: s.product,
        traffic_condition: trafficPct < 35 ? "low" : "normal",
        active: true,
        tone: s.tone,
        message,
        generated_text: message,
      });
      if (error) throw error;
      toast.success(`Stratégie "${s.name}" déployée`, {
        description: `"${message.slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
        icon: <CheckCircle2 className="size-4 text-success" />,
      });
    } catch (e) {
      toast.error("Échec du déploiement", {
        description: e instanceof Error ? e.message : "Erreur inconnue",
      });
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Stratégies parallèles
            </h2>
            <Badge variant="outline" className="font-mono text-[10px] border-primary/30 bg-primary-soft text-primary">
              {strategies.length} règle{strategies.length > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              {matchingEvals.length} active{matchingEvals.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            L'IA évalue toutes les règles en parallèle et n'envoie que la plus pertinente.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" /> Nouvelle stratégie
        </Button>
      </div>

      {/* Arbitration banner */}
      <div
        className={cn(
          "px-5 py-3 border-b border-border/60 flex items-center gap-3 text-xs",
          winner ? "bg-success/5" : "bg-secondary/40",
        )}
      >
        <Brain className={cn("size-4 shrink-0", winner ? "text-success" : "text-muted-foreground")} />
        {winner ? (
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-success">Arbitrage IA · </span>
            <span className="text-foreground">
              {matchingEvals.length} stratégie{matchingEvals.length > 1 ? "s" : ""} en match —
              priorité à <span className="font-semibold">"{winner.strategy.name}"</span> (score{" "}
              <span className="font-mono">{Math.round(winner.score)}</span>)
            </span>
          </div>
        ) : (
          <div className="flex-1 text-muted-foreground">
            Aucune règle ne correspond au contexte actuel — l'IA reste en veille.
          </div>
        )}
        <span className="font-mono text-[10px] text-muted-foreground hidden md:inline">
          {stuttgart.dayNameFr} · {stuttgart.hms} · {trafficPct}%
        </span>
      </div>

      {/* Cards grid */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {evaluations.map(({ strategy, matched, score, segOk, wOk, dOk, densOk }) => {
          const isWinner = winner?.strategy.id === strategy.id;
          const WIcon = strategy.weather === "any" ? Sparkles : weatherMeta[strategy.weather].icon;
          const seg = segmentMeta[strategy.segment];
          return (
            <div
              key={strategy.id}
              className={cn(
                "relative rounded-xl border p-4 transition-all",
                isWinner
                  ? "border-success/50 bg-success/5 shadow-elegant ring-1 ring-success/30"
                  : matched
                    ? "border-primary/40 bg-primary-soft/30"
                    : strategy.active
                      ? "border-border bg-card"
                      : "border-dashed border-border/60 bg-muted/30 opacity-70",
              )}
            >
              {/* Live match indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {isWinner && (
                  <Badge className="gap-1 bg-success text-success-foreground hover:bg-success font-mono text-[9px]">
                    <Trophy className="size-3" /> WINNER
                  </Badge>
                )}
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    matched ? "bg-success animate-pulse shadow-[0_0_6px_hsl(var(--success))]" : "bg-muted-foreground/30",
                  )}
                  title={matched ? "Règle active" : "En veille"}
                />
              </div>

              {/* Title row */}
              <div className="flex items-start gap-3 pr-16 mb-3">
                <div className={cn("size-10 rounded-lg grid place-items-center shrink-0 border", seg.bg)}>
                  <span className="text-lg leading-none">{seg.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground truncate">{strategy.name}</div>
                  <div className={cn("text-[10px] font-mono uppercase tracking-wider", seg.color)}>
                    Cible · {strategy.segment}
                  </div>
                </div>
              </div>

              {/* IF chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px]",
                    wOk ? "bg-success/10 border-success/30 text-success" : "bg-muted/40 border-border text-muted-foreground",
                  )}
                >
                  <WIcon className="size-3" />
                  {strategy.weather === "any" ? "Météo : *" : weatherMeta[strategy.weather].label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px]",
                    dOk ? "bg-success/10 border-success/30 text-success" : "bg-muted/40 border-border text-muted-foreground",
                  )}
                >
                  <Calendar className="size-3" />
                  {dayLabel(strategy.day)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px]",
                    densOk ? "bg-success/10 border-success/30 text-success" : "bg-muted/40 border-border text-muted-foreground",
                  )}
                >
                  <Users className="size-3" />
                  {strategy.densityOp === "any" ? "Densité : *" : `Densité ${strategy.densityOp} ${strategy.densityThreshold}%`}
                </span>
              </div>

              {/* THEN row */}
              <div className="flex items-center justify-between gap-2 mb-3 px-3 py-2 rounded-lg bg-foreground/5 border border-border/60">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="text-base">{productMeta[strategy.product]?.emoji ?? "☕"}</span>
                  <span className="font-medium text-foreground truncate">{strategy.product}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-semibold text-primary tabular">-{strategy.discount}%</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{tonesMeta[strategy.tone].emoji} {strategy.tone}</span>
                </div>
              </div>

              {/* Footer: score + controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono">score {Math.round(score)}</span>
                  {!segOk && (
                    <Badge variant="outline" className="font-mono text-[9px] border-warning/40 text-warning">
                      hors segment {isWeekend ? "WE" : "semaine"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={strategy.active}
                    onCheckedChange={(v) => toggleActive(strategy.id, v)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeStrategy(strategy.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={publishingId === strategy.id || !strategy.active}
                    onClick={() => handleDeploy(strategy)}
                  >
                    {publishingId === strategy.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Rocket className="size-3.5" />
                    )}
                    Déployer
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {strategies.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
            Aucune stratégie configurée. Cliquez sur "Nouvelle stratégie" pour commencer.
          </div>
        )}
      </div>

      <NewStrategyDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={addStrategy} />
    </Card>
  );
};

/* ----------------------- Dialog: Nouvelle stratégie ----------------------- */

type DialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (s: Omit<Strategy, "id">) => void;
};

const NewStrategyDialog = ({ open, onOpenChange, onCreate }: DialogProps) => {
  const [name, setName] = useState("Nouvelle stratégie");
  const [weather, setWeather] = useState<Strategy["weather"]>("any");
  const [day, setDay] = useState<Strategy["day"]>("any");
  const [densityOp, setDensityOp] = useState<Strategy["densityOp"]>("<");
  const [densityThreshold, setDensityThreshold] = useState(35);
  const [segment, setSegment] = useState<Segment>("Tous");
  const [product, setProduct] = useState("Café");
  const [tone, setTone] = useState<Tone>("Amical");
  const [discount, setDiscount] = useState(20);

  const reset = () => {
    setName("Nouvelle stratégie");
    setWeather("any");
    setDay("any");
    setDensityOp("<");
    setDensityThreshold(35);
    setSegment("Tous");
    setProduct("Café");
    setTone("Amical");
    setDiscount(20);
  };

  const handleSubmit = () => {
    onCreate({ name: name.trim() || "Sans nom", weather, day, densityOp, densityThreshold, segment, product, tone, discount, active: true });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Nouvelle stratégie
          </DialogTitle>
          <DialogDescription>
            Définissez les conditions et l'offre. L'IA arbitrera entre toutes les stratégies actives.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="strat-name">Nom</Label>
            <Input id="strat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Météo</Label>
              <Select value={weather} onValueChange={(v) => setWeather(v as Strategy["weather"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Toutes</SelectItem>
                  <SelectItem value="sun">☀️ Soleil</SelectItem>
                  <SelectItem value="rain">🌧️ Pluie</SelectItem>
                  <SelectItem value="cloud">☁️ Nuageux</SelectItem>
                  <SelectItem value="snow">❄️ Neige</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Jour</Label>
              <Select value={day} onValueChange={(v) => setDay(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Tous les jours</SelectItem>
                  <SelectItem value="weekday">Lun → Ven</SelectItem>
                  <SelectItem value="weekend">Week-end</SelectItem>
                  <SelectItem value="Lundi">Lundi</SelectItem>
                  <SelectItem value="Mardi">Mardi</SelectItem>
                  <SelectItem value="Mercredi">Mercredi</SelectItem>
                  <SelectItem value="Jeudi">Jeudi</SelectItem>
                  <SelectItem value="Vendredi">Vendredi</SelectItem>
                  <SelectItem value="Samedi">Samedi</SelectItem>
                  <SelectItem value="Dimanche">Dimanche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5 col-span-1">
              <Label>Densité</Label>
              <Select value={densityOp} onValueChange={(v) => setDensityOp(v as Strategy["densityOp"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="<">{"<"}</SelectItem>
                  <SelectItem value=">">{">"}</SelectItem>
                  <SelectItem value="any">ignorée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 col-span-2">
              <Label>Seuil ({densityThreshold}%)</Label>
              <Slider value={[densityThreshold]} onValueChange={(v) => setDensityThreshold(v[0])} max={100} step={5} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Segment cible</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">👥 Tous</SelectItem>
                  <SelectItem value="Commuters">🚆 Commuters</SelectItem>
                  <SelectItem value="Loyals">💛 Loyals</SelectItem>
                  <SelectItem value="Newcomers">✨ Newcomers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Produit</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(productMeta).map((p) => (
                    <SelectItem key={p} value={p}>
                      {productMeta[p].emoji} {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Ton</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(tonesMeta) as Tone[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {tonesMeta[t].emoji} {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Remise ({discount}%)</Label>
              <Slider value={[discount]} onValueChange={(v) => setDiscount(v[0])} max={50} step={5} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="size-4 mr-1" /> Annuler
          </Button>
          <Button onClick={handleSubmit} className="gap-1.5">
            <Plus className="size-4" /> Créer la stratégie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
