import type { SafetyFlag } from "@/context/WeatherContext";

interface SafetyFlagBadgeProps {
  flag: SafetyFlag;
  size?: "sm" | "md";
}

/**
 * Multi-Modal Safety Flag — pairs color with a WCAG-compliant shape glyph
 * (Circle/Triangle/Square/Octagon) so colorblind users receive the same signal.
 * Foreground/background tokens guarantee ≥4.5:1 contrast.
 */
const FLAG_CLASSES: Record<SafetyFlag["color"], string> = {
  Green: "bg-flag-green text-flag-green-foreground border-flag-green",
  Yellow: "bg-flag-yellow text-flag-yellow-foreground border-flag-yellow",
  Red: "bg-flag-red text-flag-red-foreground border-flag-red",
  Black: "bg-flag-black text-flag-black-foreground border-flag-black",
};

const SafetyFlagBadge = ({ flag, size = "md" }: SafetyFlagBadgeProps) => {
  const dims =
    size === "sm"
      ? "h-6 px-2 text-[11px] gap-1"
      : "h-8 px-2.5 text-xs gap-1.5";
  return (
    <span
      role="img"
      aria-label={`${flag.color} flag (${flag.shapeName}) — ${flag.label}`}
      className={`inline-flex items-center font-extrabold uppercase tracking-wider border-2 rounded ${dims} ${FLAG_CLASSES[flag.color]}`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {flag.shape}
      </span>
      <span>{flag.color}</span>
    </span>
  );
};

export default SafetyFlagBadge;
