import { useMemo, useState } from "react";
import BackToHome from "@/components/BackToHome";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RMRTab from "@/components/fuel/RMRTab";
import ActivityTab from "@/components/fuel/ActivityTab";
import MacroTab from "@/components/fuel/MacroTab";
import {
  ACTIVITY_OPTIONS,
  type ActivityLevel,
  type Sex,
} from "@/components/fuel/fuelTypes";

const Fuel = () => {
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [bmr, setBmr] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");

  const tdee = useMemo(() => {
    if (bmr === null || bmr <= 0) return null;
    const opt = ACTIVITY_OPTIONS.find((o) => o.value === activity);
    if (!opt) return null;
    return Math.round(bmr * opt.multiplier);
  }, [bmr, activity]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <div className="mx-auto w-full max-w-[375px] px-4 py-6">
        <div className="mb-3">
          <BackToHome />
        </div>

        <header className="mb-6 border-b-2 border-primary pb-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            ZTC Clinical Resource · WPE Dept.
          </p>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            WPE Fuel Auditor
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            SSOT: PAGA 2018 (2nd Ed.) · Harris-Benedict · DGA
          </p>
        </header>

        <div id="main-content">
          <div className="bg-card border-2 border-primary rounded-lg p-4">
            <Tabs defaultValue="rmr" className="w-full">
              <TabsList
                className="grid w-full grid-cols-3 h-12 bg-secondary border-2 border-primary/40 p-1"
                aria-label="Nutrition auditors"
              >
                <TabsTrigger
                  value="rmr"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  RMR
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="macros"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Macros
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rmr" className="mt-5">
                <RMRTab
                  sex={sex}
                  setSex={setSex}
                  weight={weight}
                  setWeight={setWeight}
                  height={height}
                  setHeight={setHeight}
                  age={age}
                  setAge={setAge}
                  bmr={bmr}
                  setBmr={setBmr}
                />
              </TabsContent>
              <TabsContent value="activity" className="mt-5">
                <ActivityTab
                  bmr={bmr}
                  activity={activity}
                  setActivity={setActivity}
                  tdee={tdee}
                />
              </TabsContent>
              <TabsContent value="macros" className="mt-5">
                <MacroTab tdee={tdee} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <footer className="mt-8 pt-4 border-t-2 border-primary/40 text-center">
          <p className="text-[11px] text-muted-foreground">
            Estimates only. Interpret with full dietary history per PAGA 2018 (2nd Ed.) &amp; DGA.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Fuel;
