import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CopyAuditButton from "@/components/CopyAuditButton";
import RestTimer from "@/components/strength/RestTimer";

type Move = "Push" | "Pull" | "Hinge" | "Squat";
type FormGrade = "10" | "7" | "0";

interface LoggedSet {
  id: number;
  move: Move;
  weight: number;
  reps: number;
  bodyWeight: number;
  relative: number;
  formGrade: FormGrade;
  loggedAt: string;
}

const FORM_LABEL: Record<FormGrade, string> = {
  "10": "10 — Clean (textbook form)",
  "7": "7 — Acceptable (minor breakdown)",
  "0": "0 — Failed (technique broke down)",
};

const StrengthTab = () => {
  const [move, setMove] = useState<Move>("Squat");
  const [bodyWeight, setBodyWeight] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [formGrade, setFormGrade] = useState<FormGrade>("10");
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [restKey, setRestKey] = useState<number | null>(null);

  const relative = useMemo(() => {
    const w = parseFloat(weight);
    const bw = parseFloat(bodyWeight);
    if (!w || !bw || w <= 0 || bw <= 0) return null;
    return Math.round((w / bw) * 100) / 100;
  }, [weight, bodyWeight]);

  const logSet = () => {
    setError(null);
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    const bw = parseFloat(bodyWeight);
    if (!w || !r || !bw || w <= 0 || r <= 0 || bw <= 0) {
      setError("Enter Body Weight, Weight, and Reps (all > 0).");
      return;
    }
    const entry: LoggedSet = {
      id: Date.now(),
      move,
      weight: w,
      reps: r,
      bodyWeight: bw,
      relative: Math.round((w / bw) * 100) / 100,
      formGrade,
      loggedAt: new Date().toISOString(),
    };
    setSets((s) => [entry, ...s]);
    setRestKey(entry.id); // triggers 90s rest timer
  };

  const clearAll = () => {
    setSets([]);
    setWeight("");
    setReps("");
    setError(null);
    setRestKey(null);
  };

  return (
    <section aria-labelledby="strength-heading">
      <h3 id="strength-heading" className="text-xl font-bold text-foreground mb-1">
        Strength Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Movement-pattern logger with relative-strength scoring and form audit.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          logSet();
        }}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="strength-move" className="text-base text-foreground">
            Movement Pattern
          </Label>
          <Select value={move} onValueChange={(v) => setMove(v as Move)}>
            <SelectTrigger
              id="strength-move"
              className="h-12 text-base border-2 border-primary/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Push">Push (e.g. Bench, OHP)</SelectItem>
              <SelectItem value="Pull">Pull (e.g. Row, Pull-up)</SelectItem>
              <SelectItem value="Hinge">Hinge (e.g. Deadlift, RDL)</SelectItem>
              <SelectItem value="Squat">Squat (e.g. Back, Front)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bw-lb" className="text-base text-foreground">
            Current Body Weight (lb)
          </Label>
          <Input
            id="bw-lb"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 165"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="w-lb" className="text-base text-foreground">
              Weight (lb)
            </Label>
            <Input
              id="w-lb"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="e.g. 185"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps" className="text-base text-foreground">
              Reps
            </Label>
            <Input
              id="reps"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 5"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-grade" className="text-base text-foreground">
            Form Grade (10 / 7 / 0)
          </Label>
          <Select value={formGrade} onValueChange={(v) => setFormGrade(v as FormGrade)}>
            <SelectTrigger
              id="form-grade"
              className="h-12 text-base border-2 border-primary/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">{FORM_LABEL["10"]}</SelectItem>
              <SelectItem value="7">{FORM_LABEL["7"]}</SelectItem>
              <SelectItem value="0">{FORM_LABEL["0"]}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {relative !== null && (
          <div
            role="status"
            aria-live="polite"
            className="border-2 border-primary rounded-lg p-3 bg-secondary"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Relative Strength
            </p>
            <p className="text-3xl font-extrabold text-foreground tabular-nums">
              {relative.toFixed(2)}×
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Weight ÷ Current Body Weight
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Log Set
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all logged sets"
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

      <RestTimer triggerKey={restKey} />

      {sets.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Session Log ({sets.length})
          </h4>
          <ul className="space-y-2">
            {sets.map((s) => (
              <li
                key={s.id}
                className="border-2 border-primary/40 rounded-md p-2 bg-card text-sm flex items-center justify-between gap-2"
              >
                <span className="font-bold">{s.move}</span>
                <span className="tabular-nums">
                  {s.weight} lb × {s.reps}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {s.relative.toFixed(2)}×
                </span>
                <span className="text-[11px] uppercase tracking-wider">
                  Form {s.formGrade}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          sets.length === 0
            ? ""
            : [
                "### WPE Audit · Strength Session",
                "",
                `- **Body Weight**: ${sets[0].bodyWeight} lb`,
                `- **Sets Logged**: ${sets.length}`,
                "",
                "| Move | Weight (lb) | Reps | Relative | Form |",
                "| --- | --- | --- | --- | --- |",
                ...sets.map(
                  (s) =>
                    `| ${s.move} | ${s.weight} | ${s.reps} | ${s.relative.toFixed(2)}× | ${s.formGrade} |`,
                ),
                "",
                "_Form Grade: 10 = Clean · 7 = Acceptable · 0 = Failed_",
                "_Relative Strength = Weight ÷ Current Body Weight_",
              ].join("\n")
        }
        disabled={sets.length === 0}
      />
    </section>
  );
};

export default StrengthTab;
