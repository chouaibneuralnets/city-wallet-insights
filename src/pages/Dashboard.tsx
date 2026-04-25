import { KpiCards } from "@/components/dashboard/KpiCards";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { LiveAnalytics } from "@/components/dashboard/LiveAnalytics";
import { AiActivityLog } from "@/components/dashboard/AiActivityLog";
import { RevenueComparison } from "@/components/dashboard/RevenueComparison";
import { ContextPanel } from "@/components/dashboard/ContextPanel";
import { MiaSimulator } from "@/components/dashboard/MiaSimulator";

const Dashboard = () => {
  return (
    <>
      <KpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveAnalytics />
        </div>
        <div className="space-y-6">
          <MiaSimulator />
          <AiActivityLog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionChart />
        </div>
        <ContextPanel />
      </div>

      <RevenueComparison />
    </>
  );
};

export default Dashboard;
