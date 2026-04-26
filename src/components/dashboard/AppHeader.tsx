import { useLocation } from "react-router-dom";
import { Bell, Search, CheckCircle2, Clock, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStuttgartWeather } from "@/hooks/useStuttgartWeather";
import { useSignals } from "@/context/SignalsContext";
import { cn } from "@/lib/utils";

const META: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "Module 01", title: "Detection Center" },
  "/automations": { eyebrow: "Module 02", title: "AI Strategist" },
  "/offers": { eyebrow: "Catalog", title: "Active Offers" },
  "/transactions": { eyebrow: "Module 03", title: "Payone Activity" },
  "/analytics": { eyebrow: "Reports", title: "Advanced Analytics" },
  "/settings": { eyebrow: "Configuration", title: "Settings" },
  "/help": { eyebrow: "Support", title: "Help Center" },
};

export const AppHeader = () => {
  const location = useLocation();
  const meta = META[location.pathname] ?? { eyebrow: "Workspace", title: "City-Wallet" };
  const { data, error } = useStuttgartWeather();
  const { stuttgart } = useSignals();
  const operational = !error && (!!data || true);

  return (
    <header className="sticky top-0 z-20 glass-strong border-b border-border/40">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold font-mono">
              {meta.eyebrow}
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight">
              {meta.title}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-2 pl-4 border-l border-border/60">
          <div className="size-8 rounded-xl bg-gradient-peach flex items-center justify-center text-white text-xs font-bold shadow-sm-elegant">
            MC
          </div>
          <div className="text-xs">
            <div className="font-semibold text-foreground leading-tight">Müller Coffee</div>
            <div className="text-[10px] text-muted-foreground">Stuttgart Zentrum</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:gap-2.5">
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search rules, offers…"
              className="pl-9 pr-12 h-9 bg-white/60 border-border/40 focus-visible:bg-white text-sm rounded-xl"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-secondary/80 border border-border/60 text-[10px] font-mono text-muted-foreground">
              <Command className="size-2.5" />K
            </kbd>
          </div>

          <SidebarTrigger className="hidden lg:inline-flex" />

          <div
            className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-white/60 border border-border/40 text-foreground shadow-xs-elegant"
            title={`Clock locked to Europe/Berlin (${stuttgart.tzAbbr})`}
          >
            <Clock className="size-3.5 text-primary" />
            <span className="tabular-nums font-mono">{stuttgart.hms}</span>
            <span className="opacity-50">·</span>
            <span className="tracking-wide text-muted-foreground font-mono">{stuttgart.tzAbbr}</span>
          </div>

          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              operational
                ? "bg-accent-soft text-accent-foreground hover:bg-accent/30"
                : "bg-warning/15 text-warning hover:bg-warning/20"
            )}
          >
            <span className="relative flex size-2">
              <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", operational ? "bg-accent" : "bg-warning")} />
              <span className={cn("relative inline-flex size-2 rounded-full", operational ? "bg-accent" : "bg-warning")} />
            </span>
            <span className="hidden sm:inline">Operational</span>
          </button>

          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/60">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-peach ring-2 ring-background" />
          </Button>
        </div>
      </div>
    </header>
  );
};
