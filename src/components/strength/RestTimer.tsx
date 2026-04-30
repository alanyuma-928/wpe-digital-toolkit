import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, RotateCcw } from "lucide-react";

const REST_SECONDS = 90;

interface RestTimerProps {
  /** Increments to start/restart a 90s rest. Use Date.now() for unique value each set. */
  triggerKey: number | null;
}

const RestTimer = ({ triggerKey }: RestTimerProps) => {
  const [remaining, setRemaining] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerKey === null) return;
    setRemaining(REST_SECONDS);
    setRunning(true);
  }, [triggerKey]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRemaining(REST_SECONDS);
    setRunning(true);
  };

  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining > 0 ? (REST_SECONDS - remaining) / REST_SECONDS : 1;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const done = !running && remaining === 0 && triggerKey !== null;

  return (
    <section
      aria-labelledby="rest-timer-heading"
      className="mt-4 border-2 border-primary rounded-md p-3 bg-card"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4
          id="rest-timer-heading"
          className="text-sm font-bold text-foreground flex items-center gap-2"
        >
          <Timer className="h-4 w-4" aria-hidden="true" />
          Rest Timer (90 sec)
        </h4>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`Rest time remaining: ${minutes} minutes ${seconds} seconds`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth={stroke}
            />
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
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-foreground tabular-nums">
              {timeLabel}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              min:sec
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}
          >
            {triggerKey === null
              ? "Log a set to start the rest timer."
              : running
                ? "Good set! Rest for a moment..."
                : "Rest done. You can do your next set."}
          </p>
          <Button
            type="button"
            onClick={reset}
            size="sm"
            variant="outline"
            className="mt-2 h-8 border-2 border-primary"
            aria-label="Restart 90 second rest timer"
            disabled={triggerKey === null}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restart
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RestTimer;
