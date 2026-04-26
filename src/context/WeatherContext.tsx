import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** NWS Station ID for Yuma MCAS / Yuma International (KNYL). */
const STATION_ID = "KNYL";
const ENDPOINT = `https://api.weather.gov/stations/${STATION_ID}/observations/latest`;
/** Per NWS API ToS — identify the client. */
const USER_AGENT = "(WPE-Digital-Tool-Kit, alan.pruitt@azwestern.edu)";
/** Outdoor-testing thermal redline. */
export const THERMAL_REDLINE_F = 115;
/** Refresh cadence: NWS observations update ~hourly. */
const REFRESH_MS = 10 * 60 * 1000;

export interface WeatherSnapshot {
  station: string;
  tempF: number | null;
  tempC: number | null;
  humidity: number | null;
  rawMessage: string | null;
  observedAt: string | null;
}

interface WeatherContextValue {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  outdoorLocked: boolean;
  /** Markdown block for inclusion in audit summaries. */
  auditBlock: string;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

const cToF = (c: number) => (c * 9) / 5 + 32;

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": USER_AGENT,
        },
      });
      if (!res.ok) throw new Error(`NWS ${res.status}`);
      const json = await res.json();
      const p = json?.properties ?? {};
      const tempC: number | null =
        typeof p?.temperature?.value === "number" ? p.temperature.value : null;
      const humidity: number | null =
        typeof p?.relativeHumidity?.value === "number"
          ? Math.round(p.relativeHumidity.value)
          : null;
      const rawMessage: string | null =
        typeof p?.rawMessage === "string" && p.rawMessage.length > 0
          ? p.rawMessage
          : null;
      const observedAt: string | null =
        typeof p?.timestamp === "string" ? p.timestamp : null;

      setData({
        station: STATION_ID,
        tempC,
        tempF: tempC !== null ? Math.round(cToF(tempC) * 10) / 10 : null,
        humidity,
        rawMessage,
        observedAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Weather fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObs();
    const id = window.setInterval(fetchObs, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [fetchObs]);

  const outdoorLocked =
    data?.tempF !== null && data?.tempF !== undefined && data.tempF > THERMAL_REDLINE_F;

  const auditBlock = useMemo(() => {
    if (!data) return "";
    const lines = [
      "",
      "---",
      `**KNYL Weather** (NWS · ${data.observedAt ?? "n/a"})`,
      `- Temp: ${data.tempF ?? "n/a"}°F${
        data.tempC !== null ? ` (${Math.round(data.tempC * 10) / 10}°C)` : ""
      }`,
      `- Humidity: ${data.humidity ?? "n/a"}%`,
      data.rawMessage ? `- METAR: \`${data.rawMessage}\`` : "- METAR: n/a",
      outdoorLocked
        ? `- ⚠ Thermal redline exceeded (>${THERMAL_REDLINE_F}°F) — outdoor testing disabled.`
        : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [data, outdoorLocked]);

  const value: WeatherContextValue = {
    data,
    loading,
    error,
    refresh: fetchObs,
    outdoorLocked: !!outdoorLocked,
    auditBlock,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherContextValue => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
};
