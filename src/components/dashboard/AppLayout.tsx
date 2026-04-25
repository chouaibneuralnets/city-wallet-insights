import { Outlet } from "react-router-dom";
import { Lock } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AppHeader } from "@/components/dashboard/AppHeader";

export const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-4 lg:p-6 xl:p-8 space-y-6">
            <Outlet />
          </main>
          <footer className="border-t border-border/60 bg-card/50 px-4 lg:px-6 xl:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="size-3 text-success" />
                <span>
                  Données clients traitées via <strong className="text-foreground font-semibold">Local-First SLM</strong>.
                  Conformité RGPD assurée par l'architecture City-Wallet.
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span>DSV · Payone · Sparkasse</span>
                <span className="size-1 rounded-full bg-success animate-pulse" />
                <span>v1.0</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
