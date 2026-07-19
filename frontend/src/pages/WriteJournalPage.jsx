import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import MoodQuickSelect from '../components/MoodTracker/MoodQuickSelect';
import RichTextEditor from '../components/RichTextEditor';
import { getDailyPrompt, createEntry, getEntries, getTemplates } from '../services/api';
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
  const [editorKey, setEditorKey] = useState(0); // bump to force RichTextEditor to remount/reset

  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);

  useEffect(() => {
    getDailyPrompt().then((res) => setPrompt(res.data.prompt));
    getEntries().then((res) => setRecent(res.data.slice(0, 3)));
    getTemplates().then((res) => setTemplates(res.data));
  }, []);

  const applyTemplate = (tpl) => {
    setActiveTemplate(tpl);
    const html = tpl.questions.map((q) => `<p><strong>${q}</strong></p><p><br></p>`).join('');
    setContent(html);
    setEditorKey((k) => k + 1);
  };

  const clearTemplate = () => {
    setActiveTemplate(null);
    setContent('');
    setEditorKey((k) => k + 1);
  };

  const handleSave = async () => {
    const plainCheck = content.replace(/<[^>]*>/g, '').trim();
    if (!plainCheck) return;
    setSaving(true);
    try {
      await createEntry({ content, mood, energy, prompt: activeTemplate ? activeTemplate.name : prompt, isRichText: true });
      setSaved(true);
      setContent('');
      setActiveTemplate(null);
      setEditorKey((k) => k + 1);
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '24px 0 4px' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                {activeTemplate ? activeTemplate.name : "Today's prompt"}
              </p>
              {!activeTemplate && <h3 style={{ margin: '2px 0 0' }}>{prompt || 'What is on your mind today?'}</h3>}
            </div>
            {activeTemplate && (
              <button onClick={clearTemplate} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12.5 }}>
                Clear template
              </button>
            )}
          </div>

          <div style={{ marginTop: activeTemplate ? 10 : 16 }}>
            <RichTextEditor key={editorKey} value={content} onChange={setContent} placeholder="Write about your thoughts..." />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Energy level ({energy}/10)</label>
            <input
              type="range" min="1" max="10" value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 20, gap: 12 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{saved && '✓ Saved'}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '11px 28px', fontSize: 14.5, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Journal'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 12px' }}>Guided templates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, fontSize: 13,
                    border: activeTemplate?.id === t.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: activeTemplate?.id === t.id ? 'var(--accent-soft)' : 'transparent',
                    color: activeTemplate?.id === t.id ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

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
                  const plain = e.content.replace(/<[^>]*>/g, ' ').trim();
                  return (
                    <div key={e._id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 12 }}>{cat.emoji}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>
                        {plain.slice(0, 60)}{plain.length > 60 ? '...' : ''}
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
