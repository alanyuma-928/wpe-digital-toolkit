import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import { classifyVO2, parseTime, type Sex } from "./vo2norms";

interface RockportResult {
  vo2: number;
  category: string;
  band: string;
}

const RockportTab = () => {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [walkTime, setWalkTime] = useState("");
  const [recoveryHR, setRecoveryHR] = useState("");
  const [result, setResult] = useState<RockportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const t = parseTime(walkTime);
    const hr = parseFloat(recoveryHR);

    if (!w || w <= 0 || !a || a <= 0 || !hr || hr <= 0 || t === null) {
      setError("Enter valid Weight, Age, Walk Time (MM:SS) and Recovery HR.");
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
      3.2649 * t -
      0.1565 * hr;

    const norm = classifyVO2(vo2, a, sex);
    setResult({
      vo2: Math.round(vo2 * 10) / 10,
      category: norm?.category ?? "Out of norm range",
      band: norm?.band ?? "—",
    });
  };

  const clearAll = () => {
    setWeight("");
    setAge("");
    setWalkTime("");
    setRecoveryHR("");
    setResult(null);
    setError(null);
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

        <div className="space-y-2">
          <Label htmlFor="rk-time" className="text-base text-foreground">
            Walk Time (MM:SS)
          </Label>
          <Input
            id="rk-time"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 14:30"
            value={walkTime}
            onChange={(e) => setWalkTime(e.target.value)}
            className="h-12 text-base border-2 border-primary/40 tabular-nums"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

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

      <ClinicalNotes idSuffix="rockport" />
    </section>
  );
};

export default RockportTab;
