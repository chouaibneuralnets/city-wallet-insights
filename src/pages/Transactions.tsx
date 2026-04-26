import { Wallet } from "lucide-react";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LiveAnalytics } from "@/components/dashboard/LiveAnalytics";

const Transactions = () => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            Module 03
          </span>
          <span className="text-xs text-muted-foreground font-medium">Seamless Checkout — The Outcome</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Wallet className="size-5 text-primary" />
          Finance & Payone
        </h1>
      </div>

      <KpiCards />

      <LiveAnalytics />

      <TransactionChart />
      <TransactionsTable />
    </>
  );
};

export default Transactions;
