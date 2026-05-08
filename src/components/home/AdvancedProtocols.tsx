/**
 * AdvancedProtocols — student-facing OER section for Home.
 * Mission Loop framing: Pattern → Rule → Solve.
 * Clinical/case data wrapped in ### ... ### per project convention.
 */
const AdvancedProtocols = () => {
  return (
    <section
      aria-labelledby="advanced-protocols-heading"
      className="mt-8 border-t-2 border-primary/40 pt-6"
    >
      <h3
        id="advanced-protocols-heading"
        className="text-lg font-bold text-foreground"
      >
        WPE DTK: Advanced Clinical Protocols
      </h3>

      {/* 1. Biological Pattern */}
      <article className="mt-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
          1. Biological Pattern Identification
        </h4>
        <p className="text-xs text-foreground mt-2">
          Before beginning physical tests, the following anthropometric data
          must be recorded. These factors act as the &ldquo;baseline
          pattern&rdquo; for the Mission Loop.
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground list-disc pl-5">
          <li>
            <strong>Biological Sex:</strong> Dictates the <em>Rule</em>{" "}
            (percentile rankings) for Strength and ROM.
          </li>
          <li>
            <strong>Height:</strong> Influences limb-to-trunk ratios in
            Sit-and-Reach.
          </li>
          <li>
            <strong>Weight/Body Comp:</strong> Identifies potential mechanical
            obstructions (abdominal adiposity) in flexion tasks and landmark
            palpation in goniometry.
          </li>
        </ul>
      </article>

      {/* 2. Handgrip */}
      <article className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
          2. Handgrip Dynamometry
        </h4>
        <p className="text-xs font-semibold text-foreground mt-2">
          The Mission Loop:
        </p>
        <ul className="mt-1 space-y-1.5 text-xs text-foreground list-disc pl-5">
          <li>
            <strong>Pattern:</strong> Identify sex and age to determine the
            target strength category.
          </li>
          <li>
            <strong>Rule (SSoT):</strong> Adjust grip size; 3 trials per hand.
          </li>
          <li>
            <strong>Solve:</strong> Use the <strong>US | SI Toggle</strong>{" "}
            (divide lb by 2.205) to ensure all data is in <strong>kg</strong>{" "}
            for normative comparison.
          </li>
        </ul>
      </article>

      {/* 3. Sit-and-Reach */}
      <article className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
          3. Sit-and-Reach (Canadian Trunk Flexion)
        </h4>
        <p className="text-xs font-semibold text-foreground mt-2">
          The Mission Loop:
        </p>
        <ul className="mt-1 space-y-1.5 text-xs text-foreground list-disc pl-5">
          <li>
            <strong>Pattern:</strong> Identify height (limb length) and weight
            (mechanical obstruction).
          </li>
          <li>
            <strong>Rule (SSoT):</strong> Feet flat against box, reach and hold
            for 2s.
          </li>
          <li>
            <strong>Solve:</strong> Record in <strong>cm</strong>. Note if
            height/trunk ratio suggests a mechanical advantage.
          </li>
        </ul>
      </article>

      {/* 4. Goniometric */}
      <article className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
          4. Goniometric Protocols
        </h4>
        <p className="text-xs font-semibold text-foreground mt-2">
          The Mission Loop:
        </p>
        <ul className="mt-1 space-y-1.5 text-xs text-foreground list-disc pl-5">
          <li>
            <strong>Pattern:</strong> Identify if body habitus (weight) obscures
            bony landmarks.
          </li>
          <li>
            <strong>Rule (SSoT):</strong> Align axis, stationary, and movement
            arms per ACSM.
          </li>
          <li>
            <strong>Solve:</strong> Record in degrees. Ensure the subject is in
            the standardized anatomical starting position.
          </li>
        </ul>
      </article>

      {/* AI Tool Box */}
      <article className="mt-6 rounded-lg border-2 border-accent bg-accent/10 p-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-accent-foreground">
          AI Tool Box: Advanced Clinical Audit Prompt
        </h4>
        <p className="text-xs text-foreground mt-2">
          Students must use the following template to ensure the AI considers
          biological variation.
        </p>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-md border border-primary/40 bg-card p-3 text-[11px] leading-relaxed text-foreground font-mono">
{`###
Role: Clinical Exercise Physiologist Auditor
Context: EXW245 Lab Module - Comprehensive Audit

Subject Profile:
- Age: [INSERT]
- Biological Sex: [INSERT]
- Height: [INSERT in or cm]
- Weight: [INSERT lb or kg]

Input Data:
###
[INSERT RAW DATA: Grip Strength, Sit-and-Reach, Goniometry ROM]
###

Task:
1. Toggle: Convert all Imperial measures to SI (kg and cm).
2. Audit: Compare SI data against ACSM 12th Ed normative tables
   based on the Subject Profile.
3. Mission Loop Output:
   - Pattern: How did sex/height/weight impact these specific scores?
   - Rule: What is the subject's percentile rank?
   - Solve: Provide a safety-focused exercise recommendation.
###`}
        </pre>
      </article>
    </section>
  );
};

export default AdvancedProtocols;
