import { useEffect, useState } from "react";
import { Sun, CloudRain, Snowflake, Cloud, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { productMeta, tonesMeta, type Tone } from "@/lib/aiGenerator";
import { useTypewriter } from "@/hooks/useTypewriter";

export type Weather = "rain" | "sun" | "snow" | "cloud";

const scenarios: Record<
  Weather,
  {
    label: string;
    emoji: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: (d: number) => string;
    wallpaper: string;
    accent: string;
  }
> = {
  rain: {
    label: "Pluie",
    emoji: "🌧️",
    icon: CloudRain,
    title: "Café Müller",
    body: (d) => `Il pleut ? 🌧️ Votre table est prête au Café Müller. -${d}% sur les cafés !`,
    wallpaper:
      "radial-gradient(at 20% 10%, hsl(220 60% 35%) 0%, transparent 50%), radial-gradient(at 80% 20%, hsl(210 70% 25%) 0%, transparent 55%), radial-gradient(at 50% 90%, hsl(230 50% 18%) 0%, transparent 60%), linear-gradient(180deg, hsl(220 50% 22%), hsl(225 60% 12%))",
    accent: "from-blue-500/40 to-indigo-600/40",
  },
  sun: {
    label: "Soleil",
    emoji: "☀️",
    icon: Sun,
    title: "Café Müller",
    body: (d) => `☀️ Belle journée ! Une terrasse vous attend au Café Müller. -${d}% sur les boissons fraîches.`,
    wallpaper:
      "radial-gradient(at 70% 15%, hsl(35 95% 65%) 0%, transparent 55%), radial-gradient(at 20% 80%, hsl(20 90% 55%) 0%, transparent 50%), radial-gradient(at 50% 50%, hsl(15 85% 50%) 0%, transparent 60%), linear-gradient(180deg, hsl(25 90% 60%), hsl(15 85% 40%))",
    accent: "from-amber-500/40 to-orange-600/40",
  },
  snow: {
    label: "Neige",
    emoji: "❄️",
    icon: Snowflake,
    title: "Café Müller",
    body: (d) => `❄️ Au chaud chez Müller : chocolats viennois et pâtisseries à -${d}%. À deux pas de vous !`,
    wallpaper:
      "radial-gradient(at 30% 20%, hsl(210 50% 80%) 0%, transparent 55%), radial-gradient(at 80% 70%, hsl(220 40% 70%) 0%, transparent 50%), linear-gradient(180deg, hsl(210 45% 75%), hsl(220 40% 50%))",
    accent: "from-sky-400/40 to-blue-500/40",
  },
  cloud: {
    label: "Nuageux",
    emoji: "☁️",
    icon: Cloud,
    title: "Café Müller",
    body: (d) => `☁️ Petite pause cosy ? Le Café Müller vous offre -${d}% sur la carte du jour.`,
    wallpaper:
      "radial-gradient(at 25% 25%, hsl(240 20% 40%) 0%, transparent 55%), radial-gradient(at 75% 75%, hsl(220 25% 30%) 0%, transparent 55%), linear-gradient(180deg, hsl(230 22% 38%), hsl(230 25% 20%))",
    accent: "from-slate-400/40 to-slate-600/40",
  },
};

const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
};

export const IPhonePreview = ({
  weather,
  discount,
  product = "Café",
  tone = "Amical",
  message,
}: {
  weather: Weather;
  discount: number;
  product?: string;
  tone?: Tone;
  /** Message final déjà généré par le RuleBuilder */
  message?: string;
}) => {
  const scenario = scenarios[weather];
  const now = useNow();
  const [animKey, setAnimKey] = useState(0);

  // Fallback to scenario default if no message is provided yet.
  const finalMessage = message ?? scenario.body(discount);
  const typed = useTypewriter(finalMessage, 16);

  const productInfo = productMeta[product] ?? productMeta["Café"];
  const toneInfo = tonesMeta[tone];

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [weather, discount, product, tone]);

  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70 h-full flex flex-col bg-gradient-to-br from-card to-secondary/30 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Magic Preview</h2>
          </div>
          <p className="text-sm text-muted-foreground">Aperçu live de l'offre IA sur l'écran client</p>
        </div>
      </div>

      {/* Live weather indicator (read-only — driven by Module 01 sensors) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/60 mb-6 border border-border/40">
        <div className="flex items-center gap-2">
          <scenario.icon className="size-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">{scenario.label}</span>
          <span className="text-[10px] text-muted-foreground">· capteur live Stuttgart</span>
        </div>
        <span className="text-[10px] font-mono text-success flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          AUTO
        </span>
      </div>

      {/* iPhone mockup */}
      <div className="flex-1 flex items-center justify-center min-h-[460px] py-4 relative">
        {/* Ambient glow behind phone */}
        <div
          key={`glow-${animKey}`}
          className={cn(
            "absolute inset-x-12 top-8 bottom-12 rounded-full blur-3xl opacity-60 bg-gradient-to-br animate-fade-in",
            scenario.accent
          )}
        />

        <div className="relative" style={{ width: 260, height: 530 }}>
          {/* Outer titanium frame */}
          <div
            className="absolute inset-0 rounded-[52px] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.45),0_15px_30px_-10px_rgba(15,23,42,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]"
            style={{
              background:
                "linear-gradient(145deg, #4a5060 0%, #2d3340 25%, #1a1f2e 50%, #2d3340 75%, #4a5060 100%)",
            }}
          />
          {/* Side button highlights */}
          <div
            className="absolute -left-[3px] top-28 w-[3px] h-16 rounded-l-sm"
            style={{ background: "linear-gradient(90deg, #1a1f2e, #3a4050)" }}
          />
          <div
            className="absolute -left-[3px] top-48 w-[3px] h-24 rounded-l-sm"
            style={{ background: "linear-gradient(90deg, #1a1f2e, #3a4050)" }}
          />
          <div
            className="absolute -right-[3px] top-36 w-[3px] h-20 rounded-r-sm"
            style={{ background: "linear-gradient(270deg, #1a1f2e, #3a4050)" }}
          />

          {/* Inner bezel */}
          <div className="absolute inset-[6px] rounded-[46px] bg-black" />

          {/* Screen */}
          <div className="absolute inset-[10px] rounded-[42px] overflow-hidden">
            {/* Wallpaper */}
            <div
              key={`wp-${animKey}`}
              className="absolute inset-0 animate-fade-in"
              style={{ background: scenario.wallpaper }}
            />
            {/* Subtle grain/sheen */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.08) 100%)",
              }}
            />

            {/* Status bar */}
            <div className="absolute top-0 inset-x-0 px-7 pt-2.5 flex justify-between items-center text-white text-[11px] font-semibold z-20">
              <span className="tabular">{time}</span>
              <div className="flex items-center gap-1">
                {/* signal */}
                <div className="flex items-end gap-[1.5px] h-2.5">
                  <div className="w-[2px] h-1 bg-white rounded-sm" />
                  <div className="w-[2px] h-1.5 bg-white rounded-sm" />
                  <div className="w-[2px] h-2 bg-white rounded-sm" />
                  <div className="w-[2px] h-2.5 bg-white rounded-sm" />
                </div>
                {/* battery */}
                <div className="ml-1 w-6 h-2.5 rounded-[3px] border border-white/80 relative p-[1px]">
                  <div className="w-[75%] h-full bg-white rounded-[1px]" />
                  <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1 bg-white/80 rounded-r" />
                </div>
              </div>
            </div>

            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[88px] h-[26px] bg-black rounded-full z-30" />

            {/* Lock screen content */}
            <div className="absolute inset-0 flex flex-col items-center pt-12 px-5 text-white">
              <div className="text-[11px] font-medium opacity-90 mt-1">{date}</div>
              <div
                key={`time-${animKey}`}
                className="text-[72px] font-thin tracking-tighter leading-none mt-1 animate-fade-in tabular"
                style={{ fontFamily: "'SF Pro Display', 'Inter', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                {time}
              </div>

              {/* Live Activity / Rich notification */}
              <div
                key={`notif-${animKey}`}
                className="mt-auto mb-20 w-full animate-fade-in"
                style={{ animationDuration: "500ms" }}
              >
                <div className="relative">
                  {/* Glow under notification */}
                  <div className="absolute -inset-2 bg-white/10 blur-xl rounded-3xl" />

                  <div className="relative rounded-3xl bg-white/15 backdrop-blur-2xl border border-white/20 p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                    <div className="flex items-start gap-2.5">
                      {/* App icon — change selon le produit choisi */}
                      <div
                        className={cn(
                          "size-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg text-xl",
                          productInfo.gradient,
                        )}
                      >
                        <span aria-hidden>{productInfo.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider truncate">
                            City-Wallet · {toneInfo.emoji} {tone}
                          </span>
                          <span className="text-[10px] text-white/60">à l'instant</span>
                        </div>
                        <div className="text-[12px] font-semibold text-white leading-tight mb-0.5">
                          {scenario.title}
                        </div>
                        <div className="text-[11px] text-white/85 leading-snug min-h-[2.5rem]">
                          {typed.text}
                          {!typed.done && (
                            <span className="inline-block w-1 h-3 bg-white/80 ml-0.5 align-middle animate-pulse" />
                          )}
                        </div>

                        {/* Action chips */}
                        <div className="flex gap-1.5 mt-2">
                          <div className="flex-1 text-center text-[10px] font-semibold text-white bg-white/15 rounded-full py-1">
                            Réserver
                          </div>
                          <div className="flex-1 text-center text-[10px] font-semibold text-white bg-white/15 rounded-full py-1">
                            Y aller
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom indicators */}
              <div className="absolute bottom-4 inset-x-0 flex justify-between px-7 items-center text-white/80">
                <div className="size-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5zM5 11a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm6 8h2v3h-2v-3z" />
                  </svg>
                </div>
                <div className="size-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d="M12 2a5 5 0 00-5 5v3.59l-1.7 1.7A1 1 0 006 14h12a1 1 0 00.7-1.7L17 10.58V7a5 5 0 00-5-5zm0 20a2 2 0 002-2h-4a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white rounded-full" />
            </div>

            {/* Glass reflection sheen */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.06) 100%)",
              }}
            />
          </div>

          {/* Outer glass reflection */}
          <div
            className="absolute inset-[6px] rounded-[46px] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)",
            }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <Button onClick={() => setAnimKey((k) => k + 1)} variant="outline" className="flex-1 gap-2">
          <RefreshCw className="size-4" /> Régénérer
        </Button>
        <Button className="flex-1 gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
          <Sparkles className="size-4" /> Activer l'offre
        </Button>
      </div>
    </Card>
  );
};
