"use client";

import { useEffect, useState } from "react";

const CRON_HOURS_UTC = [3, 10, 13, 16]; // 3am, 10am, 1pm, 4pm UTC

function getNextCronTime(): Date {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  for (const hour of CRON_HOURS_UTC) {
    const candidate = new Date(todayUTC.getTime() + hour * 60 * 60 * 1000);
    if (candidate > now) return candidate;
  }

  // Next is tomorrow's first slot
  const tomorrow = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);
  return new Date(tomorrow.getTime() + CRON_HOURS_UTC[0] * 60 * 60 * 1000);
}

function formatTimeLeft(ms: number): { hours: number; minutes: number } {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function NextPoemCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    function update() {
      const next = getNextCronTime();
      const ms = next.getTime() - Date.now();
      setTimeLeft(formatTimeLeft(ms));
    }

    update();
    const interval = setInterval(update, 30_000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const label =
    timeLeft.hours === 0 && timeLeft.minutes <= 1
      ? "any moment now"
      : timeLeft.hours === 0
        ? `${timeLeft.minutes}m`
        : timeLeft.minutes === 0
          ? `${timeLeft.hours}h`
          : `${timeLeft.hours}h ${timeLeft.minutes}m`;

  return (
    <div className="flex items-center justify-center gap-2 py-3 text-charcoal-light/50 text-xs tracking-wide font-[family-name:var(--font-ui)]">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sepia/40 animate-pulse" />
      <span>
        next poem in <span className="text-sepia/70 tabular-nums">{label}</span>
      </span>
    </div>
  );
}
