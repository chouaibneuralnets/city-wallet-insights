import { useState } from "react";
import { RuleBuilder } from "@/components/dashboard/RuleBuilder";
import { IPhonePreview, type Weather } from "@/components/dashboard/IPhonePreview";
import { MarketStatus } from "@/components/dashboard/MarketStatus";
import { AiActivityLog } from "@/components/dashboard/AiActivityLog";

const Automations = () => {
  const [discount, setDiscount] = useState(20);
  const [weather, setWeather] = useState<Weather>("rain");

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RuleBuilder
            discount={discount}
            onDiscountChange={setDiscount}
            weather={weather}
            onWeatherChange={setWeather}
          />
          <MarketStatus onWeatherDetected={setWeather} />
        </div>
        <div className="xl:col-span-1">
          <IPhonePreview weather={weather} onWeatherChange={setWeather} discount={discount} />
        </div>
      </div>

      <AiActivityLog />
    </>
  );
};

export default Automations;
