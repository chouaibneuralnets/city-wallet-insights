import { useState } from "react";
import { Sparkles, RefreshCw, Send, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const variants = [
  {
    tone: "Chaleureux",
    title: "Un café au chaud, ça vous tente ?",
    body: "Il pleut dehors et notre boutique vous attend ! Profitez de DISCOUNT% sur toute la carte chaude jusqu'à 18h. Une parenthèse douce avant de reprendre la route. ☕",
  },
  {
    tone: "Direct",
    title: "DISCOUNT% offerts — aujourd'hui seulement",
    body: "Météo capricieuse ? On compense. Présentez ce code en caisse pour bénéficier de DISCOUNT% sur votre commande. Valable jusqu'à fermeture.",
  },
  {
    tone: "Premium",
    title: "Une attention pour vous",
    body: "Parce que les beaux moments naissent souvent des journées grises, nous vous offrons DISCOUNT% sur notre sélection signature. À très vite.",
  },
];

export const AiSimulator = ({ discount }: { discount: number }) => {
  const [variantIdx, setVariantIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const variant = variants[variantIdx];
  const filledTitle = variant.title.replace("DISCOUNT", String(discount));
  const filledBody = variant.body.replace(/DISCOUNT/g, String(discount));

  const regenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setVariantIdx((i) => (i + 1) % variants.length);
      setGenerating(false);
    }, 600);
  };

  const copy = () => {
    navigator.clipboard.writeText(`${filledTitle}\n\n${filledBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="p-6 shadow-sm-elegant border-border/70 h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Simulateur IA</h2>
          </div>
          <p className="text-sm text-muted-foreground">Aperçu généré selon votre règle</p>
        </div>
        <div className="flex gap-1">
          {variants.map((v, i) => (
            <button
              key={v.tone}
              onClick={() => setVariantIdx(i)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                i === variantIdx
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {v.tone}
            </button>
          ))}
        </div>
      </div>

      {/* Generated message preview */}
      <div className="relative flex-1 rounded-xl border border-border bg-gradient-soft p-5 overflow-hidden">
        {generating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <RefreshCw className="size-4 animate-spin" />
              Génération en cours…
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="size-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aperçu push notification
          </span>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">{filledTitle}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{filledBody}</p>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-background border border-border font-medium">
            {filledBody.length} car.
          </span>
          <span className="px-2 py-0.5 rounded bg-background border border-border font-medium">
            FR · Inclusif
          </span>
          <span className="ml-auto px-2 py-0.5 rounded bg-success/10 text-success font-semibold">
            Score 92/100
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={regenerate} variant="outline" className="flex-1 gap-2" disabled={generating}>
          <RefreshCw className={cn("size-4", generating && "animate-spin")} />
          Régénérer
        </Button>
        <Button onClick={copy} variant="outline" size="icon">
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </Button>
        <Button className="flex-1 gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
          <Send className="size-4" /> Activer
        </Button>
      </div>
    </Card>
  );
};
