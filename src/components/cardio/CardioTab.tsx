import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import CopyAuditButton from "@/components/CopyAuditButton";
import { useWeather } from "@/context/WeatherContext";

type Activity = "Walk" | "Run" | "Ruck" | "Bike" | "Row" | "Swim";
type Zone = "Light" | "Moderate" | "Vigorous";

interface CardioSession {
  id: number;
  activity: Activity;
  minutes: number;
  avgHr: number;
  hrr: number; // %HRR at avg HR
  zone: Zone;
  points: number;
  loggedAt: string;
}

const STORAGE = "wpe-cardio-v1";

interface PersistShape {
  age: string;
  restingHr: string;
  sessions: CardioSession[];
}

/** Karvonen %HRR zones (ACSM 12th Ed.):
 *  Light <40 · Moderate 40–<60 · Vigorous ≥60.
 *  HRmax = 208 − 0.7·age (Tanaka). HRR = HRmax − RHR.
 *  %HRR = (avgHR − RHR) / HRR.
 */
const classifyZone = (
  ageNum: number,
  restingHr: number,
  avgHr: number,
): { zone: Zone; hrr: number } | null => {
  if (!ageNum || !restingHr || !avgHr) return null;
  const hrMax = 208 - 0.7 * ageNum;
  const hrr = hrMax - restingHr;
  if (hrr <= 0) return null;
  const pct = Math.max(0, Math.min(1.5, (avgHr - restingHr) / hrr));
  let zone: Zone = "Light";
  if (pct >= 0.6) zone = "Vigorous";
  else if (pct >= 0.4) zone = "Moderate";
  return { zone, hrr: Math.round(pct * 100) };
};

const pointsFor = (zone: Zone, minutes: number): number => {
  if (zone === "Vigorous") return minutes * 2;
  if (zone === "Moderate") return minutes;
  return 0;
};

const startOfWeek = (d: Date): number => {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x.getTime();
};

const CardioTab = () => {
  const { flag } = useWeather();
  const elevated = flag?.color === "Red" || flag?.color === "Black";

  const [age, setAge] = useState("");
  const [restingHr, setRestingHr] = useState("");
  const [activity, setActivity] = useState<Activity>("Run");
  const [minutes, setMinutes] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [sessions, setSessions] = useState<CardioSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return;
      const p = JSON.parse(raw) as PersistShape;
      if (p.age) setAge(p.age);
      if (p.restingHr) setRestingHr(p.restingHr);
      if (Array.isArray(p.sessions)) setSessions(p.sessions);
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    const payload: PersistShape = { age, restingHr, sessions };
    try {
      localStorage.setItem(STORAGE, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [age, restingHr, sessions]);

  const previewZone = useMemo(() => {
    return classifyZone(parseFloat(age), parseFloat(restingHr), parseFloat(avgHr));
  }, [age, restingHr, avgHr]);

  const weeklyPoints = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    return sessions
      .filter((s) => new Date(s.loggedAt).getTime() >= weekStart)
      .reduce((sum, s) => sum + s.points, 0);
  }, [sessions]);

  const weeklyPct = Math.min(100, Math.round((weeklyPoints / 150) * 100));

  const logSession = () => {
    setError(null);
    const a = parseFloat(age);
    const rhr = parseFloat(restingHr);
    const m = parseFloat(minutes);
    const hr = parseFloat(avgHr);
    if (!a || !rhr || !m || !hr || a <= 0 || rhr <= 0 || m <= 0 || hr <= 0) {
      setError("Enter Age, Resting HR, Minutes, and Average HR (all > 0).");
      return;
    }
    const z = classifyZone(a, rhr, hr);
    if (!z) {
      setError("Could not compute zone. Check Resting HR vs. Average HR.");
      return;
    }
    const entry: CardioSession = {
      id: Date.now(),
      activity,
      minutes: m,
      avgHr: hr,
      hrr: z.hrr,
      zone: z.zone,
      points: pointsFor(z.zone, m),
      loggedAt: new Date().toISOString(),
    };
    setSessions((s) => [entry, ...s]);
    setMinutes("");
    setAvgHr("");
  };

  const clearAll = () => {
    setSessions([]);
    setMinutes("");
    setAvgHr("");
    setError(null);
  };

  return (
    <section aria-labelledby="cardio-heading">
      <h3 id="cardio-heading" className="text-xl font-bold text-foreground mb-1">
        Cardio Auditor
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Karvonen %HRR zones · PAGA 2018 Heart Points (150/wk goal).
      </p>

      {elevated && (
        <div
          role="alert"
          className="mb-4 border-2 border-destructive bg-destructive/10 rounded-md p-3 flex items-start gap-2"
        >
          <AlertTriangle
            className="h-5 w-5 text-destructive shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm font-bold text-destructive">
            Environmental Warning: Keep your heart rate in the "Light" zone or
            move indoors.
          </p>
        </div>
      )}

      <section
        aria-labelledby="paga-heading"
        className="mb-5 border-2 border-primary rounded-md p-3 bg-secondary"
      >
        <div className="flex items-center justify-between mb-1">
          <h4
            id="paga-heading"
            className="text-sm font-bold text-foreground"
          >
            Weekly Heart Points
          </h4>
          <span className="text-sm font-extrabold text-foreground tabular-nums">
            {weeklyPoints} / 150
          </span>
        </div>
        <Progress
          value={weeklyPct}
          aria-label={`Weekly heart points progress: ${weeklyPoints} of 150`}
          className="h-3"
        />
        <p className="text-[11px] text-foreground mt-1">
          1 min Vigorous = 2 points · 1 min Moderate = 1 point.
        </p>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          logSession();
        }}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-base text-foreground">
              Age (yrs)
            </Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rhr" className="text-base text-foreground">
              Resting HR (bpm)
            </Label>
            <Input
              id="rhr"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 60"
              value={restingHr}
              onChange={(e) => setRestingHr(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardio-activity" className="text-base text-foreground">
            Activity Type
          </Label>
          <Select value={activity} onValueChange={(v) => setActivity(v as Activity)}>
            <SelectTrigger
              id="cardio-activity"
              className="h-12 text-base border-2 border-primary/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Walk">Walk (low impact)</SelectItem>
              <SelectItem value="Swim">Swim (low impact)</SelectItem>
              <SelectItem value="Bike">Bike</SelectItem>
              <SelectItem value="Row">Row</SelectItem>
              <SelectItem value="Run">Run</SelectItem>
              <SelectItem value="Ruck">Ruck</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minutes" className="text-base text-foreground">
              Duration (min)
            </Label>
            <Input
              id="minutes"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 30"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg-hr" className="text-base text-foreground">
              Average HR (bpm)
            </Label>
            <Input
              id="avg-hr"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 145"
              value={avgHr}
              onChange={(e) => setAvgHr(e.target.value)}
              className="h-12 text-base border-2 border-primary/40"
            />
          </div>
        </div>

        {previewZone && (
          <div
            role="status"
            aria-live="polite"
            className="border-2 border-primary rounded-lg p-3 bg-card"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Intensity Zone
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {previewZone.zone}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {previewZone.hrr}% Heart Rate Reserve (Karvonen)
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" className="flex-1 h-12 text-base font-semibold">
            Log Session
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="h-12 px-4 text-base border-2 border-primary text-foreground"
            aria-label="Clear all logged cardio sessions"
          >
            Clear All
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      {sessions.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Session Log ({sessions.length})
          </h4>
          <ul className="space-y-2">
            {sessions.slice(0, 8).map((s) => (
              <li
                key={s.id}
                className="border-2 border-primary/40 rounded-md p-2 bg-card text-sm flex items-center justify-between gap-2"
              >
                <span className="font-bold">{s.activity}</span>
                <span className="tabular-nums">{s.minutes} min</span>
                <span className="tabular-nums text-muted-foreground">
                  {s.avgHr} bpm
                </span>
                <span className="text-[11px] uppercase tracking-wider">
                  {s.zone} · {s.points} pt
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CopyAuditButton
        getMarkdown={() =>
          sessions.length === 0
            ? ""
            : [
                "### WPE Audit · Cardio Session",
                "",
                `- **Age**: ${age} yrs · **Resting HR**: ${restingHr} bpm`,
                `- **Weekly Heart Points**: ${weeklyPoints} / 150`,
                "",
                "| Activity | Minutes | Avg HR | %HRR | Zone | Points |",
                "| --- | --- | --- | --- | --- | --- |",
                ...sessions.map(
                  (s) =>
                    `| ${s.activity} | ${s.minutes} | ${s.avgHr} | ${s.hrr}% | ${s.zone} | ${s.points} |`,
                ),
                "",
                "_Zones via Karvonen %HRR (ACSM 12th Ed.): Light <40 · Moderate 40–59 · Vigorous ≥60._",
                "_PAGA 2018: 1 min Vigorous = 2 pts · 1 min Moderate = 1 pt · Goal 150 pts/wk._",
              ].join("\n")
        }
        disabled={sessions.length === 0}
      />
    </section>
  );
};

export default CardioTab;
