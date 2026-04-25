import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { AiSimulator } from "@/components/dashboard/AiSimulator";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { ContextPanel } from "@/components/dashboard/ContextPanel";

const Index = () => {
  const [discount, setDiscount] = useState(25);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <KpiCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RuleBuilder discount={discount} onDiscountChange={setDiscount} />
            </div>
            <ContextPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionChart />
            </div>
            <AiSimulator discount={discount} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
