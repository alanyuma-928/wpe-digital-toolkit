import { useStreak } from "@/hooks/useStreak";

/**
 * Mastery Streak counter — small badge shown in the global header.
 * Reads from localStorage; modules call `checkIn()` when the user logs activity.
 */
const StreakBadge = () => {
  const { count } = useStreak();
  const label =
    count === 0
      ? "No streak yet — check in today!"
      : `Streak: ${count} ${count === 1 ? "day" : "days"} in a row`;

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1 h-8 px-2 rounded-full border-2 border-primary bg-card text-foreground text-xs font-bold tabular-nums"
    >
      <span aria-hidden="true">🔥</span>
      <span>{count}</span>
      <span className="sr-only">days streak</span>
    </span>
  );
};

export default StreakBadge;
