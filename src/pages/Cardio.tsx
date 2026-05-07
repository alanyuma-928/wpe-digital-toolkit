import BackToHome from "@/components/BackToHome";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardioTab from "@/components/cardio/CardioTab";

const Cardio = () => {
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
            WPE Cardio Auditor
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            SSOT: ACSM 12th Ed. · PAGA 2018 (2nd Ed.) Heart Points
          </p>
        </header>

        <div id="main-content">
          <div className="bg-card border-2 border-primary rounded-lg p-4">
            <Tabs defaultValue="cardio" className="w-full">
              <TabsList
                className="grid w-full grid-cols-1 h-12 bg-secondary border-2 border-primary/40 p-1"
                aria-label="Cardio auditors"
              >
                <TabsTrigger
                  value="cardio"
                  className="h-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Cardio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cardio" className="mt-5">
                <CardioTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <footer
          role="contentinfo"
          className="mt-8 pt-4 border-t-2 border-primary/40 text-center"
        >
          <p className="text-[11px] text-foreground">
            Screening only. Interpret with full clinical picture per ACSM 12th
            Ed. &amp; PAGA 2018 (2nd Ed.).
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Cardio;
