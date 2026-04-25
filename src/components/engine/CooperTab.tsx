import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import { classifyVO2, parseTime, type Sex } from "./vo2norms";

interface CooperResult {
  vo2: number;
  category: string;
  band: string;
}

const CooperTab = () => {
  const [runTime, setRunTime] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [result, setResult] = useState<CooperResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const t = parseTime(runTime);
    const a = parseFloat(age);
    if (t === null || t <= 0 || !a || a <= 0) {
      setError("Enter valid Run Time (MM:SS) and Age.");
      setResult(null);
      return;
    }

    // Cooper 1.5-mile run estimate
    const vo2 = 483 / t + 3.5;
    const norm = classifyVO2(vo2, a, sex);
    setResult({
      vo2: Math.round(vo2 * 10) / 10,
      category: norm?.category ?? "Out of norm range",
      band: norm?.band ?? "—",
    });
  };

  const clearAll = () => {
    setRunTime("");
    setAge("");
    setResult(null);
    setError(null);
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
        <div className="space-y-2">
          <Label htmlFor="cp-time" className="text-base text-foreground">
            Run Time (MM:SS)
          </Label>
          <Input
            id="cp-time"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 12:45"
            value={runTime}
            onChange={(e) => setRunTime(e.target.value)}
            className="h-12 text-base border-2 border-primary/40 tabular-nums"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

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

      <ClinicalNotes idSuffix="cooper" />
    </section>
  );
};

export default CooperTab;
