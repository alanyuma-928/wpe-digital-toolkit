import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";
import ClinicalNotes from "@/components/biometrics/ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";

/**
 * USDA Food-First Auditor — MyPlate / DGA 2020–2025.
 *
 * Reference daily intakes are anchored to a 2,000 kcal pattern and scaled
 * linearly by TDEE (clamped to the USDA 1,600–3,200 kcal patterns).
 *
 *   Vegetables: 2.5 cup-eq
 *   Fruits:     2.0 cup-eq
 *   Grains:     6.0 oz-eq (≥ ½ whole)
 *   Protein:    5.5 oz-eq
 *   Dairy:      3.0 cup-eq
 */

interface FoodFirstTabProps {
  tdee: number | null;
}

interface GroupTarget {
  key: "veg" | "fruit" | "grain" | "protein" | "dairy";
  label: string;
  unit: string;
  target: number; // scaled
  base: number; // 2000 kcal pattern
}

const BASE_TARGETS: Omit<GroupTarget, "target">[] = [
  { key: "veg", label: "Vegetables", unit: "cup-eq", base: 2.5 },
  { key: "fruit", label: "Fruits", unit: "cup-eq", base: 2.0 },
  { key: "grain", label: "Grains (≥½ whole)", unit: "oz-eq", base: 6.0 },
  { key: "protein", label: "Protein Foods", unit: "oz-eq", base: 5.5 },
  { key: "dairy", label: "Dairy", unit: "cup-eq", base: 3.0 },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

const FoodFirstTab = ({ tdee }: FoodFirstTabProps) => {
  const scale = useMemo(() => {
    const kcal = tdee ?? 2000;
    const clamped = Math.max(1600, Math.min(3200, kcal));
    return clamped / 2000;
  }, [tdee]);

  const targets: GroupTarget[] = useMemo(
    () =>
      BASE_TARGETS.map((t) => ({
        ...t,
        target: round1(t.base * scale),
      })),
    [scale],
  );

  const [intake, setIntake] = useState<Record<string, string>>({});

  const rows = targets.map((t) => {
    const consumedRaw = parseFloat(intake[t.key] ?? "");
    const consumed = Number.isFinite(consumedRaw) ? consumedRaw : 0;
    const pct = t.target > 0 ? Math.round((consumed / t.target) * 100) : 0;
    const status: "met" | "short" | "empty" =
      intake[t.key] === undefined || intake[t.key] === ""
        ? "empty"
        : consumed >= t.target
        ? "met"
        : "short";
    return { ...t, consumed, pct, status };
  });

  const anyEntered = rows.some((r) => r.status !== "empty");
  const allMet = anyEntered && rows.every((r) => r.status === "met");

  const buildMarkdown = () => {
    if (!anyEntered) return "";
    const lines = [
      "### WPE Audit · USDA Food-First (MyPlate / DGA 2020–2025)",
      "",
      `- **TDEE basis**: ${tdee ?? "n/a"} kcal · pattern scale ×${round1(scale)}`,
      `- **Status**: ${allMet ? "✓ All groups met" : "⚠ Gaps present"}`,
      "",
      "| Group | Target | Consumed | % |",
      "|---|---:|---:|---:|",
      ...rows.map(
        (r) =>
          `| ${r.label} | ${r.target} ${r.unit} | ${
            r.status === "empty" ? "—" : `${r.consumed} ${r.unit}`
          } | ${r.status === "empty" ? "—" : `${r.pct}%`} |`,
      ),
      "",
      "_SSOT: USDA MyPlate · DGA 2020–2025 (Food-First Principle)_",
    ];
    return lines.join("\n");
  };

  return (
    <section aria-labelledby="foodfirst-heading">
      <h3
        id="foodfirst-heading"
        className="text-xl font-bold text-foreground mb-1"
      >
        USDA Food-First Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        MyPlate group targets (DGA 2020–2025), scaled to client TDEE.
      </p>

      <div className="mb-4 border-2 border-primary/40 rounded-md p-3 bg-card">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Pattern Scale
        </p>
        <p className="text-sm font-bold text-foreground tabular-nums">
          {tdee ? `${tdee} kcal` : "2,000 kcal (default)"} · ×{round1(scale)} of
          2,000 kcal pattern
        </p>
        {!tdee && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Complete RMR + Activity tabs to scale targets to the client.
          </p>
        )}
      </div>

      <div className="border-2 border-primary rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">
            USDA MyPlate daily group targets vs. consumed intake
          </caption>
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-semibold">
                Group
              </th>
              <th scope="col" className="text-right px-3 py-2 font-semibold">
                Target
              </th>
              <th scope="col" className="text-right px-3 py-2 font-semibold">
                Consumed
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary">
            {rows.map((r, i) => (
              <tr
                key={r.key}
                className={i < rows.length - 1 ? "border-b border-primary/30" : ""}
              >
                <th
                  scope="row"
                  className="text-left px-3 py-3 font-bold text-foreground align-top"
                >
                  <span className="block">{r.label}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {r.unit}
                  </span>
                </th>
                <td className="text-right px-3 py-3 tabular-nums text-foreground align-top">
                  {r.target}
                </td>
                <td className="px-3 py-3 align-top">
                  <Label
                    htmlFor={`ff-${r.key}`}
                    className="sr-only"
                  >{`${r.label} consumed (${r.unit})`}</Label>
                  <Input
                    id={`ff-${r.key}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={intake[r.key] ?? ""}
                    onChange={(e) =>
                      setIntake({ ...intake, [r.key]: e.target.value })
                    }
                    className="h-10 text-right tabular-nums"
                    aria-describedby={`ff-${r.key}-status`}
                  />
                  {r.status !== "empty" && (
                    <p
                      id={`ff-${r.key}-status`}
                      className={`text-[11px] mt-1 font-semibold tabular-nums text-right ${
                        r.status === "met"
                          ? "text-foreground"
                          : "text-destructive"
                      }`}
                    >
                      {r.pct}% of target
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anyEntered && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 border-2 rounded-lg p-3 flex items-start gap-2 ${
            allMet
              ? "border-primary bg-secondary"
              : "border-destructive bg-destructive/10"
          }`}
        >
          {allMet ? (
            <CheckCircle2
              className="h-5 w-5 text-primary shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="h-5 w-5 text-destructive shrink-0 mt-0.5"
              aria-hidden="true"
            />
          )}
          <p
            className={`text-xs font-semibold ${
              allMet ? "text-foreground" : "text-destructive"
            }`}
          >
            {allMet
              ? "All MyPlate groups meet the scaled pattern target."
              : `Gaps in: ${rows
                  .filter((r) => r.status === "short")
                  .map((r) => r.label)
                  .join(", ")}`}
          </p>
        </div>
      )}

      <CopyAuditButton getMarkdown={buildMarkdown} disabled={!anyEntered} />

      <ClinicalNotes idSuffix="foodfirst" />
    </section>
  );
};

export default FoodFirstTab;
