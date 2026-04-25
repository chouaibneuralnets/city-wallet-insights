import { useCallback, useState } from "react";
import { Brain } from "lucide-react";
import { StrategyCards, type Strategy } from "@/components/dashboard/StrategyCards";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { Module2Signals } from "@/components/dashboard/Module2Signals";
import { AiStrategyLog } from "@/components/dashboard/AiStrategyLog";
import type { Tone } from "@/lib/aiGenerator";

const Automations = () => {
  const [weather, setWeather] = useState<Weather>("cloud");
  const [trafficLow, setTrafficLow] = useState(true);
  const [winning, setWinning] = useState<{ strategy: Strategy | null; message: string }>({
    strategy: null,
    message: "",
  });
  const [liveState, setLiveState] = useState<{
    ruleSatisfied: boolean;
    trafficPct: number;
    weatherLabel: string;
  }>({ ruleSatisfied: false, trafficPct: 0, weatherLabel: "—" });

  const handleWinningChange = useCallback(
    (w: { strategy: Strategy | null; message: string }) => setWinning(w),
    [],
  );

  const handleLiveStateChange = useCallback(
    (s: { ruleSatisfied: boolean; trafficPct: number; weatherLabel: string }) =>
      setLiveState(s),
    [],
  );

  const previewProduct = winning.strategy?.product ?? "Café";
  const previewTone: Tone = winning.strategy?.tone ?? "Amical";
  const previewDiscount = winning.strategy?.discount ?? 20;

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

      {/* Mirror of Module 01 — same live sources */}
      <Module2Signals
        onWeatherDetected={setWeather}
        onTrafficLowDetected={setTrafficLow}
        ruleWeather={weather}
        onLiveStateChange={handleLiveStateChange}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <StrategyCards liveWeather={weather} onWinningChange={handleWinningChange} />
        </div>
        <div className="xl:col-span-1">
          <IPhonePreview
            weather={weather}
            discount={previewDiscount}
            product={previewProduct}
            tone={previewTone}
            message={winning.message}
          />
        </div>
      </div>

      {/* AI Strategy Log — autonomous console + autopilot toggle */}
      <AiStrategyLog
        ruleSatisfied={!!winning.strategy}
        trafficPct={liveState.trafficPct}
        weatherLabel={liveState.weatherLabel}
        message={winning.message}
        product={previewProduct}
        discount={previewDiscount}
      />
    </>
  );
};

export default Automations;
