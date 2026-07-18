// Spark — Sessions 1–2: navigation, rendering, theming, timer system.
// Background/locked-screen notification strategy arrives in Session 3.

(function () {
  'use strict';

  // ---------- Difficulty formula (blueprint §7a) ----------
  const BANDS = ['Easy', 'Medium', 'Hard'];

  function difficultyOf(task) {
    const stepBand = task.steps.length <= 5 ? 0 : task.steps.length <= 7 ? 1 : 2;
    const total = task.steps.reduce((s, st) => s + st.seconds, 0);
    const timeBand = total <= 600 ? 0 : total <= 1500 ? 1 : 2;
    let band = Math.max(stepBand, timeBand);
    if (task.emotionalWeight) band = Math.min(band + 1, 2);
    return BANDS[band];
  }

  function totalMinutes(task) {
    const total = task.steps.reduce((s, st) => s + st.seconds, 0);
    return Math.round(total / 60);
  }

  // ---------- State ----------
  const state = {
    screen: 'home',
    categoryId: null,
    task: null,
    stepIndex: 0,
    lastStuckIndex: -1,
  };

  const $ = (id) => document.getElementById(id);

  // ---------- Timer ----------
  // Countdown is timestamp-based (endTs), not interval-counted: background tabs
  // throttle setInterval, so remaining time is always recomputed from Date.now().
  const RING_CIRC = 553; // 2πr for r=88, matches stroke-dasharray in CSS
  const MIN_MS = 30 * 1000;
  const MAX_MS = (99 * 60 + 59) * 1000;

  const timer = {
    totalMs: 60000,
    remainingMs: 60000,
    running: false,
    endTs: null,
    intervalId: null,
    alarmTimeouts: [],
    done: false,
  };

  // ---------- Wake Lock (keep screen on while a timer runs) ----------
  // Best-effort: unsupported browsers (e.g. older Safari) just no-op.
  let wakeLock = null;

  async function acquireWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch {
      wakeLock = null; // denied (low battery, etc.) — timer still works
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  // ---------- Notifications ----------
  // Permission is requested ONCE, the first time a user ever starts a timer
  // (never on page load). If they dismiss the prompt we don't nag again —
  // dismissing leaves permission at 'default', so without this flag the
  // browser would re-prompt on every single start.
  function maybeRequestNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    if (localStorage.getItem('spark-notif-asked')) return;
    localStorage.setItem('spark-notif-asked', '1');
    Notification.requestPermission().catch(() => {});
  }

  function notifyStepDone() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Only notify when the tab is actually hidden — in the foreground the
    // audible ring + done state already alert the user.
    if (!document.hidden) return;
    const step = state.task ? state.task.steps[state.stepIndex] : null;
    const title = "⏰ Time's up!";
    const body = step
      ? `"${step.text}" is done — come back for the next step.`
      : 'Your Spark timer finished.';
    const opts = {
      body,
      tag: 'spark-timer', // replaces any previous timer notification
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      vibrate: [200, 100, 200],
    };
    // Prefer the service worker so the notification appears even when the
    // tab is backgrounded (page-scoped `new Notification` can be dropped).
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, opts))
        .catch(() => {
          try { new Notification(title, opts); } catch { /* unsupported */ }
        });
    } else {
      try { new Notification(title, opts); } catch { /* unsupported */ }
    }
  }

  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function beep() {
    if (!audioCtx) return;
    // Two quick tones per ring, gentle sine, no external asset.
    [0, 0.35].forEach((offset) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      const t = audioCtx.currentTime + offset;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  function ringAlarm() {
    // 3 distinct rings, ~1.7s apart, vibration on each (no-op where unsupported).
    stopAlarm();
    [0, 1700, 3400].forEach((delay) => {
      timer.alarmTimeouts.push(
        setTimeout(() => {
          beep();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }, delay)
      );
    });
  }

  function stopAlarm() {
    timer.alarmTimeouts.forEach(clearTimeout);
    timer.alarmTimeouts = [];
  }

  function renderTimer() {
    const secs = Math.max(0, Math.ceil(timer.remainingMs / 1000));
    if (document.activeElement !== $('min-input') && document.activeElement !== $('sec-input')) {
      $('min-input').value = String(Math.floor(secs / 60));
      $('sec-input').value = String(secs % 60).padStart(2, '0');
    }
    const frac = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;
    $('ring-progress').style.strokeDashoffset = String(RING_CIRC * (1 - frac));
    $('start-btn').textContent = timer.running ? 'Pause' : timer.done ? 'Restart' : 'Start';
    $('timer-hint').textContent = timer.running
      ? 'counting down…'
      : timer.done
        ? "time's up!"
        : 'tap time to edit';
    $('timer-ring-wrap').classList.toggle('timer-done', timer.done);
  }

  function setTimerMs(ms, { resetTotal = true } = {}) {
    timer.remainingMs = Math.min(Math.max(ms, 0), MAX_MS);
    if (resetTotal) timer.totalMs = Math.max(timer.remainingMs, 1000);
    timer.done = false;
    renderTimer();
  }

  function startTimer() {
    if (timer.remainingMs <= 0) timer.remainingMs = timer.totalMs; // restart after done
    ensureAudio(); // unlock audio inside the user gesture
    maybeRequestNotifications(); // first-timer-start prompt, per §6
    acquireWakeLock();
    timer.running = true;
    timer.done = false;
    timer.endTs = Date.now() + timer.remainingMs;
    clearInterval(timer.intervalId);
    timer.intervalId = setInterval(tick, 250);
    renderTimer();
  }

  function pauseTimer() {
    if (!timer.running) return;
    timer.remainingMs = Math.max(0, timer.endTs - Date.now());
    timer.running = false;
    clearInterval(timer.intervalId);
    releaseWakeLock();
    renderTimer();
  }

  function stopTimer() {
    timer.running = false;
    clearInterval(timer.intervalId);
    releaseWakeLock();
    stopAlarm();
  }

  function tick() {
    timer.remainingMs = Math.max(0, timer.endTs - Date.now());
    if (timer.remainingMs <= 0) {
      stopTimer();
      timer.done = true;
      ringAlarm();
      notifyStepDone();
    }
    renderTimer();
  }

  function loadStepTimer(seconds) {
    stopTimer();
    timer.done = false;
    timer.totalMs = seconds * 1000;
    timer.remainingMs = seconds * 1000;
    renderTimer();
  }

  function commitTimeInputs() {
    const m = parseInt($('min-input').value, 10) || 0;
    const s = parseInt($('sec-input').value, 10) || 0;
    setTimerMs((m * 60 + Math.min(s, 59)) * 1000);
  }

  $('start-btn').addEventListener('click', () => {
    if (timer.running) pauseTimer();
    else startTimer();
  });

  $('reset-btn').addEventListener('click', () => {
    if (state.task) loadStepTimer(state.task.steps[state.stepIndex].seconds);
  });

  function adjustTimer(deltaMs) {
    if (timer.running) pauseTimer(); // editing while running pauses first
    setTimerMs(Math.max(timer.remainingMs + deltaMs, MIN_MS));
  }

  $('minus-btn').addEventListener('click', () => adjustTimer(-30000));
  $('plus-btn').addEventListener('click', () => adjustTimer(30000));

  ['min-input', 'sec-input'].forEach((id) => {
    const input = $(id);
    input.addEventListener('focus', () => {
      if (timer.running) pauseTimer(); // editing while running pauses first
      input.select();
    });
    input.addEventListener('input', () => {
      if (timer.running) pauseTimer(); // covers browsers where focus fired late
      input.value = input.value.replace(/\D/g, '').slice(0, 2);
    });
    input.addEventListener('change', commitTimeInputs);
    input.addEventListener('blur', () => {
      commitTimeInputs();
      renderTimer();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
    });
  });

  // Background tabs throttle timers — recompute the moment we're visible again.
  // The OS auto-releases wake locks on hide, so re-acquire on return too.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timer.running) {
      tick();
      if (timer.running) acquireWakeLock();
    }
  });

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('spark-theme', theme);
    $('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    $('theme-color-meta').setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FAF7F2');
  }

  $('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  applyTheme(localStorage.getItem('spark-theme') || 'light');

  // ---------- Streak: "Tasks Started Today" (increments on task open, per product decision) ----------
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getStreak() {
    const raw = JSON.parse(localStorage.getItem('spark-streak') || 'null');
    return raw && raw.date === todayKey() ? raw.count : 0;
  }

  function bumpStreak() {
    const count = getStreak() + 1;
    localStorage.setItem('spark-streak', JSON.stringify({ date: todayKey(), count }));
    renderStreak();
  }

  function renderStreak() {
    $('streak-num').textContent = getStreak();
  }

  // ---------- Navigation ----------
  function show(screenName) {
    if (state.screen === 'task' && screenName !== 'task') stopTimer();
    state.screen = screenName;
    document.querySelectorAll('.screen').forEach((el) => {
      el.hidden = el.dataset.screen !== screenName;
    });
    $('back-btn').hidden = screenName === 'home';
    window.scrollTo(0, 0);
  }

  $('back-btn').addEventListener('click', () => {
    if (state.screen === 'task') show('category');
    else show('home');
  });

  $('brand').addEventListener('click', () => show('home'));

  // ---------- Home ----------
  function renderHome() {
    renderStreak();
    const grid = $('category-grid');
    grid.innerHTML = '';
    CATEGORIES.forEach((cat) => {
      const count = TASKS.filter((t) => t.category === cat.id).length;
      const btn = document.createElement('button');
      btn.className = 'category-card';
      btn.innerHTML = `
        <span class="category-emoji">${cat.emoji}</span>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${count} task${count === 1 ? '' : 's'}</span>`;
      btn.addEventListener('click', () => openCategory(cat.id));
      grid.appendChild(btn);
    });
  }

  // ---------- Category ----------
  function openCategory(catId) {
    state.categoryId = catId;
    const cat = CATEGORIES.find((c) => c.id === catId);
    $('category-title').textContent = `${cat.emoji} ${cat.name}`;
    const list = $('task-list');
    list.innerHTML = '';
    TASKS.filter((t) => t.category === catId).forEach((task) => {
      const diff = difficultyOf(task);
      const btn = document.createElement('button');
      btn.className = 'task-card';
      btn.innerHTML = `
        <span class="task-card-title">${task.title}</span>
        <span class="task-card-meta">
          <span class="difficulty-badge difficulty-${diff.toLowerCase()}">${diff}</span>
          <span>${task.steps.length} steps · ~${totalMinutes(task)} min</span>
        </span>`;
      btn.addEventListener('click', () => openTask(task));
      list.appendChild(btn);
    });
    show('category');
  }

  // ---------- Task detail ----------
  function openTask(task) {
    state.task = task;
    state.stepIndex = 0;
    bumpStreak(); // streak counts tasks STARTED, not completed
    renderStep();
    show('task');
  }

  function renderStep() {
    const task = state.task;
    const i = state.stepIndex;
    const step = task.steps[i];
    $('task-title').textContent = task.title;
    $('progress-text').textContent = `Step ${i + 1} of ${task.steps.length}`;
    $('progress-fill').style.width = `${((i + 1) / task.steps.length) * 100}%`;
    $('step-text').textContent = step.varies
      ? `${step.text} (actual time varies — the timer is just a nudge)`
      : step.text;
    $('step-motivation').textContent = `"${step.motivation}"`;
    loadStepTimer(step.seconds);
    $('next-btn').textContent =
      i === task.steps.length - 1 ? 'Finish 🎉' : 'Next step →';
  }

  function advanceStep() {
    if (state.stepIndex < state.task.steps.length - 1) {
      state.stepIndex += 1;
      renderStep();
    } else {
      show('done');
      launchConfetti();
    }
  }

  // ---------- Confetti (emoji pieces falling, dashboard pattern) ----------
  const CONFETTI_EMOJI = ['🎉', '✨', '🌟', '💜', '⭐', '🎊'];

  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = $('confetti');
    container.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.textContent = CONFETTI_EMOJI[Math.floor(Math.random() * CONFETTI_EMOJI.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      container.appendChild(piece);
    }
    setTimeout(() => { container.innerHTML = ''; }, 5500);
  }

  $('next-btn').addEventListener('click', advanceStep);
  $('skip-btn').addEventListener('click', advanceStep);
  $('done-home-btn').addEventListener('click', () => show('home'));

  // ---------- Stuck ----------
  function rollStuck() {
    let i;
    do {
      i = Math.floor(Math.random() * STUCK_PHRASES.length);
    } while (i === state.lastStuckIndex && STUCK_PHRASES.length > 1);
    state.lastStuckIndex = i;
    $('stuck-phrase').textContent = STUCK_PHRASES[i];
  }

  $('stuck-btn').addEventListener('click', () => {
    rollStuck();
    show('stuck');
  });

  $('reroll-btn').addEventListener('click', rollStuck);

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* offline support unavailable; app still works */
      });
    });
  }

  // ---------- Init ----------
  renderHome();
  show('home');
})();
