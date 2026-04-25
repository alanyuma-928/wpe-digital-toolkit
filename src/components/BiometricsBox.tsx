import { useState } from "react";
import { Activity, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BMIAuditor from "./BMIAuditor";

interface Props {
  onBack: () => void;
}

const BiometricsBox = ({ onBack }: Props) => {
  const [tool, setTool] = useState<"menu" | "bmi">("menu");

  if (tool === "bmi") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setTool("menu")}
          className="text-foreground hover:bg-secondary -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Biometrics Box
        </Button>
        <BMIAuditor />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-foreground hover:bg-secondary -ml-2"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Home
      </Button>

      <header>
        <h2 className="text-3xl font-bold text-foreground">Biometrics Box</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Health-related fitness assessments per ACSM 12th Ed.
        </p>
      </header>

      <button
        onClick={() => setTool("bmi")}
        className="w-full text-left rounded-2xl bg-card border-2 border-primary/20 p-5 hover:border-primary hover:shadow-[var(--shadow-soft)] transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">BMI Auditor</h3>
            <p className="text-xs text-muted-foreground">
              Body Mass Index screening & classification
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default BiometricsBox;
