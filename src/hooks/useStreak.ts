import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "dtk.streak.v1";

interface StreakRecord {
  count: number;
  lastDate: string; // YYYY-MM-DD (local)
}

const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dayDiff = (a: string, b: string): number => {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
};

const read = (): StreakRecord => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastDate: "" };
    const parsed = JSON.parse(raw) as StreakRecord;
    if (typeof parsed.count !== "number" || typeof parsed.lastDate !== "string") {
      return { count: 0, lastDate: "" };
    }
    return parsed;
  } catch {
    return { count: 0, lastDate: "" };
  }
};

/**
 * Mastery Streak hook — tracks consecutive days of activity in localStorage.
 * - Same day: no change.
 * - +1 day: increment.
 * - >1 day gap: reset to 1.
 */
export const useStreak = () => {
  const [record, setRecord] = useState<StreakRecord>(() => read());

  // Re-evaluate on mount: if last visit was >1 day ago, the displayed count is stale (still valid until they check in).
  useEffect(() => {
    setRecord(read());
  }, []);

  const checkIn = useCallback(() => {
    const today = todayKey();
    setRecord((prev) => {
      let next: StreakRecord;
      if (!prev.lastDate) {
        next = { count: 1, lastDate: today };
      } else if (prev.lastDate === today) {
        next = prev;
      } else {
        const gap = dayDiff(prev.lastDate, today);
        next = {
          count: gap === 1 ? prev.count + 1 : 1,
          lastDate: today,
        };
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Effective display count: if more than 1 day has passed without a check-in, the streak is broken.
  const today = todayKey();
  const displayCount =
    record.lastDate && dayDiff(record.lastDate, today) > 1 ? 0 : record.count;

  return { count: displayCount, lastDate: record.lastDate, checkIn };
};
