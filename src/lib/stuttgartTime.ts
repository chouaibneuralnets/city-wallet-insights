/**
 * Stuttgart time utilities — single source of truth for "what time is it
 * for Müller Coffee" regardless of where the browser/jury is located.
 *
 * Uses Intl.DateTimeFormat with timeZone: "Europe/Berlin" so DST (CEST/CET)
 * is handled automatically.
 */

const TZ = "Europe/Berlin";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour12: false,
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const tzAbbrFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  timeZoneName: "short",
  hour: "2-digit",
});

const WEEKDAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const WEEKDAY_EN_TO_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export type StuttgartParts = {
  /** 0..23 in Stuttgart timezone */
  hour: number;
  minute: number;
  second: number;
  /** 0..6 (0=Sunday) in Stuttgart timezone — same convention as Date.getDay() */
  day: number;
  /** French weekday name (Lundi…Dimanche) */
  dayNameFr: string;
  /** "CEST" or "CET" depending on DST */
  tzAbbr: string;
  /** "HH:MM:SS" */
  hms: string;
};

export const getStuttgartParts = (date: Date = new Date()): StuttgartParts => {
  const parts = partsFormatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

  const hour = parseInt(map.hour ?? "0", 10);
  const minute = parseInt(map.minute ?? "0", 10);
  const second = parseInt(map.second ?? "0", 10);
  const day = WEEKDAY_EN_TO_INDEX[map.weekday ?? "Mon"] ?? 1;
  const dayNameFr = WEEKDAY_FR[day];

  // Extract "CEST"/"CET" from a separate formatter
  let tzAbbr = "CET";
  for (const p of tzAbbrFormatter.formatToParts(date)) {
    if (p.type === "timeZoneName") {
      tzAbbr = p.value;
      break;
    }
  }

  const hms = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  return { hour, minute, second, day, dayNameFr, tzAbbr, hms };
};
