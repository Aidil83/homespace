// Paste this into the browser console at localhost:3000/gym
// Creates ~3 weeks of realistic beginner gym data with gradual progression

const s = (w, r) => ({ weight: w, reps: r, completed: true });
const ex = (name, sets) => ({ exerciseName: name, sets });

const logs = {
  // === PULL SESSIONS ===
  "2026-01-25": [
    ex("Deadlift",        [s(135, 6), s(135, 5)]),
    ex("Barbell Rows",    [s(95, 8),  s(95, 7)]),
    ex("Lat Pulldown",    [s(90, 10), s(90, 9)]),
    ex("Face Pulls",      [s(25, 15), s(25, 12)]),
    ex("Barbell Curls",   [s(55, 10), s(55, 9)]),
    ex("Hammer Curls",    [s(20, 10), s(20, 9)]),
  ],
  "2026-01-29": [
    ex("Deadlift",        [s(135, 6), s(135, 6)]),
    ex("Barbell Rows",    [s(95, 8),  s(95, 8)]),
    ex("Lat Pulldown",    [s(90, 11), s(90, 10)]),
    ex("Face Pulls",      [s(25, 15), s(25, 13)]),
    ex("Barbell Curls",   [s(55, 11), s(55, 10)]),
    ex("Hammer Curls",    [s(20, 11), s(20, 10)]),
  ],
  "2026-02-01": [
    ex("Deadlift",        [s(145, 6), s(145, 5)]),
    ex("Barbell Rows",    [s(95, 8),  s(95, 8)]),
    ex("Lat Pulldown",    [s(95, 10), s(95, 9)]),
    ex("Face Pulls",      [s(30, 12), s(30, 11)]),
    ex("Barbell Curls",   [s(55, 12), s(55, 10)]),
    ex("Hammer Curls",    [s(20, 12), s(20, 10)]),
  ],
  "2026-02-05": [
    ex("Deadlift",        [s(155, 5), s(155, 5)]),
    ex("Barbell Rows",    [s(105, 7), s(105, 6)]),
    ex("Lat Pulldown",    [s(95, 11), s(95, 10)]),
    ex("Face Pulls",      [s(30, 13), s(30, 12)]),
    ex("Barbell Curls",   [s(65, 8),  s(65, 7)]),
    ex("Hammer Curls",    [s(25, 10), s(25, 8)]),
  ],
  "2026-02-08": [
    ex("Deadlift",        [s(155, 6), s(155, 5)]),
    ex("Barbell Rows",    [s(105, 8), s(105, 7)]),
    ex("Lat Pulldown",    [s(100, 10), s(100, 9)]),
    ex("Face Pulls",      [s(30, 14), s(30, 12)]),
    ex("Barbell Curls",   [s(65, 10), s(65, 8)]),
    ex("Hammer Curls",    [s(25, 10), s(25, 9)]),
  ],
  "2026-02-12": [
    ex("Deadlift",        [s(165, 5), s(165, 5)]),
    ex("Barbell Rows",    [s(115, 7), s(115, 6)]),
    ex("Lat Pulldown",    [s(100, 11), s(100, 10)]),
    ex("Face Pulls",      [s(30, 15), s(30, 13)]),
    ex("Barbell Curls",   [s(65, 10), s(65, 9)]),
    ex("Hammer Curls",    [s(25, 11), s(25, 10)]),
  ],

  // === PUSH SESSIONS ===
  "2026-01-28": [
    ex("Bench Press",     [s(115, 8), s(115, 7)]),
    ex("Overhead Press",  [s(65, 10), s(65, 8)]),
    ex("Lateral Raises",  [s(15, 15), s(15, 12)]),
    ex("Tricep Pushdowns",[s(40, 12), s(40, 10)]),
  ],
  "2026-01-31": [
    ex("Bench Press",     [s(115, 8), s(115, 8)]),
    ex("Overhead Press",  [s(65, 10), s(65, 9)]),
    ex("Lateral Raises",  [s(15, 15), s(15, 13)]),
    ex("Tricep Pushdowns",[s(40, 12), s(40, 11)]),
  ],
  "2026-02-04": [
    ex("Bench Press",     [s(125, 7), s(125, 6)]),
    ex("Overhead Press",  [s(75, 8),  s(75, 7)]),
    ex("Lateral Raises",  [s(15, 15), s(15, 14)]),
    ex("Tricep Pushdowns",[s(45, 10), s(45, 9)]),
  ],
  "2026-02-07": [
    ex("Bench Press",     [s(125, 8), s(125, 7)]),
    ex("Overhead Press",  [s(75, 9),  s(75, 8)]),
    ex("Lateral Raises",  [s(20, 12), s(20, 10)]),
    ex("Tricep Pushdowns",[s(45, 11), s(45, 10)]),
  ],
  "2026-02-11": [
    ex("Bench Press",     [s(125, 8), s(125, 8)]),
    ex("Overhead Press",  [s(75, 10), s(75, 9)]),
    ex("Lateral Raises",  [s(20, 13), s(20, 11)]),
    ex("Tricep Pushdowns",[s(45, 12), s(45, 10)]),
  ],
  "2026-02-14": [
    ex("Bench Press",     [s(135, 6), s(135, 5)]),
    ex("Overhead Press",  [s(75, 10), s(75, 10)]),
    ex("Lateral Raises",  [s(20, 14), s(20, 12)]),
    ex("Tricep Pushdowns",[s(45, 12), s(45, 11)]),
  ],

  // === LEGS SESSIONS ===
  "2026-01-26": [
    ex("Squats",           [s(135, 8), s(135, 7)]),
    ex("Romanian Deadlift",[s(95, 10), s(95, 8)]),
    ex("Leg Press",        [s(180, 12), s(180, 10)]),
    ex("Leg Curls",        [s(60, 12), s(60, 10)]),
    ex("Leg Extensions",   [s(60, 12), s(60, 10)]),
    ex("Calf Raises",      [s(100, 15), s(100, 12)]),
  ],
  "2026-01-30": [
    ex("Squats",           [s(135, 8), s(135, 8)]),
    ex("Romanian Deadlift",[s(95, 10), s(95, 9)]),
    ex("Leg Press",        [s(180, 12), s(180, 11)]),
    ex("Leg Curls",        [s(60, 12), s(60, 11)]),
    ex("Leg Extensions",   [s(60, 12), s(60, 11)]),
    ex("Calf Raises",      [s(100, 15), s(100, 13)]),
  ],
  "2026-02-02": [
    ex("Squats",           [s(145, 7), s(145, 6)]),
    ex("Romanian Deadlift",[s(105, 9), s(105, 8)]),
    ex("Leg Press",        [s(200, 10), s(200, 9)]),
    ex("Leg Curls",        [s(65, 11), s(65, 10)]),
    ex("Leg Extensions",   [s(65, 11), s(65, 10)]),
    ex("Calf Raises",      [s(110, 14), s(110, 12)]),
  ],
  "2026-02-06": [
    ex("Squats",           [s(145, 8), s(145, 7)]),
    ex("Romanian Deadlift",[s(105, 10), s(105, 9)]),
    ex("Leg Press",        [s(200, 11), s(200, 10)]),
    ex("Leg Curls",        [s(65, 12), s(65, 10)]),
    ex("Leg Extensions",   [s(65, 12), s(65, 10)]),
    ex("Calf Raises",      [s(110, 15), s(110, 13)]),
  ],
  "2026-02-09": [
    ex("Squats",           [s(155, 6), s(155, 6)]),
    ex("Romanian Deadlift",[s(115, 8), s(115, 7)]),
    ex("Leg Press",        [s(210, 10), s(210, 9)]),
    ex("Leg Curls",        [s(70, 10), s(70, 9)]),
    ex("Leg Extensions",   [s(70, 10), s(70, 9)]),
    ex("Calf Raises",      [s(115, 14), s(115, 12)]),
  ],
  "2026-02-13": [
    ex("Squats",           [s(155, 7), s(155, 6)]),
    ex("Romanian Deadlift",[s(115, 9), s(115, 8)]),
    ex("Leg Press",        [s(220, 10), s(220, 9)]),
    ex("Leg Curls",        [s(70, 11), s(70, 10)]),
    ex("Leg Extensions",   [s(70, 11), s(70, 10)]),
    ex("Calf Raises",      [s(120, 13), s(120, 12)]),
  ],
};

const attendance = Object.keys(logs);

const goals = {
  "Bench Press": { target1RM: 225 },
  "Squats": { target1RM: 275 },
  "Deadlift": { target1RM: 315 },
};

const data = { attendance, logs, goals };
localStorage.setItem("homespace-gym", JSON.stringify(data));
console.log(`Seeded ${attendance.length} workout sessions with goals.`);
console.log("Refresh the page to see the data.");
