import type { Weather } from "@/components/dashboard/IPhonePreview";

export type Tone = "Friendly" | "Elegant" | "Urgent";

export const tonesMeta: Record<Tone, { emoji: string; color: string; description: string }> = {
  Friendly: { emoji: "😊", color: "amber", description: "Warm & welcoming" },
  Elegant: { emoji: "✨", color: "violet", description: "Refined & premium" },
  Urgent: { emoji: "⚡", color: "red", description: "Direct & flash" },
};

export const productMeta: Record<
  string,
  { emoji: string; gradient: string }
> = {
  Coffee: { emoji: "☕", gradient: "from-amber-700 to-amber-900" },
  Croissant: { emoji: "🥐", gradient: "from-yellow-600 to-orange-700" },
  Pastry: { emoji: "🥐", gradient: "from-yellow-600 to-orange-700" },
  "Cold drinks": { emoji: "🥤", gradient: "from-cyan-500 to-blue-700" },
  "Daily special": { emoji: "🍽️", gradient: "from-emerald-600 to-emerald-800" },
  Brunch: { emoji: "🍳", gradient: "from-orange-500 to-rose-700" },
  Tea: { emoji: "🍵", gradient: "from-green-600 to-emerald-800" },
  Chocolate: { emoji: "🍫", gradient: "from-amber-800 to-stone-900" },
};

const weatherCtx: Record<Weather, string> = {
  rain: "rain",
  sun: "sun",
  snow: "snow",
  cloud: "cloudy sky",
};

/** Generate the final message based on Tone + Weather + Product + Discount + conditions */
export const generateMessage = (
  tone: Tone,
  weather: Weather,
  product: string,
  discount: number,
  extras?: { stockHigh?: { quantity: number } | null; activeEvent?: string | null; timeWindow?: { from: number; to: number } | null; day?: string | null },
): string => {
  const p = product.toLowerCase();
  const w = weather;

  let base: string;
  if (tone === "Friendly") {
    if (w === "rain")
      base = `Fancy a little break? Come dry off with a ${p} at -${discount}% ☔`;
    else if (w === "sun")
      base = `The sun is out! Our ${p} is -${discount}% on the terrace 🌞`;
    else if (w === "snow")
      base = `Need to warm up? A comforting ${p} at -${discount}% awaits you ❄️`;
    else base = `Time for a little break? Come visit us, ${p} at -${discount}% 😊`;
  } else if (tone === "Elegant") {
    if (w === "rain")
      base = `A refined moment, sheltered from the rain. Our signature ${p} at -${discount}%.`;
    else if (w === "sun")
      base = `An exceptional coffee experience awaits you on the terrace. ${p} -${discount}%.`;
    else if (w === "snow")
      base = `The art of ${p} in a warm setting. Signature selection -${discount}%.`;
    else base = `An exceptional coffee experience awaits you. Signature ${p} -${discount}%.`;
  } else {
    if (w === "rain")
      base = `⚡ FLASH 30 MIN: ${p} -${discount}% during the shower. Hurry!`;
    else if (w === "sun")
      base = `⚡ HAPPY HOUR: ${p} -${discount}% — right now only!`;
    else if (w === "snow")
      base = `⚡ EXPRESS OFFER: hot ${p} -${discount}% — limited to the next 20!`;
    else base = `⚡ FLASH OFFER: ${p} -${discount}% — it's now!`;
  }
  return appendExtras(base, extras, product);
};

const appendExtras = (
  base: string,
  extras: Parameters<typeof generateMessage>[4] | undefined,
  product: string,
): string => {
  if (!extras) return base;
  const parts: string[] = [];
  if (extras.timeWindow) parts.push(`from ${extras.timeWindow.from}h to ${extras.timeWindow.to}h`);
  if (extras.day) parts.push(`${extras.day} special`);
  if (extras.stockHigh) parts.push(`${extras.stockHigh.quantity} ${product.toLowerCase()}s in stock`);
  if (extras.activeEvent && extras.activeEvent !== "None") parts.push(`during ${extras.activeEvent}`);
  if (parts.length === 0) return base;
  return `${base} (${parts.join(" · ")})`;
};

/** AI thought — shown in the "Prompt Logic" zone */
export const generateThought = (
  tone: Tone,
  weather: Weather,
  product: string,
  trafficLow: boolean,
  temperatureC: number | null,
  extraConditions?: string[],
): string => {
  const ctx = weatherCtx[weather];
  const traffic = trafficLow ? "Low Footfall" : "Normal footfall";
  const temp = temperatureC !== null ? `${temperatureC}°C, ` : "";
  const extras = extraConditions && extraConditions.length > 0 ? ` + [${extraConditions.join(" · ")}]` : "";
  return `Generating a [${tone}] message for context [${temp}${ctx}] + [${traffic}]${extras} on ${product}…`;
};
