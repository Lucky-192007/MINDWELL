import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { getEntries, updateEntry, deleteEntry } from '../services/api';
import { scoreToCategory } from '../utils/mood';

const JournalsPage = () => {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const load = () => getEntries().then((res) => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setEditText(entry.content);
  };

  const saveEdit = async (id) => {
    await updateEntry(id, { content: editText });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    await deleteEntry(id);
    load();
  };

  return (
    <AppLayout title="Journals" subtitle="All your entries in one place.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
        {entries.map((entry) => {
          const cat = scoreToCategory(entry.mood);
          const isEditing = editingId === entry._id;
          return (
            <div key={entry._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: 'var(--accent-soft)', color: cat.color }}>
                  {cat.emoji} {cat.label}
                </span>
              </div>

              {isEditing ? (
                <>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => saveEdit(entry._id)} style={smallBtn}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...smallBtn, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 10px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{entry.content}</p>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button onClick={() => startEdit(entry)} style={linkBtn}>Edit</button>
                    <button onClick={() => handleDelete(entry._id)} style={{ ...linkBtn, color: 'var(--danger)' }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {!entries.length && <p style={{ color: 'var(--text-secondary)' }}>No entries yet.</p>}
      </div>
    </AppLayout>
  );
};

const smallBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 16px', fontSize: 13 };
const linkBtn = { background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, padding: 0 };

export default JournalsPage;
