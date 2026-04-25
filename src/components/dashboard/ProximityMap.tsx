import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, MapPin, Radar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Wallet = { id: string; x: number; y: number; isMia?: boolean };

const randomWallet = (id: string, isMia = false): Wallet => {
  // points within unit circle (radius 0.85 to keep margin)
  const r = Math.sqrt(Math.random()) * 0.85;
  const a = Math.random() * Math.PI * 2;
  return { id, x: 0.5 + (r * Math.cos(a)) / 2, y: 0.5 + (r * Math.sin(a)) / 2, isMia };
};

export const ProximityMap = () => {
  const [wallets, setWallets] = useState<Wallet[]>([
    randomWallet("w1"),
    randomWallet("w2"),
    randomWallet("w3"),
  ]);
  const [miaDetected, setMiaDetected] = useState(false);

  // Trigger Mia detection when an offer is inserted (Project 2 simulator)
  useEffect(() => {
    const channel = supabase
      .channel("proximity-map-mia")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "offers_config" },
        () => {
          setMiaDetected(true);
          setWallets((prev) => {
            const without = prev.filter((w) => !w.isMia);
            return [...without, randomWallet(`mia-${Date.now()}`, true)];
          });
          // Mia disappears after 15s of inactivity
          setTimeout(() => setMiaDetected(false), 15000);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Other wallets drift slightly for "alive" feel
  useEffect(() => {
    const id = setInterval(() => {
      setWallets((prev) =>
        prev.map((w) =>
          w.isMia
            ? w
            : {
                ...w,
                x: Math.min(0.92, Math.max(0.08, w.x + (Math.random() - 0.5) * 0.02)),
                y: Math.min(0.92, Math.max(0.08, w.y + (Math.random() - 0.5) * 0.02)),
              }
        )
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="p-0 shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Radar className="size-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Mini-carte de proximité</h3>
        </div>
        <Badge variant="outline" className="gap-1.5 font-mono text-[10px] border-border/60">
          rayon 200m
        </Badge>
      </div>

      <div className="p-5">
        <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-xl overflow-hidden bg-secondary/40 border border-border/60">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Streets (decorative) */}
          <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-border/60" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-border/60" />

          {/* Geofence circle (200m) */}
          <div className="absolute inset-[8%] rounded-full border-2 border-dashed border-primary/40 bg-primary/5">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
          </div>
          <div className="absolute inset-[28%] rounded-full border border-primary/30 bg-primary/5" />

          {/* Wallet dots */}
          {wallets.map((w) => (
            <div
              key={w.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: `${w.x * 100}%`, top: `${w.y * 100}%` }}
            >
              {w.isMia ? (
                <div className="relative">
                  <span className="absolute inset-0 size-4 -translate-x-1 -translate-y-1 rounded-full bg-success/40 animate-ping" />
                  <span className="relative block size-2 rounded-full bg-success ring-2 ring-card shadow-md" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-success whitespace-nowrap bg-card/90 px-1.5 py-0.5 rounded border border-success/40">
                    Mia
                  </span>
                </div>
              ) : (
                <span className="block size-1.5 rounded-full bg-muted-foreground/70 ring-1 ring-card" />
              )}
            </div>
          ))}

          {/* Café Müller marker (center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <span className="absolute inset-0 size-8 -translate-x-1.5 -translate-y-1.5 rounded-full bg-primary/30 animate-pulse" />
              <div className="relative size-5 rounded-full bg-primary text-primary-foreground grid place-items-center ring-2 ring-card shadow-md">
                <Coffee className="size-3" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground whitespace-nowrap bg-card/90 px-1.5 py-0.5 rounded border border-border">
                Café Müller
              </span>
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-2 right-2 flex flex-col items-center text-[9px] font-mono text-muted-foreground">
            <span className="font-bold">N</span>
            <span className="h-3 w-px bg-muted-foreground/50" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Boutique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/70" />
            <span className="text-muted-foreground">Wallets actifs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Mia détectée</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-mono flex items-center gap-1.5">
            <MapPin className="size-3" /> 48.7758° N, 9.1829° E
          </span>
          {miaDetected ? (
            <span className="font-semibold text-success flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Mia dans le geofence
            </span>
          ) : (
            <span className="text-muted-foreground">{wallets.length} wallets dans la zone</span>
          )}
        </div>
      </div>
    </Card>
  );
};
