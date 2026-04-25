import { useState } from "react";
import { Smartphone, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simulates the "Mia" client app paying for an offer.
 * Inserts a row in `redemptions` so the Dashboard KPIs update in real-time.
 */
export const MiaSimulator = () => {
  const [product, setProduct] = useState("Café");
  const [amount, setAmount] = useState(3.5);
  const [loading, setLoading] = useState(false);

  const sendOffer = async (status: "sent" | "accepted" | "refused") => {
    setLoading(true);
    try {
      const { error } = await supabase.from("redemptions").insert({
        product,
        amount,
        status,
        weather: "rain",
        discount_percent: 20,
      });
      if (error) throw error;

      // When Mia accepts: drop a ping inside the geofence so the proximity
      // map + counter light up in real-time (within ~50m of Café Müller).
      if (status === "accepted") {
        const r = Math.sqrt(Math.random()) * 0.0005;
        const a = Math.random() * Math.PI * 2;
        await supabase.from("wallet_pings").insert({
          wallet_id: "mia",
          lat: 48.7758 + r * Math.cos(a),
          lng: 9.1829 + r * Math.sin(a) * 1.5,
          is_mia: true,
        });
      }

      // When Mia refuses: deactivate the latest matching active offer in
      // offers_config so the dashboard reflects the rejection.
      if (status === "refused") {
        const { data: latest } = await supabase
          .from("offers_config")
          .select("id")
          .eq("product", product)
          .eq("active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latest?.id) {
          await supabase
            .from("offers_config")
            .update({ active: false })
            .eq("id", latest.id);
        }
      }

      if (status === "refused") {
        toast(`Mia a ignoré l'offre "${product}"`, {
          icon: <XCircle className="size-4 text-destructive" />,
          description: "Statut mis à jour : refused",
        });
      } else {
        toast.success(
          status === "accepted"
            ? `Mia a payé ${product} (+${amount.toFixed(2)} €)`
            : `Offre "${product}" envoyée à Mia`,
          {
            icon: <CheckCircle2 className="size-4 text-success" />,
          },
        );
      }
    } catch (e) {
      toast.error("Erreur de simulation", {
        description: e instanceof Error ? e.message : "Inconnue",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 shadow-sm-elegant border-border/70 border-dashed">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
          <Smartphone className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Simulateur — App Mia</h3>
          <p className="text-xs text-muted-foreground">
            Simule un paiement client pour voir les KPI réagir en temps réel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label htmlFor="mia-product" className="text-xs">
            Produit
          </Label>
          <Input
            id="mia-product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="mia-amount" className="text-xs">
            Montant (€)
          </Label>
          <Input
            id="mia-amount"
            type="number"
            step="0.5"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-9 text-sm tabular"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => sendOffer("sent")}
          disabled={loading}
        >
          <Send className="size-3.5" />
          Envoyer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => sendOffer("refused")}
          disabled={loading}
        >
          <XCircle className="size-3.5" />
          Ignorer
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-gradient-primary"
          onClick={() => sendOffer("accepted")}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          Payer
        </Button>
      </div>
    </Card>
  );
};
