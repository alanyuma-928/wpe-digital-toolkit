import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Unit = "metric" | "imperial";

interface BMIResult {
  bmi: number;
  category: string;
  description: string;
}

const classify = (bmi: number): { category: string; description: string } => {
  // WHO / ACSM 12th Ed adult BMI categories
  if (bmi < 18.5) return { category: "Underweight", description: "BMI below 18.5 (ACSM 12th Ed.)" };
  if (bmi < 25) return { category: "Normal Weight", description: "BMI 18.5–24.9 (ACSM 12th Ed.)" };
  if (bmi < 30) return { category: "Overweight", description: "BMI 25.0–29.9 (ACSM 12th Ed.)" };
  if (bmi < 35) return { category: "Obesity Class I", description: "BMI 30.0–34.9 (ACSM 12th Ed.)" };
  if (bmi < 40) return { category: "Obesity Class II", description: "BMI 35.0–39.9 (ACSM 12th Ed.)" };
  return { category: "Obesity Class III", description: "BMI ≥ 40.0 (ACSM 12th Ed.)" };
};

const BMIAuditor = () => {
  const [unit, setUnit] = useState<Unit>("metric");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    let bmi = 0;
    if (unit === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weightKg);
      if (!h || !w || h <= 0 || w <= 0) {
        setError("Please enter valid height (cm) and weight (kg).");
        setResult(null);
        return;
      }
      const m = h / 100;
      bmi = w / (m * m);
    } else {
      const h = parseFloat(heightIn);
      const w = parseFloat(weightLb);
      if (!h || !w || h <= 0 || w <= 0) {
        setError("Please enter valid height (in) and weight (lb).");
        setResult(null);
        return;
      }
      bmi = (w / (h * h)) * 703;
    }
    const { category, description } = classify(bmi);
    setResult({ bmi: Math.round(bmi * 10) / 10, category, description });
  };

  const reset = () => {
    setHeightCm("");
    setWeightKg("");
    setHeightIn("");
    setWeightLb("");
    setResult(null);
    setError(null);
  };

  const ringColor = useMemo(() => {
    if (!result) return "border-border";
    if (result.bmi < 18.5 || result.bmi >= 30) return "border-destructive";
    if (result.bmi < 25) return "border-primary";
    return "border-accent";
  }, [result]);

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-2 border-primary/20">
      <h2 className="text-2xl font-bold text-foreground mb-1">BMI Auditor</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Aligned with ACSM 12th Ed. & PAGA 2018 (2nd Ed.).
      </p>

      <Tabs value={unit} onValueChange={(v) => setUnit(v as Unit)} className="mb-5">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="metric">Metric (cm / kg)</TabsTrigger>
          <TabsTrigger value="imperial">Imperial (in / lb)</TabsTrigger>
        </TabsList>

        <TabsContent value="metric" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="hcm">Height (cm)</Label>
            <Input
              id="hcm"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 170"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wkg">Weight (kg)</Label>
            <Input
              id="wkg"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 65"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="imperial" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="hin">Height (inches)</Label>
            <Input
              id="hin"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 67"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wlb">Weight (lb)</Label>
            <Input
              id="wlb"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 145"
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button onClick={compute} variant="default" className="flex-1">
          Audit BMI
        </Button>
        <Button onClick={reset} variant="outline">
          Reset
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div
          className={`mt-6 rounded-xl border-2 ${ringColor} bg-secondary/40 p-5 text-center transition-all`}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your BMI
          </p>
          <p className="text-5xl font-extrabold text-foreground my-2 tabular-nums">
            {result.bmi}
          </p>
          <p className="text-lg font-semibold text-foreground">
            {result.category}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
        </div>
      )}

      <p className="mt-5 text-[11px] leading-snug text-muted-foreground">
        Note: BMI is a screening tool, not a diagnostic. Per ACSM 12th Ed.,
        interpret alongside body composition, waist circumference, and PAGA
        2018 (2nd Ed.) physical activity status.
      </p>
    </Card>
  );
};

export default BMIAuditor;
