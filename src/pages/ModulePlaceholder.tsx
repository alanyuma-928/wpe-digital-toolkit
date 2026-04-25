import BackToHome from "@/components/BackToHome";

interface ModulePlaceholderProps {
  title: string;
  tagline: string;
  upcoming: string[];
}

const ModulePlaceholder = ({ title, tagline, upcoming }: ModulePlaceholderProps) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[375px] px-4 py-6">
        <div className="mb-3">
          <BackToHome />
        </div>

        <header className="mb-6 border-b-2 border-primary pb-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            ZTC Clinical Resource · WPE Dept.
          </p>
          <h2 className="text-2xl font-bold text-foreground mt-1">{title}</h2>
          <p className="text-xs text-muted-foreground mt-2">{tagline}</p>
        </header>

        <section
          aria-labelledby="placeholder-heading"
          className="bg-card border-2 border-primary rounded-lg p-5"
        >
          <h3
            id="placeholder-heading"
            className="text-xl font-bold text-foreground mb-2"
          >
            Module in development
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This auditor is being built per ACSM 12th Ed. &amp; PAGA 2018 (2nd Ed.) protocols.
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Planned tools
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {upcoming.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ModulePlaceholder;
