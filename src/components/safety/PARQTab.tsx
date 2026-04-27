import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import LabHistorySaver from "@/components/safety/LabHistorySaver";

// PAR-Q+ 2024 — 7 core general health questions
export const PARQ_QUESTIONS: { id: string; text: string }[] = [
  {
    id: "q1",
    text: "Has your doctor ever said that you have a heart condition OR high blood pressure?",
  },
  {
    id: "q2",
    text: "Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?",
  },
  {
    id: "q3",
    text: "Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?",
  },
  {
    id: "q4",
    text: "Have you been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?",
  },
  {
    id: "q5",
    text: "Are you currently taking prescribed medications for a chronic medical condition?",
  },
  {
    id: "q6",
    text: "Do you currently have (or have had within the past 12 months) a bone, joint, or soft tissue problem worsened by physical activity?",
  },
  {
    id: "q7",
    text: "Has your doctor ever said you should only do medically supervised physical activity?",
  },
];

interface PARQTabProps {
  answers: Record<string, boolean>;
  setAnswers: (a: Record<string, boolean>) => void;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
}

const PARQTab = ({ answers, setAnswers, submitted, setSubmitted }: PARQTabProps) => {
  const yesCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  const toggle = (id: string, checked: boolean) => {
    setAnswers({ ...answers, [id]: checked });
    setSubmitted(false);
  };

  const clearAll = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const flagged = yesCount > 0;

  const buildMarkdown = () => {
    const lines = [
      "### WPE Audit · PAR-Q+ 2024",
      "",
      `**Yes count**: ${yesCount} / 7`,
      `**Status**: ${flagged ? "⚠ RECALIBRATE — Medical Clearance Required" : "✓ Cleared for Activity"}`,
      "",
      "**Responses**:",
      ...PARQ_QUESTIONS.map(
        (q, i) => `${i + 1}. ${answers[q.id] ? "**YES**" : "No"} — ${q.text}`,
      ),
      "",
      "_SSOT: PAR-Q+ 2024 · ACSM 12th Ed._",
    ];
    return lines.join("\n");
  };

  return (
    <section aria-labelledby="parq-heading">
      <h3 id="parq-heading" className="text-xl font-bold text-foreground mb-1">
        PAR-Q+ Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Physical Activity Readiness Questionnaire (2024) — 7 core questions.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-3"
        noValidate
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">PAR-Q+ general health questions</legend>
          <ol className="space-y-3 list-none p-0">
            {PARQ_QUESTIONS.map((q, i) => {
              const checked = !!answers[q.id];
              return (
                <li key={q.id}>
                  <Label
                    htmlFor={`parq-${q.id}`}
                    className={`flex items-start gap-3 border-2 rounded-md p-3 cursor-pointer min-h-11 ${
                      checked
                        ? "border-destructive bg-destructive/10"
                        : "border-primary/40 bg-card"
                    }`}
                  >
                    <Checkbox
                      id={`parq-${q.id}`}
                      checked={checked}
                      onCheckedChange={(v) => toggle(q.id, v === true)}
                      className="mt-1 h-5 w-5"
                      aria-describedby={`parq-${q.id}-text`}
                    />
                    <span className="flex-1">
                      <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">
                        Question {i + 1}
                      </span>
                      <span
                        id={`parq-${q.id}-text`}
                        className="block text-sm font-medium text-foreground mt-0.5"
                      >
                        {q.text}
                      </span>
                      <span
                        className={`block text-xs font-bold uppercase tracking-widest mt-1 ${
                          checked ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {checked ? "Yes" : "No"}
                      </span>
                    </span>
                  </Label>
                </li>
              );
            })}
          </ol>
        </fieldset>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Audit Responses
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all PAR-Q+ responses"
          >
            Clear All
          </Button>
        </div>
      </form>

      {submitted && flagged && (
        <div
          role="alert"
          className="mt-6 border-2 border-destructive rounded-lg p-4 bg-destructive/10"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="h-6 w-6 text-destructive shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide text-destructive">
                RECALIBRATE: Medical Clearance Required
              </p>
              <p className="text-sm text-destructive mt-1 font-semibold">
                {yesCount} of 7 question{yesCount === 1 ? "" : "s"} answered Yes.
              </p>
              <p className="text-xs text-foreground mt-2">
                Per PAR-Q+ 2024, refer client to a qualified healthcare provider
                before commencing or progressing physical activity. Senior
                Fitness Test is locked until cleared.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitted && !flagged && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
        >
          <div className="flex items-start gap-2">
            <ShieldCheck
              className="h-6 w-6 text-primary shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide text-foreground">
                Cleared for Activity
              </p>
              <p className="text-sm text-foreground mt-1">
                All 7 PAR-Q+ items answered No. Proceed with standard exercise
                programming per ACSM 12th Ed.
              </p>
            </div>
          </div>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={buildMarkdown}
        disabled={Object.keys(answers).length === 0}
      />

      <ClinicalNotes idSuffix="parq" />
    </section>
  );
};

export default PARQTab;
