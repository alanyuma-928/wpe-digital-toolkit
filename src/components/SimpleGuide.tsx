import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SimpleGuide — in-app User Guide written at a ~5th grade reading level.
 * No technical jargon. High-contrast Navy-on-Creme. Geometric flag glyphs
 * (●, ▲, ■, ⬢) match the Multi-Modal Safety Flag system used across the app.
 */
const SimpleGuide = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open help guide"
        aria-haspopup="dialog"
        className="h-8 w-8 text-foreground border-2 border-primary rounded-full"
      >
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-title"
          className="fixed inset-0 z-50 bg-foreground/60 flex items-start justify-center overflow-y-auto p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <article className="w-full max-w-[520px] my-6 bg-background text-foreground border-4 border-primary rounded-lg shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b-2 border-primary px-4 py-3 bg-primary text-primary-foreground sticky top-0">
              <h2 id="guide-title" className="text-lg font-extrabold">
                User Guide
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close help guide"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15"
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            <div className="px-4 py-4 space-y-5 text-[15px] leading-relaxed">
              <section aria-labelledby="g-what">
                <h3 id="g-what" className="text-base font-bold mb-1">
                  What is this app?
                </h3>
                <p>
                  This app helps you check your body, your food, and the weather
                  outside. It tells you when it is safe to work out and when you
                  should stay inside.
                </p>
              </section>

              <section aria-labelledby="g-top">
                <h3 id="g-top" className="text-base font-bold mb-1">
                  The bar at the top
                </h3>
                <p>
                  The dark bar at the top shows the weather right now. It shows:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>How hot it is outside</li>
                  <li>How wet the air feels (humidity)</li>
                  <li>How strong the sun is (UV)</li>
                  <li>How clean the air is (AQI)</li>
                </ul>
              </section>

              <section aria-labelledby="g-flags">
                <h3 id="g-flags" className="text-base font-bold mb-2">
                  The four safety flags
                </h3>
                <p className="mb-2">
                  Each flag has a color <em>and</em> a shape so everyone can read
                  it, even if you can't see colors well.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 border-2 border-primary/40 rounded p-2">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      ●
                    </span>
                    <div>
                      <p className="font-bold">Green Circle — All good</p>
                      <p className="text-sm">
                        It is safe to go outside and exercise.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 border-2 border-primary/40 rounded p-2">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      ▲
                    </span>
                    <div>
                      <p className="font-bold">Yellow Triangle — Be careful</p>
                      <p className="text-sm">
                        Drink water. Take more breaks. Slow down if you feel tired.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 border-2 border-primary/40 rounded p-2">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      ■
                    </span>
                    <div>
                      <p className="font-bold">Red Square — Risky</p>
                      <p className="text-sm">
                        Do not push hard outside. Move tough workouts inside.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 border-2 border-primary/40 rounded p-2">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      ⬢
                    </span>
                    <div>
                      <p className="font-bold">Black Octagon — Stop</p>
                      <p className="text-sm">
                        Stay inside. The heat, sun, or air is not safe today.
                      </p>
                    </div>
                  </li>
                </ul>
              </section>

              <section aria-labelledby="g-fuel">
                <h3 id="g-fuel" className="text-base font-bold mb-1">
                  The Fuel Box (food)
                </h3>
                <p>Pick the plate that matches your day:</p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>
                    <strong>Rest Day Plate</strong> — for an easy day with no
                    practice.
                  </li>
                  <li>
                    <strong>Practice Day Plate</strong> — for a normal practice
                    day.
                  </li>
                  <li>
                    <strong>Game Day / Big Test Plate</strong> — for a hard
                    workout, a game, or a big test.
                  </li>
                </ul>
                <p className="mt-2">
                  If you are riding a bus to a game, turn on{" "}
                  <strong>Travel Mode</strong>. It picks foods that are easy to
                  bring with you.
                </p>
              </section>

              <section aria-labelledby="g-copy">
                <h3 id="g-copy" className="text-base font-bold mb-1">
                  The "Copy" button
                </h3>
                <p>
                  Tap <strong>Copy Audit Summary</strong> to copy your numbers.
                  You can paste them into a note or message to your coach or
                  teacher.
                </p>
              </section>

              <section aria-labelledby="g-help">
                <h3 id="g-help" className="text-base font-bold mb-1">
                  Need help?
                </h3>
                <p>
                  Ask your coach, teacher, or trainer. This app gives ideas — a
                  real person makes the final call.
                </p>
              </section>
            </div>

            <footer className="px-4 py-3 border-t-2 border-primary bg-secondary">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full h-11 font-bold"
              >
                Got it
              </Button>
            </footer>
          </article>
        </div>
      )}
    </>
  );
};

export default SimpleGuide;
