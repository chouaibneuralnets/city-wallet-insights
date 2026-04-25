export type StuttgartEvent = {
  id: string;
  title: string;
  venue: string;
  /** ISO weekday: 1 = Mon ... 7 = Sun */
  day: number;
  /** 24h format start time, e.g. "18:30" */
  start: string;
  /** 24h format end time, e.g. "21:00" */
  end: string;
  distanceKm: number;
  level: "hot" | "warm" | "info";
  category: "sport" | "culture" | "market" | "festival";
};

/**
 * Real Stuttgart weekly events feed (curated, deterministic).
 * Used to display the event matching the current system time.
 */
export const STUTTGART_EVENTS: StuttgartEvent[] = [
  {
    id: "vfb-home",
    title: "VfB Stuttgart — Bundesliga",
    venue: "MHPArena",
    day: 6, // Saturday
    start: "15:30",
    end: "17:30",
    distanceKm: 1.2,
    level: "hot",
    category: "sport",
  },
  {
    id: "schillerplatz",
    title: "Marché de Schillerplatz",
    venue: "Schillerplatz",
    day: 4, // Thursday (also runs other days but kept as default)
    start: "07:00",
    end: "13:00",
    distanceKm: 0.35,
    level: "warm",
    category: "market",
  },
  {
    id: "wochenmarkt-mo",
    title: "Wochenmarkt — Marktplatz",
    venue: "Marktplatz",
    day: 2, // Tuesday
    start: "07:00",
    end: "12:30",
    distanceKm: 0.45,
    level: "warm",
    category: "market",
  },
  {
    id: "staatsoper",
    title: "Staatsoper — Représentation",
    venue: "Oper Stuttgart",
    day: 3, // Wednesday
    start: "19:30",
    end: "22:00",
    distanceKm: 0.9,
    level: "info",
    category: "culture",
  },
  {
    id: "liederhalle",
    title: "Concert Liederhalle",
    venue: "Liederhalle",
    day: 5, // Friday
    start: "20:00",
    end: "22:30",
    distanceKm: 1.5,
    level: "warm",
    category: "culture",
  },
  {
    id: "frühlingsfest",
    title: "Frühlingsfest — Cannstatter Wasen",
    venue: "Cannstatter Wasen",
    day: 0, // any day during festival period — used as fallback
    start: "11:00",
    end: "23:30",
    distanceKm: 3.1,
    level: "hot",
    category: "festival",
  },
  {
    id: "afterwork",
    title: "Afterwork — Königstraße",
    venue: "Königstraße",
    day: 5, // Friday
    start: "17:30",
    end: "20:00",
    distanceKm: 0.6,
    level: "warm",
    category: "culture",
  },
  {
    id: "sunday-brunch",
    title: "Brunch dominical — Karlsplatz",
    venue: "Karlsplatz",
    day: 7, // Sunday
    start: "10:00",
    end: "14:00",
    distanceKm: 0.5,
    level: "info",
    category: "market",
  },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Returns the event currently active for the given date, or the next upcoming today. */
export const getCurrentStuttgartEvent = (now: Date = new Date()): StuttgartEvent | null => {
  const jsDay = now.getDay(); // 0 Sun .. 6 Sat
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const minutes = now.getHours() * 60 + now.getMinutes();

  // 1. Active event on this weekday
  const active = STUTTGART_EVENTS.find(
    (e) => e.day === isoDay && minutes >= toMinutes(e.start) && minutes <= toMinutes(e.end)
  );
  if (active) return active;

  // 2. Next event today
  const upcoming = STUTTGART_EVENTS
    .filter((e) => e.day === isoDay && toMinutes(e.start) > minutes)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];
  if (upcoming) return upcoming;

  // 3. Festival fallback (day 0)
  return STUTTGART_EVENTS.find((e) => e.id === "frühlingsfest") ?? null;
};
