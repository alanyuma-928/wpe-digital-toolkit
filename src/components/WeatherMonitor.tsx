import { CloudSun, Droplets, Thermometer, AlertTriangle, RefreshCw } from "lucide-react";
import { useWeather, THERMAL_REDLINE_F } from "@/context/WeatherContext";
import { Button } from "@/components/ui/button";

const WeatherMonitor = () => {
  const { data, loading, error, refresh, outdoorLocked } = useWeather();

  return (
    <div
      role="region"
      aria-label="KNYL weather monitor"
      className={`w-full border-b-2 ${
        outdoorLocked ? "border-destructive bg-destructive/10" : "border-primary bg-card"
      }`}
    >
      <div className="mx-auto w-full max-w-[375px] px-4 py-2 flex items-center gap-3">
        {outdoorLocked ? (
          <AlertTriangle
            className="h-5 w-5 text-destructive shrink-0"
            aria-hidden="true"
          />
        ) : (
          <CloudSun className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-tight">
            KNYL · NWS Live
          </p>
          {loading && !data ? (
            <p className="text-sm font-bold text-foreground">Loading observation…</p>
          ) : error && !data ? (
            <p className="text-sm font-bold text-destructive">Offline · {error}</p>
          ) : data ? (
            <p className="text-sm font-bold text-foreground tabular-nums flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />
                {data.tempF ?? "—"}°F
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                {data.humidity ?? "—"}%
              </span>
              {outdoorLocked && (
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-destructive">
                  Redline &gt;{THERMAL_REDLINE_F}°F
                </span>
              )}
            </p>
          ) : null}
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
  );
};

export default WeatherMonitor;
