import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import { calcBMR, type Sex } from "./fuelTypes";

interface RMRTabProps {
  sex: Sex;
  setSex: (s: Sex) => void;
  weight: string;
  setWeight: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  bmr: number | null;
  setBmr: (v: number | null) => void;
}

const RMRTab = ({
  sex,
  setSex,
  weight,
  setWeight,
  height,
  setHeight,
  age,
  setAge,
  bmr,
  setBmr,
}: RMRTabProps) => {
  const error = bmr === -1;

  const compute = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || w <= 0 || !h || h <= 0 || !a || a <= 0) {
      setBmr(-1);
      return;
    }
    setBmr(Math.round(calcBMR(sex, w, h, a)));
  };

  const clearAll = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setBmr(null);
  };

  return (
    <section aria-labelledby="rmr-heading">
      <h3 id="rmr-heading" className="text-xl font-bold text-foreground mb-1">
        RMR Calculator
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Harris-Benedict (revised) BMR equation.
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
          <legend className="text-base font-medium text-foreground">Gender</legend>
          <RadioGroup
            value={sex}
            onValueChange={(v) => setSex(v as Sex)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="rmr-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="rmr-sex-male" value="male" />
              <span className="text-base">Male</span>
            </Label>
            <Label
              htmlFor="rmr-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="rmr-sex-female" value="female" />
              <span className="text-base">Female</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="rmr-weight" className="text-base text-foreground">
            Weight (kg)
          </Label>
          <Input
            id="rmr-weight"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 75"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rmr-height" className="text-base text-foreground">
            Height (cm)
          </Label>
          <Input
            id="rmr-height"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 178"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rmr-age" className="text-base text-foreground">
            Age (years)
          </Label>
          <Input
            id="rmr-age"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 32"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={error}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate RMR
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all RMR fields"
          >
            Clear All
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
          Enter valid Weight, Height, and Age.
        </p>
      )}

      {bmr !== null && bmr > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Resting Metabolic Rate
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {bmr}
            <span className="text-base font-semibold ml-1">kcal/day</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Continue to Activity Auditor to compute TDEE.
          </p>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          bmr !== null && bmr > 0
            ? [
                "### WPE Audit · Resting Metabolic Rate",
                "",
                `- **Sex**: ${sex}`,
                `- **Weight**: ${weight} kg`,
                `- **Height**: ${height} cm`,
                `- **Age**: ${age} yr`,
                "",
                `**RMR (Harris-Benedict revised)**: ${bmr} kcal/day`,
                "",
                "_SSOT: PAGA 2018 (2nd Ed.) · Harris-Benedict_",
              ].join("\n")
            : ""
        }
        disabled={bmr === null || bmr <= 0}
      />

      <ClinicalNotes idSuffix="rmr" />
    </section>
  );
};

export default RMRTab;
