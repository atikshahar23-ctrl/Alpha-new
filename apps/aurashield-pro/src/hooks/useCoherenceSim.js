import { useEffect, useRef, useState } from 'react';
import { COHERENCE, DRAIN_ALERTS, RECOVERY_LINES } from '../lib/constants';
import { clamp, makeRng, pick } from '../lib/utils';

/* ══════════════════════════════════════════════════════════════════════
   SIMULATED TELEMETRY

   This module contains no sensor input of any kind. Every value it
   produces is a pseudo-random walk — a mean-reverting process with
   scheduled excursions. It is the engine behind the "drain" alerts.

   It is exported under a name that says so, and the UI's provenance
   panel reports it as generated. Do not re-label these outputs as
   measurements anywhere in the interface.
   ══════════════════════════════════════════════════════════════════════ */

const TICK_MS = 220;
const HISTORY = 96;
const BASELINE = 92;

export function useCoherenceSim({ shielded = false } = {}) {
  const [coherence, setCoherence] = useState(BASELINE);
  const [history, setHistory] = useState(() => Array(HISTORY).fill(BASELINE));
  const [alert, setAlert] = useState(null); // { text, level, id }
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState({ events: 0, deepest: BASELINE, uptime: 0 });

  const rng = useRef(makeRng(Date.now() & 0xffffffff));
  const value = useRef(BASELINE);
  const drain = useRef(null); // active excursion: { remaining, depth }
  const shieldedRef = useRef(shielded);
  const startedAt = useRef(Date.now());
  const wasLow = useRef(false);

  useEffect(() => {
    shieldedRef.current = shielded;
  }, [shielded]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const r = rng.current;
      const isShielded = shieldedRef.current;

      // Shielding raises the attractor and suppresses excursion odds.
      // This is what makes engaging the jammer feel consequential.
      const target = isShielded ? 96 : BASELINE;
      const eventChance = isShielded ? 0.006 : 0.028;

      if (!drain.current && r() < eventChance) {
        drain.current = {
          remaining: Math.floor(8 + r() * 22),
          depth: (isShielded ? 8 : 20) + r() * (isShielded ? 10 : 30),
        };
        const level = drain.current.depth > 34 ? 'critical' : 'warning';
        const text = pick(r, DRAIN_ALERTS);
        setAlert({ text, level, id: Date.now() });
        setLog((l) =>
          [{ t: Date.now(), text, level }, ...l].slice(0, 40)
        );
        setStats((s) => ({ ...s, events: s.events + 1 }));
      }

      let next = value.current;

      if (drain.current) {
        // Pull hard toward the excursion floor, then release.
        const floor = target - drain.current.depth;
        next += (floor - next) * 0.22;
        drain.current.remaining -= 1;
        if (drain.current.remaining <= 0) {
          drain.current = null;
          const text = pick(r, RECOVERY_LINES);
          setLog((l) => [{ t: Date.now(), text, level: 'ok' }, ...l].slice(0, 40));
        }
      } else {
        // Mean reversion + noise.
        next += (target - next) * 0.09 + (r() - 0.5) * 2.4;
      }

      next = clamp(next, 3, 99.9);
      value.current = next;

      setCoherence(next);
      setHistory((h) => [...h.slice(1), next]);
      setStats((s) => ({
        ...s,
        deepest: Math.min(s.deepest, next),
        uptime: Math.floor((Date.now() - startedAt.current) / 1000),
      }));

      // Auto-clear the banner once the field recovers.
      const low = next < COHERENCE.DEGRADED;
      if (wasLow.current && !low) setAlert(null);
      wasLow.current = low;
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, []);

  const level =
    coherence >= COHERENCE.NOMINAL
      ? 'nominal'
      : coherence >= COHERENCE.DEGRADED
        ? 'degraded'
        : coherence >= COHERENCE.CRITICAL
          ? 'warning'
          : 'critical';

  return { coherence, history, alert, log, level, stats, dismiss: () => setAlert(null) };
}
