import type { Weather } from "@/components/dashboard/IPhonePreview";

export type Tone = "Amical" | "Élégant" | "Urgent";

export const tonesMeta: Record<Tone, { emoji: string; color: string; description: string }> = {
  Amical: { emoji: "😊", color: "amber", description: "Chaleureux & accessible" },
  Élégant: { emoji: "✨", color: "violet", description: "Raffiné & premium" },
  Urgent: { emoji: "⚡", color: "red", description: "Direct & flash" },
};

export const productMeta: Record<
  string,
  { emoji: string; gradient: string }
> = {
  Café: { emoji: "☕", gradient: "from-amber-700 to-amber-900" },
  Croissant: { emoji: "🥐", gradient: "from-yellow-600 to-orange-700" },
  Pâtisserie: { emoji: "🥐", gradient: "from-yellow-600 to-orange-700" },
  "Boissons fraîches": { emoji: "🥤", gradient: "from-cyan-500 to-blue-700" },
  "Plat du jour": { emoji: "🍽️", gradient: "from-emerald-600 to-emerald-800" },
  Brunch: { emoji: "🍳", gradient: "from-orange-500 to-rose-700" },
  Thé: { emoji: "🍵", gradient: "from-green-600 to-emerald-800" },
  Chocolat: { emoji: "🍫", gradient: "from-amber-800 to-stone-900" },
};

const weatherCtx: Record<Weather, string> = {
  rain: "pluie",
  sun: "soleil",
  snow: "neige",
  cloud: "ciel nuageux",
};

/** Génère le message final selon Ton + Météo + Produit + Discount + conditions */
export const generateMessage = (
  tone: Tone,
  weather: Weather,
  product: string,
  discount: number,
  extras?: { stockHigh?: { quantity: number } | null; activeEvent?: string | null; timeWindow?: { from: number; to: number } | null; day?: string | null },
): string => {
  const p = product.toLowerCase();
  const w = weather;

  if (tone === "Amical") {
    if (w === "rain")
      return `Envie d'une petite pause ? Venez vous mettre au sec autour d'un ${p} à -${discount}% ☔`;
    if (w === "sun")
      return `Le soleil vous tend les bras ! Notre ${p} est à -${discount}% sur la terrasse 🌞`;
    if (w === "snow")
      return `Au chaud ça tente ? Un ${p} réconfortant à -${discount}% vous attend ❄️`;
    return `Envie d'une petite pause ? Venez nous voir, ${p} à -${discount}% 😊`;
  }

  if (tone === "Élégant") {
    if (w === "rain")
      return `Une parenthèse raffinée à l'abri de la pluie. Notre ${p} signature à -${discount}%.`;
    if (w === "sun")
      return `Une expérience caféinée d'exception vous attend en terrasse. ${p} -${discount}%.`;
    if (w === "snow")
      return `L'art du ${p} dans un écrin chaleureux. Sélection signature -${discount}%.`;
    return `Une expérience caféinée d'exception vous attend. ${p} signature -${discount}%.`;
  }

  // Urgent
  if (w === "rain")
    return `⚡ FLASH 30 MIN : ${p} -${discount}% pendant l'averse. Foncez !`;
  if (w === "sun")
    return `⚡ HAPPY HOUR : ${p} -${discount}% — uniquement maintenant !`;
  if (w === "snow")
    return `⚡ OFFRE EXPRESS : ${p} chaud -${discount}% — limité aux 20 prochains !`;
  return `⚡ OFFRE FLASH : ${p} -${discount}% — c'est maintenant !`;
};

/** Pensée IA — affichée dans la zone "Prompt Logic" */
export const generateThought = (
  tone: Tone,
  weather: Weather,
  product: string,
  trafficLow: boolean,
  temperatureC: number | null,
): string => {
  const ctx = weatherCtx[weather];
  const traffic = trafficLow ? "Faible Fréquentation" : "Fréquentation normale";
  const temp = temperatureC !== null ? `${temperatureC}°C, ` : "";
  return `Génération d'un message [${tone}] pour un contexte [${temp}${ctx}] + [${traffic}] sur ${product}…`;
};
