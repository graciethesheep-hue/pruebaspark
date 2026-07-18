# Spark — Just Start (by Bonderity)

A free, static, installable PWA that helps ADHD users beat task-initiation paralysis by breaking common tasks into micro-steps with a per-step countdown timer. No accounts, no backend, no AI — pure client-side, deployed via GitHub → Vercel.

## Status

- ✅ **Session 1** — App shell, 4 screens (Home / Category / Task Detail / Stuck), navigation, light + dark theming, manifest + basic cache-first service worker
- ✅ **Session 2** — Timer system: radial ring countdown, editable time (±30s buttons + direct mm:ss entry), start/pause/reset, drift-corrected timestamp-based ticking, in-tab 3× WebAudio alarm + vibration
- ✅ **Session 3** — Wake Lock while a timer runs, notification permission on first timer start, system notification on step completion (fires while backgrounded), locked-screen limitation documented
- ✅ **Session 4** — Confetti completion celebration, full task library (all tasks from the blueprint), full stuck-phrase pool, notification prompt asked only once ever
- ✅ **Session 5** — Firefly icon chosen and generated at all sizes (PWA 192/512 any+maskable, Apple touch 180, favicons 32/16/.ico, Safari pinned-tab SVG), manifest complete, icons cached for offline
- ⬜ Session 6 — Polish/bugfix

## Run locally

Any static server works, e.g.:

```
npx serve .
```

## What the alarm can and can't do (honest limits)

Spark's timer alarm works at three levels of reliability, and it's important to be upfront about them:

- **App open and focused** — fully reliable. The countdown is timestamp-based (drift-corrected), the 3× audible ring + vibration play, and the Wake Lock API keeps the screen from sleeping while a timer runs (on supporting browsers).
- **Tab/app backgrounded but still alive** — reliable notification, no sound guarantee. The timer keeps correct time (it recomputes from the stored end timestamp), and a system-level notification fires via the service worker when the step completes. The in-tab beep may be muted by the browser until you return.
- **Screen fully locked / app suspended by the OS** — best effort only. **No web technology can guarantee an audible alarm on a fully locked phone the way a native alarm app can** — browsers cannot wake a suspended page or service worker on a local timer (that would require server push, and Spark deliberately has no server). Android generally tolerates short background periods better than iOS Safari, which is the most restrictive.

This is why the app shows "For best results, keep Spark open while your timer runs" near the timer — it's the honest instruction, not boilerplate.

Notification permission is requested the first time you start a timer (never on page load).

## Deploying / updating on GitHub → Vercel

Upload **everything in this folder, keeping the `icons/` folder as a folder** (all other app files live at the root on purpose, so a flat drag-and-drop can't break them):

```
index.html   styles.css   app.js   tasks.js   manifest.json   sw.js   icons/ (all files inside)
```

On GitHub's web uploader, drag the `icons` *folder itself* into the upload area so the files keep their `icons/...` path. Vercel needs no configuration (Framework: Other, no build command). After each update, hard-refresh the app (Ctrl+Shift+R) or close/reopen the installed PWA twice so the service worker swaps in the new version.

**Installing on your phone:** Android Chrome → menu ⋮ → "Add to Home screen" / "Install app". iOS Safari → Share button → "Add to Home Screen" (iOS uses `apple-touch-icon.png` automatically). Use the Vercel URL (https) — installation and the service worker don't work from a plain opened file.

## Notes

- Task data lives in `js/tasks.js` — the full library from the blueprint (the blueprint says "24 tasks" but its §7 list contains 23; all 23 are included verbatim).
- Streak counter counts tasks **started**, not completed — deliberate product decision.
- Icons in `manifest.json` are referenced but not yet generated (Session 5).
