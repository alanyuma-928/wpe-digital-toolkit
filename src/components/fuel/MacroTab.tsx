import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import { splitMacros } from "./fuelTypes";

interface MacroTabProps {
  tdee: number | null;
}

const MacroTab = ({ tdee }: MacroTabProps) => {
  const macros = tdee && tdee > 0 ? splitMacros(tdee) : null;

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

      <ClinicalNotes idSuffix="macros" />
    </section>
  );
};

export default MacroTab;
