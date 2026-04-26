import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, Sparkles, CreditCard, Coffee, Croissant, GlassWater, UtensilsCrossed, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Tx = {
  id: string;
  time: string;
  customer: string;
  product: string;
  productIcon: React.ComponentType<{ className?: string }>;
  base: number;
  paid: number;
  boost: boolean;
  channel: "Payone" | "Apple Pay" | "Card";
  rule?: string;
};

const ICONS = [Coffee, Croissant, GlassWater, UtensilsCrossed];
const PRODUCTS = ["Espresso", "Almond croissant", "House lemonade", "Dish of the day", "Cappuccino", "Tarte tatin", "Brunch"];
const CUSTOMERS = ["Mia K.", "Lukas H.", "Sofia R.", "Anna B.", "Tom W.", "Léna D.", "Felix S.", "Clara M.", "Jonas P."];
const CHANNELS: Tx["channel"][] = ["Payone", "Apple Pay", "Card"];

const seed = (n: number): Tx[] => {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => {
    const boost = Math.random() > 0.45;
    const base = Math.round((Math.random() * 18 + 4) * 100) / 100;
    const discount = boost ? Math.round((Math.random() * 0.25 + 0.1) * 100) : 0;
    const paid = Math.round(base * (1 - discount / 100) * 100) / 100;
    const t = new Date(now - i * (60_000 * (1 + Math.random() * 4)));
    return {
      id: `tx-${i}-${now}`,
      time: t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }),
      customer: CUSTOMERS[i % CUSTOMERS.length],
      product: PRODUCTS[i % PRODUCTS.length],
      productIcon: ICONS[i % ICONS.length],
      base,
      paid,
      boost,
      channel: CHANNELS[i % CHANNELS.length],
      rule: boost ? `Rain · -${discount}%` : undefined,
    };
  });
};

export const TransactionsTable = () => {
  const [txs, setTxs] = useState<Tx[]>(() => seed(28));
  const [filter, setFilter] = useState<"all" | "boost" | "standard">("all");

  // simulate live transactions
  useEffect(() => {
    const id = setInterval(() => {
      setTxs((prev) => [seed(1)[0], ...prev].slice(0, 60));
    }, 12_000);
    return () => clearInterval(id);
  }, []);

  const filtered = txs.filter((t) =>
    filter === "all" ? true : filter === "boost" ? t.boost : !t.boost
  );

  const totalBoost = txs.filter((t) => t.boost).reduce((s, t) => s + t.paid, 0);
  const totalAll = txs.reduce((s, t) => s + t.paid, 0);

  return (
    <Card className="shadow-sm-elegant border-border/70 overflow-hidden">
      <div className="p-5 border-b border-border/60 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Receipt className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Payone Transactions — Live</h2>
            <Badge variant="secondary" className="text-[10px] tabular">{txs.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Total volume <span className="tabular font-semibold text-foreground">€{totalAll.toFixed(2)}</span> · including{" "}
            <span className="tabular font-semibold text-success">€{totalBoost.toFixed(2)}</span> via AI offers
          </p>
        </div>
        <div className="inline-flex items-center rounded-lg bg-secondary p-0.5">
          {(["all", "boost", "standard"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                filter === f ? "bg-card text-foreground shadow-sm-elegant" : "text-muted-foreground"
              )}
            >
              {f === "all" ? "All" : f === "boost" ? "AI Boosted" : "Standard"}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="w-[80px]">Time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="text-right">Base</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="w-[160px]">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((t) => {
            const Icon = t.productIcon;
            return (
              <TableRow key={t.id} className="hover:bg-secondary/30">
                <TableCell className="text-xs text-muted-foreground tabular">{t.time}</TableCell>
                <TableCell className="font-medium text-foreground">{t.customer}</TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span>{t.product}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="size-3" /> {t.channel}
                  </span>
                  {t.channel === "Payone" && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success">
                      <ShieldCheck className="size-2.5" /> Verified Payone
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular">€{t.base.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular font-semibold text-foreground">€{t.paid.toFixed(2)}</TableCell>
                <TableCell>
                  {t.boost ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="size-3" /> AI Boosted
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Standard
                    </Badge>
                  )}
                  {t.rule && <div className="text-[10px] text-muted-foreground mt-0.5">{t.rule}</div>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
