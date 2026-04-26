import { LayoutDashboard, Brain, Wallet, Tag, BarChart3, Settings, HelpCircle, Sparkles } from "lucide-react";
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
};

const coreItems: Item[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true, badge: "M01", caption: "Context Sensing" },
  { title: "AI Strategist", url: "/automations", icon: Brain, badge: "M02", caption: "Generative Engine" },
  { title: "Finance & Payone", url: "/transactions", icon: Wallet, badge: "M03", caption: "Seamless Checkout" },
];

const toolItems: Item[] = [
  { title: "Active offers", url: "/offers", icon: Tag },
  { title: "Advanced analytics", url: "/analytics", icon: BarChart3 },
];

const bottomItems: Item[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-3 py-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="size-9 shrink-0 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow">
            CW
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-sidebar-foreground leading-tight truncate">City-Wallet</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Merchant SaaS</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>DSV Specification</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="h-auto py-2">
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm leading-tight">{item.title}</div>
                            {item.caption && (
                              <div className="text-[10px] text-muted-foreground truncate font-normal">
                                {item.caption}
                              </div>
                            )}
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary tracking-wider shrink-0">
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
          {!collapsed && <SidebarGroupLabel>Tools</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Insights</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mx-2 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Boost</span>
                </div>
                <div className="text-xs text-foreground font-medium leading-snug">
                  +57% revenue during off-peak hours this week
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  className="hover:bg-sidebar-accent/60"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {!collapsed && (
          <div className="px-2 py-2 mt-1 flex items-center gap-2 border-t border-sidebar-border">
            <div className="size-8 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold text-xs shrink-0">
              MG
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-sidebar-foreground truncate">Maria Garcia</div>
              <div className="text-[10px] text-muted-foreground truncate">Müller Coffee</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
