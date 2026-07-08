import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import MoodQuickSelect from '../components/MoodTracker/MoodQuickSelect';
import { getDailyPrompt, createEntry, getEntries } from '../services/api';
import { scoreToCategory } from '../utils/mood';

const TIPS = [
  'Write freely — there is no wrong way to journal.',
  'Focus on how things felt, not just what happened.',
  'Even two or three sentences count as an entry.',
  'Come back to the prompt if you get stuck.',
];

const WriteJournalPage = () => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(8);
  const [energy, setEnergy] = useState(8);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getDailyPrompt().then((res) => setPrompt(res.data.prompt));
    getEntries().then((res) => setRecent(res.data.slice(0, 3)));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await createEntry({ content, mood, energy, prompt });
      setSaved(true);
      setContent('');
      getEntries().then((res) => setRecent(res.data.slice(0, 3)));
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Write Journal" subtitle="How are you feeling?">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 28 }}>
          <MoodQuickSelect value={mood} onChange={setMood} />

          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '24px 0 4px' }}>Today's prompt</p>
          <h3 style={{ margin: '0 0 16px' }}>{prompt || 'What is on your mind today?'}</h3>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your thoughts..."
            rows={14}
            maxLength={2000}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              resize: 'vertical',
            }}
          />

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Energy level ({energy}/10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {content.length}/2000 words {saved && ' · ✓ Saved'}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 20,
                padding: '11px 28px',
                fontSize: 14.5,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Journal'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 12px' }}>Writing tips</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIPS.map((tip) => (
                <p key={tip} style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                  <span>💡</span> {tip}
                </p>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 12px' }}>Recent entries</h4>
            {recent.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recent.map((e) => {
                  const cat = scoreToCategory(e.mood);
                  return (
                    <div key={e._id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 12 }}>{cat.emoji}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>
                        {e.content.slice(0, 60)}{e.content.length > 60 ? '...' : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)' }}>Your entries will show up here.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WriteJournalPage;
