export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";

export interface ActivityOption {
  value: ActivityLevel;
  label: string;
  multiplier: number;
  description: string;
}

// PAGA 2018 (2nd Ed.) intensity-aligned activity multipliers (Harris-Benedict convention)
export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    multiplier: 1.2,
    description: "Little or no exercise; desk-based.",
  },
  {
    value: "light",
    label: "Lightly Active",
    multiplier: 1.375,
    description: "Light activity 1–3 days/week.",
  },
  {
    value: "moderate",
    label: "Moderately Active",
    multiplier: 1.55,
    description: "Moderate activity 3–5 days/week (PAGA aerobic minimum).",
  },
  {
    value: "active",
    label: "Active",
    multiplier: 1.725,
    description: "Hard activity 6–7 days/week.",
  },
  {
    value: "veryActive",
    label: "Very Active",
    multiplier: 1.9,
    description: "Very hard daily training or physical job.",
  },
];

// Harris-Benedict (revised 1984) BMR equations
export const calcBMR = (
  sex: Sex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number => {
  if (sex === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears;
};

// DGA-aligned macronutrient distribution: 50% C / 20% P / 30% F
export interface MacroSplit {
  carbsKcal: number;
  proteinKcal: number;
  fatKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
}

export const splitMacros = (tdee: number): MacroSplit => {
  const carbsKcal = tdee * 0.5;
  const proteinKcal = tdee * 0.2;
  const fatKcal = tdee * 0.3;
  return {
    carbsKcal,
    proteinKcal,
    fatKcal,
    carbsG: carbsKcal / 4,
    proteinG: proteinKcal / 4,
    fatG: fatKcal / 9,
  };
};
