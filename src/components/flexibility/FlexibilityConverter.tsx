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

const RomTooltip = () => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label="Goniometry ROM info"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs leading-snug">
        Enter active or passive ROM in <strong>degrees</strong>. Goniometry
        values do not change between US and SI; they are recorded as-is for
        ACSM 12th Ed. normative comparison.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface RomState {
  shoulderFlexion: string;
  hipFlexion: string;
  kneeFlexion: string;
  ankleDorsiflexion: string;
}

const EMPTY_ROM: RomState = {
  shoulderFlexion: "",
  hipFlexion: "",
  kneeFlexion: "",
  ankleDorsiflexion: "",
};

const toKg = (v: string, units: "imperial" | "metric") => {
  const n = parseFloat(v);
  if (!isFinite(n) || n <= 0) return null;
  const kg = units === "metric" ? n : n / 2.2046226;
  return Math.round(kg * 10) / 10;
};

/**
 * FlexibilityConverter — US/SI unit-aware inputs for Handgrip (L/R),
 * Sit-and-Reach, and Goniometry ROM. Weight/length values normalize
 * to SI (kg, cm) for ACSM normative comparison; ROM stays in degrees.
 */
const FlexibilityConverter = () => {
  const { units, weightLabel } = useUnits();
  const lengthLabel = units === "metric" ? "cm" : "in";

  const [gripLeft, setGripLeft] = useState("");
  const [gripRight, setGripRight] = useState("");
  const [reach, setReach] = useState("");
  const [rom, setRom] = useState<RomState>(EMPTY_ROM);

  const si = useMemo(() => {
    const r = parseFloat(reach);
    const reachCm = isFinite(r) && r > 0
      ? units === "metric" ? r : r * 2.54
      : null;

    const parseDeg = (v: string) => {
      const n = parseFloat(v);
      return isFinite(n) && n >= 0 ? Math.round(n) : null;
    };

    const gripLeftKg = toKg(gripLeft, units);
    const gripRightKg = toKg(gripRight, units);
    const gripAvgKg =
      gripLeftKg !== null && gripRightKg !== null
        ? Math.round(((gripLeftKg + gripRightKg) / 2) * 10) / 10
        : null;

    return {
      gripLeftKg,
      gripRightKg,
      gripAvgKg,
      reachCm: reachCm !== null ? Math.round(reachCm * 10) / 10 : null,
      rom: {
        shoulderFlexion: parseDeg(rom.shoulderFlexion),
        hipFlexion: parseDeg(rom.hipFlexion),
        kneeFlexion: parseDeg(rom.kneeFlexion),
        ankleDorsiflexion: parseDeg(rom.ankleDorsiflexion),
      },
    };
  }, [gripLeft, gripRight, reach, rom, units]);

  const clearAll = () => {
    setGripLeft("");
    setGripRight("");
    setReach("");
    setRom(EMPTY_ROM);
  };

  const hasOutput =
    si.gripLeftKg !== null ||
    si.gripRightKg !== null ||
    si.reachCm !== null ||
    Object.values(si.rom).some((v) => v !== null);

  const romFields: { key: keyof RomState; label: string }[] = [
    { key: "shoulderFlexion", label: "Shoulder Flexion" },
    { key: "hipFlexion", label: "Hip Flexion" },
    { key: "kneeFlexion", label: "Knee Flexion" },
    { key: "ankleDorsiflexion", label: "Ankle Dorsiflexion" },
  ];

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

      {/* Grip L/R + Reach */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="flex-grip-left"
            className="text-sm text-foreground flex items-center gap-1.5"
          >
            Handgrip — Left ({weightLabel})
            <GripUnitTooltip unitLabel={weightLabel} />
          </Label>
          <Input
            id="flex-grip-left"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 42" : "e.g. 92"}
            value={gripLeft}
            onChange={(e) => setGripLeft(e.target.value)}
            className="h-11 border-2 border-primary/40"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="flex-grip-right"
            className="text-sm text-foreground flex items-center gap-1.5"
          >
            Handgrip — Right ({weightLabel})
            <GripUnitTooltip unitLabel={weightLabel} />
          </Label>
          <Input
            id="flex-grip-right"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder={units === "metric" ? "e.g. 42" : "e.g. 92"}
            value={gripRight}
            onChange={(e) => setGripRight(e.target.value)}
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

      {/* Goniometry ROM */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 mb-2">
          <h4 className="text-sm font-bold text-foreground">
            Goniometry ROM
          </h4>
          <RomTooltip />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {romFields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label
                htmlFor={`flex-rom-${key}`}
                className="text-sm text-foreground"
              >
                {label} (deg)
              </Label>
              <Input
                id={`flex-rom-${key}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="360"
                step="1"
                placeholder="e.g. 180"
                value={rom[key]}
                onChange={(e) =>
                  setRom((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="h-11 border-2 border-primary/40"
              />
            </div>
          ))}
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
              <dt className="text-muted-foreground text-xs">Grip Left</dt>
              <dd className="font-bold tabular-nums">
                {si.gripLeftKg !== null ? `${si.gripLeftKg} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Grip Right</dt>
              <dd className="font-bold tabular-nums">
                {si.gripRightKg !== null ? `${si.gripRightKg} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Reach</dt>
              <dd className="font-bold tabular-nums">
                {si.reachCm !== null ? `${si.reachCm} cm` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Grip Avg</dt>
              <dd className="font-bold tabular-nums">
                {si.gripAvgKg !== null ? `${si.gripAvgKg} kg` : "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-3 border-t border-primary/20 pt-2">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Goniometry ROM (deg)
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {romFields.map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="font-bold tabular-nums">
                    {si.rom[key] !== null ? `${si.rom[key]}°` : "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          hasOutput
            ? [
                "### WPE Audit · Flexibility & Grip",
                "",
                `- **Input Units**: ${units}`,
                `- **Handgrip Left**: ${gripLeft || "—"} ${weightLabel}` +
                  (si.gripLeftKg !== null ? ` (${si.gripLeftKg} kg)` : ""),
                `- **Handgrip Right**: ${gripRight || "—"} ${weightLabel}` +
                  (si.gripRightKg !== null ? ` (${si.gripRightKg} kg)` : ""),
                `- **Sit-and-Reach**: ${reach || "—"} ${lengthLabel}` +
                  (si.reachCm !== null ? ` (${si.reachCm} cm)` : ""),
                ...romFields.map(
                  ({ key, label }) =>
                    `- **${label}**: ${rom[key] || "—"} deg` +
                    (si.rom[key] !== null ? ` (${si.rom[key]}°)` : "")
                ),
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
