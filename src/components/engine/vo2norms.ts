// ACSM 12th Ed. VO2max norms (ml/kg/min) by sex and age band.
// Thresholds map to: Superior, Excellent, Good, Fair, Poor, Very Poor.
// Values are the LOWER bound for each category (descending).

export type Sex = "male" | "female";
export type FitnessCategory =
  | "Superior"
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor"
  | "Very Poor";

interface NormBand {
  // lower bounds for: Superior, Excellent, Good, Fair, Poor (anything below Poor lower = Very Poor)
  superior: number;
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

// Approximate ACSM 12th Ed. percentile-derived cutoffs.
const MALE_NORMS: Record<string, NormBand> = {
  "20-29": { superior: 55.4, excellent: 51.1, good: 45.4, fair: 41.7, poor: 38.1 },
  "30-39": { superior: 54.0, excellent: 48.3, good: 44.0, fair: 40.5, poor: 36.7 },
  "40-49": { superior: 52.5, excellent: 46.4, good: 42.4, fair: 38.5, poor: 34.6 },
  "50-59": { superior: 48.9, excellent: 43.4, good: 39.2, fair: 35.6, poor: 31.1 },
  "60-69": { superior: 45.7, excellent: 39.5, good: 35.5, fair: 32.3, poor: 28.7 },
  "70-79": { superior: 42.1, excellent: 36.7, good: 32.3, fair: 29.4, poor: 25.9 },
};

const FEMALE_NORMS: Record<string, NormBand> = {
  "20-29": { superior: 49.6, excellent: 43.9, good: 39.5, fair: 36.1, poor: 32.4 },
  "30-39": { superior: 47.4, excellent: 42.4, good: 37.8, fair: 34.4, poor: 30.5 },
  "40-49": { superior: 45.3, excellent: 39.7, good: 36.3, fair: 33.0, poor: 28.6 },
  "50-59": { superior: 41.1, excellent: 36.7, good: 33.0, fair: 30.1, poor: 26.1 },
  "60-69": { superior: 37.8, excellent: 33.0, good: 30.0, fair: 27.5, poor: 23.6 },
  "70-79": { superior: 36.7, excellent: 30.9, good: 28.1, fair: 25.0, poor: 20.8 },
};

const ageBand = (age: number): string | null => {
  if (age < 20) return null;
  if (age < 30) return "20-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  if (age < 70) return "60-69";
  if (age < 80) return "70-79";
  return "70-79";
};

export interface NormResult {
  category: FitnessCategory;
  band: string;
}

export const classifyVO2 = (
  vo2: number,
  age: number,
  sex: Sex,
): NormResult | null => {
  const band = ageBand(age);
  if (!band) return null;
  const table = sex === "male" ? MALE_NORMS : FEMALE_NORMS;
  const n = table[band];
  let category: FitnessCategory;
  if (vo2 >= n.superior) category = "Superior";
  else if (vo2 >= n.excellent) category = "Excellent";
  else if (vo2 >= n.good) category = "Good";
  else if (vo2 >= n.fair) category = "Fair";
  else if (vo2 >= n.poor) category = "Poor";
  else category = "Very Poor";
  return { category, band };
};

// Parse "MM:SS" or "M:SS" or plain decimal minutes -> decimal minutes.
export const parseTime = (input: string): number | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return m + s / 60;
  }
  const dec = parseFloat(trimmed);
  if (isNaN(dec) || dec <= 0) return null;
  return dec;
};
