import { LayoutDashboard, Wand2, Tag, BarChart3, Receipt, Settings, HelpCircle, Sparkles } from "lucide-react";
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

const workspaceItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Automations", url: "/automations", icon: Wand2 },
  { title: "Offers", url: "/offers", icon: Tag },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const bottomItems = [
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
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
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
                  +57% revenu sur heures creuses cette semaine
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
              <div className="text-[10px] text-muted-foreground truncate">Café Müller</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
