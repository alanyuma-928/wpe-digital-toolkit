// Senior Fitness Test (Rikli & Jones) norms — average ranges by sex and age.
// Below range = Below Average · Within = Average · Above = Above Average.
// 30-Second Chair Stand: reps in 30s.
// 8-Foot Up-and-Go: seconds (LOWER is better).

export type SeniorSex = "male" | "female";
export type SeniorCategory = "Above Average" | "Average" | "Below Average";

interface Range {
  low: number;
  high: number;
}

interface SeniorBand {
  chairStand: Range; // reps
  upAndGo: Range; // seconds (lower = better)
}

// Rikli & Jones average normative ranges
const MALE: Record<string, SeniorBand> = {
  "60-64": { chairStand: { low: 14, high: 19 }, upAndGo: { low: 3.8, high: 5.6 } },
  "65-69": { chairStand: { low: 12, high: 18 }, upAndGo: { low: 4.3, high: 5.9 } },
  "70-74": { chairStand: { low: 12, high: 17 }, upAndGo: { low: 4.4, high: 6.2 } },
  "75-79": { chairStand: { low: 11, high: 17 }, upAndGo: { low: 4.6, high: 7.2 } },
  "80-84": { chairStand: { low: 10, high: 15 }, upAndGo: { low: 5.2, high: 7.6 } },
  "85-89": { chairStand: { low: 8, high: 14 }, upAndGo: { low: 5.5, high: 8.9 } },
  "90-94": { chairStand: { low: 7, high: 12 }, upAndGo: { low: 6.2, high: 10.0 } },
};

const FEMALE: Record<string, SeniorBand> = {
  "60-64": { chairStand: { low: 12, high: 17 }, upAndGo: { low: 4.4, high: 6.0 } },
  "65-69": { chairStand: { low: 11, high: 16 }, upAndGo: { low: 4.8, high: 6.4 } },
  "70-74": { chairStand: { low: 10, high: 15 }, upAndGo: { low: 4.9, high: 7.1 } },
  "75-79": { chairStand: { low: 10, high: 15 }, upAndGo: { low: 5.2, high: 7.4 } },
  "80-84": { chairStand: { low: 9, high: 14 }, upAndGo: { low: 5.7, high: 8.7 } },
  "85-89": { chairStand: { low: 8, high: 13 }, upAndGo: { low: 6.2, high: 9.6 } },
  "90-94": { chairStand: { low: 4, high: 11 }, upAndGo: { low: 7.3, high: 11.5 } },
};

export const seniorAgeBand = (age: number): string | null => {
  if (age < 60 || age > 94) return null;
  if (age < 65) return "60-64";
  if (age < 70) return "65-69";
  if (age < 75) return "70-74";
  if (age < 80) return "75-79";
  if (age < 85) return "80-84";
  if (age < 90) return "85-89";
  return "90-94";
};

export interface SeniorClassification {
  band: string;
  chairStand: { range: Range; category: SeniorCategory };
  upAndGo: { range: Range; category: SeniorCategory };
}

export const classifySenior = (
  age: number,
  sex: SeniorSex,
  chairReps: number,
  upAndGoSec: number,
): SeniorClassification | null => {
  const band = seniorAgeBand(age);
  if (!band) return null;
  const table = sex === "male" ? MALE : FEMALE;
  const n = table[band];

  const chairCat: SeniorCategory =
    chairReps > n.chairStand.high
      ? "Above Average"
      : chairReps < n.chairStand.low
        ? "Below Average"
        : "Average";

  // Up-and-Go: LOWER seconds = BETTER
  const tugCat: SeniorCategory =
    upAndGoSec < n.upAndGo.low
      ? "Above Average"
      : upAndGoSec > n.upAndGo.high
        ? "Below Average"
        : "Average";

  return {
    band,
    chairStand: { range: n.chairStand, category: chairCat },
    upAndGo: { range: n.upAndGo, category: tugCat },
  };
};
