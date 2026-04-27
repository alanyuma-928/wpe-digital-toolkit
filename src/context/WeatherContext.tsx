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
const NWS_ENDPOINT = `https://api.weather.gov/stations/${STATION_ID}/observations/latest`;
/** EPA Envirofacts UV Hourly forecast (ZIP 85365 = Yuma, AZ). */
const EPA_ZIP = "85365";
const EPA_HOURLY_ENDPOINT = `https://data.epa.gov/efservice/getEnvirofactsUVHOURLY/ZIP/${EPA_ZIP}/JSON`;
const EPA_DAILY_ENDPOINT = `https://data.epa.gov/efservice/getEnvirofactsUVDAILY/ZIP/${EPA_ZIP}/JSON`;
/** Per NWS API ToS — identify the client (browsers may strip in fetch, but kept for parity). */
const USER_AGENT = "(WPE-Digital-Tool-Kit, alan.pruitt@azwestern.edu)";
/** Outdoor-testing thermal redline. */
export const THERMAL_REDLINE_F = 115;
/** Refresh cadence: NWS observations update ~hourly. */
const REFRESH_MS = 10 * 60 * 1000;

export interface BurnTimeAdvisory {
  category: "Low" | "Moderate" | "High" | "Very High" | "Extreme";
  minutes: string;
  message: string;
}

export interface WeatherSnapshot {
  station: string;
  tempF: number | null;
  tempC: number | null;
  humidity: number | null;
  rawMessage: string | null;
  observedAt: string | null;
  /** EPA UV Index at the closest forecast hour (or daily peak fallback). */
  uvIndex: number | null;
  uvSource: "hourly" | "daily" | null;
  uvObservedAt: string | null;
}

interface WeatherContextValue {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  outdoorLocked: boolean;
  burnTime: BurnTimeAdvisory | null;
  /** Markdown block for inclusion in audit summaries. */
  auditBlock: string;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

const cToF = (c: number) => (c * 9) / 5 + 32;

/** EPA UV Index → NOAA/EPA Sun Safety burn-time advisory. */
export const burnTimeFromUV = (uv: number | null): BurnTimeAdvisory | null => {
  if (uv === null || Number.isNaN(uv)) return null;
  if (uv < 3)
    return {
      category: "Low",
      minutes: "60+ min",
      message: "Low UV: minimal risk for unprotected skin.",
    };
  if (uv < 6)
    return {
      category: "Moderate",
      minutes: "30–45 min",
      message: "Moderate UV: cover up & SPF 30+ recommended.",
    };
  if (uv < 8)
    return {
      category: "High",
      minutes: "15–25 min",
      message: "High UV: shade between 10am–4pm; reapply SPF q2h.",
    };
  if (uv < 11)
    return {
      category: "Very High",
      minutes: "10–15 min",
      message: "Very High UV: minimize sun exposure midday.",
    };
  return {
    category: "Extreme",
    minutes: "<10 min",
    message: "Extreme UV: unprotected skin risk in <10 mins.",
  };
};

/** Parse "Apr/27/2026 12 PM" → Date. */
const parseEpaDate = (s: string): Date | null => {
  const m = s.match(/^(\w{3})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})\s*(AM|PM)$/i);
  if (!m) return null;
  const [, mon, day, year, hr, ap] = m;
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const mi = months[mon.toLowerCase()];
  if (mi === undefined) return null;
  let h = parseInt(hr, 10) % 12;
  if (ap.toUpperCase() === "PM") h += 12;
  return new Date(parseInt(year, 10), mi, parseInt(day, 10), h, 0, 0);
};

interface EpaHourlyRow {
  ORDER?: number;
  ZIP?: string;
  DATE_TIME?: string;
  UV_VALUE?: number;
}
interface EpaDailyRow {
  UV_INDEX?: string | number;
  DATE?: string;
}

const pickCurrentUV = (
  rows: EpaHourlyRow[],
): { uv: number; observedAt: string } | null => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const now = Date.now();
  let best: { uv: number; observedAt: string; delta: number } | null = null;
  for (const r of rows) {
    if (typeof r.UV_VALUE !== "number" || !r.DATE_TIME) continue;
    const d = parseEpaDate(r.DATE_TIME);
    if (!d) continue;
    const delta = Math.abs(d.getTime() - now);
    if (!best || delta < best.delta) {
      best = { uv: r.UV_VALUE, observedAt: r.DATE_TIME, delta };
    }
  }
  return best ? { uv: best.uv, observedAt: best.observedAt } : null;
};

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObs = useCallback(async () => {
    setLoading(true);
    setError(null);

    // NWS — primary
    let nws: Partial<WeatherSnapshot> = {
      tempC: null,
      tempF: null,
      humidity: null,
      rawMessage: null,
      observedAt: null,
    };
    try {
      const res = await fetch(NWS_ENDPOINT, {
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
      nws = {
        tempC,
        tempF: tempC !== null ? Math.round(cToF(tempC) * 10) / 10 : null,
        humidity,
        rawMessage,
        observedAt,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Weather fetch failed");
    }

    // EPA — UV Index (hourly preferred, daily fallback)
    let uvIndex: number | null = null;
    let uvSource: "hourly" | "daily" | null = null;
    let uvObservedAt: string | null = null;
    try {
      const res = await fetch(EPA_HOURLY_ENDPOINT, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
      });
      if (res.ok) {
        const rows: EpaHourlyRow[] = await res.json();
        const pick = pickCurrentUV(rows);
        if (pick) {
          uvIndex = pick.uv;
          uvObservedAt = pick.observedAt;
          uvSource = "hourly";
        }
      }
    } catch {
      // try daily
    }
    if (uvIndex === null) {
      try {
        const res = await fetch(EPA_DAILY_ENDPOINT, {
          headers: {
            Accept: "application/json",
            "User-Agent": USER_AGENT,
          },
        });
        if (res.ok) {
          const rows: EpaDailyRow[] = await res.json();
          const r = Array.isArray(rows) ? rows[0] : null;
          const v =
            r && r.UV_INDEX !== undefined ? Number(r.UV_INDEX) : NaN;
          if (!Number.isNaN(v)) {
            uvIndex = v;
            uvObservedAt = r?.DATE ?? null;
            uvSource = "daily";
          }
        }
      } catch {
        // swallow — UV remains null
      }
    }

    setData({
      station: STATION_ID,
      tempC: nws.tempC ?? null,
      tempF: nws.tempF ?? null,
      humidity: nws.humidity ?? null,
      rawMessage: nws.rawMessage ?? null,
      observedAt: nws.observedAt ?? null,
      uvIndex,
      uvSource,
      uvObservedAt,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchObs();
    const id = window.setInterval(fetchObs, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [fetchObs]);

  const outdoorLocked =
    data?.tempF !== null && data?.tempF !== undefined && data.tempF > THERMAL_REDLINE_F;

  const burnTime = useMemo(
    () => (data ? burnTimeFromUV(data.uvIndex) : null),
    [data],
  );

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
      `**EPA UV Index** (ZIP ${EPA_ZIP} · ${data.uvSource ?? "n/a"} · ${data.uvObservedAt ?? "n/a"})`,
      `- UV: ${data.uvIndex ?? "n/a"}${burnTime ? ` (${burnTime.category})` : ""}`,
      burnTime ? `- Burn Time: ${burnTime.minutes} — ${burnTime.message}` : "",
      outdoorLocked
        ? `- ⚠ Thermal redline exceeded (>${THERMAL_REDLINE_F}°F) — outdoor testing disabled.`
        : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [data, outdoorLocked, burnTime]);

  const value: WeatherContextValue = {
    data,
    loading,
    error,
    refresh: fetchObs,
    outdoorLocked: !!outdoorLocked,
    burnTime,
    auditBlock,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherContextValue => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
};
