// Current streak: consecutive days up to and including today with an entry
export const getCurrentStreak = (entries) => {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
  let streak = 0;
  let cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

// Longest streak ever: longest run of consecutive calendar days with an entry, anywhere in history
export const getLongestStreak = (entries) => {
  if (!entries.length) return 0;
  const uniqueDays = [...new Set(entries.map((e) => new Date(e.date).toDateString()))]
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] - uniqueDays[i - 1] === oneDay) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
};
