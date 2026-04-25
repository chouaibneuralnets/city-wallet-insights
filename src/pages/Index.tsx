import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { ContextPanel } from "@/components/dashboard/ContextPanel";
import { MarketStatus } from "@/components/dashboard/MarketStatus";

const Index = () => {
  const [discount, setDiscount] = useState(20);
  const [weather, setWeather] = useState<Weather>("rain");

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <KpiCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RuleBuilder
                discount={discount}
                onDiscountChange={setDiscount}
                weather={weather}
                onWeatherChange={setWeather}
              />
            </div>
            <MarketStatus onWeatherDetected={setWeather} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionChart />
            </div>
            <ContextPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <IPhonePreview weather={weather} onWeatherChange={setWeather} discount={discount} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
