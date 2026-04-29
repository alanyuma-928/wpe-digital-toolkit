import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Droplet, RotateCcw } from "lucide-react";

const CYCLE_SECONDS = 60 * 60; // 60 minutes

const SipTimer = () => {
  const [remaining, setRemaining] = useState(CYCLE_SECONDS);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setCycles((c) => c + 1);
          return CYCLE_SECONDS;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const refill = () => {
    setRemaining(CYCLE_SECONDS);
  };

  // Ring math
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (CYCLE_SECONDS - remaining) / CYCLE_SECONDS;
  const dashOffset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const dueNow = remaining === CYCLE_SECONDS && cycles > 0;

  return (
    <section
      aria-labelledby="sip-timer-heading"
      className="mt-3 border-2 border-primary rounded-md p-3 bg-card"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4
          id="sip-timer-heading"
          className="text-sm font-bold text-foreground flex items-center gap-2"
        >
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Travel Water Timer
        </h4>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground tabular-nums">
          Sips: {cycles}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`Time until next drink: ${minutes} minutes ${seconds} seconds`}
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
            className={`text-sm font-bold ${
              dueNow ? "text-destructive" : "text-foreground"
            }`}
          >
            {dueNow
              ? "Time to Hydrate: Drink 8–12 oz."
              : "Next drink in a bit. Keep your bottle close."}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tap Refill after you drink to restart the hour.
          </p>
          <Button
            type="button"
            onClick={refill}
            size="sm"
            className="mt-2 h-8"
            aria-label="Refill: restart the 60 minute water timer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Refill
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SipTimer;
