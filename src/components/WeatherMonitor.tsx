import { CloudSun, Droplets, Thermometer, AlertTriangle, RefreshCw, Sun, Flame, Wind } from "lucide-react";
import { useWeather, THERMAL_REDLINE_F } from "@/context/WeatherContext";
import { Button } from "@/components/ui/button";
import SafetyFlagBadge from "@/components/SafetyFlagBadge";
import SimpleGuide from "@/components/SimpleGuide";
import StreakBadge from "@/components/StreakBadge";
import ObsidianToggle from "@/components/ObsidianToggle";

/**
 * SE-Hardened (260px content well): metrics stacked into a 2-col grid,
 * header chrome compressed, icons reduced to 12px, type to 10–11px.
 */
const WeatherMonitor = () => {
  const { data, loading, error, refresh, outdoorLocked, flag } = useWeather();
  const elevated = flag?.color === "Red" || flag?.color === "Black";

  return (
    <header
      role="region"
      aria-label="KNYL environmental safety monitor"
      className={`w-full border-b-2 ${
        elevated || outdoorLocked
          ? "border-destructive bg-destructive/10"
          : "border-primary bg-card"
      }`}
    >
      <div className="mx-auto w-full max-w-[260px] px-2 py-2">
        {/* Row 1: status icon + label + flag + refresh */}
        <div className="flex items-center gap-1.5">
          {elevated || outdoorLocked ? (
            <AlertTriangle
              className="h-3.5 w-3.5 text-destructive shrink-0 animate-safety-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <CloudSun className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
          )}
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground leading-none flex-1 min-w-0 truncate">
            KNYL · NWS
          </p>
          {flag && <SafetyFlagBadge flag={flag} size="sm" />}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refresh}
            aria-label="Refresh KNYL observation"
            className="h-7 w-7 text-foreground"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Row 2: metrics grid */}
        {loading && !data ? (
          <p className="text-[11px] font-bold text-foreground mt-1">Loading…</p>
        ) : error && !data ? (
          <p className="text-[11px] font-bold text-destructive mt-1 truncate">Offline · {error}</p>
        ) : data ? (
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-bold text-foreground tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Thermometer className="h-3 w-3 shrink-0" aria-hidden="true" />
              {data.tempF ?? "—"}°F
            </span>
            <span
              className="inline-flex items-center gap-1"
              aria-label={`WBGT ${data.wbgtF ?? "unavailable"} degrees Fahrenheit`}
            >
              <Flame className="h-3 w-3 shrink-0" aria-hidden="true" />
              WBGT {data.wbgtF ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3 w-3 shrink-0" aria-hidden="true" />
              {data.humidity ?? "—"}%
            </span>
            <span
              className="inline-flex items-center gap-1"
              aria-label={`UV Index ${data.uvIndex ?? "unavailable"}`}
            >
              <Sun className="h-3 w-3 shrink-0" aria-hidden="true" />
              UV {data.uvIndex ?? "—"}
            </span>
            <span
              className="inline-flex items-center gap-1 col-span-2"
              aria-label={
                data.aqi
                  ? `Air Quality Index ${data.aqi.value}, ${data.aqi.category}, ${data.aqi.parameter}`
                  : "Air Quality Index unavailable"
              }
            >
              <Wind className="h-3 w-3 shrink-0" aria-hidden="true" />
              AQI {data.aqi?.value ?? "—"}
              {data.aqi?.parameter ? (
                <span className="text-[10px] font-semibold text-muted-foreground truncate">
                  {data.aqi.parameter}
                </span>
              ) : null}
            </span>
            {outdoorLocked && (
              <span className="col-span-2 text-[10px] font-extrabold uppercase tracking-wide text-destructive">
                Redline &gt;{THERMAL_REDLINE_F}°F
              </span>
            )}
          </div>
        ) : null}

        {flag && elevated && (
          <p className="text-[10px] font-semibold text-destructive mt-1 leading-snug">
            {flag.guidance}
          </p>
        )}

        {/* Row 3: utility toggles */}
        <div className="mt-1.5 flex items-center justify-end gap-1 border-t border-primary/20 pt-1">
          <StreakBadge />
          <ObsidianToggle />
          <SimpleGuide />
        </div>
      </div>
    </header>
  );
};

export default WeatherMonitor;
