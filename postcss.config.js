// Tailwind runs for the DoggyLife app only: it emits base/components/utilities
// exclusively where the @tailwind directives appear (doggy/tailwind.css), and
// that file is imported by doggy/main.jsx alone. Every other page's CSS passes
// through this pipeline untouched — no preflight reset leaks into the
// dashboard, arena, octopus or lyrics apps, which have their own hand-written
// styling.
export default {
  plugins: {
    tailwindcss: { config: "./doggy/tailwind.config.js" },
    autoprefixer: {},
  },
};
