import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ClinicalNotes from "./ClinicalNotes";

interface BMIResult {
  bmi: number;
  category: string;
  range: string;
}

const classify = (bmi: number): { category: string; range: string } => {
  if (bmi < 18.5) return { category: "Underweight", range: "BMI < 18.5" };
  if (bmi < 25) return { category: "Healthy", range: "BMI 18.5–24.9" };
  if (bmi < 30) return { category: "Overweight", range: "BMI 25.0–29.9" };
  return { category: "Obese", range: "BMI ≥ 30.0" };
};

const BMITab = () => {
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const h = parseFloat(heightIn);
    const w = parseFloat(weightLb);
    if (!h || !w || h <= 0 || w <= 0) {
      setError("Enter valid Height (in) and Weight (lb).");
      setResult(null);
      return;
    }
    const bmi = (w / (h * h)) * 703;
    const { category, range } = classify(bmi);
    setResult({ bmi: Math.round(bmi * 10) / 10, category, range });
  };

  const clearAll = () => {
    setHeightIn("");
    setWeightLb("");
    setResult(null);
    setError(null);
  };

  return (
    <section aria-labelledby="bmi-heading">
      <h3 id="bmi-heading" className="text-xl font-bold text-foreground mb-1">
        BMI Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        ACSM 12th Ed. classification. Imperial units.
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
          <Label htmlFor="height-in" className="text-base text-foreground">
            Height (inches)
          </Label>
          <Input
            id="height-in"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 67"
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight-lb" className="text-base text-foreground">
            Weight (pounds)
          </Label>
          <Input
            id="weight-lb"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 145"
            value={weightLb}
            onChange={(e) => setWeightLb(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate BMI
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all BMI fields"
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
            Calculated BMI
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {result.bmi}
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            ACSM Category
          </p>
          <p className="text-lg font-bold text-foreground">{result.category}</p>
          <p className="text-xs text-muted-foreground mt-1">{result.range}</p>
        </div>
      )}

      <ClinicalNotes idSuffix="bmi" />
    </section>
  );
};

export default BMITab;
