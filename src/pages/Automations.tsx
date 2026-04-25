import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Plus } from "lucide-react";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { Module2Signals } from "@/components/dashboard/Module2Signals";
import { AiStrategyLog } from "@/components/dashboard/AiStrategyLog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { setRuleActiveValue } from "@/lib/ruleActiveStore";
import type { Tone } from "@/lib/aiGenerator";

type OfferRule = {
  id: string;
  title: string;
  discount: number;
  active: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 9);

const Automations = () => {
  const [weather, setWeather] = useState<Weather>("cloud");
  const [trafficLow, setTrafficLow] = useState(true);

  // Multiple offer rules — each with its own If-Then card.
  const [offers, setOffers] = useState<OfferRule[]>([
    { id: uid(), title: "Offre principale", discount: 20, active: false },
  ]);

  // The iPhone preview mirrors the FIRST active offer (or the first one if none active).
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

  const updateOffer = (id: string, patch: Partial<OfferRule>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const addOffer = () => {
    setOffers((prev) => [
      ...prev,
      {
        id: uid(),
        title: `Offre #${prev.length + 1}`,
        discount: 15,
        active: false,
      },
    ]);
  };

  const removeOffer = (id: string) => {
    setOffers((prev) => (prev.length > 1 ? prev.filter((o) => o.id !== id) : prev));
  };

  // For AiStrategyLog: rule is "active" if any offer is active.
  const anyActive = offers.some((o) => o.active);
  // Use the first offer as the lead for KPI display.
  const leadOffer = offers[0];

  // Mirror the global "rule active" flag so all background tickers (Module 01
  // LiveOpportunities, autopilot, …) honor the same kill-switch — even from
  // other pages.
  const wasActiveRef = useRef(anyActive);
  useEffect(() => {
    setRuleActiveValue(anyActive);
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = anyActive;
    if (wasActive && !anyActive) {
      // ON → OFF transition: expire any pending offers in Supabase so Mia's
      // app stops displaying them.
      void supabase
        .from("offers_config")
        .update({ active: false })
        .eq("active", true);
    }
  }, [anyActive]);

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
        ruleActive={anyActive}
        onLiveStateChange={handleLiveStateChange}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {offers.map((offer, idx) => (
            <RuleBuilder
              key={offer.id}
              title={offer.title}
              discount={offer.discount}
              onDiscountChange={(v) => updateOffer(offer.id, { discount: v })}
              weather={weather}
              trafficLow={trafficLow}
              // Only the first card drives the iPhone preview to keep it simple.
              onGenerationChange={idx === 0 ? handleGenerationChange : undefined}
              active={offer.active}
              onActiveChange={(v) => updateOffer(offer.id, { active: v })}
              onRemove={offers.length > 1 ? () => removeOffer(offer.id) : undefined}
            />
          ))}

          <Button
            variant="outline"
            onClick={addOffer}
            className="w-full h-14 gap-2 border-dashed border-primary/40 text-primary hover:bg-primary-soft hover:text-primary"
          >
            <Plus className="size-4" />
            Ajouter une offre (If-Then)
          </Button>
        </div>
        <div className="xl:col-span-1">
          <IPhonePreview
            weather={weather}
            discount={leadOffer?.discount ?? 20}
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
        discount={leadOffer?.discount ?? 20}
        ruleActive={anyActive}
      />
    </>
  );
};

export default Automations;
