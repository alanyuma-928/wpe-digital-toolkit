import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Activity,
  Calculator,
  TimerReset,
  Layers,
  Plus,
  Trash2,
  Play,
  RotateCcw,
} from "lucide-react";

/**
 * StrengthBox — four stacked, collapsible clinical tools:
 *  1. Relative Strength Matrix
 *  2. Brzycki 1-RM Estimator
 *  3. ATP-PC Phosphagen Rest Timer (180s)
 *  4. Volume Load Calculator (multi-exercise)
 *
 * SSOT: ACSM 12th Ed. — phosphagen recovery 3–5 min for maximal lifts.
 */

// ───────────────────────────── shared shell ─────────────────────────────
interface ToolCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ToolCard = ({
  id,
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}: ToolCardProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-xl border-2 border-primary/30 bg-card/80 backdrop-blur-sm shadow-[var(--shadow-soft)] overflow-hidden"
        aria-labelledby={`${id}-heading`}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
                aria-hidden="true"
              >
                {icon}
              </span>
              <div className="min-w-0">
                <h4
                  id={`${id}-heading`}
                  className="text-sm font-bold text-foreground truncate"
                >
                  {title}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {subtitle}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-foreground transition-transform shrink-0 ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent id={`${id}-panel`}>
          <div className="px-3 pb-4 pt-1 border-t-2 border-primary/20">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ───────────────────────────── 1. Relative Strength ─────────────────────────────
const RelativeStrength = () => {
  const [lift, setLift] = useState("");
  const [bw, setBw] = useState("");

  const ratio = useMemo(() => {
    const l = parseFloat(lift);
    const b = parseFloat(bw);
    if (!l || !b || l <= 0 || b <= 0) return null;
    return Math.round((l / b) * 100) / 100;
  }, [lift, bw]);

  const flag = useMemo(() => {
    if (ratio === null) return null;
    if (ratio < 0.5)
      return {
        label: "Needs Improvement",
        cls: "bg-flag-red text-flag-red-foreground border-flag-red",
        glyph: "▲",
      };
    if (ratio <= 1.0)
      return {
        label: "Healthy",
        cls: "bg-flag-green text-flag-green-foreground border-flag-green",
        glyph: "●",
      };
    return {
      label: "Superior",
      cls: "bg-primary text-primary-foreground border-primary",
      glyph: "◆",
    };
  }, [ratio]);

  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rs-lift" className="text-xs text-foreground">
            Weight Lifted (lb)
          </Label>
          <Input
            id="rs-lift"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="e.g. 225"
            value={lift}
            onChange={(e) => setLift(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rs-bw" className="text-xs text-foreground">
            Body Weight (lb)
          </Label>
          <Input
            id="rs-bw"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="e.g. 180"
            value={bw}
            onChange={(e) => setBw(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border-2 border-primary bg-secondary p-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Relative Strength Ratio
        </p>
        <p className="text-3xl font-extrabold text-foreground tabular-nums mt-0.5">
          {ratio !== null ? `${ratio.toFixed(2)}×` : "—"}
        </p>
        {flag && (
          <span
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 h-7 rounded border-2 text-[11px] font-extrabold uppercase tracking-wider ${flag.cls}`}
            role="img"
            aria-label={`Clinical flag: ${flag.label}`}
          >
            <span aria-hidden="true">{flag.glyph}</span>
            {flag.label}
          </span>
        )}
        <p className="text-[10px] text-muted-foreground mt-2">
          Ratio = Weight Lifted ÷ Body Weight
        </p>
      </div>
    </div>
  );
};

// ───────────────────────────── 2. Brzycki 1-RM ─────────────────────────────
const Brzycki = () => {
  const [w, setW] = useState("");
  const [r, setR] = useState("");

  const oneRM = useMemo(() => {
    const wn = parseFloat(w);
    const rn = parseFloat(r);
    if (!wn || !rn || wn <= 0 || rn <= 0 || rn > 10) return null;
    const denom = 1.0278 - 0.0278 * rn;
    if (denom <= 0) return null;
    return Math.round((wn / denom) * 10) / 10;
  }, [w, r]);

  const repsInvalid = r !== "" && (parseFloat(r) > 10 || parseFloat(r) <= 0);

  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bz-w" className="text-xs text-foreground">
            Weight Lifted (lb)
          </Label>
          <Input
            id="bz-w"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="e.g. 185"
            value={w}
            onChange={(e) => setW(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bz-r" className="text-xs text-foreground">
            Reps Completed (≤10)
          </Label>
          <Input
            id="bz-r"
            type="number"
            inputMode="numeric"
            min="1"
            max="10"
            step="1"
            placeholder="e.g. 5"
            value={r}
            onChange={(e) => setR(e.target.value)}
            aria-invalid={repsInvalid}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border-2 border-primary bg-secondary p-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Estimated 1-RM (Brzycki)
        </p>
        <p className="text-4xl font-extrabold text-foreground tabular-nums mt-0.5 leading-none">
          {oneRM !== null ? oneRM : "—"}
          {oneRM !== null && (
            <span className="text-base font-semibold ml-1.5">lb</span>
          )}
        </p>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Estimation valid only for 10 repetitions or fewer.
        </p>
        {repsInvalid && (
          <p
            role="alert"
            className="text-[11px] font-semibold text-destructive mt-1"
          >
            Reps must be between 1 and 10.
          </p>
        )}
      </div>
    </div>
  );
};

// ───────────────────────────── 3. ATP-PC Rest Timer ─────────────────────────────
const TOTAL = 180;
const PhosphagenTimer = () => {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const alertedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && !alertedRef.current) {
      alertedRef.current = true;
      // ping — non-blocking, ignored if AudioContext unsupported
      try {
        const Ctx =
          (window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext) as typeof AudioContext | undefined;
        if (Ctx) {
          const ctx = new Ctx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = 880;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          o.start();
          o.stop(ctx.currentTime + 0.65);
        }
      } catch {
        /* silent */
      }
    }
  }, [remaining]);

  const elapsed = TOTAL - remaining;
  const pct = (elapsed / TOTAL) * 100;

  let phase: { label: string; cls: string };
  if (elapsed < 45) {
    phase = {
      label: "ATP-PC Empty — DO NOT LIFT",
      cls: "bg-flag-red text-flag-red-foreground",
    };
  } else if (elapsed < 120) {
    phase = {
      label: "ATP-PC 50% Resynthesized",
      cls: "bg-flag-yellow text-flag-yellow-foreground",
    };
  } else if (elapsed < 180) {
    phase = {
      label: "ATP-PC ~85% — Almost Cleared",
      cls: "bg-flag-yellow text-flag-yellow-foreground",
    };
  } else {
    phase = {
      label: "ATP-PC 100% — Cleared for Maximal Attempt",
      cls: "bg-flag-green text-flag-green-foreground",
    };
  }

  const start = () => {
    setRemaining(TOTAL);
    alertedRef.current = false;
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(TOTAL);
    alertedRef.current = false;
  };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const time = `${m}:${s.toString().padStart(2, "0")}`;

  // bar color tied to phase
  const barColor =
    elapsed < 45
      ? "hsl(var(--flag-red))"
      : elapsed < 180
        ? "hsl(var(--flag-yellow))"
        : "hsl(var(--flag-green))";

  return (
    <div className="space-y-3 pt-3">
      <div className="rounded-lg border-2 border-primary bg-secondary p-3">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Phosphagen Recovery
          </p>
          <p className="text-2xl font-extrabold text-foreground tabular-nums">
            {time}
          </p>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={elapsed}
          aria-label="ATP-PC recovery progress"
          className="relative h-4 w-full rounded-full bg-card border-2 border-primary/40 overflow-hidden"
        >
          <div
            className="h-full transition-[width,background-color] duration-500 ease-linear"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          className={`mt-2 inline-flex items-center px-2.5 h-7 rounded text-[11px] font-extrabold uppercase tracking-wider ${phase.cls}`}
        >
          {phase.label}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={start}
          className="flex-1 h-11 text-sm font-semibold"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          {running ? "Restart Rest" : "Start Rest Interval"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          className="h-11 px-3 border-2 border-primary text-foreground"
          aria-label="Reset rest timer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        ACSM 12th Ed. — 3–5 min phosphagen recovery between 1-RM attempts.
      </p>
    </div>
  );
};

// ───────────────────────────── 4. Volume Load ─────────────────────────────
interface VolEntry {
  id: number;
  sets: number;
  reps: number;
  weight: number;
}
const VolumeLoad = () => {
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [list, setList] = useState<VolEntry[]>([]);

  const current = useMemo(() => {
    const s = parseFloat(sets);
    const r = parseFloat(reps);
    const w = parseFloat(weight);
    if (!s || !r || !w || s <= 0 || r <= 0 || w <= 0) return null;
    return Math.round(s * r * w * 10) / 10;
  }, [sets, reps, weight]);

  const session = useMemo(
    () => list.reduce((sum, e) => sum + e.sets * e.reps * e.weight, 0),
    [list],
  );

  const add = () => {
    const s = parseFloat(sets);
    const r = parseFloat(reps);
    const w = parseFloat(weight);
    if (!s || !r || !w || s <= 0 || r <= 0 || w <= 0) return;
    setList((prev) => [
      { id: Date.now(), sets: s, reps: r, weight: w },
      ...prev,
    ]);
    setSets("");
    setReps("");
    setWeight("");
  };

  const remove = (id: number) =>
    setList((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="vl-s" className="text-xs text-foreground">
            Sets
          </Label>
          <Input
            id="vl-s"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="3"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vl-r" className="text-xs text-foreground">
            Reps
          </Label>
          <Input
            id="vl-r"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="8"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vl-w" className="text-xs text-foreground">
            Weight (lb)
          </Label>
          <Input
            id="vl-w"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="135"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-11 text-base border-2 border-primary/40"
          />
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border-2 border-primary bg-secondary p-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Mechanical Work Displaced
        </p>
        <p className="text-2xl font-extrabold text-foreground tabular-nums">
          {current !== null ? current.toLocaleString() : "—"}
          {current !== null && (
            <span className="text-xs font-semibold ml-1">lb·reps</span>
          )}
        </p>
      </div>

      <Button
        type="button"
        onClick={add}
        disabled={current === null}
        className="w-full h-11 text-sm font-semibold"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Exercise to Session
      </Button>

      {list.length > 0 && (
        <div className="space-y-2">
          <ul className="space-y-1.5">
            {list.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 rounded-md border-2 border-primary/30 bg-card p-2 text-sm"
              >
                <span className="tabular-nums">
                  {e.sets} × {e.reps} @ {e.weight} lb
                </span>
                <span className="tabular-nums font-bold">
                  {(e.sets * e.reps * e.weight).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive"
                  aria-label="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border-2 border-primary bg-primary text-primary-foreground p-3">
            <p className="text-[10px] uppercase tracking-widest opacity-80">
              Session Volume Load
            </p>
            <p className="text-3xl font-extrabold tabular-nums">
              {session.toLocaleString()}
              <span className="text-sm font-semibold ml-1.5">lb·reps</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ───────────────────────────── Box ─────────────────────────────
const StrengthBox = () => {
  return (
    <section aria-labelledby="strength-box-heading" className="space-y-3">
      <div>
        <h3
          id="strength-box-heading"
          className="text-xl font-bold text-foreground"
        >
          Strength Box
        </h3>
        <p className="text-sm text-muted-foreground">
          Four clinical tools — relative strength, 1-RM estimate, phosphagen
          rest, and volume load.
        </p>
      </div>

      <ToolCard
        id="relative-strength"
        title="Relative Strength Matrix"
        subtitle="Lift ÷ Body Weight with clinical flag"
        icon={<Activity className="h-5 w-5" />}
        defaultOpen
      >
        <RelativeStrength />
      </ToolCard>

      <ToolCard
        id="brzycki"
        title="1-RM Estimation Engine"
        subtitle="Brzycki formula — submaximal safe estimate"
        icon={<Calculator className="h-5 w-5" />}
      >
        <Brzycki />
      </ToolCard>

      <ToolCard
        id="phosphagen"
        title="ATP-PC Phosphagen Rest Timer"
        subtitle="3-minute ACSM recovery countdown"
        icon={<TimerReset className="h-5 w-5" />}
      >
        <PhosphagenTimer />
      </ToolCard>

      <ToolCard
        id="volume-load"
        title="Volume Load Calculator"
        subtitle="Sets × Reps × Weight, stacked per session"
        icon={<Layers className="h-5 w-5" />}
      >
        <VolumeLoad />
      </ToolCard>
    </section>
  );
};

export default StrengthBox;
