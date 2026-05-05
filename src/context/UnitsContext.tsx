import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Units = "imperial" | "metric";

interface UnitsContextValue {
  units: Units;
  setUnits: (u: Units) => void;
  weightLabel: string;
  heightLabel: string;
  loadLabel: string;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);
const STORAGE_KEY = "exw.units";

export const UnitsProvider = ({ children }: { children: ReactNode }) => {
  const [units, setUnitsState] = useState<Units>(() => {
    if (typeof window === "undefined") return "imperial";
    return (localStorage.getItem(STORAGE_KEY) as Units) || "imperial";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, units);
  }, [units]);

  const isMetric = units === "metric";
  const value: UnitsContextValue = {
    units,
    setUnits: setUnitsState,
    weightLabel: isMetric ? "kg" : "lb",
    heightLabel: isMetric ? "cm" : "in",
    loadLabel: isMetric ? "kg" : "lb",
  };

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
};

export const useUnits = () => {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used within UnitsProvider");
  return ctx;
};
