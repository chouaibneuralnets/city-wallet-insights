import { useState } from "react";
import { CloudRain, Users, Clock, Calendar, Plus, X, ArrowRight, Tag, Bell, Percent, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Condition = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  field: string;
  operator: string;
  value: string;
};

type Action = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
};

const initialConditions: Condition[] = [
  { id: "c1", icon: CloudRain, field: "Météo", operator: "=", value: "Pluie" },
  { id: "c2", icon: Users, field: "Fréquentation", operator: "=", value: "Basse" },
];

const initialActions: Action[] = [
  { id: "a1", icon: Percent, label: "Générer offre", detail: "Max 25% de remise" },
  { id: "a2", icon: Bell, label: "Notification push", detail: "Clients à <500m" },
];

const conditionLibrary = [
  { icon: Clock, field: "Heure", operator: "entre", value: "14h - 17h" },
  { icon: Calendar, field: "Jour", operator: "=", value: "Mardi" },
  { icon: Tag, field: "Stock", operator: ">", value: "20 unités" },
];

export const RuleBuilder = ({ discount, onDiscountChange }: { discount: number; onDiscountChange: (v: number) => void }) => {
  const [conditions, setConditions] = useState(initialConditions);
  const [actions] = useState(initialActions);
  const [active, setActive] = useState(true);

  const removeCondition = (id: string) => setConditions((c) => c.filter((x) => x.id !== id));

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Constructeur de règle</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-soft text-primary">
              If-Then
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Définissez des conditions contextuelles pour déclencher des offres personnalisées.
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
            <div className="flex flex-wrap gap-2">
              {conditions.map((cond, idx) => (
                <div key={cond.id} className="flex items-center gap-2">
                  {idx > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1.5">
                      AND
                    </span>
                  )}
                  <div className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-primary-soft border border-primary/20 text-sm">
                    <cond.icon className="size-3.5 text-primary" />
                    <span className="font-medium text-foreground">{cond.field}</span>
                    <span className="text-muted-foreground">{cond.operator}</span>
                    <span className="font-semibold text-primary">{cond.value}</span>
                    <button
                      onClick={() => removeCondition(cond.id)}
                      className="ml-1 size-5 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full h-8 gap-1 border-dashed">
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
              {actions.map((act) => (
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
          className={cn("w-full")}
        />
        <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>
    </Card>
  );
};
