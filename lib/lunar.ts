/**
 * Lunar and Astrological helper for Cõi Vô Thường
 */

// Known new moon: January 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();
const LUNAR_MONTH = 29.530588853; // days

// Mercury Retrograde periods for 2025 and 2026 (UTC)
const RETROGRADE_PERIODS = [
  // 2025
  { start: new Date("2025-03-15T00:00:00Z"), end: new Date("2025-04-07T23:59:59Z") },
  { start: new Date("2025-07-18T00:00:00Z"), end: new Date("2025-08-11T23:59:59Z") },
  { start: new Date("2025-11-09T00:00:00Z"), end: new Date("2025-11-29T23:59:59Z") },
  // 2026
  { start: new Date("2026-02-25T00:00:00Z"), end: new Date("2026-03-20T23:59:59Z") },
  { start: new Date("2026-06-29T00:00:00Z"), end: new Date("2026-07-23T23:59:59Z") },
  { start: new Date("2026-10-24T00:00:00Z"), end: new Date("2026-11-13T23:59:59Z") },
];

// Eclipse dates in 2025 and 2026 (including 2026-07-07 for live user testing)
const ECLIPSE_DATES = [
  "2026-07-07", // Live testing date
  // 2025
  "2025-03-14", "2025-03-15",
  "2025-03-29",
  "2025-09-07", "2025-09-08",
  "2025-09-21",
  // 2026
  "2026-02-17",
  "2026-03-03",
  "2026-08-12",
  "2026-08-28",
];

export interface CelestialEvents {
  isFullMoon: boolean;
  isNewMoon: boolean;
  isMercuryRetrograde: boolean;
  isEclipse: boolean;
  moonAgeDays: number;
}

export function isEclipseEvent(date: Date = new Date()): boolean {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  // Support both local and UTC checks for testing flexibility
  const localY = date.getFullYear();
  const localM = String(date.getMonth() + 1).padStart(2, "0");
  const localD = String(date.getDate()).padStart(2, "0");
  const localDateStr = `${localY}-${localM}-${localD}`;

  return ECLIPSE_DATES.includes(dateStr) || ECLIPSE_DATES.includes(localDateStr);
}

export function getCelestialEvents(date: Date = new Date()): CelestialEvents {
  const timeDiff = date.getTime() - KNOWN_NEW_MOON;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  let moonAgeDays = daysDiff % LUNAR_MONTH;
  if (moonAgeDays < 0) {
    moonAgeDays += LUNAR_MONTH;
  }

  // Determine phases
  const isNewMoon = moonAgeDays < 1.0 || moonAgeDays > LUNAR_MONTH - 1.0;
  const isFullMoon = moonAgeDays >= 13.76 && moonAgeDays <= 15.76;

  // Check Mercury Retrograde
  const isMercuryRetrograde = RETROGRADE_PERIODS.some(
    (period) => date >= period.start && date <= period.end
  );

  const isEclipse = isEclipseEvent(date);

  return {
    isFullMoon,
    isNewMoon,
    isMercuryRetrograde,
    isEclipse,
    moonAgeDays,
  };
}
