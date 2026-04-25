import { useEffect, useMemo, useRef, useState } from "react";
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
  Loader2,
  CheckCircle2,
  Brain,
  Rocket,
  ShieldAlert,
  Lock as LockIcon,
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
import {
  generateMessage,
  generateThought,
  productMeta,
  tonesMeta,
  type Tone,
} from "@/lib/aiGenerator";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useSignals } from "@/context/SignalsContext";
import { ConditionChips, conditionLabel, evaluateCondition, type Condition } from "./ConditionChips";

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

type Props = {
  discount: number;
  onDiscountChange: (v: number) => void;
  /** Driven automatically from the live OpenWeather signal. */
  weather: Weather;
  /** Driven automatically from the live Payone density gauge (<35%). */
  trafficLow: boolean;
  /** Bubble up product, tone, message so the iPhone preview stays in sync */
  onGenerationChange?: (g: { product: string; tone: Tone; message: string }) => void;
  /** Lifted active state so other modules (AiStrategyLog) can react to it. */
  active?: boolean;
  onActiveChange?: (v: boolean) => void;
};

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const RuleBuilder = ({
  discount,
  onDiscountChange,
  weather,
  trafficLow,
  onGenerationChange,
  active: activeProp,
  onActiveChange,
}: Props) => {
  const { temperatureC } = useSignals();
  const [actions] = useState(initialActions);
  const [activeLocal, setActiveLocal] = useState(true);
  const active = activeProp ?? activeLocal;
  const setActive = (v: boolean) => {
    setActiveLocal(v);
    onActiveChange?.(v);
  };
  const [product, setProduct] = useState<string>("Café");
  const [tone, setTone] = useState<Tone>("Amical");
  const [publishing, setPublishing] = useState(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<Date | null>(null);
  // Lock: stores timestamp of last auto-dispatch within current activation cycle.
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const sessionDispatchedRef = useRef(false);

  // Dynamic conditions (Heure, Jour, Stock, Événement) — fully editable
  const [conditions, setConditions] = useState<Condition[]>([]);
  // Simulated live world state for validation badges (in real app, these come from inventory + events APIs)
  const stockQty = 28;
  const activeEvent = "Marché de Noël";

  const WeatherIcon = weatherMeta[weather].icon;
  const discountAction = actions.find((a) => a.id === "a1");

  const products = Object.keys(productMeta);

  // Build extras for the AI message based on current conditions
  const extras = useMemo(() => {
    const time = conditions.find((c) => c.type === "Heure");
    const day = conditions.find((c) => c.type === "Jour");
    const stock = conditions.find((c) => c.type === "Stock");
    const evt = conditions.find((c) => c.type === "Événement");
    return {
      timeWindow: time && time.type === "Heure" ? { from: time.from, to: time.to } : null,
      day: day && day.type === "Jour" ? day.value : null,
      stockHigh:
        stock && stock.type === "Stock" && stock.operator === ">" ? { quantity: stock.quantity } : null,
      activeEvent: evt && evt.type === "Événement" ? evt.value : null,
    };
  }, [conditions]);

  const message = useMemo(
    () => generateMessage(tone, weather, product, discount, extras),
    [tone, weather, product, discount, extras],
  );
  const thought = useMemo(
    () =>
      generateThought(
        tone,
        weather,
        product,
        trafficLow,
        temperatureC,
        conditions.map(conditionLabel),
      ),
    [tone, weather, product, trafficLow, temperatureC, conditions],
  );

  // Typewriter for the AI thought line.
  const typed = useTypewriter(thought, 14);

  // Push state up so the iPhone preview shows the same message + product icon.
  useEffect(() => {
    onGenerationChange?.({ product, tone, message });
  }, [product, tone, message, onGenerationChange]);

  const dispatchOffer = async (opts: { auto: boolean }) => {
    if (!active) {
      toast.error("Règle inactive", {
        description: "Activez la règle pour autoriser l'envoi vers Mia.",
        icon: <ShieldAlert className="size-4 text-warning" />,
      });
      return;
    }
    // 15-min lock: don't fire again for the same activation cycle until expiry.
    const now = Date.now();
    if (lockUntil && now < lockUntil) {
      const remaining = Math.ceil((lockUntil - now) / 1000);
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      toast.warning("Verrou actif — une seule offre par session", {
        description: `Désactivez puis réactivez la règle, ou attendez ${min}m${sec.toString().padStart(2, "0")}s.`,
        icon: <LockIcon className="size-4 text-warning" />,
      });
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase.from("offers_config").insert({
        weather,
        discount_percent: discount,
        product,
        traffic_condition: trafficLow ? "low" : "normal",
        active,
        tone,
        message,
        // Canonical text shipped to Mia's wallet app + read back by Magic Preview
        generated_text: message,
      });
      if (error) throw error;
      setLastPublishedAt(new Date());
      sessionDispatchedRef.current = true;
      setLockUntil(Date.now() + LOCK_DURATION_MS);
      toast.success(opts.auto ? "Règle déclenchée — offre envoyée à Mia" : "Offre déployée sur le réseau Payone", {
        description: `"${message.slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
        icon: <CheckCircle2 className="size-4 text-success" />,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      toast.error("Impossible de déployer l'offre", { description: msg });
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = () => dispatchOffer({ auto: false });

  // Auto-trigger: ONLY on the OFF → ON transition, and only if conditions
  // already match at that moment. Changing remise/conditions while ON does
  // NOT re-send. To resend, user must toggle OFF then ON again.
  const conditionsMatch = weather === "sun" && trafficLow;
  const conditionsMatchRef = useRef(conditionsMatch);
  useEffect(() => {
    conditionsMatchRef.current = conditionsMatch;
  }, [conditionsMatch]);

  const wasActiveRef = useRef(active);
  useEffect(() => {
    const prev = wasActiveRef.current;
    if (prev && !active) {
      // ON → OFF : reset session lock so next activation can re-send.
      sessionDispatchedRef.current = false;
      setLockUntil(null);
    } else if (!prev && active) {
      // OFF → ON : if conditions already match and no active 15-min lock, send once.
      if (
        conditionsMatchRef.current &&
        !sessionDispatchedRef.current &&
        !(lockUntil && Date.now() < lockUntil)
      ) {
        dispatchOffer({ auto: true });
      }
    }
    wasActiveRef.current = active;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium",
              active ? "text-success" : "text-muted-foreground",
            )}>
              {active ? "Règle active" : "Règle inactive — envois bloqués"}
            </span>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          {active && lockUntil && (
            <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
              <LockIcon className="size-3" /> Verrou 15 min — 1 offre/session
            </span>
          )}
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
              <div className="inline-flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-primary-soft border border-primary/20 text-sm">
                <WeatherIcon className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">Météo</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-semibold text-primary">{weatherMeta[weather].label}</span>
                <span className="ml-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-success">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  live
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1.5">
                AND
              </span>

              <div
                className={cn(
                  "inline-flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full border text-sm",
                  trafficLow
                    ? "bg-primary-soft border-primary/20"
                    : "bg-secondary/60 border-border/60",
                )}
              >
                <Users className={cn("size-3.5", trafficLow ? "text-primary" : "text-muted-foreground")} />
                <span className="font-medium text-foreground">Densité</span>
                <span className="text-muted-foreground">{"<"}</span>
                <span className={cn("font-semibold", trafficLow ? "text-primary" : "text-muted-foreground")}>
                  35%
                </span>
                <span className="ml-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-success">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  {trafficLow ? "match" : "idle"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Conditions personnalisées
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {conditions.filter((c) => evaluateCondition(c, { now: new Date(), stockQty, activeEvent })).length}
                  /{conditions.length} match
                </span>
              </div>
              <div className={cn(active && "pointer-events-none opacity-60 select-none")} aria-disabled={active}>
                <ConditionChips
                  conditions={conditions}
                  onChange={setConditions}
                  stockQty={stockQty}
                  activeEvent={activeEvent}
                />
              </div>
            </div>
          </div>
        </div>

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

              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={active}>
                  <button
                    disabled={active}
                    className={cn(
                      "inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors",
                      active && "opacity-60 cursor-not-allowed hover:bg-foreground",
                    )}
                  >
                    <span className="text-base leading-none">{productMeta[product]?.emoji ?? "☕"}</span>
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
                        "cursor-pointer gap-2",
                        p === product && "bg-primary-soft text-primary font-medium",
                      )}
                    >
                      <span>{productMeta[p].emoji}</span> {p}
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

      {/* Tone selector — Amical, Élégant, Urgent */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Ton de la marque</span>
            <span className="text-[10px] text-muted-foreground font-mono">SLM local</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(tonesMeta) as Tone[]).map((t) => {
            const m = tonesMeta[t];
            const selected = tone === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "group relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all overflow-hidden",
                  selected
                    ? "border-primary bg-gradient-to-br from-primary-soft to-primary/5 ring-2 ring-primary/30 shadow-sm-elegant"
                    : "border-border hover:border-primary/40 hover:bg-secondary/40",
                )}
              >
                <span className="text-lg">{m.emoji}</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    selected ? "text-primary" : "text-foreground",
                  )}
                >
                  {t}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {m.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Thought / Prompt logic */}
        <div className="mt-4 p-3 rounded-lg border border-border bg-gradient-soft">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="size-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
              Pensée de l'IA
            </span>
            {!typed.done && (
              <span className="size-1.5 rounded-full bg-primary animate-pulse ml-auto" />
            )}
          </div>
          <div className="text-xs font-mono text-foreground leading-relaxed min-h-[2.25rem]">
            {typed.text}
            {!typed.done && <span className="inline-block w-1.5 h-3 bg-primary ml-0.5 animate-pulse align-middle" />}
          </div>
        </div>
      </div>

      {/* Big deploy button */}
      <div className="mt-6 pt-6 border-t border-border">
        {(() => {
          const locked = !!(active && lockUntil && Date.now() < lockUntil);
          return (
            <>
              <Button
                onClick={handlePublish}
                disabled={publishing || !active || locked}
                size="lg"
                className="w-full gap-2 h-14 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant"
              >
                {publishing ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : locked ? (
                  <LockIcon className="size-5" />
                ) : (
                  <Rocket className="size-5" />
                )}
                {publishing
                  ? "Déploiement en cours…"
                  : !active
                    ? "Règle inactive — envois bloqués"
                    : locked
                      ? "Verrouillé — 1 offre/session (15 min)"
                      : "Déployer sur le réseau Payone"}
              </Button>
              <div className="text-[11px] text-muted-foreground text-center mt-2">
                {!active ? (
                  <span className="inline-flex items-center gap-1.5 text-warning">
                    <ShieldAlert className="size-3" />
                    Activez la règle pour déclencher l'envoi automatique vers Mia.
                  </span>
                ) : locked ? (
                  <span className="inline-flex items-center gap-1.5 text-warning">
                    <LockIcon className="size-3" />
                    Désactivez puis réactivez la règle pour renvoyer une offre.
                  </span>
                ) : lastPublishedAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-success" />
                    Dernière offre déployée à {lastPublishedAt.toLocaleTimeString("fr-FR", { timeZone: "Europe/Berlin" })}
                  </span>
                ) : (
                  <span>L'offre finalisée sera propagée à tous les commerçants partenaires.</span>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </Card>
  );
};
