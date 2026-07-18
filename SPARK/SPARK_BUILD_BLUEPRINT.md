# Spark (by Bonderity) — Build Blueprint for Claude Code

## What this is
A free, static, installable PWA ("Just Start" tool) that helps ADHD users overcome task-initiation paralysis by breaking common tasks into micro-steps with an editable countdown timer per step. No accounts, no backend, no AI — pure client-side app. It ships as a bonus alongside the paid ADHD Life Planner Dashboard and is deployed via GitHub → Vercel.

Read this whole document before starting Session 1. Work through sessions in order. Each session ends with a working, deployable state — commit and stop there even if there's remaining budget, rather than bleeding into the next session's scope.

---

## 1. Hard requirements checklist (do not skip any of these)

- [ ] Single-page app, vanilla JS, no framework, no build step required (but Vite is fine if it simplifies PWA tooling — Claude Code's call)
- [ ] Installable PWA: manifest.json + service worker, "Add to Home Screen" on iOS Safari and Android Chrome
- [ ] Works fully offline after first load (all task content bundled, no external API calls at runtime)
- [ ] Light and dark mode, dark mode palette matched to the existing ADHD Dashboard (see §5 tokens below), toggle persists via localStorage
- [ ] Per-step timer:
  - Radial ring visual
  - Editable via +/− buttons AND direct numeric typing (separate minutes and seconds fields, or a single field parsed as mm:ss — Claude Code's call, but both increment methods must exist)
  - Minimum interval step for +/− buttons is 30 seconds
  - Custom minutes AND custom seconds must both be supported (e.g. a user can set 1:45, not just round minutes)
  - Editable before starting AND while paused; editing while running should pause first
- [ ] On timer completion:
  - Plays an audible alarm that rings 3 distinct times (spaced ~1.5–2s apart)
  - Triggers device vibration on each ring (Vibration API, graceful no-op where unsupported)
  - Fires a system-level notification (Notification API) so the alert is visible even if the tab/app is backgrounded
  - **Must still work if the screen is locked or the app is backgrounded** — see §6 for the real constraints and honest fallback behavior here, this is the single riskiest requirement in the whole build and needs to be scoped carefully, not just promised
- [ ] Confetti celebration on full task completion, visually consistent with the dashboard's existing confetti pattern (emoji-based `.confetti-piece` fall animation — reuse the approach, not a new library)
- [ ] No search/filter text input on the home screen (removed per product decision — browsing by category and the "I'm stuck" button are the only entry points, to avoid users typing a task that isn't in the library and hitting a dead end)
- [ ] All 24 tasks from §7 included, fully authored (not placeholders)
- [ ] Full "I'm Stuck" phrase pool from §8 included
- [ ] App icon generation happens in two steps, in order:
  1. First render the two icon concepts as standalone SVG samples (kernel-mid-pop and firefly) at a size the user can review, do NOT skip straight to production icons
  2. Only after the user picks one (or asks you to proceed with your recommendation), generate the full icon set: iOS/Android home screen icons, Safari pinned-tab/touch icons, and PWA manifest icons at all required sizes (see §9 for exact size list)

---

## 2. Tech stack decision

- Plain HTML/CSS/JS, or Vite + vanilla JS if Claude Code prefers the dev-server/build convenience — no React/Vue needed, this app has no complex state
- Service worker: hand-written, cache-first for the app shell (HTML/CSS/JS/icons/task data), since everything is static and offline-first
- Task/step content: a single `tasks.js` (or `tasks.json`) data file — keep content separate from rendering logic so it's easy to extend to 50 tasks later without touching app code
- No external CDN dependencies beyond Google Fonts (Quicksand + Karla, per existing prototype) — self-host the fonts if true offline-from-first-load matters, otherwise document that fonts require one initial online load and fall back to system fonts offline
- Deployment target: GitHub repo → Vercel static deploy, so keep the folder structure Vercel-friendly (no server-side code, `vercel.json` only if needed for headers like service worker scope)

---

## 3. Session plan (to manage credits/context — stop at each checkpoint)

### Session 1 — Scaffold + static screens (no timer logic yet)
- Project structure, manifest.json skeleton, basic service worker (cache shell only, no push logic yet)
- Build all 4 screens as static markup with the light palette only: Home, Category, Task Detail (steps render but timer is non-functional placeholder), Stuck screen
- Wire up navigation between screens
- Implement dark mode toggle + both palettes (tokens from §5), no timer/notification work yet
- Commit checkpoint: "App shell + navigation + theming, no timer/notifications yet"

### Session 2 — Timer system
- Radial SVG ring component, wired to real countdown state
- Editable time: +/− buttons (30s increments) and direct numeric entry for minutes + seconds
- Start/pause/reset controls
- Local (in-tab) alarm: 3x beep (WebAudio, no external asset) + vibration per ring, when tab is in foreground
- Motivational phrase display per step, step-to-step progression, progress bar
- Commit checkpoint: "Full timer works when tab is open and focused"

### Session 3 — Background reliability + notifications
- Implement the real approach for §6 (Wake Lock API to keep screen awake during an active timer as the primary strategy; Notification API + service worker `setTimeout`/scheduled notification as the backgrounded fallback; be explicit in code comments and in a README section about what actually works when the OS fully suspends the tab/PWA, since no web technology can guarantee a locked-phone alarm the way a native app can)
- Request notification permission at an appropriate moment (not on first load — trigger it the first time a user starts a timer)
- Fire a Notification when a step's timer completes, even if the tab is backgrounded but not fully killed
- Commit checkpoint: "Notifications fire on backgrounded tab; document the locked-screen limitation clearly for the user"

### Session 4 — Confetti + task completion + full content
- Build the confetti completion celebration (reuse dashboard's emoji `.confetti-piece` CSS animation pattern, not a new library)
- Load all 24 tasks from §7 into the data file with full step/time/motivation content
- Load full "I'm Stuck" pool from §8
- Wire "Tasks Started Today" streak counter (increments on task open, not completion) with localStorage persistence across sessions
- Commit checkpoint: "All content in, full user flow completable start to finish"

### Session 5 — PWA installability + icons
- First: render the kernel-mid-pop and firefly SVG icon concepts as simple preview files/pages for the user to pick from
- Once a direction is chosen: generate the full icon set at all sizes in §9, wire up manifest.json completely, test "Add to Home Screen" behavior on iOS Safari and Android Chrome (note in README any manual steps the user needs to do, e.g. Apple touch icon meta tags)
- Final service worker pass: confirm full offline reload works after first visit
- Commit checkpoint: "Installable, offline-capable, icons finalized — ready for Vercel deploy"

### Session 6 (only if needed) — Polish/bugfix pass
- Cross-browser check (Safari iOS quirks with Vibration API — it's unsupported on iOS Safari, confirm graceful fallback), accessibility pass (focus states, reduced motion), any leftover bugs

Do not combine sessions to "save time" — the whole point of this split is to keep each session's context small enough to finish cleanly rather than run out of budget mid-feature.

---

## 4. Screens (recap, 4 total)

1. **Home** — streak banner ("Tasks Started Today 🔥"), no search bar, category grid, "I'm stuck" button
2. **Category** — list of task cards (title, difficulty badge, step count + time)
3. **Task Detail** — progress bar, one step at a time, radial timer (editable), motivational phrase, Next/Skip, confetti + completion screen on last step
4. **Stuck** — single random micro-nudge with a reroll button

---

## 5. Design tokens

**Light mode ("Soft Focus" palette, indigo swapped in per dashboard brand color):**
```
--bg: #FAF7F2
--card: #FFFFFF
--indigo: #6366F1
--indigo-dark: #4548C9
--indigo-light: rgba(99,102,241,0.12)
--gold: #D4B483
--lavender: #B8A9D9
--text: #3A3A38
--text-muted: #8A867F
--border: #EDE7DC
```

**Dark mode — matched to the existing ADHD Dashboard's dark theme:**
```
--bg: #0A0A0A            /* bg-canvas */
--card: #171717          /* bg-surface */
--card-elevated: #262626 /* bg-elevated */
--indigo: #818CF8        /* accent-primary in dark mode */
--indigo-dark: #A5B4FC   /* accent-primary-dark, used for text on colored bg in dark mode */
--indigo-light: #262626
--gold: #FBB94F           /* accent-warm */
--text: #F9FAFB
--text-muted: #9CA3AF
--border: #333333
```

Fonts: Quicksand (display/headers, 500–700 weight) + Karla (body, 400–700 weight), same as prototype.

---

## 6. Honest scoping on "works when locked / alarm sounds when locked"

Be direct with the user in the README about this rather than overpromising:

- **Foreground/backgrounded-but-open tab:** fully achievable — timer keeps running via `setInterval` combined with timestamp-based drift correction (don't trust `setInterval` alone across throttled background tabs; calculate remaining time from a stored `endTimestamp = Date.now() + remainingMs` and recompute on each tick or on visibility change), Notification API fires reliably, Wake Lock API keeps the screen on if the user leaves the tab focused-but-idle.
- **Fully locked phone screen / PWA killed by OS:** no web technology (not even a PWA with a service worker) can guarantee an audible alarm on a fully locked phone the way a native alarm clock app can — this is an OS-level restriction on all browsers, not a bug to fix. The realistic best-effort: schedule a Notification via the service worker before the screen locks (if the OS allows the service worker to wake briefly), which produces a push-style notification with sound/vibration on Android more reliably than iOS. iOS Safari PWAs have the most restrictions here.
- Document this clearly in-app too (e.g. a small note near the timer: "For best results, keep Spark open while your timer runs") rather than silently failing to meet user expectations.

---

## 7. Full task library content (24 tasks — author these exactly, do not placeholder)

Format per task: `{ title, category, difficulty (auto-computed, see §7a), steps: [{ text, seconds, motivation }] }`

### Writing & Communication
**Write Email**
1. Open your email app and type the recipient's name — 60s — "Starting is the hardest part — you're already doing it."
2. Write the subject line — 120s — "Doesn't need to be perfect. Just needs to exist."
3. Write a short opening line — 60s — "One sentence is enough to keep going."
4. Write the main message — 300s — "Halfway there. Keep the momentum."
5. Proofread quickly and hit send — 120s — "Last one — finish strong."

**Make Phone Call**
1. Write down what you need to say, even just bullet points — 180s — "You don't have to remember it — you just wrote it down."
2. Find the phone number — 60s — "Small step. Still counts."
3. Take 3 deep breaths — 60s — "Your nervous system just needs a second. Take it."
4. Dial the number — 30s — "The scariest part is right now — and it's almost over."
5. Say your first line out loud — 30s — "You already know what to say. It's written down."
6. Continue the conversation — 120s — "You're doing the actual hard thing. That's real progress."
7. Say goodbye and hang up — 30s — "Done. You did the thing you were avoiding."

**Reply to a Text You've Been Avoiding**
1. Open the conversation and reread the last message — 60s — "You're not obligated to have the perfect reply — just a reply."
2. Type one honest sentence — 120s — "Short and real beats long and perfect."
3. Send it — 30s — "That's it. It's off your chest and off your plate."

### Health & Self-Care
**Take Medication**
1. Go to where you keep your medication — 30s — "You're already moving. That's the win."
2. Take the dose with water — 30s — "Future-you is thanking you right now."
3. Log it or check it off — 30s — "Small action, real care."

**Drink Water (Reminder)**
1. Get up and fill a glass or bottle — 30s — "Your body will feel this in ten minutes."
2. Drink at least half of it now — 30s — "That counts as taking care of yourself."

**Take a Shower**
1. Walk to the bathroom — 30s — "You don't have to feel ready. Just go."
2. Turn on the water and let it warm up — 60s — "You're already closer than you were a minute ago."
3. Get in — 30s — "The hardest transition is behind you now."
4. Wash your hair — 180s — "One step at a time — this one's easy."
5. Wash your body — 180s — "Almost there. Keep going."
6. Get out, dry off, get dressed — 420s — "You did something your body needed. That matters."

**Go to a Doctor Appointment**
1. Confirm the date, time, and location — 120s — "Confirming it makes it real and doable, not just looming."
2. Write down 1-3 things you want to mention — 300s — "You won't have to remember it under pressure — it's already written."
3. Get dressed and gather what you need — 600s — "Getting ready is its own small win."
4. Leave with enough time to arrive early — 60s (nominal, actual travel varies — display as "varies") — "You're already on your way. That's the hard part done."
5. Check in at the front desk — 120s — "You showed up. That's what mattered most today."

### Home & Organization
**Clean Kitchen**
1. Throw away obvious trash from counters — 120s — "You just changed the room without even really starting."
2. Load the dishwasher or start a sink of soapy water — 180s — "Momentum is building. Keep it going."
3. Wash or load the remaining dishes — 600s — "You don't have to finish fast — just keep moving."
4. Wipe down counters — 180s — "Look at that — it's already looking different."
5. Sweep the floor — 300s — "Almost a whole clean kitchen. Keep going."
6. Take out the trash if full — 120s — "Last step. You're finishing what you started."

**Do Laundry**
1. Gather dirty clothes into one pile or basket — 180s — "Gathering it is 80% of starting this task."
2. Sort lights and darks if needed — 120s — "Small decision, real progress."
3. Load the washer and start it — 120s — "The machine does the actual work from here."
4. Move to dryer when done — 120s — "You remembered. That's the executive-function win right there."
5. Fold or hang at least some of it — 600s — "Even half-folded counts as done enough."

**Make Bed**
1. Pull the sheet and blanket up straight — 60s — "One motion. Already halfway done."
2. Fluff or place the pillows — 30s — "Look at that — it already looks intentional."
3. Smooth the top layer — 30s — "Done. Your room already feels calmer."

**Organize Desk**
1. Clear everything that doesn't belong into one pile — 180s — "You don't have to sort it yet — just clear the surface."
2. Throw away obvious trash — 120s — "Instant progress, zero decisions needed."
3. Group similar items together — 300s — "You're creating order without needing a perfect system."
4. Put items back in their place — 180s — "Each thing you place is one less thing pulling at your attention."
5. Wipe the surface down — 120s — "A clear desk, and you built it one small step at a time."

### Work & Productivity
**Start Work Session**
1. Sit at your workspace, nothing else — 60s — "You're in position. That's the real first step."
2. Open the one file or tool you need first — 60s — "You don't need the whole plan — just the first thing."
3. Set a timer for a focused stretch (15–25 min) — 30s — "The timer is holding the pressure so you don't have to."
4. Do the very first tiny action on the task — 300s — "You're in motion now — that's the part that was hard."

**Prepare for Meeting**
1. Check the meeting time and platform/link — 60s — "Confirming it removes one thing from your mental load."
2. Skim the agenda or last notes if there are any — 300s — "You don't need to memorize it — just refresh your memory."
3. Write down 1-2 things you want to say or ask — 300s — "Having it written means you won't blank in the moment."
4. Close distracting tabs/apps — 120s — "You're clearing space to actually be present."
5. Join a few minutes early — 120s — "You showed up prepared. That's more than most people do."

**Complete Assignment**
1. Reread the instructions once, fully — 300s — "Understanding it fully now saves you from redoing it later."
2. Write down the smallest possible first section to tackle — 120s — "You just made this task 10x more doable."
3. Do that one small section only — 900s — "You're actually doing it. Right now."
4. Take a short break — 300s — "Rest is part of doing this well, not a distraction from it."
5. Do the next section — 900s — "Every section done is proof you can keep going."
6. Review and submit — 300s — "You finished something that felt impossible earlier today."

### Finance & Admin
**Pay a Bill**
1. Find the bill or open the account/app — 120s — "Finding it is often the actual hard part — you just did it."
2. Confirm the amount and due date — 60s — "Confirming it now prevents a bigger stress later."
3. Enter payment details or click pay — 120s — "Almost done — just a couple more taps."
4. Save or screenshot the confirmation — 60s — "Handled. One less thing weighing on you."

### Dashboard Check-ins
**Set Up Today**
1. Open your ADHD Life Planner dashboard — 30s — "Just opening it is the whole first step."
2. Check off anything from yesterday you actually finished — 120s — "Progress you forgot to celebrate still counts."
3. Pick your top 3 priorities for today — 120s — "Three is enough. You don't need a ten-item list."
4. Glance at your habit tracker and mark what's already done — 60s — "Even one checkmark builds the pattern."

**Check Your Budget**
1. Open the Budget section of your dashboard — 30s — "You don't need to fix anything yet — just look."
2. Confirm your income is up to date for this period — 120s — "Knowing what's actually coming in makes everything else easier to plan."
3. Look at your Safe-to-Spend number — 60s — "One number. That's all you need right now."
4. Add any purchases from the last few days you haven't logged — 300s — "Catching up counts the same as staying current."
5. Check if any bills are due this week — 180s — "Knowing now is easier than finding out late."
6. Close it — no changes required beyond this — 30s — "You checked in. That's the whole win today."

**Review Your Time Blocks**
1. Open today's Daily view — 30s — "Seeing the shape of your day reduces the dread of it."
2. Look at what's already scheduled — 120s — "You're not planning from scratch — most of it's already there."
3. Block 15-30 minutes for the one thing you're avoiding most — 180s — "Giving it a time slot makes it smaller."
4. Add a buffer block after anything stressful — 120s — "Future-you will thank present-you for this."

**Plan Meals for the Week**
1. Open the Meal Planner section — 30s — "You don't need a full plan — just a start."
2. Write down 3 meals you already know you like and can make easily — 300s — "Repeats are allowed. Variety isn't required to eat well."
3. Check what you already have at home — 180s — "You might already be closer to done than you think."
4. Fill remaining meal slots, even with 'leftovers' or 'eat out' — 180s — "An honest plan beats an ambitious one you won't follow."
5. Move meals to your grocery list — 120s — "One tap and the hard part is already connected."
6. Close the planner — 30s — "Done. Future-you already knows what's for dinner."

**Build Your Grocery List**
1. Open the Grocery List, linked from your Meal Planner — 30s — "It's mostly already built for you."
2. Add anything missing for this week's meals — 180s — "Small additions, not a big decision."
3. Walk through your kitchen and add anything you're low on — 240s — "You're preventing a future emergency store run."
4. Mark the list ready to shop — 30s — "That's it. Tomorrow-you has one less thing to figure out."

**Check Your Calendar**
1. Open your Calendar view — 30s — "Just looking removes the fear of the unknown."
2. Scan the next 3 days for anything you need to prepare for — 120s — "Knowing early means you get to prepare, not scramble."
3. Add any missing appointment or deadline you just remembered — 90s — "Getting it out of your head and onto the page is real relief."

**Log a Habit or Micro-Commitment**
1. Open your Habit Tracker — 30s — "You're already showing up by opening this."
2. Mark today's habits — even partially done counts — 90s — "A missed day resets nothing. Every check-off counts forever."
3. If today's too much, log just your 2-minute micro-commitment instead — 60s — "A tiny version of the habit still builds the habit."

**Do Your Weekly Reset**
1. Open your dashboard's Weekly view — 30s — "One section at a time. You don't have to see it all at once."
2. Review what got done this week — 180s — "You did more than the stuck moments made it feel like."
3. Move any unfinished tasks to next week — 180s — "Carrying it forward isn't failure — it's normal planning."
4. Check your budget's weekly total against Safe-to-Spend — 300s — "One honest look now avoids a bigger surprise later."
5. Glance at your habit heatmap for the week — 120s — "Look at all that green. That's real, even on hard weeks."
6. Set your top 3 priorities for next week — 300s — "You're not starting from zero — you're building on this week."
7. Close the dashboard for the week — 30s — "Reset complete. You showed up for yourself."

### 7a. Difficulty formula (implement exactly this — do not hardcode difficulty per task)
```
stepBand   = steps.length <= 5 ? 'Easy' : steps.length <= 7 ? 'Medium' : 'Hard'
timeBand   = totalSeconds <= 600 ? 'Easy' : totalSeconds <= 1500 ? 'Medium' : 'Hard'
difficulty = max(stepBand, timeBand)   // Easy < Medium < Hard
```
Total time displayed on task cards = sum of step seconds, rounded to nearest minute, prefixed "~".

Optional manual override flag (`emotionalWeight: true`) bumps difficulty one level regardless of formula — apply this to **Make Phone Call** and **Go to a Doctor Appointment** specifically, per product decision (emotional/anxiety weight isn't captured by time or step count alone).

---

## 8. "I'm Stuck" phrase pool (random selection each time, avoid repeating the current one on reroll)

1. "Open your email app and just look at the inbox. That's it."
2. "Fill one glass of water and drink 3 sips."
3. "Pick up one item off the floor and put it where it belongs."
4. "Open your to-do list. You don't have to do anything on it yet."
5. "Stand up, stretch your arms overhead, and take 3 slow breaths."
6. "Open one drawer or bag you've been avoiding — just look inside."
7. "Text one person 'hey' — nothing more required."
8. "Set a 2-minute timer and just sit with your task open."
9. "Move one thing from your 'to-do' pile to your desk."
10. "Open the app for the thing you're dreading — you don't have to use it yet."
11. "Write down the very first word of what you need to write."
12. "Put on shoes. That's the whole task right now."

---

## 9. Icon sizes to generate in Session 5 (after concept approval)

- PWA manifest: 192x192, 512x512 (both maskable and any-purpose variants)
- Apple touch icon: 180x180
- Favicon: 32x32, 16x16, and an .ico fallback
- Safari pinned tab: monochrome SVG mask icon
- Android adaptive icon foreground/background layers if targeting a native wrapper later (optional, note as future work if out of scope for this static PWA)

---

## 10. Notes for Claude Code on content/tone (do not deviate)
- Every user-facing string is shame-free, plain language, celebrates small wins — never guilt-driven ("you still haven't...", "don't forget...")
- Streak counter tracks **tasks started**, not completed — this is a deliberate product decision, not a placeholder. Do not silently change this to "completed" for convenience.
- No accounts, no sign-in, no cloud sync in this version — all state in localStorage, scoped to the device/browser
