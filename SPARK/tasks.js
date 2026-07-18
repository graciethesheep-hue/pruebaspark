// Spark task library — full content per blueprint §7 (Session 4).
// Difficulty is NOT stored here — it is computed by the formula in app.js (§7a).
// emotionalWeight bumps difficulty one level (Make Phone Call, Doctor Appointment).

const CATEGORIES = [
  { id: 'writing',   name: 'Writing & Communication', emoji: '✍️' },
  { id: 'health',    name: 'Health & Self-Care',      emoji: '🫧' },
  { id: 'home',      name: 'Home & Organization',     emoji: '🏠' },
  { id: 'work',      name: 'Work & Productivity',     emoji: '💼' },
  { id: 'finance',   name: 'Finance & Admin',         emoji: '💳' },
  { id: 'dashboard', name: 'Dashboard Check-ins',     emoji: '📋' },
];

const TASKS = [
  // ---------- Writing & Communication ----------
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
    title: 'Make Phone Call',
    category: 'writing',
    emotionalWeight: true,
    steps: [
      { text: 'Write down what you need to say, even just bullet points', seconds: 180, motivation: "You don't have to remember it — you just wrote it down." },
      { text: 'Find the phone number', seconds: 60, motivation: 'Small step. Still counts.' },
      { text: 'Take 3 deep breaths', seconds: 60, motivation: 'Your nervous system just needs a second. Take it.' },
      { text: 'Dial the number', seconds: 30, motivation: "The scariest part is right now — and it's almost over." },
      { text: 'Say your first line out loud', seconds: 30, motivation: "You already know what to say. It's written down." },
      { text: 'Continue the conversation', seconds: 120, motivation: "You're doing the actual hard thing. That's real progress." },
      { text: 'Say goodbye and hang up', seconds: 30, motivation: 'Done. You did the thing you were avoiding.' },
    ],
  },
  {
    title: "Reply to a Text You've Been Avoiding",
    category: 'writing',
    steps: [
      { text: 'Open the conversation and reread the last message', seconds: 60, motivation: "You're not obligated to have the perfect reply — just a reply." },
      { text: 'Type one honest sentence', seconds: 120, motivation: 'Short and real beats long and perfect.' },
      { text: 'Send it', seconds: 30, motivation: "That's it. It's off your chest and off your plate." },
    ],
  },

  // ---------- Health & Self-Care ----------
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
    title: 'Drink Water (Reminder)',
    category: 'health',
    steps: [
      { text: 'Get up and fill a glass or bottle', seconds: 30, motivation: 'Your body will feel this in ten minutes.' },
      { text: 'Drink at least half of it now', seconds: 30, motivation: 'That counts as taking care of yourself.' },
    ],
  },
  {
    title: 'Take a Shower',
    category: 'health',
    steps: [
      { text: 'Walk to the bathroom', seconds: 30, motivation: "You don't have to feel ready. Just go." },
      { text: 'Turn on the water and let it warm up', seconds: 60, motivation: "You're already closer than you were a minute ago." },
      { text: 'Get in', seconds: 30, motivation: 'The hardest transition is behind you now.' },
      { text: 'Wash your hair', seconds: 180, motivation: "One step at a time — this one's easy." },
      { text: 'Wash your body', seconds: 180, motivation: 'Almost there. Keep going.' },
      { text: 'Get out, dry off, get dressed', seconds: 420, motivation: 'You did something your body needed. That matters.' },
    ],
  },
  {
    title: 'Go to a Doctor Appointment',
    category: 'health',
    emotionalWeight: true,
    steps: [
      { text: 'Confirm the date, time, and location', seconds: 120, motivation: 'Confirming it makes it real and doable, not just looming.' },
      { text: 'Write down 1-3 things you want to mention', seconds: 300, motivation: "You won't have to remember it under pressure — it's already written." },
      { text: 'Get dressed and gather what you need', seconds: 600, motivation: 'Getting ready is its own small win.' },
      { text: 'Leave with enough time to arrive early', seconds: 60, varies: true, motivation: "You're already on your way. That's the hard part done." },
      { text: 'Check in at the front desk', seconds: 120, motivation: "You showed up. That's what mattered most today." },
    ],
  },

  // ---------- Home & Organization ----------
  {
    title: 'Clean Kitchen',
    category: 'home',
    steps: [
      { text: 'Throw away obvious trash from counters', seconds: 120, motivation: 'You just changed the room without even really starting.' },
      { text: 'Load the dishwasher or start a sink of soapy water', seconds: 180, motivation: 'Momentum is building. Keep it going.' },
      { text: 'Wash or load the remaining dishes', seconds: 600, motivation: "You don't have to finish fast — just keep moving." },
      { text: 'Wipe down counters', seconds: 180, motivation: "Look at that — it's already looking different." },
      { text: 'Sweep the floor', seconds: 300, motivation: 'Almost a whole clean kitchen. Keep going.' },
      { text: 'Take out the trash if full', seconds: 120, motivation: "Last step. You're finishing what you started." },
    ],
  },
  {
    title: 'Do Laundry',
    category: 'home',
    steps: [
      { text: 'Gather dirty clothes into one pile or basket', seconds: 180, motivation: 'Gathering it is 80% of starting this task.' },
      { text: 'Sort lights and darks if needed', seconds: 120, motivation: 'Small decision, real progress.' },
      { text: 'Load the washer and start it', seconds: 120, motivation: 'The machine does the actual work from here.' },
      { text: 'Move to dryer when done', seconds: 120, motivation: "You remembered. That's the executive-function win right there." },
      { text: 'Fold or hang at least some of it', seconds: 600, motivation: 'Even half-folded counts as done enough.' },
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
    title: 'Organize Desk',
    category: 'home',
    steps: [
      { text: "Clear everything that doesn't belong into one pile", seconds: 180, motivation: "You don't have to sort it yet — just clear the surface." },
      { text: 'Throw away obvious trash', seconds: 120, motivation: 'Instant progress, zero decisions needed.' },
      { text: 'Group similar items together', seconds: 300, motivation: "You're creating order without needing a perfect system." },
      { text: 'Put items back in their place', seconds: 180, motivation: 'Each thing you place is one less thing pulling at your attention.' },
      { text: 'Wipe the surface down', seconds: 120, motivation: 'A clear desk, and you built it one small step at a time.' },
    ],
  },

  // ---------- Work & Productivity ----------
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
    title: 'Prepare for Meeting',
    category: 'work',
    steps: [
      { text: 'Check the meeting time and platform/link', seconds: 60, motivation: 'Confirming it removes one thing from your mental load.' },
      { text: 'Skim the agenda or last notes if there are any', seconds: 300, motivation: "You don't need to memorize it — just refresh your memory." },
      { text: 'Write down 1-2 things you want to say or ask', seconds: 300, motivation: "Having it written means you won't blank in the moment." },
      { text: 'Close distracting tabs/apps', seconds: 120, motivation: "You're clearing space to actually be present." },
      { text: 'Join a few minutes early', seconds: 120, motivation: "You showed up prepared. That's more than most people do." },
    ],
  },
  {
    title: 'Complete Assignment',
    category: 'work',
    steps: [
      { text: 'Reread the instructions once, fully', seconds: 300, motivation: 'Understanding it fully now saves you from redoing it later.' },
      { text: 'Write down the smallest possible first section to tackle', seconds: 120, motivation: 'You just made this task 10x more doable.' },
      { text: 'Do that one small section only', seconds: 900, motivation: "You're actually doing it. Right now." },
      { text: 'Take a short break', seconds: 300, motivation: 'Rest is part of doing this well, not a distraction from it.' },
      { text: 'Do the next section', seconds: 900, motivation: 'Every section done is proof you can keep going.' },
      { text: 'Review and submit', seconds: 300, motivation: 'You finished something that felt impossible earlier today.' },
    ],
  },

  // ---------- Finance & Admin ----------
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

  // ---------- Dashboard Check-ins ----------
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
  {
    title: 'Check Your Budget',
    category: 'dashboard',
    steps: [
      { text: 'Open the Budget section of your dashboard', seconds: 30, motivation: "You don't need to fix anything yet — just look." },
      { text: 'Confirm your income is up to date for this period', seconds: 120, motivation: "Knowing what's actually coming in makes everything else easier to plan." },
      { text: 'Look at your Safe-to-Spend number', seconds: 60, motivation: "One number. That's all you need right now." },
      { text: "Add any purchases from the last few days you haven't logged", seconds: 300, motivation: 'Catching up counts the same as staying current.' },
      { text: 'Check if any bills are due this week', seconds: 180, motivation: 'Knowing now is easier than finding out late.' },
      { text: 'Close it — no changes required beyond this', seconds: 30, motivation: "You checked in. That's the whole win today." },
    ],
  },
  {
    title: 'Review Your Time Blocks',
    category: 'dashboard',
    steps: [
      { text: "Open today's Daily view", seconds: 30, motivation: 'Seeing the shape of your day reduces the dread of it.' },
      { text: "Look at what's already scheduled", seconds: 120, motivation: "You're not planning from scratch — most of it's already there." },
      { text: "Block 15-30 minutes for the one thing you're avoiding most", seconds: 180, motivation: 'Giving it a time slot makes it smaller.' },
      { text: 'Add a buffer block after anything stressful', seconds: 120, motivation: 'Future-you will thank present-you for this.' },
    ],
  },
  {
    title: 'Plan Meals for the Week',
    category: 'dashboard',
    steps: [
      { text: 'Open the Meal Planner section', seconds: 30, motivation: "You don't need a full plan — just a start." },
      { text: 'Write down 3 meals you already know you like and can make easily', seconds: 300, motivation: "Repeats are allowed. Variety isn't required to eat well." },
      { text: 'Check what you already have at home', seconds: 180, motivation: 'You might already be closer to done than you think.' },
      { text: "Fill remaining meal slots, even with 'leftovers' or 'eat out'", seconds: 180, motivation: "An honest plan beats an ambitious one you won't follow." },
      { text: 'Move meals to your grocery list', seconds: 120, motivation: 'One tap and the hard part is already connected.' },
      { text: 'Close the planner', seconds: 30, motivation: "Done. Future-you already knows what's for dinner." },
    ],
  },
  {
    title: 'Build Your Grocery List',
    category: 'dashboard',
    steps: [
      { text: 'Open the Grocery List, linked from your Meal Planner', seconds: 30, motivation: "It's mostly already built for you." },
      { text: "Add anything missing for this week's meals", seconds: 180, motivation: 'Small additions, not a big decision.' },
      { text: "Walk through your kitchen and add anything you're low on", seconds: 240, motivation: "You're preventing a future emergency store run." },
      { text: 'Mark the list ready to shop', seconds: 30, motivation: "That's it. Tomorrow-you has one less thing to figure out." },
    ],
  },
  {
    title: 'Check Your Calendar',
    category: 'dashboard',
    steps: [
      { text: 'Open your Calendar view', seconds: 30, motivation: 'Just looking removes the fear of the unknown.' },
      { text: 'Scan the next 3 days for anything you need to prepare for', seconds: 120, motivation: 'Knowing early means you get to prepare, not scramble.' },
      { text: 'Add any missing appointment or deadline you just remembered', seconds: 90, motivation: 'Getting it out of your head and onto the page is real relief.' },
    ],
  },
  {
    title: 'Log a Habit or Micro-Commitment',
    category: 'dashboard',
    steps: [
      { text: 'Open your Habit Tracker', seconds: 30, motivation: "You're already showing up by opening this." },
      { text: "Mark today's habits — even partially done counts", seconds: 90, motivation: 'A missed day resets nothing. Every check-off counts forever.' },
      { text: "If today's too much, log just your 2-minute micro-commitment instead", seconds: 60, motivation: 'A tiny version of the habit still builds the habit.' },
    ],
  },
  {
    title: 'Do Your Weekly Reset',
    category: 'dashboard',
    steps: [
      { text: "Open your dashboard's Weekly view", seconds: 30, motivation: "One section at a time. You don't have to see it all at once." },
      { text: 'Review what got done this week', seconds: 180, motivation: 'You did more than the stuck moments made it feel like.' },
      { text: 'Move any unfinished tasks to next week', seconds: 180, motivation: "Carrying it forward isn't failure — it's normal planning." },
      { text: "Check your budget's weekly total against Safe-to-Spend", seconds: 300, motivation: 'One honest look now avoids a bigger surprise later.' },
      { text: 'Glance at your habit heatmap for the week', seconds: 120, motivation: "Look at all that green. That's real, even on hard weeks." },
      { text: 'Set your top 3 priorities for next week', seconds: 300, motivation: "You're not starting from zero — you're building on this week." },
      { text: 'Close the dashboard for the week', seconds: 30, motivation: 'Reset complete. You showed up for yourself.' },
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
