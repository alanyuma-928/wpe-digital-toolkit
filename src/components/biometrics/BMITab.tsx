import { useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ClinicalNotes from "./ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import UnitToggle from "@/components/UnitToggle";
import { useUnits } from "@/context/UnitsContext";

const WeightUnitTooltip = ({ unitLabel }: { unitLabel: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={`Weight unit info: currently ${unitLabel}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs leading-snug">
        Enter body weight in <strong>{unitLabel}</strong> (matches the US|SI
        toggle). Values in lb are auto-divided by 2.2046 to normalize to{" "}
        <strong>kg</strong>; height converts to metres for the ACSM BMI
        formula.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface BMIResult {
  bmi: number;
  category: string;
  range: string;
  heightCm: number;
  weightKg: number;
}

const classify = (bmi: number): { category: string; range: string } => {
  if (bmi < 18.5) return { category: "Underweight", range: "BMI < 18.5" };
  if (bmi < 25) return { category: "Healthy", range: "BMI 18.5–24.9" };
  if (bmi < 30) return { category: "Overweight", range: "BMI 25.0–29.9" };
  return { category: "Obese", range: "BMI ≥ 30.0" };
};

const BMITab = () => {
  const { units, weightLabel, heightLabel } = useUnits();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      setError(`Enter valid Height (${heightLabel}) and Weight (${weightLabel}).`);
      setResult(null);
      return;
    }
    // Normalize to SI (kg, m) regardless of toggle
    const weightKg = units === "metric" ? w : w / 2.2046226;
    const heightCm = units === "metric" ? h : h * 2.54;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const { category, range } = classify(bmi);
    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      range,
      heightCm: Math.round(heightCm * 10) / 10,
      weightKg: Math.round(weightKg * 10) / 10,
    });
  };

  const clearAll = () => {
    setHeight("");
    setWeight("");
    setResult(null);
    setError(null);
  };

  return (
    <section aria-labelledby="bmi-heading">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 id="bmi-heading" className="text-xl font-bold text-foreground">
          BMI Auditor
        </h3>
        <UnitToggle />
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        ACSM 12th Ed. classification. Auto-converts to SI (kg, m) for calculation.
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
          <Label htmlFor="bmi-height" className="text-base text-foreground">
            Height ({heightLabel})
          </Label>
          <Input
            id="bmi-height"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 170" : "e.g. 67"}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="bmi-weight"
            className="text-base text-foreground flex items-center gap-1.5"
          >
            Weight ({weightLabel})
            <WeightUnitTooltip unitLabel={weightLabel} />
          </Label>
          <Input
            id="bmi-weight"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 66" : "e.g. 145"}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
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
          <p className="text-[11px] text-muted-foreground mt-2">
            SI normalized: {result.weightKg} kg · {result.heightCm} cm
          </p>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          result
            ? [
                "### WPE Audit · BMI",
                "",
                `- **Input Units**: ${units}`,
                `- **Height**: ${height} ${heightLabel} (${result.heightCm} cm)`,
                `- **Weight**: ${weight} ${weightLabel} (${result.weightKg} kg)`,
                "",
                `**BMI**: ${result.bmi}`,
                `**Category**: ${result.category} (${result.range})`,
                "",
                "_SSOT: ACSM 12th Ed._",
              ].join("\n")
            : ""
        }
        disabled={!result}
      />

      <ClinicalNotes idSuffix="bmi" />
    </section>
  );
};

export default BMITab;
