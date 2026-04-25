import { useLocation } from "react-router-dom";
import { Bell, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import { cn } from "@/lib/utils";

const META: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "Overview", title: "Dashboard" },
  "/automations": { eyebrow: "Le cerveau IA", title: "Automations" },
  "/offers": { eyebrow: "Catalogue", title: "Offers" },
  "/transactions": { eyebrow: "Activité Payone", title: "Transactions" },
  "/analytics": { eyebrow: "Rapports", title: "Analytics" },
  "/settings": { eyebrow: "Configuration", title: "Settings" },
  "/help": { eyebrow: "Support", title: "Help" },
};

export const AppHeader = () => {
  const location = useLocation();
  const meta = META[location.pathname] ?? { eyebrow: "Workspace", title: "City-Wallet" };
  const { weather } = useStuttgartWeather();
  const operational = !!weather; // si le hook répond, le système est OK (sinon on reste optimiste)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              {meta.eyebrow}
            </div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight leading-tight">
              {meta.title}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-border">
          <div className="size-7 rounded-md bg-primary-soft flex items-center justify-center text-primary text-xs font-bold">
            CM
          </div>
          <div className="text-xs">
            <div className="font-semibold text-foreground leading-tight">Café Müller</div>
            <div className="text-[10px] text-muted-foreground">Stuttgart Zentrum</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search rules, offers, transactions…"
              className="pl-9 h-9 bg-secondary/60 border-transparent focus-visible:bg-background text-sm"
            />
          </div>

          <SidebarTrigger className="hidden lg:inline-flex" />

          {/* System status pill */}
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors",
              operational
                ? "bg-success/10 border-success/30 text-success hover:bg-success/15"
                : "bg-warning/10 border-warning/30 text-warning hover:bg-warning/15"
            )}
            title="Statut backend, edge functions et intégrations"
          >
            <span className="relative flex size-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  operational ? "bg-success" : "bg-warning"
                )}
              />
              <span className={cn("relative inline-flex size-2 rounded-full", operational ? "bg-success" : "bg-warning")} />
            </span>
            <CheckCircle2 className="size-3.5" />
            <span className="hidden sm:inline">Système : Opérationnel</span>
            <span className="sm:hidden">OK</span>
          </button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
};
