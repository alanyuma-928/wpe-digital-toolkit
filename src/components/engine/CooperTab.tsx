import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Thermometer } from "lucide-react";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import { useWeather, THERMAL_REDLINE_F } from "@/context/WeatherContext";
import { classifyVO2, type Sex } from "./vo2norms";

interface CooperResult {
  vo2: number;
  category: string;
  band: string;
  decimalMin: number;
}

const fmtTime = (mm: number, ss: number) =>
  `${mm}:${ss.toString().padStart(2, "0")}`;

const CooperTab = () => {
  const { data: weather, outdoorLocked } = useWeather();
  const [runMin, setRunMin] = useState(12);
  const [runSec, setRunSec] = useState(45);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [result, setResult] = useState<CooperResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decimalMin = runMin + runSec / 60;

  const compute = () => {
    setError(null);
    const a = parseFloat(age);
    if (decimalMin <= 0 || !a || a <= 0) {
      setError("Enter valid Run Time and Age.");
      setResult(null);
      return;
    }

    // Cooper 1.5-mile run estimate
    const vo2 = 483 / decimalMin + 3.5;
    const norm = classifyVO2(vo2, a, sex);
    setResult({
      vo2: Math.round(vo2 * 10) / 10,
      category: norm?.category ?? "Out of norm range",
      band: norm?.band ?? "—",
      decimalMin: Math.round(decimalMin * 100) / 100,
    });
  };

  const clearAll = () => {
    setRunMin(12);
    setRunSec(45);
    setAge("");
    setResult(null);
    setError(null);
  };

  const buildMarkdown = () => {
    if (!result) return "";
    return [
      "### WPE Audit · Cooper 1.5-Mile Run",
      "",
      `- **Sex**: ${sex}`,
      `- **Age**: ${age} yr`,
      `- **Run Time**: ${fmtTime(runMin, runSec)} (${result.decimalMin} min)`,
      "",
      `**Estimated VO₂max**: ${result.vo2} ml/kg/min`,
      `**ACSM Norm (${sex} · ${result.band})**: ${result.category}`,
      "",
      "_SSOT: ACSM 12th Ed. · Cooper (1968)_",
    ].join("\n");
  };

  return (
    <section aria-labelledby="cooper-heading">
      <h3 id="cooper-heading" className="text-xl font-bold text-foreground mb-1">
        Cooper 1.5-Mile Run
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Cooper (1968) · ACSM 12th Ed. norms.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
        className="space-y-4"
        noValidate
      >
        <fieldset className="space-y-3 border-2 border-primary/40 rounded-md p-3 bg-card">
          <legend className="px-1 text-base font-medium text-foreground">
            Run Time
          </legend>
          <p
            className="text-3xl font-extrabold text-foreground tabular-nums text-center"
            aria-live="polite"
          >
            {fmtTime(runMin, runSec)}
            <span className="text-xs font-semibold text-muted-foreground ml-2">
              ({decimalMin.toFixed(2)} min)
            </span>
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cp-min" className="text-sm text-foreground">
                Minutes
              </Label>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {runMin}
              </span>
            </div>
            <Slider
              id="cp-min"
              min={5}
              max={25}
              step={1}
              value={[runMin]}
              onValueChange={(v) => setRunMin(v[0])}
              aria-label="Run time minutes"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cp-sec" className="text-sm text-foreground">
                Seconds
              </Label>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {runSec.toString().padStart(2, "0")}
              </span>
            </div>
            <Slider
              id="cp-sec"
              min={0}
              max={59}
              step={1}
              value={[runSec]}
              onValueChange={(v) => setRunSec(v[0])}
              aria-label="Run time seconds"
            />
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="cp-age" className="text-base text-foreground">
            Age (years)
          </Label>
          <Input
            id="cp-age"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-base font-medium text-foreground">Gender</legend>
          <RadioGroup
            value={sex}
            onValueChange={(v) => setSex(v as Sex)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="cp-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="cp-sex-male" value="male" />
              <span className="text-base">Male</span>
            </Label>
            <Label
              htmlFor="cp-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="cp-sex-female" value="female" />
              <span className="text-base">Female</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate VO₂max
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all Cooper fields"
          >
            Clear All
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Estimated VO₂max
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {result.vo2}
            <span className="text-base font-semibold ml-1">ml/kg/min</span>
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            ACSM Norm ({sex === "male" ? "Male" : "Female"} · {result.band})
          </p>
          <p className="text-lg font-bold text-foreground">{result.category}</p>
        </div>
      )}

      <CopyAuditButton getMarkdown={buildMarkdown} disabled={!result} />

      <ClinicalNotes idSuffix="cooper" />
    </section>
  );
};

export default CooperTab;
