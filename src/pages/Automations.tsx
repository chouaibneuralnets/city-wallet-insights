import { useCallback, useState } from "react";
import { Brain } from "lucide-react";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { Module2Signals } from "@/components/dashboard/Module2Signals";
import { AiStrategyLog } from "@/components/dashboard/AiStrategyLog";
import type { Tone } from "@/lib/aiGenerator";

const Automations = () => {
  const [discount, setDiscount] = useState(20);
  const [weather, setWeather] = useState<Weather>("cloud");
  const [trafficLow, setTrafficLow] = useState(true);
  const [ruleActive, setRuleActive] = useState(true);
  const [generation, setGeneration] = useState<{ product: string; tone: Tone; message: string }>({
    product: "Café",
    tone: "Amical",
    message: "",
  });
  const [liveState, setLiveState] = useState<{
    ruleSatisfied: boolean;
    trafficPct: number;
    weatherLabel: string;
  }>({ ruleSatisfied: false, trafficPct: 0, weatherLabel: "—" });

  const handleGenerationChange = useCallback(
    (g: { product: string; tone: Tone; message: string }) => setGeneration(g),
    [],
  );

  const handleLiveStateChange = useCallback(
    (s: { ruleSatisfied: boolean; trafficPct: number; weatherLabel: string }) =>
      setLiveState(s),
    [],
  );

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            Module 02
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Generative Offer Engine — La Configuration
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          IA Strategist
        </h1>
      </div>

      {/* Mirror of Module 01 — same live sources, drives the rule automatically */}
      <Module2Signals
        onWeatherDetected={setWeather}
        onTrafficLowDetected={setTrafficLow}
        ruleWeather={weather}
        onLiveStateChange={handleLiveStateChange}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RuleBuilder
            discount={discount}
            onDiscountChange={setDiscount}
            weather={weather}
            trafficLow={trafficLow}
            onGenerationChange={handleGenerationChange}
          />
        </div>
        <div className="xl:col-span-1">
          <IPhonePreview
            weather={weather}
            discount={discount}
            product={generation.product}
            tone={generation.tone}
            message={generation.message}
          />
        </div>
      </div>

      {/* AI Strategy Log — autonomous console + autopilot toggle */}
      <AiStrategyLog
        ruleSatisfied={liveState.ruleSatisfied}
        trafficPct={liveState.trafficPct}
        weatherLabel={liveState.weatherLabel}
        message={generation.message}
        product={generation.product}
        discount={discount}
      />
    </>
  );
};

export default Automations;
