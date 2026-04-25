import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CloudRain, Sun, Snowflake, Cloud, Tag, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OfferRow = {
  id: string;
  weather: string;
  discount_percent: number;
  product: string;
  traffic_condition: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

const weatherIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  rain: CloudRain,
  sun: Sun,
  snow: Snowflake,
  cloud: Cloud,
};

const weatherLabel: Record<string, string> = {
  rain: "Pluie",
  sun: "Soleil",
  snow: "Neige",
  cloud: "Nuageux",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusFromDate = (iso: string, active: boolean): "scheduled" | "active" | "past" => {
  if (!active) return "past";
  const created = new Date(iso).getTime();
  const now = Date.now();
  if (created > now + 60 * 1000) return "scheduled";
  return "active";
};

export const OffersTable = () => {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("offers_config")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error("Impossible de charger les offres", { description: error.message });
    } else {
      setOffers((data ?? []) as OfferRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("offers-table-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers_config" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggle = async (row: OfferRow, value: boolean) => {
    setOffers((prev) => prev.map((o) => (o.id === row.id ? { ...o, active: value } : o)));
    const { error } = await supabase
      .from("offers_config")
      .update({ active: value })
      .eq("id", row.id);
    if (error) {
      toast.error("Mise à jour échouée", { description: error.message });
      load();
    } else {
      toast.success(
        value ? "Offre activée sur le réseau" : "Offre désactivée",
        { description: `${weatherLabel[row.weather] ?? row.weather} → -${row.discount_percent}% sur ${row.product}` }
      );
    }
  };

  const filtered = offers.filter((o) => {
    if (filter === "all") return true;
    const s = statusFromDate(o.created_at, o.active);
    if (filter === "active") return s === "active";
    if (filter === "past") return s === "past";
    return true;
  });

  return (
    <Card className="shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="p-5 border-b border-border/60 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Tag className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Catalogue des offres</h2>
            <Badge variant="secondary" className="text-[10px] tabular">{offers.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Activez, désactivez ou supprimez les offres synchronisées avec l'app Mia.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg bg-secondary p-0.5">
            {(["all", "active", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                  filter === f ? "bg-card text-foreground shadow-sm-elegant" : "text-muted-foreground"
                )}
              >
                {f === "all" ? "Toutes" : f === "active" ? "Actives" : "Inactives"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Actualiser
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="w-[140px]">Statut</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="text-right">Réduction</TableHead>
            <TableHead>Trafic</TableHead>
            <TableHead>Créée</TableHead>
            <TableHead className="text-right w-[120px]">Actif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && offers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin inline mr-2" /> Chargement...
              </TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                Aucune offre dans cette catégorie.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((o) => {
              const Icon = weatherIcon[o.weather] ?? Cloud;
              const status = statusFromDate(o.created_at, o.active);
              return (
                <TableRow key={o.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        status === "active" && "bg-success/15 text-success",
                        status === "scheduled" && "bg-primary/15 text-primary",
                        status === "past" && "bg-muted text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full mr-1.5",
                          status === "active" && "bg-success animate-pulse",
                          status === "scheduled" && "bg-primary",
                          status === "past" && "bg-muted-foreground"
                        )}
                      />
                      {status === "active" ? "Active" : status === "scheduled" ? "Programmée" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <Icon className="size-3.5 text-primary" />
                      <span className="font-medium">{weatherLabel[o.weather] ?? o.weather}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.product}</TableCell>
                  <TableCell className="text-right tabular font-semibold text-foreground">-{o.discount_percent}%</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                      {o.traffic_condition ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular">{formatDate(o.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Switch checked={o.active} onCheckedChange={(v) => toggle(o, v)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
