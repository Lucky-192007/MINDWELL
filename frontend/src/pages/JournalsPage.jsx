import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { getEntries, updateEntry, deleteEntry } from '../services/api';
import { scoreToCategory } from '../utils/mood';

const JournalsPage = () => {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all'); // all | starred

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

  const toggleStar = async (entry) => {
    await updateEntry(entry._id, { starred: !entry.starred });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    await deleteEntry(id);
    load();
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
              padding: '8px 18px',
              borderRadius: 16,
              border: 'none',
              background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              fontSize: 13.5,
              textTransform: 'capitalize',
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
          return (
            <div key={entry._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: 'var(--accent-soft)', color: cat.color }}>
                    {cat.emoji} {cat.label}
                  </span>
                  <button
                    onClick={() => toggleStar(entry)}
                    title={entry.starred ? 'Unstar' : 'Star this entry'}
                    style={{ background: 'none', border: 'none', fontSize: 16, color: entry.starred ? '#F0B94C' : 'var(--text-secondary)' }}
                  >
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
