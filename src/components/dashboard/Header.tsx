import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-8 py-4">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Automations</div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Smart Offer Builder</h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search rules, offers, transactions…"
              className="pl-9 h-9 bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </Button>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-md-elegant">
            <Plus className="size-4" /> New Rule
          </Button>
        </div>
      </div>
    </header>
  );
};
