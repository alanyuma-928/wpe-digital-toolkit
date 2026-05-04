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

/**
 * MET Converter — ACSM 12th Ed.
 * 1 MET = 3.5 ml O₂ · kg⁻¹ · min⁻¹.
 * kcal/min = METs × 3.5 × kg / 200.
 *
 * Pattern → Rule → Solve:
 *  Pattern: activity intensity expressed in METs.
 *  Rule:    VO₂ = METs × 3.5; kcal = METs × 3.5 × kg / 200.
 *  Solve:   weekly MET-min target ≥ 500 (PAGA 2018, 2nd Ed.).
 */

interface Activity {
  label: string;
  mets: number;
}

const ACTIVITIES: Activity[] = [
  { label: "Walking, slow (2.0 mph)", mets: 2.8 },
  { label: "Walking, brisk (3.5 mph)", mets: 4.3 },
  { label: "Hiking, general", mets: 6.0 },
  { label: "Bicycling, leisure (<10 mph)", mets: 4.0 },
  { label: "Bicycling, moderate (12–14 mph)", mets: 8.0 },
  { label: "Running, 5 mph (12-min mile)", mets: 8.3 },
  { label: "Running, 6 mph (10-min mile)", mets: 9.8 },
  { label: "Swimming, moderate", mets: 5.8 },
  { label: "Resistance training, moderate", mets: 5.0 },
  { label: "Yoga, Hatha", mets: 2.5 },
  { label: "Custom (enter METs)", mets: 0 },
];

const METTab = () => {
  const [activityIdx, setActivityIdx] = useState("0");
  const [customMets, setCustomMets] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [minutes, setMinutes] = useState("");

  const mets = useMemo(() => {
    const a = ACTIVITIES[parseInt(activityIdx, 10)];
    if (!a) return 0;
    if (a.mets === 0) {
      const c = parseFloat(customMets);
      return isNaN(c) || c <= 0 ? 0 : c;
    }
    return a.mets;
  }, [activityIdx, customMets]);

  const result = useMemo(() => {
    const lb = parseFloat(weightLb);
    const min = parseFloat(minutes);
    if (!mets || !lb || !min || lb <= 0 || min <= 0) return null;
    const kg = lb / 2.20462;
    const vo2 = mets * 3.5; // ml/kg/min
    const kcalPerMin = (mets * 3.5 * kg) / 200;
    const totalKcal = kcalPerMin * min;
    const metMin = mets * min;
    return {
      vo2: Math.round(vo2 * 10) / 10,
      kcalPerMin: Math.round(kcalPerMin * 10) / 10,
      totalKcal: Math.round(totalKcal),
      metMin: Math.round(metMin),
    };
  }, [mets, weightLb, minutes]);

  const intensity =
    mets < 3 ? "Light" : mets < 6 ? "Moderate" : "Vigorous";

  return (
    <section aria-labelledby="met-heading">
      <h3 id="met-heading" className="text-xl font-bold text-foreground mb-1">
        MET Converter
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        ACSM 12th Ed. · 1 MET = 3.5 ml·kg⁻¹·min⁻¹. PAGA target ≥ 500 MET-min/week.
      </p>

      <form className="space-y-4" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="met-activity" className="text-base text-foreground">
            Activity
          </Label>
          <Select value={activityIdx} onValueChange={setActivityIdx}>
            <SelectTrigger
              id="met-activity"
              className="h-12 text-base border-2 border-primary/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITIES.map((a, i) => (
                <SelectItem key={a.label} value={i.toString()}>
                  {a.label}
                  {a.mets > 0 ? ` · ${a.mets} METs` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {ACTIVITIES[parseInt(activityIdx, 10)]?.mets === 0 && (
          <div className="space-y-2">
            <Label htmlFor="met-custom" className="text-base text-foreground">
              Custom METs
            </Label>
            <Input
              id="met-custom"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={customMets}
              onChange={(e) => setCustomMets(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="met-weight" className="text-base text-foreground">
              Body Weight (lb)
            </Label>
            <Input
              id="met-weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="met-min" className="text-base text-foreground">
              Duration (min)
            </Label>
            <Input
              id="met-min"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        </div>
      </form>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary space-y-2"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Solve
          </p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums">
            {result.totalKcal}
            <span className="text-base font-semibold ml-1">kcal</span>
          </p>
          <ul className="text-sm text-foreground space-y-1">
            <li>
              <span className="font-semibold">VO₂:</span> {result.vo2} ml/kg/min
            </li>
            <li>
              <span className="font-semibold">Burn rate:</span>{" "}
              {result.kcalPerMin} kcal/min
            </li>
            <li>
              <span className="font-semibold">MET-min:</span> {result.metMin}{" "}
              <span className="text-muted-foreground">
                ({Math.round((result.metMin / 500) * 100)}% of weekly PAGA goal)
              </span>
            </li>
            <li>
              <span className="font-semibold">Intensity:</span> {intensity}
            </li>
          </ul>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          !result
            ? ""
            : [
                "### WPE Audit · MET Converter (ACSM 12th Ed.)",
                "",
                `- **Activity**: ${ACTIVITIES[parseInt(activityIdx, 10)].label}`,
                `- **METs**: ${mets}`,
                `- **Body Weight**: ${weightLb} lb`,
                `- **Duration**: ${minutes} min`,
                "",
                `**VO₂**: ${result.vo2} ml/kg/min`,
                `**Energy Cost**: ${result.totalKcal} kcal (${result.kcalPerMin} kcal/min)`,
                `**MET-min**: ${result.metMin} (PAGA goal ≥ 500/week)`,
                `**Intensity**: ${intensity}`,
              ].join("\n")
        }
        disabled={!result}
      />
    </section>
  );
};

export default METTab;
