import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getEntries, downloadJsonExport, downloadPdfExport } from '../services/api';

const MENU_ITEMS = [
  { label: 'Export My Data', action: 'export' },
  { label: 'Change Password', action: null },
  { label: 'Privacy & Security', action: null },
  { label: 'Delete Account', action: null, danger: true },
];

const ProfilePage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => { getEntries().then((res) => setEntries(res.data)); }, []);

  const streak = (() => {
    if (!entries.length) return 0;
    const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
    let s = 0;
    let cursor = new Date();
    while (days.has(cursor.toDateString())) { s += 1; cursor.setDate(cursor.getDate() - 1); }
    return s;
  })();

  return (
    <AppLayout title="Profile" subtitle="Your account and preferences.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, maxWidth: 780 }}>
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-soft)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {user?.name?.[0]?.toUpperCase() || '🙂'}
          </div>
          <h3 style={{ margin: 0 }}>{user?.name}</h3>
          <p style={{ margin: '2px 0 10px', color: 'var(--text-secondary)', fontSize: 13.5 }}>{user?.email}</p>
          <span style={{ fontSize: 12, background: user?.isPremium ? 'var(--accent-soft)' : 'var(--border)', color: user?.isPremium ? 'var(--accent)' : 'var(--text-secondary)', padding: '4px 12px', borderRadius: 12 }}>
            {user?.isPremium ? '★ Premium' : 'Free plan'}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{entries.length}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Journals</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{streak}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Streak</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 8 }}>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.action === 'export') downloadJsonExport();
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '16px 18px',
                fontSize: 14.5,
                color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {item.label} <span>›</span>
            </button>
          ))}
          <div style={{ padding: '16px 18px', display: 'flex', gap: 10 }}>
            <button onClick={downloadJsonExport} style={smallBtn}>Export JSON</button>
            <button onClick={downloadPdfExport} style={smallBtn}>Export PDF</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const smallBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, padding: '8px 16px', fontSize: 13 };

export default ProfilePage;
