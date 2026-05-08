import { useMemo, useState } from "react";
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
import UnitToggle from "@/components/UnitToggle";
import { useUnits } from "@/context/UnitsContext";
import CopyAuditButton from "@/components/CopyAuditButton";

const GripUnitTooltip = ({ unitLabel }: { unitLabel: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={`Handgrip unit info: currently ${unitLabel}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs leading-snug">
        Enter handgrip force in <strong>{unitLabel}</strong> (matches the US|SI
        toggle). Values in lb are auto-divided by 2.2046 to normalize to{" "}
        <strong>kg</strong> for ACSM 12th Ed. normative comparison.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


/**
 * FlexibilityConverter — US/SI unit-aware inputs for Handgrip and
 * Sit-and-Reach. All values normalize to SI (kg, cm) for ACSM
 * normative comparison regardless of the active toggle.
 */
const FlexibilityConverter = () => {
  const { units, weightLabel } = useUnits();
  const lengthLabel = units === "metric" ? "cm" : "in";

  const [grip, setGrip] = useState("");
  const [reach, setReach] = useState("");

  const si = useMemo(() => {
    const g = parseFloat(grip);
    const r = parseFloat(reach);
    const gripKg = isFinite(g) && g > 0
      ? units === "metric" ? g : g / 2.2046226
      : null;
    const reachCm = isFinite(r) && r > 0
      ? units === "metric" ? r : r * 2.54
      : null;
    return {
      gripKg: gripKg !== null ? Math.round(gripKg * 10) / 10 : null,
      reachCm: reachCm !== null ? Math.round(reachCm * 10) / 10 : null,
    };
  }, [grip, reach, units]);

  const clearAll = () => {
    setGrip("");
    setReach("");
  };

  const hasOutput = si.gripKg !== null || si.reachCm !== null;

  return (
    <section
      aria-labelledby="flex-converter-heading"
      className="rounded-lg border-2 border-primary bg-secondary/40 p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3
            id="flex-converter-heading"
            className="text-base font-bold text-foreground"
          >
            US ↔ SI Field Converter
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Auto-normalizes to <strong>kg</strong> and <strong>cm</strong> for ACSM
            normative comparison.
          </p>
        </div>
        <UnitToggle />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="flex-grip" className="text-sm text-foreground">
            Handgrip ({weightLabel})
          </Label>
          <Input
            id="flex-grip"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 42" : "e.g. 92"}
            value={grip}
            onChange={(e) => setGrip(e.target.value)}
            className="h-11 border-2 border-primary/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flex-reach" className="text-sm text-foreground">
            Sit-and-Reach ({lengthLabel})
          </Label>
          <Input
            id="flex-reach"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 30" : "e.g. 12"}
            value={reach}
            onChange={(e) => setReach(e.target.value)}
            className="h-11 border-2 border-primary/40"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={clearAll}
          className="h-10 px-4 border-2 border-primary text-foreground"
        >
          Clear
        </Button>
      </div>

      {hasOutput && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 border-2 border-primary rounded-md p-3 bg-card"
        >
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            SI Normalized (for ACSM tables)
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Grip</dt>
              <dd className="font-bold tabular-nums">
                {si.gripKg !== null ? `${si.gripKg} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Reach</dt>
              <dd className="font-bold tabular-nums">
                {si.reachCm !== null ? `${si.reachCm} cm` : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          hasOutput
            ? [
                "### WPE Audit · Flexibility & Grip",
                "",
                `- **Input Units**: ${units}`,
                `- **Handgrip**: ${grip || "—"} ${weightLabel}` +
                  (si.gripKg !== null ? ` (${si.gripKg} kg)` : ""),
                `- **Sit-and-Reach**: ${reach || "—"} ${lengthLabel}` +
                  (si.reachCm !== null ? ` (${si.reachCm} cm)` : ""),
                "",
                "_SSOT: ACSM 12th Ed. · normative tables in SI._",
              ].join("\n")
            : ""
        }
        disabled={!hasOutput}
      />
    </section>
  );
};

export default FlexibilityConverter;
