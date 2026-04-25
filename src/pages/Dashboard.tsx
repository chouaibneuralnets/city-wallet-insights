import { KpiCards } from "@/components/dashboard/KpiCards";
import { LiveAnalytics } from "@/components/dashboard/LiveAnalytics";
import { LiveOpportunities } from "@/components/dashboard/LiveOpportunities";

const Dashboard = () => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            Module 01
          </span>
          <span className="text-xs text-muted-foreground font-medium">Context Sensing — Le Présent</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Vue temps réel
        </h1>
      </div>

      <KpiCards />

      <LiveAnalytics />

      <LiveOpportunities />
    </>
  );
};

export default Dashboard;
