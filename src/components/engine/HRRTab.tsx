import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import CopyAuditButton from "@/components/CopyAuditButton";

/**
 * Karvonen HRR Target-Zone Calculator — ACSM 12th Ed.
 *
 * Pattern → Rule → Solve:
 *  Pattern: target intensity defined as % of Heart-Rate Reserve.
 *  Rule:    HRmax = 220 − age · HRR = HRmax − HRrest
 *           Target HR = (HRR × intensity%) + HRrest.
 *  Solve:   Moderate 40–59% HRR · Vigorous 60–89% HRR (PAGA 2018, 2nd Ed.).
 */
const HRRTab = () => {
  const [age, setAge] = useState("");
  const [restHR, setRestHR] = useState("");
  const [low, setLow] = useState(40);
  const [high, setHigh] = useState(85);

  const result = useMemo(() => {
    const a = parseFloat(age);
    const r = parseFloat(restHR);
    if (!a || !r || a <= 0 || r <= 0) return null;
    const hrmax = 220 - a;
    const hrr = hrmax - r;
    if (hrr <= 0) return null;
    const lowBpm = Math.round((hrr * low) / 100 + r);
    const highBpm = Math.round((hrr * high) / 100 + r);
    return { hrmax, hrr, lowBpm, highBpm };
  }, [age, restHR, low, high]);

  const zone =
    high <= 59 ? "Light–Moderate" : low >= 60 ? "Vigorous" : "Moderate–Vigorous";

  return (
    <section aria-labelledby="hrr-heading">
      <h3 id="hrr-heading" className="text-xl font-bold text-foreground mb-1">
        Karvonen HRR Target Zone
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        ACSM 12th Ed. · Target HR = (HRR × %) + HRrest.
      </p>

      <form className="space-y-4" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="hrr-age" className="text-base text-foreground">
              Age (yr)
            </Label>
            <Input
              id="hrr-age"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hrr-rest" className="text-base text-foreground">
              Rest HR (bpm)
            </Label>
            <Input
              id="hrr-rest"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={restHR}
              onChange={(e) => setRestHR(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        </div>

        <fieldset className="space-y-3 border-2 border-primary/40 rounded-md p-3 bg-card">
          <legend className="px-1 text-base font-medium text-foreground">
            Intensity Range (% HRR)
          </legend>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hrr-low" className="text-sm">
                Lower bound
              </Label>
              <span className="text-sm font-bold tabular-nums">{low}%</span>
            </div>
            <Slider
              id="hrr-low"
              min={20}
              max={89}
              step={1}
              value={[low]}
              onValueChange={(v) => {
                const next = v[0];
                setLow(next);
                if (next >= high) setHigh(Math.min(next + 1, 95));
              }}
              aria-label="Lower bound percent HRR"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hrr-high" className="text-sm">
                Upper bound
              </Label>
              <span className="text-sm font-bold tabular-nums">{high}%</span>
            </div>
            <Slider
              id="hrr-high"
              min={21}
              max={95}
              step={1}
              value={[high]}
              onValueChange={(v) => {
                const next = v[0];
                setHigh(next);
                if (next <= low) setLow(Math.max(next - 1, 20));
              }}
              aria-label="Upper bound percent HRR"
            />
          </div>
        </fieldset>
      </form>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Target Heart-Rate Zone · {zone}
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {result.lowBpm} – {result.highBpm}
            <span className="text-base font-semibold ml-1">bpm</span>
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
            <li>HRmax (220 − age): {result.hrmax} bpm</li>
            <li>HRR (HRmax − Rest): {result.hrr} bpm</li>
          </ul>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          !result
            ? ""
            : [
                "### WPE Audit · Karvonen HRR (ACSM 12th Ed.)",
                "",
                `- **Age**: ${age} yr · **Rest HR**: ${restHR} bpm`,
                `- **HRmax**: ${result.hrmax} · **HRR**: ${result.hrr}`,
                `- **Intensity**: ${low}–${high}% HRR (${zone})`,
                "",
                `**Target Zone**: ${result.lowBpm}–${result.highBpm} bpm`,
              ].join("\n")
        }
        disabled={!result}
      />
    </section>
  );
};

export default HRRTab;
