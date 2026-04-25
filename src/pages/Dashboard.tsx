import { InputSignals } from "@/components/dashboard/InputSignals";
import { CompositeState } from "@/components/dashboard/CompositeState";
import { ProximityMap } from "@/components/dashboard/ProximityMap";
import { LiveOpportunities } from "@/components/dashboard/LiveOpportunities";

const Dashboard = () => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            Module 01
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Context Sensing — Capture des signaux IoT
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Centre de détection
        </h1>
      </div>

      <InputSignals />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <CompositeState />
        <ProximityMap />
      </div>

      <LiveOpportunities />
    </>
  );
};

export default Dashboard;
