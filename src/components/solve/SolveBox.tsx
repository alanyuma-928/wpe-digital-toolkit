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

const SolveBox = () => {
  const { data, flag } = useWeather();

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
      </CardContent>
    </Card>
  );
};

export default SolveBox;
