import BackToHome from "@/components/BackToHome";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BMITab from "@/components/biometrics/BMITab";
import WHRTab from "@/components/biometrics/WHRTab";
import SkinfoldTab from "@/components/biometrics/SkinfoldTab";

const Biometrics = () => {
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
            WPE Biometrics Auditor
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            SSOT: ACSM 12th Ed. · Jackson-Pollock 3-Site · Siri
          </p>
        </header>

        <div id="main-content">
          <div className="bg-card border-2 border-primary rounded-lg p-4">
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
        </div>

        <footer className="mt-8 pt-4 border-t-2 border-primary/40 text-center">
          <p className="text-[11px] text-muted-foreground">
            Screening indicators only. Interpret with full clinical picture per ACSM 12th Ed.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Biometrics;
