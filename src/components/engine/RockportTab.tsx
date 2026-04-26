import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import { classifyVO2, type Sex } from "./vo2norms";

interface RockportResult {
  vo2: number;
  category: string;
  band: string;
  decimalMin: number;
}

const fmtTime = (mm: number, ss: number) =>
  `${mm}:${ss.toString().padStart(2, "0")}`;

const RockportTab = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [walkMin, setWalkMin] = useState(14);
  const [walkSec, setWalkSec] = useState(30);
  const [recoveryHR, setRecoveryHR] = useState("");
  const [result, setResult] = useState<RockportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decimalMin = walkMin + walkSec / 60;

  const compute = () => {
    setError(null);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const hr = parseFloat(recoveryHR);

    if (!w || w <= 0 || !a || a <= 0 || !hr || hr <= 0 || decimalMin <= 0) {
      setError("Enter valid Weight, Age, Walk Time and Recovery HR.");
      setResult(null);
      return;
    }

    const gender = sex === "male" ? 1 : 0;
    // Kline et al. 1987 Rockport equation
    const vo2 =
      132.853 -
      0.0769 * w -
      0.3877 * a +
      6.315 * gender -
      3.2649 * decimalMin -
      0.1565 * hr;

    const norm = classifyVO2(vo2, a, sex);
    setResult({
      vo2: Math.round(vo2 * 10) / 10,
      category: norm?.category ?? "Out of norm range",
      band: norm?.band ?? "—",
      decimalMin: Math.round(decimalMin * 100) / 100,
    });
  };

  const clearAll = () => {
    setWeight("");
    setAge("");
    setWalkMin(14);
    setWalkSec(30);
    setRecoveryHR("");
    setResult(null);
    setError(null);
  };

  const buildMarkdown = () => {
    if (!result) return "";
    return [
      "### WPE Audit · Rockport 1-Mile Walk (Kline 1987)",
      "",
      `- **Sex**: ${sex === "male" ? "Male (1)" : "Female (0)"}`,
      `- **Age**: ${age} yr`,
      `- **Weight**: ${weight} lb`,
      `- **Walk Time**: ${fmtTime(walkMin, walkSec)} (${result.decimalMin} min)`,
      `- **Recovery HR**: ${recoveryHR} bpm`,
      "",
      `**Estimated VO₂max**: ${result.vo2} ml/kg/min`,
      `**ACSM Norm (${sex} · ${result.band})**: ${result.category}`,
      "",
      "_SSOT: ACSM 12th Ed. · Kline et al. (1987)_",
    ].join("\n");
  };

  return (
    <section aria-labelledby="rockport-heading">
      <h3 id="rockport-heading" className="text-xl font-bold text-foreground mb-1">
        Rockport 1-Mile Walk
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Kline et al. (1987) · ACSM 12th Ed. norms.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="rk-weight" className="text-base text-foreground">
            Weight (pounds)
          </Label>
          <Input
            id="rk-weight"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 165"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rk-age" className="text-base text-foreground">
            Age (years)
          </Label>
          <Input
            id="rk-age"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 32"
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
              htmlFor="rk-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="rk-sex-male" value="male" />
              <span className="text-base">Male (1)</span>
            </Label>
            <Label
              htmlFor="rk-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="rk-sex-female" value="female" />
              <span className="text-base">Female (0)</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-3 border-2 border-primary/40 rounded-md p-3 bg-card">
          <legend className="px-1 text-base font-medium text-foreground">
            Walk Time
          </legend>
          <p
            className="text-3xl font-extrabold text-foreground tabular-nums text-center"
            aria-live="polite"
          >
            {fmtTime(walkMin, walkSec)}
            <span className="text-xs font-semibold text-muted-foreground ml-2">
              ({decimalMin.toFixed(2)} min)
            </span>
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rk-min" className="text-sm text-foreground">
                Minutes
              </Label>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {walkMin}
              </span>
            </div>
            <Slider
              id="rk-min"
              min={5}
              max={30}
              step={1}
              value={[walkMin]}
              onValueChange={(v) => setWalkMin(v[0])}
              aria-label="Walk time minutes"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rk-sec" className="text-sm text-foreground">
                Seconds
              </Label>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {walkSec.toString().padStart(2, "0")}
              </span>
            </div>
            <Slider
              id="rk-sec"
              min={0}
              max={59}
              step={1}
              value={[walkSec]}
              onValueChange={(v) => setWalkSec(v[0])}
              aria-label="Walk time seconds"
            />
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="rk-hr" className="text-base text-foreground">
            Recovery HR (bpm)
          </Label>
          <Input
            id="rk-hr"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 140"
            value={recoveryHR}
            onChange={(e) => setRecoveryHR(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate VO₂max
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all Rockport fields"
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

      <ClinicalNotes idSuffix="rockport" />
    </section>
  );
};

export default RockportTab;
