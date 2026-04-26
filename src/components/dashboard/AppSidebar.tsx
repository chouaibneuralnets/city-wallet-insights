import { LayoutDashboard, Brain, Wallet, Tag, BarChart3, Settings, HelpCircle, Sparkles, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: string;
  caption?: string;
  accent?: "primary" | "mint" | "peach";
};

const coreItems: Item[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true, badge: "M01", caption: "Context Sensing", accent: "primary" },
  { title: "AI Strategist", url: "/automations", icon: Brain, badge: "M02", caption: "Generative Engine", accent: "mint" },
  { title: "Finance & Payone", url: "/transactions", icon: Wallet, badge: "M03", caption: "Seamless Checkout", accent: "peach" },
];

const toolItems: Item[] = [
  { title: "Active offers", url: "/offers", icon: Tag },
  { title: "Advanced analytics", url: "/analytics", icon: BarChart3 },
];

const bottomItems: Item[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

const accentDotMap = {
  primary: "bg-primary",
  mint: "bg-accent",
  peach: "bg-peach",
};

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60 bg-transparent">
      <SidebarHeader className="px-3 py-5">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative shrink-0">
            <div className="size-10 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow">
              CW
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-accent border-2 border-background animate-pulse-soft" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sidebar-foreground leading-tight truncate text-[15px]">City-Wallet</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Merchant SaaS</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-3">
              DSV Specification
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="h-auto py-2.5 rounded-xl">
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-white/60 transition-all duration-200 group"
                      activeClassName="bg-white shadow-sm-elegant text-sidebar-accent-foreground font-semibold ring-1 ring-primary/15"
                    >
                      <div className="relative shrink-0">
                        <item.icon className="size-[18px] shrink-0" />
                        {item.accent && (
                          <span className={cn(
                            "absolute -top-0.5 -right-0.5 size-1.5 rounded-full opacity-0 group-[.bg-white]:opacity-100 transition-opacity",
                            accentDotMap[item.accent]
                          )} />
                        )}
                      </div>
                      {!collapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm leading-tight">{item.title}</div>
                            {item.caption && (
                              <div className="text-[10px] text-muted-foreground truncate font-normal mt-0.5">
                                {item.caption}
                              </div>
                            )}
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary tracking-wider shrink-0 font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-3">
              Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="rounded-xl">
                    <NavLink
                      to={item.url}
                      className="hover:bg-white/60 transition-all duration-200"
                      activeClassName="bg-white shadow-sm-elegant text-sidebar-accent-foreground font-medium ring-1 ring-primary/15"
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-3">
              Insights
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mx-2 relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 border border-primary/15 shadow-sm-elegant">
                <div className="absolute -top-8 -right-8 size-24 rounded-full bg-primary/20 blur-2xl animate-blob" />
                <div className="absolute -bottom-6 -left-6 size-20 rounded-full bg-accent/30 blur-2xl animate-blob delay-300" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="size-5 rounded-md bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Sparkles className="size-3 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">AI Boost</span>
                  </div>
                  <div className="text-xs text-foreground font-semibold leading-snug">
                    +57% revenue during off-peak hours this week
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary font-semibold">
                    <Zap className="size-3" /> View full report
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-0.5">
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} className="rounded-xl">
                <NavLink
                  to={item.url}
                  className="hover:bg-white/60 transition-colors"
                  activeClassName="bg-white shadow-sm-elegant text-sidebar-accent-foreground"
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {!collapsed && (
          <div className="mx-1 mt-2 px-3 py-2.5 flex items-center gap-2.5 rounded-2xl glass">
            <div className="size-9 rounded-xl bg-gradient-peach flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm-elegant">
              MG
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-sidebar-foreground truncate">Maria Garcia</div>
              <div className="text-[10px] text-muted-foreground truncate">Müller Coffee · Owner</div>
            </div>
            <div className="size-2 rounded-full bg-success animate-pulse-soft" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
