# Spark — Just Start (by Bonderity)

A free, static, installable PWA that helps ADHD users beat task-initiation paralysis by breaking common tasks into micro-steps with a per-step countdown timer. No accounts, no backend, no AI — pure client-side, deployed via GitHub → Vercel.

## Status

- ✅ **Session 1** — App shell, 4 screens (Home / Category / Task Detail / Stuck), navigation, light + dark theming, manifest + basic cache-first service worker
- ✅ **Session 2** — Timer system: radial ring countdown, editable time (±30s buttons + direct mm:ss entry), start/pause/reset, drift-corrected timestamp-based ticking, in-tab 3× WebAudio alarm + vibration
- ✅ **Session 3** — Wake Lock while a timer runs, notification permission on first timer start, system notification on step completion (fires while backgrounded), locked-screen limitation documented
- ⬜ Session 4 — Confetti, full 24-task library, streak persistence polish
- ⬜ Session 5 — PWA icons + installability pass
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

## Notes

- Task data lives in `js/tasks.js`; currently a seed subset (one task per category). Full 24-task library lands in Session 4.
- Streak counter counts tasks **started**, not completed — deliberate product decision.
- Icons in `manifest.json` are referenced but not yet generated (Session 5).
