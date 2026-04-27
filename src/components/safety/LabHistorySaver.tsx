import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, Save, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeather } from "@/context/WeatherContext";
import SafetyFlagBadge from "@/components/SafetyFlagBadge";

const STORAGE_KEY = "wpe.dtk.labHistory.v1";

export interface LabHistoryEntry {
  id: string;
  savedAt: string;
  source: string;
  payload: string;
  flag: string | null;
  wbgtF: number | null;
  uvIndex: number | null;
  auditAcknowledged: boolean;
}

interface LabHistorySaverProps {
  /** Short label for what's being saved (e.g., "PAR-Q+ Audit"). */
  source: string;
  /** Markdown / serialized payload. */
  buildPayload: () => string;
  /** Disable the save button when no payload is meaningful. */
  disabled?: boolean;
}

const readHistory = (): LabHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (entries: LabHistoryEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
};

/**
 * Lab History saver with the v1.2 Clinical Safety Audit gate:
 * when the environmental flag is Red or Black, the user MUST tick
 * the audit acknowledgement before the Save button enables.
 */
const LabHistorySaver = ({ source, buildPayload, disabled }: LabHistorySaverProps) => {
  const { flag, data } = useWeather();
  const { toast } = useToast();
  const [audited, setAudited] = useState(false);
  const [entries, setEntries] = useState<LabHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readHistory());
  }, []);

  const requiresAudit = !!flag?.requiresAudit;
  const canSave = !disabled && (!requiresAudit || audited);

  const handleSave = () => {
    if (!canSave) return;
    const entry: LabHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
      source,
      payload: buildPayload(),
      flag: flag ? `${flag.shape} ${flag.color}` : null,
      wbgtF: data?.wbgtF ?? null,
      uvIndex: data?.uvIndex ?? null,
      auditAcknowledged: requiresAudit ? audited : false,
    };
    const next = [entry, ...entries].slice(0, 25);
    setEntries(next);
    writeHistory(next);
    setAudited(false);
    toast({
      title: "Saved to Lab History",
      description: requiresAudit
        ? `Clinical Safety Audit acknowledged (${flag?.color} flag).`
        : "Entry recorded.",
    });
  };

  return (
    <section
      aria-labelledby="lab-history-heading"
      className="mt-6 border-2 border-primary rounded-lg p-3 bg-card"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4
          id="lab-history-heading"
          className="text-sm font-extrabold uppercase tracking-widest text-foreground inline-flex items-center gap-2"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Lab History
        </h4>
        {flag && <SafetyFlagBadge flag={flag} size="sm" />}
      </div>

      {requiresAudit && (
        <div
          role="alert"
          className="border-2 border-destructive rounded-md p-3 bg-destructive/10 mb-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="h-5 w-5 text-destructive shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-xs font-extrabold uppercase tracking-wide text-destructive">
                Clinical Safety Audit Required
              </p>
              <p className="text-[11px] text-destructive font-semibold mt-0.5">
                {flag?.color} flag active — {flag?.guidance}
              </p>
            </div>
          </div>

          <Label
            htmlFor="clinical-safety-audit"
            className="mt-3 flex items-start gap-3 border-2 border-destructive rounded-md p-3 cursor-pointer min-h-11 bg-card"
          >
            <Checkbox
              id="clinical-safety-audit"
              checked={audited}
              onCheckedChange={(v) => setAudited(v === true)}
              className="mt-0.5 h-5 w-5"
            />
            <span className="text-xs font-semibold text-foreground">
              I have completed the Clinical Safety Audit and confirm the client
              meets all hydration, supervision, and exertion-modification
              requirements for the active environmental flag.
            </span>
          </Label>
        </div>
      )}

      {!requiresAudit && flag && (
        <div className="border-2 border-primary/40 rounded-md p-3 bg-secondary mb-3 flex items-start gap-2">
          <ShieldCheck
            className="h-5 w-5 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-[11px] font-semibold text-foreground">
            {flag.label} — no additional audit required to save Lab History.
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full h-12 text-base font-semibold"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        Save to Lab History
      </Button>

      {entries.length > 0 && (
        <ol className="mt-4 space-y-2 list-none p-0">
          {entries.slice(0, 5).map((e) => (
            <li
              key={e.id}
              className="border-2 border-primary/30 rounded-md p-2 bg-secondary"
            >
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {new Date(e.savedAt).toLocaleString()} · {e.source}
              </p>
              <p className="text-xs font-bold text-foreground mt-0.5 tabular-nums">
                Flag {e.flag ?? "n/a"} · WBGT {e.wbgtF ?? "—"}°F · UV{" "}
                {e.uvIndex ?? "—"}
                {e.auditAcknowledged && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-destructive">
                    · Audit ✓
                  </span>
                )}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default LabHistorySaver;
