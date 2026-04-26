import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lock } from "lucide-react";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import {
  classifySenior,
  type SeniorClassification,
  type SeniorSex,
} from "./seniorNorms";

interface SeniorFitnessTabProps {
  /** When true, the entire tool is locked out (set by PAR-Q+ Yes responses). */
  locked?: boolean;
  lockedYesCount?: number;
}

const SeniorFitnessTab = ({
  locked = false,
  lockedYesCount = 0,
}: SeniorFitnessTabProps) => {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<SeniorSex>("male");
  const [chair, setChair] = useState("");
  const [tug, setTug] = useState("");
  const [result, setResult] = useState<SeniorClassification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const a = parseInt(age, 10);
    const c = parseInt(chair, 10);
    const t = parseFloat(tug);

    if (!a || a < 60 || a > 94) {
      setError("Age must be between 60 and 94 (Rikli & Jones range).");
      setResult(null);
      return;
    }
    if (isNaN(c) || c < 0 || isNaN(t) || t <= 0) {
      setError("Enter valid Chair Stand reps and Up-and-Go seconds.");
      setResult(null);
      return;
    }
    setResult(classifySenior(a, sex, c, t));
  };

  const clearAll = () => {
    setAge("");
    setChair("");
    setTug("");
    setResult(null);
    setError(null);
  };

  const catClass = (cat: string) =>
    cat === "Below Average" ? "text-destructive" : "text-foreground";

  const buildMarkdown = () => {
    if (!result) return "";
    return [
      "### WPE Audit · Senior Fitness Test (Rikli & Jones)",
      "",
      `- **Sex**: ${sex}`,
      `- **Age**: ${age} yr (band ${result.band})`,
      `- **30-Sec Chair Stand**: ${chair} reps (norm ${result.chairStand.range.low}–${result.chairStand.range.high}) → **${result.chairStand.category}**`,
      `- **8-Ft Up-and-Go**: ${tug} sec (norm ${result.upAndGo.range.low}–${result.upAndGo.range.high}, lower = better) → **${result.upAndGo.category}**`,
      "",
      result.chairStand.category === "Below Average" ||
      result.upAndGo.category === "Below Average"
        ? "⚠ Below-average score(s) — elevated functional decline / fall risk."
        : "Functional capacity within normative range.",
      "",
      "_SSOT: ACSM 12th Ed. · Rikli & Jones_",
    ].join("\n");
  };

  if (locked) {
    return (
      <section aria-labelledby="senior-heading">
        <h3 id="senior-heading" className="text-xl font-bold text-foreground mb-1">
          Senior Fitness (Rikli &amp; Jones)
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Functional fitness norms for adults 60–94 years.
        </p>

        <div
          role="alert"
          className="border-2 border-destructive rounded-lg p-4 bg-destructive/10"
        >
          <div className="flex items-start gap-2">
            <Lock
              className="h-6 w-6 text-destructive shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide text-destructive">
                Test Locked
              </p>
              <p className="text-sm text-destructive font-semibold mt-1">
                {lockedYesCount} PAR-Q+ Yes response
                {lockedYesCount === 1 ? "" : "s"} detected.
              </p>
              <p className="text-xs text-foreground mt-2">
                Per PAR-Q+ 2024 / ACSM 12th Ed., physical performance testing
                is contraindicated until medical clearance is obtained. Resolve
                PAR-Q+ flags or document clearance before proceeding.
              </p>
            </div>
          </div>
        </div>

        <ClinicalNotes idSuffix="senior" />
      </section>
    );
  }

  return (
    <section aria-labelledby="senior-heading">
      <h3 id="senior-heading" className="text-xl font-bold text-foreground mb-1">
        Senior Fitness (Rikli &amp; Jones)
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Functional fitness norms for adults 60–94 years.
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
          <Label htmlFor="sf-age" className="text-base text-foreground">
            Age (years)
          </Label>
          <Input
            id="sf-age"
            type="number"
            inputMode="numeric"
            min="60"
            max="94"
            step="1"
            placeholder="60–94"
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
            onValueChange={(v) => setSex(v as SeniorSex)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="sf-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="sf-sex-male" value="male" />
              <span className="text-base">Male</span>
            </Label>
            <Label
              htmlFor="sf-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="sf-sex-female" value="female" />
              <span className="text-base">Female</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="sf-chair" className="text-base text-foreground">
            30-Second Chair Stand (reps)
          </Label>
          <Input
            id="sf-chair"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 14"
            value={chair}
            onChange={(e) => setChair(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sf-tug" className="text-base text-foreground">
            8-Foot Up-and-Go (seconds)
          </Label>
          <Input
            id="sf-tug"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 5.4"
            value={tug}
            onChange={(e) => setTug(e.target.value)}
            className="h-12 text-base border-2 border-primary/40 tabular-nums"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Audit Performance
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all Senior Fitness fields"
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
        <div role="status" aria-live="polite" className="mt-6 space-y-3">
          <div className="border-2 border-primary rounded-lg p-4 bg-secondary">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Chair Stand · Age Band {result.band}
            </p>
            <p className="text-3xl font-extrabold text-foreground tabular-nums mt-1">
              {chair} <span className="text-sm font-semibold">reps</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Norm: {result.chairStand.range.low}–{result.chairStand.range.high} reps
            </p>
            <p
              className={`text-base font-bold uppercase tracking-wide mt-1 ${catClass(
                result.chairStand.category,
              )}`}
            >
              {result.chairStand.category}
            </p>
          </div>

          <div className="border-2 border-primary rounded-lg p-4 bg-secondary">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              8-Ft Up-and-Go · Age Band {result.band}
            </p>
            <p className="text-3xl font-extrabold text-foreground tabular-nums mt-1">
              {tug} <span className="text-sm font-semibold">sec</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Norm: {result.upAndGo.range.low}–{result.upAndGo.range.high} sec (lower = better)
            </p>
            <p
              className={`text-base font-bold uppercase tracking-wide mt-1 ${catClass(
                result.upAndGo.category,
              )}`}
            >
              {result.upAndGo.category}
            </p>
          </div>

          {(result.chairStand.category === "Below Average" ||
            result.upAndGo.category === "Below Average") && (
            <p className="text-xs font-semibold text-destructive">
              Below-average score(s) indicate elevated functional decline / fall
              risk. Recalibrate program per ACSM 12th Ed.
            </p>
          )}
        </div>
      )}

      <CopyAuditButton getMarkdown={buildMarkdown} disabled={!result} />

      <ClinicalNotes idSuffix="senior" />
    </section>
  );
};

export default SeniorFitnessTab;
