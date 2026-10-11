// ─── useNowTick hook ───
// Forces a re-render every 60 seconds so date-based KPIs update at midnight.
// Without this, "Today's Collection" stays on yesterday's date if the app
// is left open overnight.
import { useState, useEffect } from "react";

export function useNowTick(intervalMs: number = 60_000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
}
