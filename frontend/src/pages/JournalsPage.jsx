import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import MoodQuickSelect from '../components/MoodTracker/MoodQuickSelect';
import { getEntries, updateEntry, deleteEntry, shareEntryApi, revokeShareApi, getAiReflection } from '../services/api';
import { scoreToCategory } from '../utils/mood';
import { useAuth } from '../context/AuthContext';

const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const JournalsPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState(5);
  const [editEnergy, setEditEnergy] = useState(5);
  const [filter, setFilter] = useState('all'); // all | starred
  const [shareInfo, setShareInfo] = useState({}); // entryId -> { url, expiresAt }
  const [reflections, setReflections] = useState({}); // entryId -> text
  const [reflectingId, setReflectingId] = useState(null);

  const load = () => getEntries().then((res) => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setEditText(entry.isRichText ? stripHtml(entry.content) : entry.content);
    setEditMood(entry.mood);
    setEditEnergy(entry.energy);
  };

  const saveEdit = async (id) => {
    await updateEntry(id, { content: editText, mood: editMood, energy: editEnergy, isRichText: false });
    setEditingId(null);
    load();
  };

  const toggleStar = async (entry) => {
    await updateEntry(entry._id, { starred: !entry.starred });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    await deleteEntry(id);
    load();
  };

  const handleShare = async (entry) => {
    if (shareInfo[entry._id]) {
      await revokeShareApi(entry._id);
      setShareInfo((prev) => { const next = { ...prev }; delete next[entry._id]; return next; });
      return;
    }
    const res = await shareEntryApi(entry._id);
    const url = `${window.location.origin}/shared/${res.data.shareToken}`;
    setShareInfo((prev) => ({ ...prev, [entry._id]: { url, expiresAt: res.data.expiresAt } }));
    navigator.clipboard?.writeText(url).catch(() => {});
  };

  const handleReflect = async (entry) => {
    setReflectingId(entry._id);
    try {
      const res = await getAiReflection(entry._id);
      setReflections((prev) => ({ ...prev, [entry._id]: res.data.reflection }));
    } catch (err) {
      setReflections((prev) => ({ ...prev, [entry._id]: err.response?.data?.message || 'Reflection unavailable right now.' }));
    } finally {
      setReflectingId(null);
    }
  };

  const visible = filter === 'starred' ? entries.filter((e) => e.starred) : entries;

  return (
    <AppLayout title="Journals" subtitle="All your entries in one place.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['all', 'starred'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: 16, border: 'none',
              background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)', fontSize: 13.5,
            }}
          >
            {f === 'starred' ? '★ Favorites' : 'All entries'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
        {visible.map((entry) => {
          const cat = scoreToCategory(entry.mood);
          const isEditing = editingId === entry._id;
          const shared = shareInfo[entry._id];
          return (
            <div key={entry._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!isEditing && (
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: 'var(--accent-soft)', color: cat.color }}>
                      {cat.emoji} {cat.label}
                    </span>
                  )}
                  <button onClick={() => toggleStar(entry)} title={entry.starred ? 'Unstar' : 'Star this entry'} style={{ background: 'none', border: 'none', fontSize: 16, color: entry.starred ? '#F0B94C' : 'var(--text-secondary)' }}>
                    {entry.starred ? '★' : '☆'}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', marginBottom: 12 }}
                  />
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Update your mood for this entry</p>
                  <MoodQuickSelect value={editMood} onChange={setEditMood} />
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Energy level ({editEnergy}/10)</label>
                    <input type="range" min="1" max="10" value={editEnergy} onChange={(e) => setEditEnergy(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => saveEdit(entry._id)} style={smallBtn}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...smallBtn, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  {entry.isRichText ? (
                    <div style={{ margin: '0 0 6px', color: 'var(--text-primary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: entry.content }} />
                  ) : (
                    <p style={{ margin: '0 0 6px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{entry.content}</p>
                  )}
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-secondary)' }}>Energy: {entry.energy}/10</p>

                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={() => startEdit(entry)} style={linkBtn}>Edit</button>
                    <button onClick={() => handleDelete(entry._id)} style={{ ...linkBtn, color: 'var(--danger)' }}>Delete</button>
                    <button onClick={() => handleShare(entry)} style={linkBtn}>{shared ? '✓ Link copied - Revoke' : 'Share'}</button>
                    {user?.aiReflectionEnabled && (
                      <button onClick={() => handleReflect(entry)} disabled={reflectingId === entry._id} style={linkBtn}>
                        {reflectingId === entry._id ? 'Thinking...' : '✨ Reflect'}
                      </button>
                    )}
                  </div>

                  {shared && (
                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 8, wordBreak: 'break-all' }}>
                      {shared.url} (expires {new Date(shared.expiresAt).toLocaleDateString()})
                    </p>
                  )}
                  {reflections[entry._id] && (
                    <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--accent)', marginTop: 10, padding: '10px 14px', background: 'var(--accent-soft)', borderRadius: 10 }}>
                      {reflections[entry._id]}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
        {!visible.length && (
          <p style={{ color: 'var(--text-secondary)' }}>
            {filter === 'starred' ? 'No starred entries yet - tap the star on any entry to save it here.' : 'No entries yet.'}
          </p>
        )}
      </div>
    </AppLayout>
  );
};

const smallBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 16px', fontSize: 13 };
const linkBtn = { background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, padding: 0 };

export default JournalsPage;
