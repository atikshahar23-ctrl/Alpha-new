import { useEffect, useRef, useState } from 'react';
import { ANOMALY_CLASSES } from '../lib/constants';
import { clamp, makeIdent, makeRng, normalizeDeg, pick, randRange } from '../lib/utils';

/* ══════════════════════════════════════════════════════════════════════
   SIMULATED CONTACTS

   The contacts are generated, not detected. What *is* real is the frame
   of reference: each contact is assigned a fixed compass bearing, and
   the radar renders it relative to the device's live heading.

   The effect is that contacts stay pinned to the room while you turn the
   phone — which is the whole reason this reads as an instrument rather
   than a screensaver.
   ══════════════════════════════════════════════════════════════════════ */

const TICK_MS = 900;
const MAX_CONTACTS = 6;

function spawn(rng) {
  const cls = pick(rng, ANOMALY_CLASSES);
  return {
    id: `${Date.now()}-${Math.floor(rng() * 1e6)}`,
    ident: makeIdent(rng),
    bearing: rng() * 360,
    distance: randRange(rng, 0.22, 0.94), // 0 = on top of you, 1 = scope edge
    drift: randRange(rng, -0.9, 0.9), // degrees per tick
    closing: randRange(rng, -0.012, 0.008), // change in distance per tick
    strength: randRange(rng, 0.35, 1),
    ttl: Math.floor(randRange(rng, 14, 44)),
    ...cls,
  };
}

export function useAnomalyField({ shielded = false, active = true } = {}) {
  const rng = useRef(makeRng((Date.now() ^ 0x5f3759df) >>> 0));
  const [contacts, setContacts] = useState(() => {
    const r = makeRng((Date.now() ^ 0x9e3779b9) >>> 0);
    return Array.from({ length: 3 }, () => spawn(r));
  });

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const r = rng.current;
      setContacts((prev) => {
        const next = prev
          .map((c) => ({
            ...c,
            bearing: normalizeDeg(c.bearing + c.drift),
            distance: clamp(c.distance + c.closing, 0.14, 0.97),
            strength: clamp(
              c.strength + (r() - 0.5) * 0.12 - (shielded ? 0.03 : 0),
              0,
              1
            ),
            ttl: c.ttl - 1,
          }))
          .filter((c) => c.ttl > 0 && c.strength > 0.08);

        // Shielding suppresses the spawn rate — the field visibly thins
        // out a few seconds after the jammer is engaged.
        const spawnChance = shielded ? 0.18 : 0.55;
        if (next.length < MAX_CONTACTS && r() < spawnChance) next.push(spawn(r));
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [shielded, active]);

  const threatCount = contacts.filter((c) => c.threat === 'high').length;

  return { contacts, threatCount };
}
