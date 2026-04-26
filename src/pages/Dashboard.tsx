import { InputSignals } from "@/components/dashboard/InputSignals";
import { CompositeState } from "@/components/dashboard/CompositeState";
import { ProximityMap } from "@/components/dashboard/ProximityMap";
import { LiveOpportunities } from "@/components/dashboard/LiveOpportunities";
import { Radar } from "lucide-react";

const Dashboard = () => {
  return (
    <>
      <div className="flex items-end justify-between gap-4 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-primary-soft text-primary font-mono">
              <Radar className="size-3" />
              Module 01
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Context Sensing — IoT signal capture
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
            Detection Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time environmental signals feeding the AI strategist.
          </p>
        </div>
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
