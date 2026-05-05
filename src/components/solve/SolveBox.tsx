import { useMemo, useState } from "react";
import { AlertTriangle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeather } from "@/context/WeatherContext";
import { generateRxPdf, type FITTVP, type ClientProfile } from "@/lib/rxPdf";

/**
 * Solve Box — final Exercise Prescription container.
 * Mission Loop: Pattern → Rule → Solve.
 * WCAG 2.1 AA header: bg #003366 / text #FFFFFF (~12.6:1).
 */
const HEAT_INDEX_WARN_F = 90;

type Units = "imperial" | "metric";

const SolveBox = () => {
  const { data, flag } = useWeather();
  const [units, setUnits] = useState<Units>("imperial");
  const isMetric = units === "metric";
  const fToC = (f: number) => Math.round(((f - 32) * 5) / 9 * 10) / 10;
  const t = (f: number | null | undefined) =>
    f === null || f === undefined ? "n/a" : isMetric ? fToC(f) : f;
  const tLabel = isMetric ? "°C" : "°F";
  const [client, setClient] = useState<ClientProfile>({
    name: "",
    age: "",
    restingHR: "",
    betaBlocker: false,
    notes: "",
  });

  const [fittvp, setFittvp] = useState<FITTVP>({
    frequency: "5 days/week",
    intensity: "Moderate (40–59% HRR)",
    time: "30 min/session",
    type: "Walking + Resistance",
    volume: "150 min/week",
    progression: "+10% volume / week (max)",
  });

  // LOGIC GATE: Beta-blocker invalidates HR zones → force Modified Borg RPE 3-5.
  const intensityDisplay = useMemo(
    () => (client.betaBlocker ? "Modified Borg Scale (RPE 3–5)" : fittvp.intensity),
    [client.betaBlocker, fittvp.intensity],
  );

  const heatWarning =
    (data?.tempF !== null && data?.tempF !== undefined && data.tempF >= HEAT_INDEX_WARN_F) ||
    flag?.color === "Red" ||
    flag?.color === "Black";

  const handleExport = () => {
    generateRxPdf({
      client,
      fittvp: { ...fittvp, intensity: intensityDisplay },
      weather: data,
      flag,
      units,
    });
  };

  return (
    <Card className="border-2 border-primary shadow-md">
      <CardHeader
        className="rounded-t-lg"
        style={{ backgroundColor: "#003366", color: "#FFFFFF" }}
      >
        <CardTitle className="text-xl" style={{ color: "#FFFFFF" }}>
          Solve Box · Exercise Prescription
        </CardTitle>
        <p className="text-xs" style={{ color: "#FFFFFF" }}>
          Pattern → Rule → Solve · ACSM 12th Ed. · PAGA 2018
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Units Toggle */}
        <div
          role="group"
          aria-label="Units toggle"
          className="flex items-center justify-end gap-2 text-xs"
        >
          <span className="font-semibold uppercase tracking-widest">Units:</span>
          <div className="inline-flex rounded-md border-2 border-primary overflow-hidden">
            {(["imperial", "metric"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                aria-pressed={units === u}
                className={`px-3 py-1 font-semibold uppercase ${
                  units === u
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {u === "imperial" ? "°F" : "°C"}
              </button>
            ))}
          </div>
        </div>

        {/* Client Profile */}
        <section aria-labelledby="profile-heading">
          <h3 id="profile-heading" className="text-sm font-bold uppercase tracking-widest mb-3">
            ### Client Profile ###
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={client.age} onChange={(e) => setClient({ ...client, age: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="rhr">Resting HR</Label>
              <Input id="rhr" type="number" value={client.restingHR} onChange={(e) => setClient({ ...client, restingHR: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <input
                id="bb"
                type="checkbox"
                checked={client.betaBlocker}
                onChange={(e) => setClient({ ...client, betaBlocker: e.target.checked })}
                className="h-5 w-5"
              />
              <Label htmlFor="bb">Beta-Blocker</Label>
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="notes">Pattern Notes</Label>
            <Input id="notes" value={client.notes} onChange={(e) => setClient({ ...client, notes: e.target.value })} />
          </div>

          {client.betaBlocker && (
            <p
              role="alert"
              className="mt-3 rounded-md border-2 border-primary bg-secondary p-2 text-xs font-semibold"
            >
              ⚠ Beta-Blocker detected: HR zones invalidated. Intensity forced to Modified Borg RPE 3–5.
            </p>
          )}
        </section>

        {/* FITT-VP */}
        <section aria-labelledby="fittvp-heading">
          <h3 id="fittvp-heading" className="text-sm font-bold uppercase tracking-widest mb-3">
            FITT-VP Prescription
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["frequency", "Frequency"],
                ["intensity", "Intensity"],
                ["time", "Time"],
                ["type", "Type"],
                ["volume", "Volume"],
                ["progression", "Progression"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={key === "intensity" ? intensityDisplay : fittvp[key]}
                  disabled={key === "intensity" && client.betaBlocker}
                  onChange={(e) => setFittvp({ ...fittvp, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        <Button onClick={handleExport} className="w-full" size="lg">
          <FileDown className="h-4 w-4" />
          Generate Professional Rx PDF
        </Button>

        {/* Thermal Safety Footer */}
        <footer
          className={`rounded-md border-2 p-3 text-xs ${
            heatWarning ? "border-destructive bg-destructive/10 text-destructive" : "border-primary/40 bg-secondary"
          }`}
          role={heatWarning ? "alert" : undefined}
        >
          {heatWarning ? (
            <p className="flex items-start gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Thermal Safety Warning: KNYL {data?.tempF ?? "—"}°F · WBGT {data?.wbgtF ?? "—"}°F ·{" "}
                {flag?.label ?? "Heat risk elevated"}. Move indoors or restrict intensity.
              </span>
            </p>
          ) : (
            <p>
              KNYL {data?.tempF ?? "—"}°F · WBGT {data?.wbgtF ?? "—"}°F · {flag?.label ?? "Conditions nominal"}.
            </p>
          )}
        </footer>

        {/* On-Screen Rx Preview (mirrors PDF layout) */}
        <section aria-labelledby="rx-preview-heading" className="mt-2">
          <h3 id="rx-preview-heading" className="text-sm font-bold uppercase tracking-widest mb-2">
            Rx Preview
          </h3>
          <div className="rounded-md border-2 border-primary bg-card p-4 text-foreground">
            <h2 className="text-lg font-bold" style={{ color: "#003366" }}>
              Clinical Exercise Prescription
            </h2>
            <p className="text-[10px] text-muted-foreground mb-3">
              Generated: {new Date().toLocaleString()}
            </p>

            <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed mb-3">
{`### CLIENT PROFILE ###
Name:         ${client.name || "—"}
Age:          ${client.age || "—"}
Resting HR:   ${client.restingHR || "—"} bpm
Beta-Blocker: ${client.betaBlocker ? "YES (HR zones invalidated)" : "No"}
Notes:        ${client.notes || "—"}
### END CLIENT PROFILE ###`}
            </pre>

            <table className="w-full text-xs border-collapse mb-3">
              <thead>
                <tr style={{ backgroundColor: "#003366", color: "#FFFFFF" }}>
                  <th className="text-left p-2 border border-primary">Component</th>
                  <th className="text-left p-2 border border-primary">Prescription</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Frequency", fittvp.frequency],
                  ["Intensity", intensityDisplay],
                  ["Time", fittvp.time],
                  ["Type", fittvp.type],
                  ["Volume", fittvp.volume],
                  ["Progression", fittvp.progression],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="p-2 border border-primary/40 font-semibold">{k}</td>
                    <td className="p-2 border border-primary/40">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="text-sm font-bold" style={{ color: "#003366" }}>
              Thermal Safety Audit (KNYL)
            </h4>
            <ul className="text-xs mt-1 space-y-0.5">
              <li>Timestamp: {new Date().toISOString()}</li>
              <li>Station: KNYL · Yuma MCAS</li>
              <li>Temp: {data?.tempF ?? "n/a"}°F · Humidity: {data?.humidity ?? "n/a"}%</li>
              <li>WBGT (est.): {data?.wbgtF ?? "n/a"}°F · UV: {data?.uvIndex ?? "n/a"}</li>
              <li>
                AQI:{" "}
                {data?.aqi
                  ? `${data.aqi.value} ${data.aqi.category} (${data.aqi.parameter})`
                  : "n/a"}
              </li>
              <li>Flag: {flag ? `${flag.shape} ${flag.color} — ${flag.label}` : "n/a"}</li>
              {flag && <li>Guidance: {flag.guidance}</li>}
            </ul>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default SolveBox;
