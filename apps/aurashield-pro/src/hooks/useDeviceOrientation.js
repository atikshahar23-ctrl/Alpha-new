import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { lerpAngle, lerp, normalizeDeg } from '../lib/utils';

const FRAME_MS = 33; // ~30fps. Sensors fire faster; the eye does not care.

/**
 * Reads the device's real orientation sensors.
 *
 *   alpha — compass heading (0-360)
 *   beta  — front/back tilt (-180..180)
 *   gamma — left/right tilt (-90..90)
 *
 * Three things make this messy in the real world, and each is handled:
 *
 * 1. iOS 13+ requires DeviceOrientationEvent.requestPermission(), and it
 *    MUST be called from inside a user gesture or it rejects.
 * 2. Android exposes absolute heading on `deviceorientationabsolute`;
 *    iOS exposes it as the non-standard `webkitCompassHeading`.
 * 3. Desktops have no sensors at all. Rather than showing a dead
 *    instrument, we fall back to slow synthetic drift and report
 *    `source: 'dead-reckoning'` so the UI can label it honestly.
 *
 * Raw samples land in a ref; a single rAF loop smooths and publishes to
 * state. Nothing re-renders on the sensor's schedule.
 */
export function useDeviceOrientation() {
  const [permission, setPermission] = useState('idle'); // idle|granted|denied|unsupported
  const [source, setSource] = useState('none'); // none|absolute|relative|dead-reckoning
  const [display, setDisplay] = useState({ alpha: 0, beta: 0, gamma: 0 });

  const raw = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const smooth = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const gotEvent = useRef(false);

  const handle = useCallback((e) => {
    // iOS true-compass value wins when present.
    const heading =
      typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)
        ? e.webkitCompassHeading
        : e.alpha;

    if (heading === null && e.beta === null && e.gamma === null) return;

    if (!gotEvent.current) {
      gotEvent.current = true;
      setSource(
        e.absolute || typeof e.webkitCompassHeading === 'number' ? 'absolute' : 'relative'
      );
    }

    raw.current = {
      alpha: normalizeDeg(heading ?? 0),
      beta: e.beta ?? 0,
      gamma: e.gamma ?? 0,
    };
  }, []);

  /** Must be invoked from a click/tap handler. */
  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setPermission('unsupported');
      setSource('dead-reckoning');
      return 'unsupported';
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') {
          setPermission('denied');
          setSource('dead-reckoning');
          return 'denied';
        }
      } catch {
        // Thrown when not called from a genuine user gesture.
        setPermission('denied');
        setSource('dead-reckoning');
        return 'denied';
      }
    }

    setPermission('granted');
    window.addEventListener('deviceorientationabsolute', handle, true);
    window.addEventListener('deviceorientation', handle, true);

    // If nothing fires within 1.2s we're almost certainly on a desktop.
    window.setTimeout(() => {
      if (!gotEvent.current) setSource('dead-reckoning');
    }, 1200);

    return 'granted';
  }, [handle]);

  // Single publish loop: smooth, throttle, emit.
  useEffect(() => {
    let id;
    let last = 0;
    const t0 = performance.now();

    const tick = (now) => {
      id = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;

      // Synthetic drift for sensor-less machines — slow enough to read
      // as instrument noise rather than animation.
      if (source === 'dead-reckoning') {
        const t = (now - t0) / 1000;
        raw.current = {
          alpha: normalizeDeg(t * 5.5),
          beta: Math.sin(t * 0.32) * 22,
          gamma: Math.cos(t * 0.21) * 14,
        };
      }

      const s = smooth.current;
      const r = raw.current;
      s.alpha = lerpAngle(s.alpha, r.alpha, 0.22);
      s.beta = lerp(s.beta, r.beta, 0.2);
      s.gamma = lerp(s.gamma, r.gamma, 0.2);
      setDisplay({ alpha: s.alpha, beta: s.beta, gamma: s.gamma });
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [source]);

  useEffect(
    () => () => {
      window.removeEventListener('deviceorientationabsolute', handle, true);
      window.removeEventListener('deviceorientation', handle, true);
    },
    [handle]
  );

  return useMemo(() => {
    // Derived "field intensity": how far off level the device is held.
    const tiltMagnitude = Math.min(
      1,
      Math.hypot(display.beta / 90, display.gamma / 90)
    );
    return { permission, source, request, ...display, tiltMagnitude };
  }, [permission, source, request, display]);
}
