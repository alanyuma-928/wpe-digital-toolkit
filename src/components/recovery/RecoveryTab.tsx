import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Battery, BatteryLow, BatteryFull, Share2, Check } from "lucide-react";
import CopyAuditButton from "@/components/CopyAuditButton";
import { useStreak } from "@/hooks/useStreak";
import { useToast } from "@/hooks/use-toast";

type Mental = "Ready" | "Tired";

const RecoveryTab = () => {
  const [hours, setHours] = useState("");
  const [soreness, setSoreness] = useState<number>(5);
  const [mental, setMental] = useState<Mental>("Ready");
  const [shared, setShared] = useState(false);
  const { checkIn, count: streakCount } = useStreak();
  const { toast } = useToast();

  const score = useMemo(() => {
    const h = parseFloat(hours);
    if (!Number.isFinite(h) || h < 0) return null;
    let s = 100;
    if (h < 7) s -= 10 * (7 - h);
    if (soreness > 5) s -= 5 * (soreness - 5);
    if (mental === "Tired") s -= 15;
    return Math.max(0, Math.min(100, Math.round(s)));
  }, [hours, soreness, mental]);

  const narrative = useMemo(() => {
    if (score === null) return null;
    if (score < 60)
      return {
        tone: "low" as const,
        text: "Your battery is low! Today is a 'Recovery Day.' Drink water and do some light stretching.",
      };
    if (score > 85)
      return {
        tone: "high" as const,
        text: "You are fully charged! Great day for a hard workout.",
      };
    return {
      tone: "mid" as const,
      text: "You are good to go. Train smart and listen to your body.",
    };
  }, [score]);

  // Dial geometry
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score ?? 0;
  const dashOffset = circumference * (1 - pct / 100);

  const buildMarkdown = () => {
    const lines = [
      "## Recovery & Readiness Audit",
      `- Sleep (hours): ${hours || "—"}`,
      `- Soreness (1-10): ${soreness}`,
      `- Mental Readiness: ${mental}`,
      `- Daily Readiness Score: ${score === null ? "—" : `${score}%`}`,
    ];
    if (narrative) lines.push(`- Guidance: ${narrative.text}`);
    return lines.join("\n");
  };

  // Streak check-in: count this as an activity day once a valid score exists.
  useEffect(() => {
    if (score !== null) checkIn();
  }, [score, checkIn]);

  const buildShareSummary = () => {
    if (score === null) return "";
    const streakLine =
      streakCount > 0
        ? ` Day ${streakCount} of my Mastery Streak. 🔥`
        : "";
    return [
      `Daily Readiness: ${score}%.`,
      `Sleep ${hours || "—"}h · Soreness ${soreness}/10 · Mind: ${mental}.`,
      narrative ? narrative.text : "",
      `Tracked with the WPE Digital Tool Kit (ACSM 12th Ed. · PAGA 2018).${streakLine}`,
      "#WellnessByDesign #WPE #ReadinessScore",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const handleShare = async () => {
    const text = buildShareSummary();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      toast({
        title: "Progress copied",
        description: "Paste it into LinkedIn or your social feed.",
      });
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard unavailable in this context.",
        variant: "destructive",
      });
    }
  };
  const ToneIcon =
    narrative?.tone === "low"
      ? BatteryLow
      : narrative?.tone === "high"
        ? BatteryFull
        : Battery;

  return (
    <section aria-labelledby="recovery-heading" className="space-y-5">
      <h3 id="recovery-heading" className="sr-only">
        Recovery and Readiness
      </h3>

      <div className="space-y-2">
        <Label htmlFor="rec-sleep" className="text-sm font-bold">
          Sleep (hours)
        </Label>
        <Input
          id="rec-sleep"
          inputMode="decimal"
          type="number"
          min={0}
          max={24}
          step={0.25}
          placeholder="e.g., 7.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="h-11 border-2 border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rec-sore" className="text-sm font-bold">
          How do your muscles feel? ({soreness}/10)
        </Label>
        <Slider
          id="rec-sore"
          min={1}
          max={10}
          step={1}
          value={[soreness]}
          onValueChange={(v) => setSoreness(v[0] ?? 5)}
          aria-label="Muscle soreness from 1 to 10"
        />
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>1 · Fresh</span>
          <span>10 · Very sore</span>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-bold">
          Is your brain ready for work?
        </legend>
        <div
          role="radiogroup"
          aria-label="Mental readiness"
          className="grid grid-cols-2 gap-2"
        >
          {(["Ready", "Tired"] as Mental[]).map((opt) => {
            const active = mental === opt;
            return (
              <Button
                key={opt}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMental(opt)}
                variant={active ? "default" : "outline"}
                className={`h-11 border-2 font-bold ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-primary text-foreground"
                }`}
              >
                {opt}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <section
        aria-labelledby="readiness-score-heading"
        className="border-2 border-primary rounded-md p-4 bg-card"
      >
        <h4
          id="readiness-score-heading"
          className="text-sm font-bold mb-3 text-foreground"
        >
          Daily Readiness Score
        </h4>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={
                score === null
                  ? "Enter sleep hours to compute readiness."
                  : `Readiness score: ${score} percent`
              }
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth={stroke}
              />
              {score !== null && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-foreground tabular-nums">
                {score === null ? "—" : `${score}%`}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                readiness
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {narrative ? (
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-bold text-foreground flex items-start gap-2"
              >
                <ToneIcon className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{narrative.text}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter your sleep hours to see your score.
              </p>
            )}
          </div>
        </div>
      </section>

      <CopyAuditButton getMarkdown={buildMarkdown} disabled={score === null} />

      <Button
        type="button"
        onClick={handleShare}
        disabled={score === null}
        variant="outline"
        className="mt-2 w-full h-12 text-base font-semibold border-2 border-primary"
        aria-label="Copy a short progress summary for LinkedIn or social media"
      >
        {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {shared ? "Copied for sharing" : "Share Progress"}
      </Button>
    </section>
  );
};

export default RecoveryTab;
