import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Plus } from "lucide-react";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { Module2Signals } from "@/components/dashboard/Module2Signals";
import { AiStrategyLog } from "@/components/dashboard/AiStrategyLog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { setRuleActiveValue, useRuleActive } from "@/lib/ruleActiveStore";
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
    { id: uid(), title: "Main Offer", discount: 20, active: false },
  ]);
  const globalRuleActive = useRuleActive();

  // The iPhone preview mirrors the FIRST active offer (or the first one if none active).
  const [generation, setGeneration] = useState<{ product: string; tone: Tone; message: string }>({
    product: "Coffee",
    tone: "Friendly",
    message: "",
  });
  const [liveState, setLiveState] = useState<{
    trafficPct: number;
    weatherLabel: string;
  }>({ trafficPct: 0, weatherLabel: "—" });
  const [ruleMatches, setRuleMatches] = useState<Record<string, boolean>>({});

  const handleGenerationChange = useCallback(
    (g: { product: string; tone: Tone; message: string }) => setGeneration(g),
    [],
  );

  const handleLiveStateChange = useCallback(
    (s: { trafficPct: number; weatherLabel: string }) => setLiveState(s),
    [],
  );

  const handleRuleSatisfiedChange = useCallback((id: string, matched: boolean) => {
    setRuleMatches((prev) => (prev[id] === matched ? prev : { ...prev, [id]: matched }));
  }, []);

  const updateOffer = (id: string, patch: Partial<OfferRule>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const addOffer = () => {
    setOffers((prev) => [
      ...prev,
      {
        id: uid(),
        title: `Offer #${prev.length + 1}`,
        discount: 15,
        active: false,
      },
    ]);
  };

  const removeOffer = (id: string) => {
    setOffers((prev) => (prev.length > 1 ? prev.filter((o) => o.id !== id) : prev));
    setRuleMatches((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // For AiStrategyLog: rule is "active" if any offer is active.
  const anyActive = offers.some((o) => o.active);
  const anyRuleSatisfied = offers.some((o) => ruleMatches[o.id]);
  // Use the first offer as the lead for KPI display.
  const leadOffer = offers[0];

  // Mirror the global "rule active" flag so all background tickers (Module 01
  // LiveOpportunities, autopilot, …) honor the same kill-switch — even from
  // other pages.
  useEffect(() => {
    setOffers((prev) => {
      const hasActive = prev.some((o) => o.active);
      if (globalRuleActive && !hasActive) {
        return prev.map((o, idx) => (idx === 0 ? { ...o, active: true } : o));
      }
      if (!globalRuleActive && hasActive) {
        return prev.map((o) => (o.active ? { ...o, active: false } : o));
      }
      return prev;
    });
  }, [globalRuleActive]);

  const didMountMirrorRef = useRef(false);
  const wasActiveRef = useRef(anyActive);
  useEffect(() => {
    if (!didMountMirrorRef.current) {
      didMountMirrorRef.current = true;
      wasActiveRef.current = anyActive;
      return;
    }
    void setRuleActiveValue(anyActive).catch(() => undefined);
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
      <div className="animate-slide-up">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-accent-soft text-accent-foreground font-mono">
            <Brain className="size-3" />
            Module 02
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Generative Offer Engine — Configuration
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
          AI Strategist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Translate live context into personalized offers, deployed to Mia in seconds.
        </p>
      </div>

      {/* Mirror of Module 01 — same live sources, drives the rule automatically */}
      <Module2Signals
        onWeatherDetected={setWeather}
        onTrafficLowDetected={setTrafficLow}
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
              onRuleSatisfiedChange={(matched) => handleRuleSatisfiedChange(offer.id, matched)}
            />
          ))}

          <Button
            variant="outline"
            onClick={addOffer}
            className="w-full h-14 gap-2 rounded-2xl border-dashed border-primary/40 bg-white/40 backdrop-blur text-primary hover:bg-primary-soft hover:text-primary hover:border-primary/60 transition-all"
          >
            <Plus className="size-4" />
            Add another offer (If-Then)
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
        ruleSatisfied={anyRuleSatisfied}
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
