import { useState } from "react";
import { HeartPulse } from "lucide-react";
import BiometricsBox from "@/components/BiometricsBox";

type View = "home" | "biometrics";

const Index = () => {
  const [view, setView] = useState<View>("home");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-5 py-8">
        <header className="mb-8 text-center">
          <p className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Wellness & Physical Education
          </p>
          <h1 className="text-3xl font-extrabold text-foreground mt-1">
            WPE Digital Tool Kit
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            PAGA 2018 (2nd Ed.) · ACSM 12th Ed.
          </p>
        </header>

        {view === "home" && (
          <section className="space-y-4">
            <button
              onClick={() => setView("biometrics")}
              className="group w-full rounded-3xl p-8 text-left bg-[image:var(--gradient-navy)] text-primary-foreground shadow-[var(--shadow-elegant)] border-2 border-primary/40 hover:scale-[1.02] active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase opacity-75">
                    Module 01
                  </p>
                  <h2 className="text-2xl font-bold">Biometrics Box</h2>
                </div>
              </div>
              <p className="mt-5 text-sm opacity-90 leading-relaxed">
                Screen, measure, and classify health-related fitness
                indicators including BMI.
              </p>
            </button>
          </section>
        )}

        {view === "biometrics" && (
          <BiometricsBox onBack={() => setView("home")} />
        )}

        <footer className="mt-12 text-center text-[10px] text-muted-foreground">
          © WPE Department · Curriculum-aligned tools
        </footer>
      </div>
    </main>
  );
};

export default Index;
