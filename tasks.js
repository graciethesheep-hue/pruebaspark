// Spark task library data.
// Session 1: seed subset (one task per category) so screens can render.
// Session 4 will load the full 24-task library from the blueprint (§7).
// Difficulty is NOT stored here — it is computed by the formula in app.js (§7a).

const CATEGORIES = [
  { id: 'writing',   name: 'Writing & Communication', emoji: '✍️' },
  { id: 'health',    name: 'Health & Self-Care',      emoji: '🫧' },
  { id: 'home',      name: 'Home & Organization',     emoji: '🏠' },
  { id: 'work',      name: 'Work & Productivity',     emoji: '💼' },
  { id: 'finance',   name: 'Finance & Admin',         emoji: '💳' },
  { id: 'dashboard', name: 'Dashboard Check-ins',     emoji: '📋' },
];

const TASKS = [
  {
    title: 'Write Email',
    category: 'writing',
    steps: [
      { text: "Open your email app and type the recipient's name", seconds: 60, motivation: "Starting is the hardest part — you're already doing it." },
      { text: 'Write the subject line', seconds: 120, motivation: "Doesn't need to be perfect. Just needs to exist." },
      { text: 'Write a short opening line', seconds: 60, motivation: 'One sentence is enough to keep going.' },
      { text: 'Write the main message', seconds: 300, motivation: 'Halfway there. Keep the momentum.' },
      { text: 'Proofread quickly and hit send', seconds: 120, motivation: 'Last one — finish strong.' },
    ],
  },
  {
    title: 'Take Medication',
    category: 'health',
    steps: [
      { text: 'Go to where you keep your medication', seconds: 30, motivation: "You're already moving. That's the win." },
      { text: 'Take the dose with water', seconds: 30, motivation: 'Future-you is thanking you right now.' },
      { text: 'Log it or check it off', seconds: 30, motivation: 'Small action, real care.' },
    ],
  },
  {
    title: 'Make Bed',
    category: 'home',
    steps: [
      { text: 'Pull the sheet and blanket up straight', seconds: 60, motivation: 'One motion. Already halfway done.' },
      { text: 'Fluff or place the pillows', seconds: 30, motivation: 'Look at that — it already looks intentional.' },
      { text: 'Smooth the top layer', seconds: 30, motivation: 'Done. Your room already feels calmer.' },
    ],
  },
  {
    title: 'Start Work Session',
    category: 'work',
    steps: [
      { text: 'Sit at your workspace, nothing else', seconds: 60, motivation: "You're in position. That's the real first step." },
      { text: 'Open the one file or tool you need first', seconds: 60, motivation: "You don't need the whole plan — just the first thing." },
      { text: 'Set a timer for a focused stretch (15–25 min)', seconds: 30, motivation: "The timer is holding the pressure so you don't have to." },
      { text: 'Do the very first tiny action on the task', seconds: 300, motivation: "You're in motion now — that's the part that was hard." },
    ],
  },
  {
    title: 'Pay a Bill',
    category: 'finance',
    steps: [
      { text: 'Find the bill or open the account/app', seconds: 120, motivation: 'Finding it is often the actual hard part — you just did it.' },
      { text: 'Confirm the amount and due date', seconds: 60, motivation: 'Confirming it now prevents a bigger stress later.' },
      { text: 'Enter payment details or click pay', seconds: 120, motivation: 'Almost done — just a couple more taps.' },
      { text: 'Save or screenshot the confirmation', seconds: 60, motivation: 'Handled. One less thing weighing on you.' },
    ],
  },
  {
    title: 'Set Up Today',
    category: 'dashboard',
    steps: [
      { text: 'Open your ADHD Life Planner dashboard', seconds: 30, motivation: 'Just opening it is the whole first step.' },
      { text: 'Check off anything from yesterday you actually finished', seconds: 120, motivation: 'Progress you forgot to celebrate still counts.' },
      { text: 'Pick your top 3 priorities for today', seconds: 120, motivation: "Three is enough. You don't need a ten-item list." },
      { text: "Glance at your habit tracker and mark what's already done", seconds: 60, motivation: 'Even one checkmark builds the pattern.' },
    ],
  },
];

const STUCK_PHRASES = [
  "Open your email app and just look at the inbox. That's it.",
  'Fill one glass of water and drink 3 sips.',
  'Pick up one item off the floor and put it where it belongs.',
  "Open your to-do list. You don't have to do anything on it yet.",
  'Stand up, stretch your arms overhead, and take 3 slow breaths.',
  "Open one drawer or bag you've been avoiding — just look inside.",
  "Text one person 'hey' — nothing more required.",
  'Set a 2-minute timer and just sit with your task open.',
  "Move one thing from your 'to-do' pile to your desk.",
  "Open the app for the thing you're dreading — you don't have to use it yet.",
  'Write down the very first word of what you need to write.',
  "Put on shoes. That's the whole task right now.",
];
