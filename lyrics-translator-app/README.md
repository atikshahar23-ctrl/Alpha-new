# Lyrics Translator — standalone app

A fully self-contained, de-branded build of the Lyrics Translator product —
independent from the Alpha/Heavy Guard platform, ready to host on its own
and package for the Google Play Store.

## Local development

```
npm install
npm run dev       # http://localhost:5173
```

## Build

```
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Deploying to the Play Store

See **`PLAYSTORE-DEPLOY.md`** for the full step-by-step guide — hosting,
PWA verification, packaging via PWABuilder, and Play Console submission.
**Read the "מכשולים קריטיים" section at the top first** — real copyright
and Spotify-branding constraints that affect what you can ship and how.

Also see `STORE-LISTING.md` (draft store copy) and `PRIVACY.md` (required
privacy policy — host it publicly and link it from Play Console).

## What's inside

- `index.html` — the full app (translation, Spotify sync/playback/
  playlists, 3D dancing avatar, karaoke mode, ambient LED glow, wake lock)
- `src/avatarScene.ts` — the three.js avatar scene
- `public/manifest.json`, `public/sw.js`, `public/icon-*.png` — PWA
  installability requirements (verified via Lighthouse-equivalent checks)
