// GitHub-style contribution heatmap of the last ~16 weeks of journaling activity
const WEEKS_TO_SHOW = 16;

const CalendarHeatmap = ({ entries }) => {
  const countByDay = {};
  entries.forEach((e) => {
    const key = new Date(e.date).toDateString();
    countByDay[key] = (countByDay[key] || 0) + 1;
  });

  const today = new Date();
  const days = [];
  for (let i = WEEKS_TO_SHOW * 7 - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  // Group into columns of 7 (weeks)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const colorFor = (count) => {
    if (!count) return 'var(--border)';
    if (count === 1) return 'var(--accent-soft)';
    if (count === 2) return 'var(--accent-lavender)';
    return 'var(--accent)';
  };

  return (
    <div style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: '4px 0' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map((day, di) => {
            const count = countByDay[day.toDateString()] || 0;
            return (
              <div
                key={di}
                title={`${day.toLocaleDateString()}: ${count} entr${count === 1 ? 'y' : 'ies'}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: colorFor(count),
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CalendarHeatmap;
