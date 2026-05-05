import { useUnits } from "@/context/UnitsContext";

const UnitToggle = () => {
  const { units, setUnits } = useUnits();
  return (
    <div
      role="group"
      aria-label="Units toggle"
      className="flex items-center gap-2 text-xs"
    >
      <span className="font-semibold uppercase tracking-widest">Units:</span>
      <div className="inline-flex rounded-md border-2 border-primary overflow-hidden">
        {(["imperial", "metric"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            aria-pressed={units === u}
            className={`px-3 py-1 font-semibold uppercase ${
              units === u
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {u === "imperial" ? "Imperial (lb/in)" : "Metric (kg/cm)"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitToggle;
