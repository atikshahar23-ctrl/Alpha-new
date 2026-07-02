import './style.css';
import { mountApp } from './ui/app';

// ── Performance-lite mode ──────────────────────────────────────────────
// Decide BEFORE the first paint so we never render the heavy glass once.
// backdrop-filter blur over the animated orb canvas is the main reason the
// UI feels sluggish on iPads/phones, so strip it there (and whenever the
// user picks Fast or Mobile mode). Explicit Desktop mode keeps full glass.
function decidePerfLite(): boolean {
  try {
    const dm = localStorage.getItem('alpha_display_mode');
    if (dm === 'desktop') return false;
    if (dm === 'mobile') return true;
    if (localStorage.getItem('alpha_fast_mode') === '1') return true;
  } catch {}
  const ua = navigator.userAgent;
  const touchPts = (navigator as any).maxTouchPoints || 0;
  // iPad on recent iPadOS reports a Macintosh UA but exposes multi-touch.
  const isIpadOrIos = /iPhone|iPad|iPod/i.test(ua) || (touchPts > 1 && /Macintosh/i.test(ua));
  const isTouchTablet = touchPts > 0 && window.innerWidth < 1024;
  return isIpadOrIos || isTouchTablet;
}
if (decidePerfLite()) document.documentElement.classList.add('perf-lite');

const root = document.getElementById('app')!;
mountApp(root);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
  caches.keys().then(keys => {
    keys.forEach(k => caches.delete(k));
  });
}
