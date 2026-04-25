import { LayoutDashboard, Wand2, Tag, BarChart3, Receipt, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#dashboard" },
  { label: "Automations", icon: Wand2, href: "#automations", active: true },
  { label: "Offers", icon: Tag, href: "#offers" },
  { label: "Transactions", icon: Receipt, href: "#transactions" },
  { label: "Analytics", icon: BarChart3, href: "#analytics" },
];

const bottomNav = [
  { label: "Settings", icon: Settings, href: "#settings" },
  { label: "Help", icon: HelpCircle, href: "#help" },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow">
          CW
        </div>
        <div>
          <div className="font-semibold text-foreground leading-tight">City-Wallet</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Merchant</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
            {item.active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
          </a>
        ))}
      </nav>

      <div className="px-3 py-2 space-y-1 border-t border-border">
        {bottomNav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      <div className="p-4 border-t border-border flex items-center gap-3">
        <div className="size-9 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold text-sm">
          MG
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">Maria Garcia</div>
          <div className="text-xs text-muted-foreground truncate">Boulangerie L'Aurore</div>
        </div>
      </div>
    </aside>
  );
};
