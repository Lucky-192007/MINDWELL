// Maps the 1-10 mood scale (stored in the DB) to the 5-category system
// used throughout the UI (Great / Good / Okay / Low / Bad).

export const MOOD_CATEGORIES = [
  { label: 'Great', value: 10, emoji: '😄', color: 'var(--mood-great)' },
  { label: 'Good', value: 8, emoji: '🙂', color: 'var(--mood-good)' },
  { label: 'Okay', value: 5, emoji: '😐', color: 'var(--mood-okay)' },
  { label: 'Low', value: 3, emoji: '😔', color: 'var(--mood-low)' },
  { label: 'Bad', value: 1, emoji: '😞', color: 'var(--mood-bad)' },
];

export const scoreToCategory = (score) => {
  if (score >= 9) return MOOD_CATEGORIES[0];
  if (score >= 7) return MOOD_CATEGORIES[1];
  if (score >= 5) return MOOD_CATEGORIES[2];
  if (score >= 3) return MOOD_CATEGORIES[3];
  return MOOD_CATEGORIES[4];
};

export const moodColorHex = {
  Great: '#6C5CE7',
  Good: '#4CAF7D',
  Okay: '#F0B94C',
  Low: '#F0894C',
  Bad: '#EE5D5D',
};
