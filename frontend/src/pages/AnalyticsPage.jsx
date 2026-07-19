import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import MoodLineChart from '../components/Charts/MoodLineChart';
import MoodPieChart from '../components/Charts/MoodPieChart';
import { getMoodHistory, getMoodDistribution, getMoodInsights, downloadJsonExport, downloadPdfExport, getEntries } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Overview', 'Weekly', 'Monthly', 'Yearly'];

const AnalyticsPage = () => {
  const [tab, setTab] = useState('Overview');
  const [history, setHistory] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsMsg, setInsightsMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getMoodHistory().then((res) => setHistory(res.data));
    getMoodDistribution().then((res) => setDistribution(res.data));
    getEntries().then((res) => setEntries(res.data));
    getMoodInsights().then((res) => {
      setInsights(res.data.insights || []);
      setInsightsMsg(res.data.message || '');
    });
  }, []);

  const streak = (() => {
    if (!entries.length) return 0;
    const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
    let s = 0;
    let cursor = new Date();
    while (days.has(cursor.toDateString())) { s += 1; cursor.setDate(cursor.getDate() - 1); }
    return s;
  })();

  return (
    <AppLayout title="Mood Analytics" subtitle="Understand your emotional patterns over time.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px',
              borderRadius: 16,
              border: 'none',
              background: tab === t ? 'var(--accent)' : 'var(--bg-elevated)',
              color: tab === t ? 'white' : 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Mood Trend {tab !== 'Overview' ? `(${tab})` : ''}</h3>
          {history.length > 0 ? <MoodLineChart entries={history} /> : <p style={{ color: 'var(--text-secondary)' }}>Log a few entries to see trends here.</p>}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Mood Distribution</h3>
          {distribution.length > 0 ? <MoodPieChart distribution={distribution} /> : <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 30 }}>🔥</span>
          <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{streak} Days</p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>Mood streak - keep it up!</p>
          </div>
        </div>

        {!user?.isPremium && (
          <div className="card" style={{ padding: 24, border: '1px dashed var(--accent-lavender)' }}>
            <h4 style={{ margin: '0 0 4px' }}>Unlock advanced analytics</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
              Weekly/monthly averages and unlimited historical search are part of MindWell Premium.
            </p>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>✨ Mood Insights</h3>
        {insights.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((text, i) => (
              <p key={i} style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--accent-soft)', borderRadius: 10 }}>
                {text}
              </p>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>{insightsMsg || 'Log a few more entries to unlock insights.'}</p>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Export your data</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Download everything you've written, decrypted and readable, at any time.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={downloadJsonExport} style={exportBtn}>Download JSON</button>
          <button onClick={downloadPdfExport} style={exportBtn}>Download PDF</button>
        </div>
      </div>
    </AppLayout>
  );
};

const exportBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14 };

export default AnalyticsPage;
