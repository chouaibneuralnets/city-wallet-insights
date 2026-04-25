import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TransactionChart } from "@/components/dashboard/TransactionChart";

const Transactions = () => {
  return (
    <>
      <TransactionChart />
      <TransactionsTable />
    </>
  );
};

export default Transactions;
