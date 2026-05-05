import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BMITab from "@/components/biometrics/BMITab";
import WHRTab from "@/components/biometrics/WHRTab";
import SkinfoldTab from "@/components/biometrics/SkinfoldTab";
import UnitToggle from "@/components/UnitToggle";
import { useUnits } from "@/context/UnitsContext";

/**
 * BiometricAudit — wraps the existing biometric tabs and adds
 * unit-aware Weight / Height / Rucking Load inputs. The active unit
 * propagates globally via UnitsContext to the Solve Box and Markdown Rx.
 */
const BiometricAudit = () => {
  const { weightLabel, heightLabel, loadLabel } = useUnits();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [ruckLoad, setRuckLoad] = useState("");

  return (
    <div className="space-y-5">
      <Card className="border-2 border-primary shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Audit Inputs</CardTitle>
          <UnitToggle />
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="ba-weight">Weight ({weightLabel})</Label>
            <Input
              id="ba-weight"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ba-height">Height ({heightLabel})</Label>
            <Input
              id="ba-height"
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ba-ruck">Rucking Load ({loadLabel})</Label>
            <Input
              id="ba-ruck"
              type="number"
              inputMode="decimal"
              value={ruckLoad}
              onChange={(e) => setRuckLoad(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bmi" className="w-full">
        <TabsList
          className="grid w-full grid-cols-3 h-12 bg-secondary border-2 border-primary/40 p-1"
          aria-label="Biometric auditors"
        >
          <TabsTrigger
            value="bmi"
            className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            BMI
          </TabsTrigger>
          <TabsTrigger
            value="whr"
            className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            WHR
          </TabsTrigger>
          <TabsTrigger
            value="skinfold"
            className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Skinfold
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bmi" className="mt-5">
          <BMITab />
        </TabsContent>
        <TabsContent value="whr" className="mt-5">
          <WHRTab />
        </TabsContent>
        <TabsContent value="skinfold" className="mt-5">
          <SkinfoldTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiometricAudit;
