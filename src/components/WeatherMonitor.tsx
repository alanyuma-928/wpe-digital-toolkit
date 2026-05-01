import { CloudSun, Droplets, Thermometer, AlertTriangle, RefreshCw, Sun, Flame, Wind } from "lucide-react";
import { useWeather, THERMAL_REDLINE_F } from "@/context/WeatherContext";
import { Button } from "@/components/ui/button";
import SafetyFlagBadge from "@/components/SafetyFlagBadge";
import SimpleGuide from "@/components/SimpleGuide";
import StreakBadge from "@/components/StreakBadge";

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
      <div className="mx-auto w-full max-w-[375px] px-4 py-2 flex items-start gap-3">
        {elevated || outdoorLocked ? (
          <AlertTriangle
            className="h-5 w-5 text-destructive shrink-0 mt-0.5 animate-safety-pulse motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <CloudSun className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-tight">
              KNYL · NWS Live
            </p>
            {flag && <SafetyFlagBadge flag={flag} size="sm" />}
          </div>

          {loading && !data ? (
            <p className="text-sm font-bold text-foreground mt-0.5">Loading observation…</p>
          ) : error && !data ? (
            <p className="text-sm font-bold text-destructive mt-0.5">Offline · {error}</p>
          ) : data ? (
            <p className="text-sm font-bold text-foreground tabular-nums flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />
                {data.tempF ?? "—"}°F
              </span>
              <span
                className="inline-flex items-center gap-1"
                aria-label={`WBGT ${data.wbgtF ?? "unavailable"} degrees Fahrenheit`}
              >
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                WBGT {data.wbgtF ?? "—"}°F
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                {data.humidity ?? "—"}%
              </span>
              <span
                className="inline-flex items-center gap-1"
                aria-label={`UV Index ${data.uvIndex ?? "unavailable"}`}
              >
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                UV {data.uvIndex ?? "—"}
              </span>
              <span
                className="inline-flex items-center gap-1"
                aria-label={
                  data.aqi
                    ? `Air Quality Index ${data.aqi.value}, ${data.aqi.category}, ${data.aqi.parameter}`
                    : "Air Quality Index unavailable"
                }
              >
                <Wind className="h-3.5 w-3.5" aria-hidden="true" />
                AQI {data.aqi?.value ?? "—"}
                {data.aqi?.parameter ? (
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {data.aqi.parameter}
                  </span>
                ) : null}
              </span>
              {outdoorLocked && (
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-destructive">
                  Redline &gt;{THERMAL_REDLINE_F}°F
                </span>
              )}
            </p>
          ) : null}

          {flag && elevated && (
            <p className="text-[11px] font-semibold text-destructive mt-1">
              {flag.guidance}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <StreakBadge />
            <SimpleGuide />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refresh}
            aria-label="Refresh KNYL observation"
            className="h-8 w-8 text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default WeatherMonitor;
