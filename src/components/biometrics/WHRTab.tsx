import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "./ClinicalNotes";

type Sex = "male" | "female";

interface WHRResult {
  ratio: number;
  category: string;
  range: string;
}

// ACSM 12th Ed. WHR health-risk thresholds (adult, sex-specific)
const classifyWHR = (ratio: number, sex: Sex): { category: string; range: string } => {
  if (sex === "male") {
    if (ratio < 0.90) return { category: "Low Risk", range: "WHR < 0.90" };
    if (ratio < 0.95) return { category: "Moderate Risk", range: "WHR 0.90–0.94" };
    if (ratio < 1.00) return { category: "High Risk", range: "WHR 0.95–0.99" };
    return { category: "Very High Risk", range: "WHR ≥ 1.00" };
  }
  if (ratio < 0.80) return { category: "Low Risk", range: "WHR < 0.80" };
  if (ratio < 0.85) return { category: "Moderate Risk", range: "WHR 0.80–0.84" };
  if (ratio < 0.90) return { category: "High Risk", range: "WHR 0.85–0.89" };
  return { category: "Very High Risk", range: "WHR ≥ 0.90" };
};

const WHRTab = () => {
  const [sex, setSex] = useState<Sex>("male");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<WHRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const w = parseFloat(waist);
    const h = parseFloat(hip);
    if (!w || !h || w <= 0 || h <= 0) {
      setError("Enter valid Waist and Hip measurements.");
      setResult(null);
      return;
    }
    const ratio = w / h;
    const { category, range } = classifyWHR(ratio, sex);
    setResult({ ratio: Math.round(ratio * 100) / 100, category, range });
  };

  const clearAll = () => {
    setWaist("");
    setHip("");
    setResult(null);
    setError(null);
  };

  return (
    <section aria-labelledby="whr-heading">
      <h3 id="whr-heading" className="text-xl font-bold text-foreground mb-1">
        Waist-to-Hip Ratio
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        ACSM 12th Ed. health-risk thresholds. Use consistent units (in or cm).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
        className="space-y-4"
        noValidate
      >
        <fieldset className="space-y-2">
          <legend className="text-base font-medium text-foreground">Sex</legend>
          <RadioGroup
            value={sex}
            onValueChange={(v) => setSex(v as Sex)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="whr-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="whr-sex-male" value="male" />
              <span className="text-base">Male</span>
            </Label>
            <Label
              htmlFor="whr-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="whr-sex-female" value="female" />
              <span className="text-base">Female</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="waist" className="text-base text-foreground">
            Waist circumference
          </Label>
          <Input
            id="waist"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 32"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hip" className="text-base text-foreground">
            Hip circumference
          </Label>
          <Input
            id="hip"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 38"
            value={hip}
            onChange={(e) => setHip(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate WHR
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all WHR fields"
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
            Waist-to-Hip Ratio
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {result.ratio.toFixed(2)}
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            Risk Category ({sex === "male" ? "Male" : "Female"})
          </p>
          <p className="text-lg font-bold text-foreground">{result.category}</p>
          <p className="text-xs text-muted-foreground mt-1">{result.range}</p>
        </div>
      )}

      <ClinicalNotes idSuffix="whr" />
    </section>
  );
};

export default WHRTab;
