import type { WeatherSnapshot, SafetyFlag } from "@/context/WeatherContext";

export interface FITTVP {
  frequency: string;
  intensity: string;
  time: string;
  type: string;
  volume: string;
  progression: string;
}

export interface ClientProfile {
  name: string;
  age: string;
  restingHR: string;
  betaBlocker: boolean;
  notes: string;
}

export type Units = "imperial" | "metric";

export interface RxPayload {
  client: ClientProfile;
  fittvp: FITTVP;
  weather: WeatherSnapshot | null;
  flag: SafetyFlag | null;
  units: Units;
}

const fToC = (f: number) => Math.round(((f - 32) * 5) / 9 * 10) / 10;

export const buildRxMarkdown = ({
  client,
  fittvp,
  weather,
  flag,
  units,
}: RxPayload): string => {
  const isMetric = units === "metric";
  const tLabel = isMetric ? "°C" : "°F";
  const tv = (f: number | null | undefined) =>
    f === null || f === undefined ? "n/a" : isMetric ? fToC(f) : f;

  const intensity = client.betaBlocker
    ? "Modified Borg Scale (RPE)"
    : fittvp.intensity;

  const profile = [
    "### CLIENT PROFILE ###",
    `- **Name:** ${client.name || "—"}`,
    `- **Age:** ${client.age || "—"}`,
    `- **Resting HR:** ${client.restingHR || "—"} bpm`,
    `- **Beta-Blocker:** ${client.betaBlocker ? "YES (HR zones invalidated)" : "No"}`,
    `- **Notes:** ${client.notes || "—"}`,
    "### END CLIENT PROFILE ###",
  ].join("\n");

  const table = [
    "| Component | Prescription |",
    "| --- | --- |",
    `| Frequency | ${fittvp.frequency} |`,
    `| Intensity | ${intensity} |`,
    `| Time | ${fittvp.time} |`,
    `| Type | ${fittvp.type} |`,
    `| Volume | ${fittvp.volume} |`,
    `| Progression | ${fittvp.progression} |`,
  ].join("\n");

  const audit = [
    "> **KNYL Thermal Safety Audit**",
    `> Timestamp: ${new Date().toISOString()}`,
    `> Station: KNYL · Yuma MCAS`,
    `> Temp: ${tv(weather?.tempF)}${tLabel} · Humidity: ${weather?.humidity ?? "n/a"}%`,
    `> WBGT (est.): ${tv(weather?.wbgtF)}${tLabel} · UV: ${weather?.uvIndex ?? "n/a"}`,
    `> AQI: ${weather?.aqi ? `${weather.aqi.value} ${weather.aqi.category} (${weather.aqi.parameter})` : "n/a"}`,
    `> Flag: ${flag ? `${flag.shape} ${flag.color} — ${flag.label}` : "n/a"}`,
    flag ? `> Guidance: ${flag.guidance}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "## EXW Clinical Exercise Prescription",
    `_Generated: ${new Date().toLocaleString()} · Units: ${units}_`,
    "",
    profile,
    "",
    "**FITT-VP Solve**",
    "",
    table,
    "",
    audit,
    "",
  ].join("\n");
};
