import { Link } from "react-router-dom";
import { Activity, Gauge, Apple, ShieldCheck, Dumbbell, HeartPulse, type LucideIcon } from "lucide-react";

interface ModuleTile {
  to: string;
  title: string;
  subtitle: string;
  ariaLabel: string;
  Icon: LucideIcon;
  enabled: boolean;
}

const modules: ModuleTile[] = [
  {
    to: "/biometrics",
    title: "Biometrics Box",
    subtitle: "BMI · WHR",
    ariaLabel: "Open Biometrics Box: BMI and Waist-to-Hip auditor",
    Icon: Activity,
    enabled: true,
  },
  {
    to: "/engine",
    title: "The Engine Box",
    subtitle: "Rockport · Cooper",
    ariaLabel: "Open The Engine Box: Rockport and Cooper cardiorespiratory tests (coming soon)",
    Icon: Gauge,
    enabled: true,
  },
  {
    to: "/fuel",
    title: "The Fuel Box",
    subtitle: "EXW 150 RMR · DGA",
    ariaLabel: "Open The Fuel Box: EXW 150 Resting Metabolic Rate and Dietary Guidelines",
    Icon: Apple,
    enabled: true,
  },
  {
    to: "/safety",
    title: "The Safety Box",
    subtitle: "PAR-Q+ · Sr. Fitness",
    ariaLabel: "Open The Safety Box: PAR-Q+ and Senior Fitness screening",
    Icon: ShieldCheck,
    enabled: true,
  },
  {
    to: "/strength",
    title: "The Strength Box",
    subtitle: "Push · Pull · Hinge · Squat",
    ariaLabel: "Open The Strength Box: movement-pattern strength auditor",
    Icon: Dumbbell,
    enabled: true,
  },
  {
    to: "/cardio",
    title: "The Cardio Box",
    subtitle: "Zones · Heart Points",
    ariaLabel: "Open The Cardio Box: PAGA Heart Points and intensity zones",
    Icon: HeartPulse,
    enabled: true,
  },
];

const Home = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <div className="mx-auto w-full max-w-[375px] px-4 py-6">
        <header className="mb-6 border-b-2 border-primary pb-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            ZTC Clinical Resource · WPE Dept.
          </p>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            WPE Digital Tool Kit
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            SSOT: ACSM 12th Ed. · PAGA 2018 (2nd Ed.)
          </p>
        </header>

        <section id="main-content" aria-labelledby="command-center-heading">
          <h3
            id="command-center-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
          >
            Command Center
          </h3>

          <ul className="grid grid-cols-2 gap-3" role="list">
            {modules.map(({ to, title, subtitle, ariaLabel, Icon, enabled }) => (
              <li key={title}>
                {enabled ? (
                  <Link
                    to={to}
                    aria-label={ariaLabel}
                    className="flex flex-col items-start justify-between min-h-[140px] w-full p-4 rounded-lg border-2 border-primary bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Icon className="h-7 w-7 text-primary" aria-hidden={true} />
                    <div className="mt-3">
                      <p className="text-base font-bold leading-tight">{title}</p>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                        {subtitle}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-label={ariaLabel}
                    aria-disabled="true"
                    className="flex flex-col items-start justify-between min-h-[140px] w-full p-4 rounded-lg border-2 border-dashed border-primary/50 bg-card/60 text-foreground/70 text-left cursor-not-allowed"
                  >
                    <Icon className="h-7 w-7 text-primary/60" aria-hidden={true} />
                    <div className="mt-3">
                      <p className="text-base font-bold leading-tight">{title}</p>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                        {subtitle}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                        Coming soon
                      </p>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer
          role="contentinfo"
          className="mt-8 pt-4 border-t-2 border-primary/40 text-center"
        >
          <p className="text-[11px] leading-relaxed text-foreground">
            Clinical screening tools. Interpret results per ACSM 12th Ed. &amp;
            PAGA 2018 (2nd Ed.).
            <br />
            CC BY-NC 4.0 · Accessibility: WCAG 2.1 AA
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Home;
