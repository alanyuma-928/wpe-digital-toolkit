import BackToHome from "@/components/BackToHome";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PARQTab from "@/components/safety/PARQTab";
import SeniorFitnessTab from "@/components/safety/SeniorFitnessTab";

const Safety = () => {
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
            WPE Safety Auditor
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            SSOT: ACSM 12th Ed. · PAR-Q+ 2024 · Rikli &amp; Jones
          </p>
        </header>

        <div id="main-content">
          <div className="bg-card border-2 border-primary rounded-lg p-4">
            <Tabs defaultValue="parq" className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 h-12 bg-secondary border-2 border-primary/40 p-1"
                aria-label="Safety auditors"
              >
                <TabsTrigger
                  value="parq"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  PAR-Q+
                </TabsTrigger>
                <TabsTrigger
                  value="senior"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sr. Fitness
                </TabsTrigger>
              </TabsList>

              <TabsContent value="parq" className="mt-5">
                <PARQTab />
              </TabsContent>
              <TabsContent value="senior" className="mt-5">
                <SeniorFitnessTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <footer className="mt-8 pt-4 border-t-2 border-primary/40 text-center">
          <p className="text-[11px] text-muted-foreground">
            Pre-participation screening only. Refer per PAR-Q+ 2024 &amp; ACSM 12th Ed.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Safety;
