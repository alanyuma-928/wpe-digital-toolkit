import { Sun, AlertTriangle } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";

/**
 * Safety Box · UV Burn Time advisory card.
 * Categories per EPA Sun Safety / NOAA UV Index guidance.
 */
const BurnTimeCard = () => {
  const { data, burnTime } = useWeather();

  const isExtreme = burnTime?.category === "Extreme";
  const isHighPlus =
    burnTime?.category === "High" ||
    burnTime?.category === "Very High" ||
    isExtreme;

  return (
    <section
      aria-labelledby="burn-time-heading"
      className={`mb-4 border-2 rounded-lg p-3 ${
        isExtreme
          ? "border-destructive bg-destructive/10"
          : "border-primary bg-card"
      }`}
    >
      <div className="flex items-start gap-2">
        {isExtreme ? (
          <AlertTriangle
            className="h-5 w-5 text-destructive shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ) : (
          <Sun
            className="h-5 w-5 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
        )}
        <div className="flex-1 min-w-0">
          <p
            id="burn-time-heading"
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            EPA UV · Burn Time
          </p>
          {!data || data.uvIndex === null || !burnTime ? (
            <p className="text-sm font-bold text-foreground mt-0.5">
              UV data unavailable.
            </p>
          ) : (
            <>
              <p className="text-sm font-extrabold text-foreground tabular-nums mt-0.5">
                UV {data.uvIndex} · {burnTime.category} · {burnTime.minutes}
              </p>
              <p
                className={`text-xs mt-1 font-semibold ${
                  isExtreme
                    ? "text-destructive"
                    : isHighPlus
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {burnTime.message}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BurnTimeCard;
