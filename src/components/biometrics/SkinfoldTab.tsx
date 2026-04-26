import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClinicalNotes from "./ClinicalNotes";
import CopyAuditButton from "@/components/CopyAuditButton";

type Sex = "male" | "female";

interface SkinfoldResult {
  sumMm: number;
  bodyDensity: number;
  bodyFatPct: number;
  category: string;
}

// ACSM 12th Ed. body-fat % descriptive categories (adult, approximate)
const classifyBF = (pct: number, sex: Sex): string => {
  if (sex === "male") {
    if (pct < 6) return "Essential Fat";
    if (pct < 14) return "Athletes";
    if (pct < 18) return "Fitness";
    if (pct < 25) return "Average";
    return "Obese";
  }
  if (pct < 14) return "Essential Fat";
  if (pct < 21) return "Athletes";
  if (pct < 25) return "Fitness";
  if (pct < 32) return "Average";
  return "Obese";
};

const SkinfoldTab = () => {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  // Male sites
  const [chest, setChest] = useState("");
  const [abdomen, setAbdomen] = useState("");
  const [thighM, setThighM] = useState("");
  // Female sites
  const [triceps, setTriceps] = useState("");
  const [suprailiac, setSuprailiac] = useState("");
  const [thighF, setThighF] = useState("");

  const [result, setResult] = useState<SkinfoldResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    setError(null);
    const a = parseFloat(age);
    if (!a || a <= 0) {
      setError("Enter a valid Age.");
      setResult(null);
      return;
    }

    let s1: number, s2: number, s3: number;
    if (sex === "male") {
      s1 = parseFloat(chest);
      s2 = parseFloat(abdomen);
      s3 = parseFloat(thighM);
    } else {
      s1 = parseFloat(triceps);
      s2 = parseFloat(suprailiac);
      s3 = parseFloat(thighF);
    }

    if (!s1 || !s2 || !s3 || s1 <= 0 || s2 <= 0 || s3 <= 0) {
      setError("Enter valid skinfold measurements (mm) for all three sites.");
      setResult(null);
      return;
    }

    const sum = s1 + s2 + s3;
    let bd: number;
    // Jackson-Pollock 3-Site Equations
    if (sex === "male") {
      bd =
        1.10938 -
        0.0008267 * sum +
        0.0000016 * sum * sum -
        0.0002574 * a;
    } else {
      bd =
        1.0994921 -
        0.0009929 * sum +
        0.0000023 * sum * sum -
        0.0001392 * a;
    }
    // Siri Equation
    const bf = (495 / bd - 450);

    setResult({
      sumMm: Math.round(sum * 10) / 10,
      bodyDensity: Math.round(bd * 10000) / 10000,
      bodyFatPct: Math.round(bf * 10) / 10,
      category: classifyBF(bf, sex),
    });
  };

  const clearAll = () => {
    setAge("");
    setChest("");
    setAbdomen("");
    setThighM("");
    setTriceps("");
    setSuprailiac("");
    setThighF("");
    setResult(null);
    setError(null);
  };

  const sites =
    sex === "male"
      ? [
          { id: "sf-chest", label: "Chest (mm)", value: chest, set: setChest },
          { id: "sf-abdomen", label: "Abdomen (mm)", value: abdomen, set: setAbdomen },
          { id: "sf-thigh-m", label: "Thigh (mm)", value: thighM, set: setThighM },
        ]
      : [
          { id: "sf-triceps", label: "Triceps (mm)", value: triceps, set: setTriceps },
          { id: "sf-suprailiac", label: "Suprailiac (mm)", value: suprailiac, set: setSuprailiac },
          { id: "sf-thigh-f", label: "Thigh (mm)", value: thighF, set: setThighF },
        ];

  return (
    <section aria-labelledby="skinfold-heading">
      <h3 id="skinfold-heading" className="text-xl font-bold text-foreground mb-1">
        Skinfold — 3-Site
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Jackson-Pollock 3-Site · Siri Equation · ACSM 12th Ed.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
        className="space-y-4"
        noValidate
      >
        <fieldset className="space-y-2">
          <legend className="text-base font-medium text-foreground">Sex</legend>
          <RadioGroup
            value={sex}
            onValueChange={(v) => {
              setSex(v as Sex);
              setResult(null);
              setError(null);
            }}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="sf-sex-male"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="sf-sex-male" value="male" />
              <span className="text-base">Male</span>
            </Label>
            <Label
              htmlFor="sf-sex-female"
              className="flex items-center gap-2 border-2 border-primary/40 rounded-md p-3 cursor-pointer min-h-11"
            >
              <RadioGroupItem id="sf-sex-female" value="female" />
              <span className="text-base">Female</span>
            </Label>
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="sf-age" className="text-base text-foreground">
            Age (years)
          </Label>
          <Input
            id="sf-age"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 32"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-12 text-base border-2 border-primary/40"
            aria-required="true"
            aria-invalid={!!error}
          />
        </div>

        {sites.map((site) => (
          <div key={site.id} className="space-y-2">
            <Label htmlFor={site.id} className="text-base text-foreground">
              {site.label}
            </Label>
            <Input
              id={site.id}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder="mm"
              value={site.value}
              onChange={(e) => site.set(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
              aria-required="true"
              aria-invalid={!!error}
            />
          </div>
        ))}

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Calculate % BF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all skinfold fields"
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

      {result && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 border-2 border-primary rounded-lg p-4 bg-secondary"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            % Body Fat (Siri)
          </p>
          <p className="text-4xl font-extrabold text-foreground mt-1 tabular-nums">
            {result.bodyFatPct}%
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            ACSM Category ({sex === "male" ? "Male" : "Female"})
          </p>
          <p className="text-lg font-bold text-foreground">{result.category}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <dt className="uppercase tracking-wider">Σ Skinfolds</dt>
              <dd className="text-foreground font-semibold tabular-nums">
                {result.sumMm} mm
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-wider">Body Density</dt>
              <dd className="text-foreground font-semibold tabular-nums">
                {result.bodyDensity.toFixed(4)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() => {
          if (!result) return "";
          const siteList =
            sex === "male"
              ? `Chest ${chest}mm, Abdomen ${abdomen}mm, Thigh ${thighM}mm`
              : `Triceps ${triceps}mm, Suprailiac ${suprailiac}mm, Thigh ${thighF}mm`;
          return [
            "### WPE Audit · Skinfold (Jackson-Pollock 3-Site · Siri)",
            "",
            `- **Sex**: ${sex}`,
            `- **Age**: ${age} yr`,
            `- **Sites**: ${siteList}`,
            `- **Σ Skinfolds**: ${result.sumMm} mm`,
            `- **Body Density**: ${result.bodyDensity.toFixed(4)}`,
            "",
            `**% Body Fat (Siri)**: ${result.bodyFatPct}%`,
            `**ACSM Category (${sex})**: ${result.category}`,
            "",
            "_SSOT: ACSM 12th Ed. · Jackson-Pollock · Siri Equation_",
          ].join("\n");
        }}
        disabled={!result}
      />

      <ClinicalNotes idSuffix="skinfold" />
    </section>
  );
};

export default SkinfoldTab;
