# End-to-end sweeps

Two Playwright scripts that drive the built site the way a user does. Run a
preview server first (`npm run build && npx vite preview --port 4173`), then:

    node tools/sweep-pages.mjs    # every page, desktop + phone, load health
    node tools/sweep-flows.mjs    # every feature, driven for real

`sweep-pages` loads all eleven pages at 1440x900 and at 411x891 and reports
any page that throws, logs an error, or renders nothing at all.

`sweep-flows` actually uses the apps: every centre mode, every panel, every
chart style and drawing tool, zoom/replay/backtest, the strategy lab, opening
and closing a trade, market and timeframe switches, walk mode, every settings
row, the whole OCTOPUS story flow, the NEURO audio engine through all three
entrainment modes and a protocol, plus DoggyLife, Lyrics and the dashboard.

Both filter sandbox noise (blocked hosts, TLS interception, autoplay refusals)
so anything they print is a real finding.

**Why the console listener matters:** the arena's render loop catches its own
exceptions and drops to safe mode, so a fatal per-frame error never reaches
`pageerror` — it only ever appears as a `console.error`. A checker that
watches `pageerror` alone will call a broken page healthy. Both scripts watch
both.
