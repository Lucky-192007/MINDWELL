import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import MoodQuickSelect from '../components/MoodTracker/MoodQuickSelect';
import { getDailyPrompt, createEntry } from '../services/api';

const WriteJournalPage = () => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(8);
  const [energy, setEnergy] = useState(8);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDailyPrompt().then((res) => setPrompt(res.data.prompt));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await createEntry({ content, mood, energy, prompt });
      setSaved(true);
      setContent('');
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Write Journal" subtitle="How are you feeling?">
      <div className="card" style={{ padding: 28, maxWidth: 720 }}>
        <MoodQuickSelect value={mood} onChange={setMood} />

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '24px 0 4px' }}>Today's prompt</p>
        <h3 style={{ margin: '0 0 16px' }}>{prompt || 'What is on your mind today?'}</h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your thoughts..."
          rows={10}
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
    </AppLayout>
  );
};

export default WriteJournalPage;
