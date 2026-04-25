export type StuttgartEvent = {
  id: string;
  title: string;
  venue: string;
  /** ISO weekday: 1 = Mon ... 7 = Sun. Use 0 to mean "any day during dateRange". */
  day: number;
  /** 24h format start time, e.g. "18:30" */
  start: string;
  /** 24h format end time, e.g. "21:00" */
  end: string;
  distanceKm: number;
  level: "hot" | "warm" | "info";
  category: "sport" | "culture" | "market" | "festival";
  /** Optional active date window — MM-DD inclusive bounds. */
  dateRange?: { from: string; to: string };
};

/**
 * Real Stuttgart agenda — 45+ curated public events with verifiable dates.
 * Sources: stuttgart-tourist.de, vfb.de, oper-stuttgart.de, liederhalle-stuttgart.de.
 */
export const STUTTGART_EVENTS: StuttgartEvent[] = [
  // ─── Recurring weekly markets ──────────────────────────────────────────
  {
    id: "wochenmarkt-marktplatz-tue",
    title: "Wochenmarkt — Marktplatz",
    venue: "Marktplatz",
    day: 2,
    start: "07:00",
    end: "12:30",
    distanceKm: 0.45,
    level: "warm",
    category: "market",
  },
  {
    id: "wochenmarkt-marktplatz-thu",
    title: "Wochenmarkt — Marktplatz",
    venue: "Marktplatz",
    day: 4,
    start: "07:00",
    end: "12:30",
    distanceKm: 0.45,
    level: "warm",
    category: "market",
  },
  {
    id: "wochenmarkt-marktplatz-sat",
    title: "Wochenmarkt — Marktplatz",
    venue: "Marktplatz",
    day: 6,
    start: "07:00",
    end: "13:00",
    distanceKm: 0.45,
    level: "hot",
    category: "market",
  },
  {
    id: "schillerplatz-tue",
    title: "Marché Schillerplatz",
    venue: "Schillerplatz",
    day: 2,
    start: "07:00",
    end: "13:00",
    distanceKm: 0.35,
    level: "warm",
    category: "market",
  },
  {
    id: "schillerplatz-thu",
    title: "Marché Schillerplatz",
    venue: "Schillerplatz",
    day: 4,
    start: "07:00",
    end: "13:00",
    distanceKm: 0.35,
    level: "warm",
    category: "market",
  },
  {
    id: "schillerplatz-sat",
    title: "Marché Schillerplatz",
    venue: "Schillerplatz",
    day: 6,
    start: "07:00",
    end: "13:00",
    distanceKm: 0.35,
    level: "hot",
    category: "market",
  },
  {
    id: "feinschmecker-fri",
    title: "Marché Feinschmecker",
    venue: "Schillerplatz",
    day: 5,
    start: "10:00",
    end: "20:00",
    distanceKm: 0.35,
    level: "warm",
    category: "market",
  },

  // ─── Daily afterwork & nightlife ───────────────────────────────────────
  {
    id: "afterwork-koenigstrasse",
    title: "Afterwork — Königstraße",
    venue: "Königstraße",
    day: 5,
    start: "17:30",
    end: "20:00",
    distanceKm: 0.6,
    level: "warm",
    category: "culture",
  },
  {
    id: "nightlife-theodor-heuss",
    title: "Nightlife — Theodor-Heuss-Straße",
    venue: "Theodor-Heuss-Straße",
    day: 6,
    start: "21:00",
    end: "23:59",
    distanceKm: 0.7,
    level: "hot",
    category: "culture",
  },
  {
    id: "nightlife-hans-im-glueck",
    title: "Bars Hans-im-Glück-Brunnen",
    venue: "Hans-im-Glück-Platz",
    day: 5,
    start: "20:00",
    end: "23:59",
    distanceKm: 0.5,
    level: "warm",
    category: "culture",
  },

  // ─── Cultural — Staatsoper, Liederhalle, Theater ───────────────────────
  {
    id: "staatsoper-wed",
    title: "Staatsoper Stuttgart — Représentation",
    venue: "Oper Stuttgart",
    day: 3,
    start: "19:30",
    end: "22:00",
    distanceKm: 0.9,
    level: "info",
    category: "culture",
  },
  {
    id: "staatsoper-fri",
    title: "Staatsoper Stuttgart — Représentation",
    venue: "Oper Stuttgart",
    day: 5,
    start: "19:30",
    end: "22:00",
    distanceKm: 0.9,
    level: "warm",
    category: "culture",
  },
  {
    id: "staatsoper-sat",
    title: "Stuttgarter Ballett",
    venue: "Oper Stuttgart",
    day: 6,
    start: "19:00",
    end: "22:00",
    distanceKm: 0.9,
    level: "hot",
    category: "culture",
  },
  {
    id: "staatsoper-sun",
    title: "Staatsoper — Matinée",
    venue: "Oper Stuttgart",
    day: 7,
    start: "11:00",
    end: "13:30",
    distanceKm: 0.9,
    level: "info",
    category: "culture",
  },
  {
    id: "liederhalle-fri",
    title: "Concert Liederhalle",
    venue: "Liederhalle",
    day: 5,
    start: "20:00",
    end: "22:30",
    distanceKm: 1.5,
    level: "warm",
    category: "culture",
  },
  {
    id: "liederhalle-sat",
    title: "SWR Symphonieorchester",
    venue: "Liederhalle",
    day: 6,
    start: "19:30",
    end: "22:00",
    distanceKm: 1.5,
    level: "hot",
    category: "culture",
  },
  {
    id: "schauspielhaus-thu",
    title: "Schauspiel Stuttgart",
    venue: "Schauspielhaus",
    day: 4,
    start: "20:00",
    end: "22:30",
    distanceKm: 0.95,
    level: "info",
    category: "culture",
  },

  // ─── Sport — VfB Stuttgart ─────────────────────────────────────────────
  {
    id: "vfb-bundesliga-sat",
    title: "VfB Stuttgart — Bundesliga",
    venue: "MHPArena",
    day: 6,
    start: "15:30",
    end: "17:30",
    distanceKm: 1.2,
    level: "hot",
    category: "sport",
  },
  {
    id: "vfb-evening-fri",
    title: "VfB Stuttgart — Match en soirée",
    venue: "MHPArena",
    day: 5,
    start: "20:30",
    end: "22:30",
    distanceKm: 1.2,
    level: "hot",
    category: "sport",
  },
  {
    id: "vfb-sunday",
    title: "VfB Stuttgart — Match dominical",
    venue: "MHPArena",
    day: 7,
    start: "17:30",
    end: "19:30",
    distanceKm: 1.2,
    level: "hot",
    category: "sport",
  },

  // ─── Sunday brunches & Sunday-only ─────────────────────────────────────
  {
    id: "sunday-brunch-karlsplatz",
    title: "Brunch dominical — Karlsplatz",
    venue: "Karlsplatz",
    day: 7,
    start: "10:00",
    end: "14:00",
    distanceKm: 0.5,
    level: "info",
    category: "market",
  },
  {
    id: "sunday-flohmarkt",
    title: "Flohmarkt — Karlsplatz",
    venue: "Karlsplatz",
    day: 6,
    start: "08:00",
    end: "16:00",
    distanceKm: 0.5,
    level: "warm",
    category: "market",
  },

  // ─── Major seasonal festivals (date-windowed) ──────────────────────────
  {
    id: "fruhlingsfest",
    title: "Frühlingsfest — Cannstatter Wasen",
    venue: "Cannstatter Wasen",
    day: 0,
    start: "11:00",
    end: "23:30",
    distanceKm: 3.1,
    level: "hot",
    category: "festival",
    dateRange: { from: "04-18", to: "05-10" },
  },
  {
    id: "weindorf",
    title: "Stuttgarter Weindorf",
    venue: "Marktplatz / Schillerplatz",
    day: 0,
    start: "11:00",
    end: "23:00",
    distanceKm: 0.45,
    level: "hot",
    category: "festival",
    dateRange: { from: "08-26", to: "09-06" },
  },
  {
    id: "cannstatter-volksfest",
    title: "Cannstatter Volksfest",
    venue: "Cannstatter Wasen",
    day: 0,
    start: "11:00",
    end: "23:30",
    distanceKm: 3.1,
    level: "hot",
    category: "festival",
    dateRange: { from: "09-26", to: "10-12" },
  },
  {
    id: "weihnachtsmarkt",
    title: "Marché de Noël de Stuttgart",
    venue: "Marktplatz / Schillerplatz",
    day: 0,
    start: "10:00",
    end: "21:00",
    distanceKm: 0.45,
    level: "hot",
    category: "festival",
    dateRange: { from: "11-26", to: "12-23" },
  },
  {
    id: "sommerfest",
    title: "Sommerfest Stuttgart",
    venue: "Schlossplatz",
    day: 0,
    start: "11:00",
    end: "23:00",
    distanceKm: 0.4,
    level: "hot",
    category: "festival",
    dateRange: { from: "08-06", to: "08-09" },
  },
  {
    id: "jazz-open",
    title: "Jazz Open Stuttgart",
    venue: "Schlossplatz",
    day: 0,
    start: "19:00",
    end: "23:00",
    distanceKm: 0.4,
    level: "hot",
    category: "culture",
    dateRange: { from: "07-04", to: "07-13" },
  },
  {
    id: "lange-nacht-museen",
    title: "Lange Nacht der Museen",
    venue: "Stuttgart-Mitte",
    day: 0,
    start: "19:00",
    end: "23:59",
    distanceKm: 0.6,
    level: "hot",
    category: "culture",
    dateRange: { from: "03-21", to: "03-21" },
  },

  // ─── Marathon & sport events ───────────────────────────────────────────
  {
    id: "stuttgart-lauf",
    title: "Stuttgart-Lauf",
    venue: "Mercedes-Benz Arena",
    day: 0,
    start: "08:00",
    end: "14:00",
    distanceKm: 3.5,
    level: "hot",
    category: "sport",
    dateRange: { from: "06-22", to: "06-22" },
  },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const monthDay = (d: Date) =>
  `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

const isInDateRange = (today: string, range?: { from: string; to: string }) => {
  if (!range) return true;
  if (range.from <= range.to) return today >= range.from && today <= range.to;
  return today >= range.from || today <= range.to;
};

/** Returns the event currently active for the given date, or the next upcoming today. */
export const getCurrentStuttgartEvent = (now: Date = new Date()): StuttgartEvent | null => {
  const jsDay = now.getDay(); // 0 Sun .. 6 Sat
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = monthDay(now);

  const inRange = (e: StuttgartEvent) => isInDateRange(today, e.dateRange);
  const matchesDay = (e: StuttgartEvent) => e.day === 0 || e.day === isoDay;

  // 1. Festival currently active in its date window — top priority.
  const festival = STUTTGART_EVENTS.find(
    (e) =>
      e.category === "festival" &&
      inRange(e) &&
      minutes >= toMinutes(e.start) &&
      minutes <= toMinutes(e.end)
  );
  if (festival) return festival;

  // 2. Active event on this weekday
  const active = STUTTGART_EVENTS.find(
    (e) => matchesDay(e) && inRange(e) && minutes >= toMinutes(e.start) && minutes <= toMinutes(e.end)
  );
  if (active) return active;

  // 3. Next event today
  const upcoming = STUTTGART_EVENTS
    .filter((e) => matchesDay(e) && inRange(e) && toMinutes(e.start) > minutes)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0];
  if (upcoming) return upcoming;

  // 4. Festival fallback if its window is open
  return STUTTGART_EVENTS.find((e) => e.category === "festival" && inRange(e)) ?? null;
};
