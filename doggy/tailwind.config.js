/** Scoped to the Tailwind-based apps (DoggyLife + NeuroSomatic) only — the rest of the platform has its own
 *  hand-written CSS and must not be touched by Tailwind's preflight. */
export default {
  content: ["./doggy.html", "./doggy/**/*.{js,jsx}", "./neuro.html", "./neuro/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
