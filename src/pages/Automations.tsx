import { useState } from "react";
import { Brain, Cloud, MapPin, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { MarketStatus } from "@/components/dashboard/MarketStatus";

const Automations = () => {
  const [discount, setDiscount] = useState(20);
  const [weather, setWeather] = useState<Weather>("rain");

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            Module 02
          </span>
          <span className="text-xs text-muted-foreground font-medium">Generative Offer Engine — La Configuration</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          IA Strategist
        </h1>
      </div>

      {/* Module 01 → Signaux entrants vers le Module 02 */}
      <Card className="p-4 shadow-sm-elegant border-border/70">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Signaux entrants</h2>
          <span className="text-[10px] font-mono text-muted-foreground">Module 01 → 02</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/40">
            <Cloud className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Météo</div>
              <div className="text-xs font-semibold text-foreground capitalize truncate">{weather}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/40">
            <MapPin className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Localisation</div>
              <div className="text-xs font-semibold text-foreground truncate">Stuttgart Zentrum</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/40">
            <Activity className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Densité tx</div>
              <div className="text-xs font-semibold text-foreground truncate">Faible · -30%</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RuleBuilder
            discount={discount}
            onDiscountChange={setDiscount}
            weather={weather}
            onWeatherChange={setWeather}
          />
          <MarketStatus onWeatherDetected={setWeather} />
        </div>
        <div className="xl:col-span-1">
          <IPhonePreview weather={weather} onWeatherChange={setWeather} discount={discount} />
        </div>
      </div>
    </>
  );
};

export default Automations;
