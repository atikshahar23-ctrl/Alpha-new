/** Scoped to the DoggyLife app only — the rest of the platform has its own
 *  hand-written CSS and must not be touched by Tailwind's preflight. */
export default {
  content: ["./doggy.html", "./doggy/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
