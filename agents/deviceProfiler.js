import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

/* ── DeviceProfiler ─────────────────────────────────────────────────────
   Detects a rough device tier once at startup so the 3D sim and any other
   Heavy Guard interface can pick sane defaults for blur/shadow/particle
   density without the user having to find the settings panel. Manual
   overrides (graphicsHigh/turbo, already saved to localStorage elsewhere)
   always win — this only sets the *first-run* default.

   Tiers:
     "desktop-high" — multi-core desktop/laptop, decent RAM, no touch-only UA
     "tablet"       — iPad / Android tablet (touch + large screen)
     "mobile-low"   — phones, or anything reporting few cores / little RAM
   There's no real GPU-capability API on the web, so this leans on the
   closest public proxies: logical cores, device memory, UA hints and
   screen size — good enough to separate "can push full glass + shadows"
   from "should not". */

function detectDeviceProfile() {
  if (typeof navigator === "undefined") return { tier: "desktop-high", label: "Server", touch: false };

  const ua = navigator.userAgent || "";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4; // GB, Chrome/Android only — undefined elsewhere
  const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  const minSide = Math.min(window.screen?.width || 1280, window.screen?.height || 800);
  const maxSide = Math.max(window.screen?.width || 1280, window.screen?.height || 800);

  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && touch); // iPadOS reports as Mac + touch
  const isTablet = isIPad || (touch && minSide >= 600);
  const isPhone = touch && !isTablet;

  let tier = "desktop-high";
  let label = "Desktop";

  if (isPhone) {
    tier = "mobile-low";
    label = "Mobile";
  } else if (isTablet) {
    // iPad Pro (M-series) is genuinely strong — give it the high tier if it
    // also reports plenty of cores; older/base iPads fall back to mid.
    tier = cores >= 6 ? "tablet-pro" : "tablet";
    label = isIPad ? (cores >= 6 ? "iPad Pro" : "iPad") : "Tablet";
  } else if (cores <= 2 || mem <= 2) {
    tier = "mobile-low"; // weak desktop/laptop — treat like a low-end device
    label = "Low-power desktop";
  }

  return { tier, label, touch, cores, mem, minSide, maxSide };
}

/* Per-tier render budget the 3D sim (and CSS) reads from. */
const PROFILES = {
  "desktop-high": { graphicsHigh: true, turbo: false, shadows: true, blur: true, dpr: 2, particleScale: 1 },
  "tablet-pro": { graphicsHigh: true, turbo: false, shadows: true, blur: true, dpr: 1.5, particleScale: 0.7 },
  "tablet": { graphicsHigh: false, turbo: true, shadows: false, blur: false, dpr: 1.25, particleScale: 0.4 },
  "mobile-low": { graphicsHigh: false, turbo: true, shadows: false, blur: false, dpr: 1, particleScale: 0.25 },
};

function budgetFor(tier) {
  return PROFILES[tier] || PROFILES["desktop-high"];
}

const DeviceProfileContext = createContext(null);

export function DeviceProfileProvider({ children }) {
  const [profile] = useState(() => detectDeviceProfile());
  const budget = useMemo(() => budgetFor(profile.tier), [profile.tier]);

  // Strip heavy blur/backdrop-filter globally on weaker devices — one body
  // class, CSS in style.css/App.jsx opts into it (`.perf-lite .foo{filter:none}`).
  useEffect(() => {
    document.body.classList.toggle("perf-lite", !budget.blur);
    return () => document.body.classList.remove("perf-lite");
  }, [budget.blur]);

  const value = useMemo(() => ({ ...profile, budget }), [profile, budget]);
  return React.createElement(DeviceProfileContext.Provider, { value }, children);
}

export function useDeviceProfile() {
  const ctx = useContext(DeviceProfileContext);
  if (ctx) return ctx;
  // Usable without the provider too (e.g. inside Office3D, which is mounted
  // deep in the tree) — detect fresh rather than throwing.
  const profile = detectDeviceProfile();
  return { ...profile, budget: budgetFor(profile.tier) };
}

export { detectDeviceProfile };
