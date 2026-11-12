// Daily numbers, computed from the history when the stats page opens.
// Pure: "now" comes in. Days follow the computer's local time.
const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Counts back from today, or from yesterday when today has no session yet.
function streakOf(days, now) {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function computeStats(entries, now) {
  const today = dayKey(now);
  const minutesByDay = new Map();
  const doneDays = new Set();
  let sessionsToday = 0;
  for (const e of entries) {
    const key = dayKey(e.start);
    minutesByDay.set(key, (minutesByDay.get(key) || 0) + e.minutes);
    if (e.kind !== 'focus') continue;
    doneDays.add(key);
    if (key === today) sessionsToday += 1;
  }
  const week = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    week.push({ day: dayKey(d), minutes: Math.round(minutesByDay.get(dayKey(d)) || 0) });
  }
  return {
    minutesToday: Math.round(minutesByDay.get(today) || 0),
    sessionsToday,
    streak: streakOf(doneDays, now),
    totalSessions: entries.filter((e) => e.kind === 'focus').length,
    week
  };
}
