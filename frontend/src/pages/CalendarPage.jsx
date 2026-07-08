import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { getEntries } from '../services/api';
import { scoreToCategory, MOOD_CATEGORIES } from '../utils/mood';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarPage = () => {
  const [entries, setEntries] = useState([]);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { getEntries().then((res) => setEntries(res.data)); }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const entryByDate = {};
  entries.forEach((e) => {
    const key = new Date(e.date).toDateString();
    if (!entryByDate[key]) entryByDate[key] = [];
    entryByDate[key].push(e);
  });

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => setCursor(new Date(year, month + delta, 1));

  const selectedEntries = selectedDay ? entryByDate[new Date(year, month, selectedDay).toDateString()] : null;

  return (
    <AppLayout title="Calendar" subtitle="See your mood history at a glance.">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => changeMonth(-1)} style={arrowBtn}>←</button>
            <h3 style={{ margin: 0 }}>{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} style={arrowBtn}>→</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateKey = new Date(year, month, day).toDateString();
              const dayEntries = entryByDate[dateKey];
              const cat = dayEntries ? scoreToCategory(dayEntries[0].mood) : null;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    fontSize: 13,
                    color: 'var(--text-primary)',
                  }}
                >
                  {day}
                  {cat && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>
            {selectedDay ? new Date(year, month, selectedDay).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a day'}
          </h3>
          {selectedEntries ? (
            selectedEntries.map((e) => {
              const cat = scoreToCategory(e.mood);
              return (
                <div key={e._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, background: 'var(--accent-soft)', color: cat.color }}>{cat.emoji} {cat.label}</span>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-primary)', fontSize: 14 }}>{e.content}</p>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Click a highlighted day to see what you wrote.</p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
            {MOOD_CATEGORIES.map((c) => (
              <span key={c.label} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} /> {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const arrowBtn = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' };

export default CalendarPage;
