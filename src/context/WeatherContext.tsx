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
/** Per NWS API ToS — identify the client. */
const USER_AGENT = "(WPE-Digital-Tool-Kit, alan.pruitt@azwestern.edu)";
/** Outdoor-testing thermal redline (legacy raw-temp gate; flag system supersedes for clinical). */
export const THERMAL_REDLINE_F = 115;
/** v1.2: 60-minute fetch cycle per DTK Logic Master Protocol. */
const REFRESH_MS = 60 * 60 * 1000;
/** AirNow API — current observations by ZIP. Personal key (client-side, low-volume). */
const AIRNOW_API_KEY = "C46D315C-21EB-48DC-9A8D-85727BE7A82F";
const AIRNOW_ENDPOINT = `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${EPA_ZIP}&distance=25&API_KEY=${AIRNOW_API_KEY}`;
/** v1.5: AQI override threshold — forces Black/Octagon "Indoor Pivot Required". */
export const AQI_INDOOR_PIVOT = 100;

export type FlagColor = "Green" | "Yellow" | "Red" | "Black";
/** WCAG multi-modal: pair color with shape so colorblind users get the same signal. */
export type FlagShape = "●" | "▲" | "■" | "⬢";

export interface SafetyFlag {
  color: FlagColor;
  shape: FlagShape;
  shapeName: "Circle" | "Triangle" | "Square" | "Octagon";
  label: string;
  guidance: string;
  /** Drives Lab History safety gate. */
  requiresAudit: boolean;
}

export interface BurnTimeAdvisory {
  category: "Low" | "Moderate" | "High" | "Very High" | "Extreme";
  minutes: string;
  message: string;
}

export interface AQISnapshot {
  value: number;
  category: string; // "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | ...
  parameter: string; // "PM10" | "PM2.5" | "O3"
  observedAt: string | null;
}

export interface WeatherSnapshot {
  station: string;
  tempF: number | null;
  tempC: number | null;
  humidity: number | null;
  observedAt: string | null;
  uvIndex: number | null;
  uvSource: "hourly" | "daily" | null;
  uvObservedAt: string | null;
  /** Wet Bulb Globe Temperature, °F (estimated from Temp + RH). */
  wbgtF: number | null;
  /** Primary AQI (PM-10 preferred for Yuma; falls back to highest reported). */
  aqi: AQISnapshot | null;
  /** All AQI observations returned by AirNow (PM10, PM2.5, O3...). */
  aqiAll: AQISnapshot[];
}

interface WeatherContextValue {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  outdoorLocked: boolean;
  burnTime: BurnTimeAdvisory | null;
  /** Multi-Modal Safety Flag (color + WCAG shape). */
  flag: SafetyFlag | null;
  /** Markdown block for inclusion in audit summaries. */
  auditBlock: string;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

const cToF = (c: number) => (c * 9) / 5 + 32;
const fToC = (f: number) => ((f - 32) * 5) / 9;

/**
 * Estimate WBGT (°F) from ambient dry-bulb temp (°F) and relative humidity (%).
 * Uses Australian BoM simplified WBGT approximation (no globe radiometer):
 *   Tw  = 0.567·Ta + 0.393·e + 3.94   (Stull 2011, °C)
 *   WBGT ≈ 0.7·Tw + 0.3·Ta            (sun-shielded simplified)
 * where e = vapor pressure (hPa) = (rh/100) · 6.105·exp(17.27·Ta/(237.7+Ta))
 * Returns °F, rounded to 1 decimal.
 */
export const estimateWBGT = (
  tempF: number | null,
  rh: number | null,
): number | null => {
  if (tempF === null || rh === null || Number.isNaN(tempF) || Number.isNaN(rh)) {
    return null;
  }
  const Ta = fToC(tempF); // °C
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * Ta) / (237.7 + Ta));
  const Tw = 0.567 * Ta + 0.393 * e + 3.94; // wet-bulb °C
  const wbgtC = 0.7 * Tw + 0.3 * Ta; // simplified shielded WBGT °C
  return Math.round(cToF(wbgtC) * 10) / 10;
};

/**
 * Multi-Modal Flag derived from the more conservative of WBGT band and UV band.
 * WBGT bands (°F) — ACSM/OSHA heat-stress guidance:
 *   <82 Green · 82–86.9 Yellow · 87–89.9 Red · ≥90 Black
 * UV bands escalate to Red at ≥8 (Very High) and Black at ≥11 (Extreme).
 */
export const deriveFlag = (
  wbgtF: number | null,
  uv: number | null,
  aqi: number | null = null,
): SafetyFlag | null => {
  if (wbgtF === null && uv === null && aqi === null) return null;

  // v1.5 override: AQI > 100 forces Black/Octagon "Indoor Pivot Required".
  if (aqi !== null && aqi > AQI_INDOOR_PIVOT) {
    return {
      color: "Black",
      shape: "⬢",
      shapeName: "Octagon",
      label: "Black Flag · Indoor Pivot Required",
      guidance: `High AQI (${aqi}): Indoor Pivot Required. Clinical Safety Audit required before logging Lab History.`,
      requiresAudit: true,
    };
  }

  const rank: Record<FlagColor, number> = {
    Green: 0,
    Yellow: 1,
    Red: 2,
    Black: 3,
  };

  let heat: FlagColor = "Green";
  if (wbgtF !== null) {
    if (wbgtF >= 90) heat = "Black";
    else if (wbgtF >= 87) heat = "Red";
    else if (wbgtF >= 82) heat = "Yellow";
  }

  let uvBand: FlagColor = "Green";
  if (uv !== null) {
    if (uv >= 11) uvBand = "Black";
    else if (uv >= 8) uvBand = "Red";
    else if (uv >= 6) uvBand = "Yellow";
  }

  const color: FlagColor = rank[heat] >= rank[uvBand] ? heat : uvBand;

  switch (color) {
    case "Black":
      return {
        color: "Black",
        shape: "⬢",
        shapeName: "Octagon",
        label: "Black Flag · Cease Outdoor Activity",
        guidance:
          "Extreme heat/UV. Cancel outdoor testing. Clinical Safety Audit required before logging Lab History.",
        requiresAudit: true,
      };
    case "Red":
      return {
        color: "Red",
        shape: "■",
        shapeName: "Square",
        label: "Red Flag · High Risk",
        guidance:
          "High heat/UV. Restrict outdoor exertion. Clinical Safety Audit required before logging Lab History.",
        requiresAudit: true,
      };
    case "Yellow":
      return {
        color: "Yellow",
        shape: "▲",
        shapeName: "Triangle",
        label: "Yellow Flag · Caution",
        guidance:
          "Moderate heat/UV. Hydrate, monitor symptoms, consider work:rest cycles.",
        requiresAudit: false,
      };
    default:
      return {
        color: "Green",
        shape: "●",
        shapeName: "Circle",
        label: "Green Flag · Normal",
        guidance: "Conditions within standard testing parameters.",
        requiresAudit: false,
      };
  }
};

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

interface AirNowRow {
  DateObserved?: string;
  HourObserved?: number;
  LocalTimeZone?: string;
  ParameterName?: string;
  AQI?: number;
  Category?: { Number?: number; Name?: string };
}

/** Fallback AQI category mapping (EPA breakpoints) when AirNow omits Category.Name. */
const aqiCategoryFromValue = (v: number): string => {
  if (v <= 50) return "Good";
  if (v <= 100) return "Moderate";
  if (v <= 150) return "Unhealthy for Sensitive Groups";
  if (v <= 200) return "Unhealthy";
  if (v <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObs = useCallback(async () => {
    setLoading(true);
    setError(null);

    let nws: Partial<WeatherSnapshot> = {
      tempC: null,
      tempF: null,
      humidity: null,
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
      // v1.5: METAR/aviation strings deprecated — no rawMessage, altimeter, or ceiling capture.
      const observedAt: string | null =
        typeof p?.timestamp === "string" ? p.timestamp : null;
      nws = {
        tempC,
        tempF: tempC !== null ? Math.round(cToF(tempC) * 10) / 10 : null,
        humidity,
        observedAt,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Weather fetch failed");
    }

    let uvIndex: number | null = null;
    let uvSource: "hourly" | "daily" | null = null;
    let uvObservedAt: string | null = null;
    try {
      const res = await fetch(EPA_HOURLY_ENDPOINT, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
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
          headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        });
        if (res.ok) {
          const rows: EpaDailyRow[] = await res.json();
          const r = Array.isArray(rows) ? rows[0] : null;
          const v = r && r.UV_INDEX !== undefined ? Number(r.UV_INDEX) : NaN;
          if (!Number.isNaN(v)) {
            uvIndex = v;
            uvObservedAt = r?.DATE ?? null;
            uvSource = "daily";
          }
        }
      } catch {
        // swallow
      }
    }

    // AirNow AQI fetch (PM-10 preferred for Yuma's desert dust environment).
    let aqi: AQISnapshot | null = null;
    let aqiAll: AQISnapshot[] = [];
    try {
      const res = await fetch(AIRNOW_ENDPOINT, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      });
      if (res.ok) {
        const rows: AirNowRow[] = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          aqiAll = rows
            .filter(
              (r) =>
                typeof r?.AQI === "number" &&
                typeof r?.ParameterName === "string",
            )
            .map((r) => ({
              value: r.AQI as number,
              category:
                (r.Category && typeof r.Category.Name === "string"
                  ? r.Category.Name
                  : aqiCategoryFromValue(r.AQI as number)),
              parameter: r.ParameterName as string,
              observedAt:
                r.DateObserved && r.HourObserved !== undefined
                  ? `${r.DateObserved.trim()} ${String(r.HourObserved).padStart(2, "0")}:00 ${r.LocalTimeZone ?? ""}`.trim()
                  : null,
            }));
          // Prefer PM10 for Yuma; fall back to highest reported value.
          const pm10 = aqiAll.find((a) => /pm.?10/i.test(a.parameter));
          aqi = pm10 ?? aqiAll.reduce<AQISnapshot | null>(
            (max, cur) => (max === null || cur.value > max.value ? cur : max),
            null,
          );
        }
      }
    } catch {
      // AQI optional — flag still derives from WBGT/UV.
    }

    const wbgtF = estimateWBGT(nws.tempF ?? null, nws.humidity ?? null);

    setData({
      station: STATION_ID,
      tempC: nws.tempC ?? null,
      tempF: nws.tempF ?? null,
      humidity: nws.humidity ?? null,
      observedAt: nws.observedAt ?? null,
      uvIndex,
      uvSource,
      uvObservedAt,
      wbgtF,
      aqi,
      aqiAll,
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

  const flag = useMemo(
    () => (data ? deriveFlag(data.wbgtF, data.uvIndex, data.aqi?.value ?? null) : null),
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
      `- WBGT (est.): ${data.wbgtF ?? "n/a"}°F`,
      `**EPA UV Index** (ZIP ${EPA_ZIP} · ${data.uvSource ?? "n/a"} · ${data.uvObservedAt ?? "n/a"})`,
      `- UV: ${data.uvIndex ?? "n/a"}${burnTime ? ` (${burnTime.category})` : ""}`,
      burnTime ? `- Burn Time: ${burnTime.minutes} — ${burnTime.message}` : "",
      `**AirNow AQI** (ZIP ${EPA_ZIP} · ${data.aqi?.observedAt ?? "n/a"})`,
      data.aqi
        ? `- AQI: ${data.aqi.value} - ${data.aqi.category} (${data.aqi.parameter})`
        : "- AQI: n/a",
      ...(data.aqiAll.length > 1
        ? data.aqiAll
            .filter((a) => a !== data.aqi)
            .map((a) => `  - ${a.parameter}: ${a.value} (${a.category})`)
        : []),
      flag
        ? `**Multi-Modal Flag**: ${flag.shape} ${flag.color} (${flag.shapeName}) — ${flag.guidance}`
        : "",
      outdoorLocked
        ? `- ⚠ Thermal redline exceeded (>${THERMAL_REDLINE_F}°F) — outdoor testing disabled.`
        : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [data, outdoorLocked, burnTime, flag]);

  const value: WeatherContextValue = {
    data,
    loading,
    error,
    refresh: fetchObs,
    outdoorLocked: !!outdoorLocked,
    burnTime,
    flag,
    auditBlock,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherContextValue => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
};
