import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import MoodQuickSelect from '../components/MoodTracker/MoodQuickSelect';
import StatCard from '../components/shared/StatCard';
import MoodLineChart from '../components/Charts/MoodLineChart';
import MoodPieChart from '../components/Charts/MoodPieChart';
import { getEntries, getMoodHistory, getMoodDistribution } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { scoreToCategory } from '../utils/mood';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mood, setMood] = useState(8);
  const [entries, setEntries] = useState([]);
  const [history, setHistory] = useState([]);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    getEntries().then((res) => setEntries(res.data));
    getMoodHistory().then((res) => setHistory(res.data));
    getMoodDistribution().then((res) => setDistribution(res.data));
  }, []);

  const streak = (() => {
    if (!entries.length) return 0;
    const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
    let s = 0;
    let cursor = new Date();
    while (days.has(cursor.toDateString())) { s += 1; cursor.setDate(cursor.getDate() - 1); }
    return s;
  })();

  const mostCommon = (() => {
    if (!distribution.length) return null;
    const top = distribution.reduce((a, b) => (b.count > a.count ? b : a));
    return scoreToCategory(top._id);
  })();

  return (
    <AppLayout title={`Good morning, ${user?.name?.split(' ')[0] || 'there'}! ☀️`} subtitle="How are you feeling today?">
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-elevated))',
        }}
      >
        <MoodQuickSelect value={mood} onChange={setMood} />
        <button onClick={() => navigate('/journal')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '11px 24px', fontSize: 14.5, whiteSpace: 'nowrap' }}>
          Write Journal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 8px' }}>Today's Journal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Take a moment to write about your thoughts and feelings.</p>
          </div>
          <button onClick={() => navigate('/journal')} style={{ alignSelf: 'flex-start', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '9px 20px', fontSize: 14 }}>
            Write Now
          </button>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}>Weekly Overview</h3>
          {history.length > 0 ? <MoodLineChart entries={history.slice(-7)} /> : <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>Log entries to see your week.</p>}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}>Mood Distribution</h3>
          {distribution.length > 0 ? <MoodPieChart distribution={distribution} /> : <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>No data yet.</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard icon="📓" label="Journal Entries" value={entries.length} sublabel="This week" />
        <StatCard icon="🔥" label="Current Streak" value={`${streak} Days`} accent="#FFF1E4" />
        <StatCard icon="🙂" label="Most Common Mood" value={mostCommon?.label || '—'} sublabel={mostCommon ? `${mostCommon.emoji} feeling` : ''} accent="#E9FBEF" />

        <div className="card" style={{ padding: 20, background: 'var(--accent)', color: 'white', flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <strong>👑 Unlock Premium</strong>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>Get advanced insights, unlimited journals and more.</p>
          <button onClick={() => navigate('/premium')} style={{ alignSelf: 'flex-start', background: 'white', color: 'var(--accent)', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 13, fontWeight: 600 }}>
            Go Premium
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Recent Journals</h3>
            <button onClick={() => navigate('/journals')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13 }}>View All</button>
          </div>
          {entries.slice(0, 3).map((e) => {
            const cat = scoreToCategory(e.mood);
            return (
              <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14 }}>{e.content.slice(0, 40)}{e.content.length > 40 ? '...' : ''}</span>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, background: 'var(--accent-soft)', color: cat.color }}>{cat.emoji} {cat.label}</span>
              </div>
            );
          })}
          {entries.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>No journal entries yet.</p>}
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Quick Actions</h3>
          <QuickAction icon="🌬️" label="Breathing Exercise" onClick={() => navigate('/breathe')} />
          <QuickAction icon="📅" label="View Calendar" onClick={() => navigate('/calendar')} />
          <QuickAction icon="⬇️" label="Export My Data" onClick={() => navigate('/profile')} />
        </div>
      </div>
    </AppLayout>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)' }}>
    <span>{icon}</span> {label}
  </button>
);

export default DashboardPage;
