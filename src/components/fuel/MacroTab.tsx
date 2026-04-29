import { useState } from "react";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { splitMacros } from "./fuelTypes";

interface MacroTabProps {
  tdee: number | null;
}

type PlateKey = "easy" | "moderate" | "hard";

interface PlateDef {
  key: PlateKey;
  label: string; // simple, kid-friendly
  intensity: string; // sport-science term (kept for SSOT)
  carb: number; // % of plate
  protein: number;
  veg: number;
  blurb: string;
  travelBlurb: string;
}

/**
 * USOC / IOC "Athlete's Plate" framework (Reed/Meyer, 2014).
 * Easy = Rest, Moderate = Practice/Train, Hard = Game / Big Test.
 * Plate fractions are visual portion guidance (carb-rich grain, lean protein,
 * fruit + veg / color), scaled by training load.
 */
const PLATES: PlateDef[] = [
  {
    key: "easy",
    label: "Rest Day Plate",
    intensity: "Easy / Off Day",
    carb: 25,
    protein: 25,
    veg: 50,
    blurb:
      "Half your plate is veggies and fruit. A small scoop of grain. A palm of protein.",
    travelBlurb:
      "Pack: apple, baby carrots, string cheese, water bottle.",
  },
  {
    key: "moderate",
    label: "Practice Day Plate",
    intensity: "Moderate / Practice",
    carb: 33,
    protein: 25,
    veg: 42,
    blurb:
      "About a third grain (rice, pasta, bread). A palm of protein. The rest is veggies and fruit.",
    travelBlurb:
      "Pack: turkey sandwich, banana, pretzels, water + sports drink.",
  },
  {
    key: "hard",
    label: "Game Day / Big Test Plate",
    intensity: "Hard / Game Day",
    carb: 50,
    protein: 25,
    veg: 25,
    blurb:
      "Half your plate is grain (rice, pasta, bread). A palm of protein. A side of veggies or fruit.",
    travelBlurb:
      "Pack: pasta box, grilled chicken wrap, granola bar, fruit cup, water + sports drink.",
  },
];

const MacroTab = ({ tdee }: MacroTabProps) => {
  const [plate, setPlate] = useState<PlateKey>("moderate");
  const [travel, setTravel] = useState(false);

  const macros = tdee && tdee > 0 ? splitMacros(tdee) : null;
  const active = PLATES.find((p) => p.key === plate)!;

  const rows = macros
    ? [
        {
          label: "Carbohydrates",
          pct: "50%",
          kcal: Math.round(macros.carbsKcal),
          grams: Math.round(macros.carbsG),
        },
        {
          label: "Protein",
          pct: "20%",
          kcal: Math.round(macros.proteinKcal),
          grams: Math.round(macros.proteinG),
        },
        {
          label: "Fat",
          pct: "30%",
          kcal: Math.round(macros.fatKcal),
          grams: Math.round(macros.fatG),
        },
      ]
    : [];

  return (
    <section aria-labelledby="macro-heading">
      <h3 id="macro-heading" className="text-xl font-bold text-foreground mb-1">
        Macro Splitter
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        DGA standard distribution: 50% Carb · 20% Pro · 30% Fat.
      </p>

      {!macros ? (
        <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 bg-card/60">
          <p className="text-sm font-semibold text-foreground">
            TDEE required.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete the RMR and Activity Auditor tabs to generate a macro split.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 border-2 border-primary/40 rounded-md p-3 bg-card">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              TDEE Source
            </p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {tdee} <span className="text-sm font-semibold">kcal/day</span>
            </p>
          </div>

          <div
            role="status"
            aria-live="polite"
            className="border-2 border-primary rounded-lg overflow-hidden"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">
                Daily macronutrient targets per DGA standard distribution
              </caption>
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th scope="col" className="text-left px-3 py-2 font-semibold">
                    Macro
                  </th>
                  <th scope="col" className="text-right px-3 py-2 font-semibold">
                    %
                  </th>
                  <th scope="col" className="text-right px-3 py-2 font-semibold">
                    kcal
                  </th>
                  <th scope="col" className="text-right px-3 py-2 font-semibold">
                    grams
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary">
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className={i < rows.length - 1 ? "border-b border-primary/30" : ""}
                  >
                    <th
                      scope="row"
                      className="text-left px-3 py-3 font-bold text-foreground"
                    >
                      {r.label}
                    </th>
                    <td className="text-right px-3 py-3 tabular-nums text-foreground">
                      {r.pct}
                    </td>
                    <td className="text-right px-3 py-3 tabular-nums text-foreground">
                      {r.kcal}
                    </td>
                    <td className="text-right px-3 py-3 tabular-nums font-semibold text-foreground">
                      {r.grams} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Carb/Protein = 4 kcal/g · Fat = 9 kcal/g (Atwater).
          </p>
        </>
      )}

      {/* ===== Athlete Plates (USOC / IOC, Reed/Meyer 2014) ===== */}
      <fieldset className="mt-6 border-2 border-primary rounded-lg p-3 bg-card">
        <legend className="px-2 text-sm font-bold text-foreground">
          Pick Your Plate
        </legend>

        <div
          role="radiogroup"
          aria-label="Athlete plate by training load"
          className="grid grid-cols-3 gap-2"
        >
          {PLATES.map((p) => {
            const selected = p.key === plate;
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPlate(p.key)}
                className={`text-left p-2 rounded-md border-2 transition-colors h-full ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/30 bg-secondary text-foreground hover:border-primary"
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider opacity-80">
                  {p.intensity}
                </span>
                <span className="block text-sm font-extrabold leading-tight mt-1">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-2 border-primary/40 rounded-md p-3 bg-secondary">
          <p className="text-sm font-bold text-foreground">{active.label}</p>
          <p className="text-sm text-foreground mt-1">{active.blurb}</p>

          <div
            className="mt-3 grid grid-cols-3 gap-1 h-6 rounded overflow-hidden border-2 border-primary"
            aria-label={`Plate portions: ${active.carb} percent grain, ${active.protein} percent protein, ${active.veg} percent veggies and fruit`}
          >
            <div
              style={{ flexBasis: `${active.carb}%` }}
              className="col-span-1 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
            >
              Grain {active.carb}%
            </div>
            <div
              style={{ flexBasis: `${active.protein}%` }}
              className="col-span-1 bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center"
            >
              Pro {active.protein}%
            </div>
            <div
              style={{ flexBasis: `${active.veg}%` }}
              className="col-span-1 bg-flag-green text-flag-green-foreground text-[10px] font-bold flex items-center justify-center"
            >
              Veg/Fruit {active.veg}%
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-2 border-primary/40 rounded-md p-3 bg-card">
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="travel-mode"
              className="text-sm font-bold text-foreground cursor-pointer"
            >
              Travel Mode (bus trip)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Picks foods that are easy to bring along.
            </p>
          </div>
          <Switch
            id="travel-mode"
            checked={travel}
            onCheckedChange={setTravel}
            aria-label="Travel Mode for bus trips"
          />
        </div>

        {travel && (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-sm font-semibold text-foreground border-l-4 border-accent pl-3 py-1"
          >
            🧳 {active.travelBlurb}
          </p>
        )}
      </fieldset>

      <CopyAuditButton
        getMarkdown={() =>
          macros && tdee
            ? [
                "### Fuel Plan Summary",
                "",
                `- **Daily calories**: ${tdee} kcal/day`,
                `- **Plate**: ${active.label} (${active.intensity})`,
                `- **Travel Mode**: ${travel ? "On" : "Off"}`,
                travel ? `- **Travel snacks**: ${active.travelBlurb}` : "",
                "",
                "| Food Type | Share | Calories | Grams |",
                "|---|---:|---:|---:|",
                ...rows.map(
                  (r) => `| ${r.label} | ${r.pct} | ${r.kcal} | ${r.grams} g |`,
                ),
                "",
                "**Plate Picture**",
                `- Grain: ${active.carb}%`,
                `- Protein: ${active.protein}%`,
                `- Veggies & Fruit: ${active.veg}%`,
                "",
                `_${active.blurb}_`,
                "",
                "_Based on: USDA Dietary Guidelines · USOC Athlete's Plate_",
              ]
                .filter(Boolean)
                .join("\n")
            : ""
        }
        disabled={!macros}
      />

      <ClinicalNotes idSuffix="macros" />
    </section>
  );
};

export default MacroTab;
