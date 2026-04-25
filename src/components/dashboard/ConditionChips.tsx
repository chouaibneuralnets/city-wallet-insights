import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Calendar,
  Tag,
  PartyPopper,
  Plus,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getStuttgartParts } from "@/lib/stuttgartTime";

export type ConditionType = "Heure" | "Jour" | "Stock" | "Événement";

export type Condition =
  | { id: string; type: "Heure"; from: number; to: number }
  | { id: string; type: "Jour"; value: string }
  | { id: string; type: "Stock"; operator: ">" | "<"; quantity: number }
  | { id: string; type: "Événement"; value: string };

const typeMeta: Record<
  ConditionType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  Heure: { icon: Clock, color: "text-sky-600" },
  Jour: { icon: Calendar, color: "text-violet-600" },
  Stock: { icon: Tag, color: "text-amber-600" },
  Événement: { icon: PartyPopper, color: "text-rose-600" },
};

const dayOptions = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
  "Week-end",
  "Semaine",
];

const eventOptions = [
  "Marché de Noël",
  "Match VfB Stuttgart",
  "Festival Musique",
  "Aucun",
];

const dayIndexFR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultCondition = (type: ConditionType): Condition => {
  const id = uid();
  switch (type) {
    case "Heure":
      return { id, type, from: 14, to: 17 };
    case "Jour":
      return { id, type, value: "Jeudi" };
    case "Stock":
      return { id, type, operator: ">", quantity: 20 };
    case "Événement":
      return { id, type, value: "Marché de Noël" };
  }
};

/** Validate a single condition against the current world state. */
export const evaluateCondition = (
  c: Condition,
  ctx: { now: Date; stockQty: number; activeEvent: string },
): boolean => {
  if (c.type === "Heure") {
    const h = ctx.now.getHours();
    return h >= c.from && h < c.to;
  }
  if (c.type === "Jour") {
    const today = dayIndexFR[ctx.now.getDay()];
    if (c.value === "Week-end") return today === "Samedi" || today === "Dimanche";
    if (c.value === "Semaine") return today !== "Samedi" && today !== "Dimanche";
    return today === c.value;
  }
  if (c.type === "Stock") {
    return c.operator === ">" ? ctx.stockQty > c.quantity : ctx.stockQty < c.quantity;
  }
  if (c.type === "Événement") {
    return ctx.activeEvent === c.value;
  }
  return false;
};

/** Short human label for the AI prompt context (e.g. "Jeudi", "14h-17h"). */
export const conditionLabel = (c: Condition): string => {
  if (c.type === "Heure") return `${c.from}h–${c.to}h`;
  if (c.type === "Jour") return c.value;
  if (c.type === "Stock") return `Stock ${c.operator} ${c.quantity}`;
  if (c.type === "Événement") return c.value;
  return "";
};

type Props = {
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  /** Live world state used to compute MATCH/idle badges. */
  stockQty: number;
  activeEvent: string;
};

export const ConditionChips = ({ conditions, onChange, stockQty, activeEvent }: Props) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const ctx = useMemo(() => ({ now, stockQty, activeEvent }), [now, stockQty, activeEvent]);

  const addCondition = (type: ConditionType) => {
    onChange([...conditions, defaultCondition(type)]);
  };
  const removeCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };
  const updateCondition = (id: string, patch: Partial<Condition>) => {
    onChange(
      conditions.map((c) => (c.id === id ? ({ ...c, ...patch } as Condition) : c)),
    );
  };

  return (
    <div className="space-y-2">
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {conditions.map((c, idx) => {
            const Meta = typeMeta[c.type];
            const Icon = Meta.icon;
            const match = evaluateCondition(c, ctx);
            return (
              <div key={c.id} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                    AND
                  </span>
                )}
                <div
                  className={cn(
                    "group inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full border text-xs transition-all",
                    match
                      ? "bg-success/10 border-success/30 shadow-sm"
                      : "bg-secondary/60 border-border/60",
                  )}
                >
                  <Icon className={cn("size-3.5", match ? "text-success" : Meta.color)} />
                  <span className="font-medium text-foreground">{c.type}</span>
                  <span className="text-muted-foreground">=</span>

                  {/* Inline editor per type */}
                  {c.type === "Heure" && (
                    <div className="inline-flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={c.from}
                        onChange={(e) =>
                          updateCondition(c.id, { from: Math.max(0, Math.min(23, +e.target.value || 0)) })
                        }
                        className="h-6 w-10 px-1 py-0 text-xs text-center"
                      />
                      <span className="text-muted-foreground">h –</span>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={c.to}
                        onChange={(e) =>
                          updateCondition(c.id, { to: Math.max(0, Math.min(23, +e.target.value || 0)) })
                        }
                        className="h-6 w-10 px-1 py-0 text-xs text-center"
                      />
                      <span className="text-muted-foreground">h</span>
                    </div>
                  )}

                  {c.type === "Jour" && (
                    <Select value={c.value} onValueChange={(v) => updateCondition(c.id, { value: v })}>
                      <SelectTrigger className="h-6 px-2 py-0 text-xs border-0 bg-transparent shadow-none w-auto gap-1 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {c.type === "Stock" && (
                    <div className="inline-flex items-center gap-1">
                      <Select
                        value={c.operator}
                        onValueChange={(v) => updateCondition(c.id, { operator: v as ">" | "<" })}
                      >
                        <SelectTrigger className="h-6 px-1.5 py-0 text-xs border-0 bg-transparent shadow-none w-auto gap-0.5 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">" className="text-xs">{">"}</SelectItem>
                          <SelectItem value="<" className="text-xs">{"<"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        value={c.quantity}
                        onChange={(e) =>
                          updateCondition(c.id, { quantity: Math.max(0, +e.target.value || 0) })
                        }
                        className="h-6 w-12 px-1 py-0 text-xs text-center"
                      />
                      <span className="text-muted-foreground">u.</span>
                    </div>
                  )}

                  {c.type === "Événement" && (
                    <Select value={c.value} onValueChange={(v) => updateCondition(c.id, { value: v })}>
                      <SelectTrigger className="h-6 px-2 py-0 text-xs border-0 bg-transparent shadow-none w-auto gap-1 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventOptions.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* MATCH badge */}
                  <span
                    className={cn(
                      "ml-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1 rounded",
                      match ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {match ? (
                      <>
                        <CheckCircle2 className="size-2.5" /> match
                      </>
                    ) : (
                      "idle"
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeCondition(c.id)}
                    aria-label="Supprimer la condition"
                    className="ml-0.5 size-5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-primary/40 text-xs text-primary hover:bg-primary-soft transition-colors">
            <Plus className="size-3.5" /> Ajouter une condition
            <ChevronDown className="size-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          {(Object.keys(typeMeta) as ConditionType[]).map((t) => {
            const Icon = typeMeta[t].icon;
            return (
              <DropdownMenuItem key={t} onClick={() => addCondition(t)} className="cursor-pointer gap-2">
                <Icon className={cn("size-3.5", typeMeta[t].color)} /> {t}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
