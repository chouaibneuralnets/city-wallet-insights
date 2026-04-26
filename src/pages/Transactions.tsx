import { Wallet } from "lucide-react";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LiveAnalytics } from "@/components/dashboard/LiveAnalytics";

const Transactions = () => {
  return (
    <>
      <div className="animate-slide-up">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full bg-peach-soft text-peach font-mono">
            <Wallet className="size-3" />
            Module 03
          </span>
          <span className="text-xs text-muted-foreground font-medium">Seamless Checkout — Outcome</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
          Finance & Payone
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Accepted offers convert into seamless Payone payments — no friction, no apps to download.
        </p>
      </div>

      <KpiCards />

      <LiveAnalytics />

      <TransactionChart />
      <TransactionsTable />
    </>
  );
};

export default Transactions;
