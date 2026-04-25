import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import { ACTIVITY_OPTIONS, type ActivityLevel } from "./fuelTypes";

interface ActivityTabProps {
  bmr: number | null;
  activity: ActivityLevel;
  setActivity: (a: ActivityLevel) => void;
  tdee: number | null;
}

const ActivityTab = ({ bmr, activity, setActivity, tdee }: ActivityTabProps) => {
  return (
    <section aria-labelledby="activity-heading">
      <h3 id="activity-heading" className="text-xl font-bold text-foreground mb-1">
        Activity Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        PAGA 2018 (2nd Ed.) intensity multipliers.
      </p>

      {bmr === null || bmr <= 0 ? (
        <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 bg-card/60">
          <p className="text-sm font-semibold text-foreground">
            Calculate RMR first.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Return to the RMR tab to compute Harris-Benedict BMR before auditing
            activity.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 border-2 border-primary/40 rounded-md p-3 bg-card">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Current RMR
            </p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {bmr} <span className="text-sm font-semibold">kcal/day</span>
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-base font-medium text-foreground mb-1">
              PAGA Activity Level
            </legend>
            <RadioGroup
              value={activity}
              onValueChange={(v) => setActivity(v as ActivityLevel)}
              className="space-y-2"
            >
              {ACTIVITY_OPTIONS.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`act-${opt.value}`}
                  className="flex items-start gap-3 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
                >
                  <RadioGroupItem
                    id={`act-${opt.value}`}
                    value={opt.value}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="block text-base font-semibold text-foreground">
                      {opt.label}
                      <span className="ml-2 text-xs font-mono text-muted-foreground">
                        ×{opt.multiplier}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {opt.description}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {tdee !== null && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Total Daily Energy Expenditure
              </p>
              <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
                {tdee}
                <span className="text-base font-semibold ml-1">kcal/day</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Continue to Macro Splitter for DGA distribution.
              </p>
            </div>
          )}
        </>
      )}

      <ClinicalNotes idSuffix="activity" />
    </section>
  );
};

export default ActivityTab;
