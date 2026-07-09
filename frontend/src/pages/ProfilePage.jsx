import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
  getEntries,
  downloadJsonExport,
  downloadPdfExport,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../services/api';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [editingName, setEditingName] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    getEntries().then((res) => setEntries(res.data));
  }, []);

  const streak = (() => {
    if (!entries.length) return 0;
    const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
    let s = 0;
    let cursor = new Date();
    while (days.has(cursor.toDateString())) { s += 1; cursor.setDate(cursor.getDate() - 1); }
    return s;
  })();

  const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter(Boolean).length, 0);

  const badges = [
    { label: 'First Entry', earned: entries.length >= 1, emoji: '🌱' },
    { label: '7 Day Streak', earned: streak >= 7, emoji: '🔥' },
    { label: '10 Entries', earned: entries.length >= 10, emoji: '📓' },
    { label: '1000 Words', earned: totalWords >= 1000, emoji: '✍️' },
  ];

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      alert('Please choose an image smaller than 1.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarUploading(true);
      try {
        const res = await updateProfile({ avatar: reader.result });
        setUser(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload image');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveName = async () => {
    if (!name.trim()) return;
    const res = await updateProfile({ name });
    setUser(res.data);
    setEditingName(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg('✓ Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordForm(false), 1500);
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDelete = async () => {
    await deleteAccount();
    logout();
    navigate('/register');
  };

  return (
    <AppLayout title="Profile" subtitle="Your account and preferences.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, maxWidth: 900 }}>
        {/* Left column: avatar + identity + stats */}
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 14px' }}>
            <div
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                border: '2px solid var(--accent-soft)',
              }}
            >
              {!user?.avatar && (user?.name?.[0]?.toUpperCase() || '🙂')}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change photo"
              style={{
                position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: '50%',
                background: 'var(--accent)', color: 'white', border: '2px solid var(--bg-elevated)', fontSize: 13,
              }}
            >
              {avatarUploading ? '…' : '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          {editingName ? (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, width: 140 }}
              />
              <button onClick={saveName} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '0 10px', fontSize: 13 }}>✓</button>
            </div>
          ) : (
            <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setEditingName(true)} title="Click to edit">
              {user?.name} <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✎</span>
            </h3>
          )}

          <p style={{ margin: '2px 0 10px', color: 'var(--text-secondary)', fontSize: 13.5 }}>{user?.email}</p>
          <span style={{ fontSize: 12, background: user?.isPremium ? 'var(--accent-soft)' : 'var(--border)', color: user?.isPremium ? 'var(--accent)' : 'var(--text-secondary)', padding: '4px 12px', borderRadius: 12 }}>
            {user?.isPremium ? '★ Premium' : 'Free plan'}
          </span>

          {user?.createdAt && (
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{entries.length}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)' }}>Journals</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{streak}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)' }}>Streak</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{totalWords}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)' }}>Words</p>
            </div>
          </div>
        </div>

        {/* Right column: badges, export, password, danger zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 14px' }}>Achievements</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {badges.map((b) => (
                <div key={b.label} style={{ textAlign: 'center', opacity: b.earned ? 1 : 0.35 }}>
                  <div style={{ fontSize: 26 }}>{b.emoji}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 10.5, color: 'var(--text-secondary)' }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 8px' }}>Export your data</h4>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
              Download everything you've written, decrypted and readable, at any time.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={downloadJsonExport} style={smallBtn}>Export JSON</button>
              <button onClick={downloadPdfExport} style={smallBtn}>Export PDF</button>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Change Password</h4>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13 }}>
                {showPasswordForm ? 'Cancel' : 'Update'}
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <input
                  type="password" placeholder="Current password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} required
                  style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
                <input
                  type="password" placeholder="New password (min 6 characters)" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
                {passwordMsg && <p style={{ margin: 0, fontSize: 12.5, color: passwordMsg.startsWith('✓') ? 'var(--accent)' : 'var(--danger)' }}>{passwordMsg}</p>}
                <button type="submit" style={{ ...smallBtn, alignSelf: 'flex-start' }}>Save new password</button>
              </form>
            )}
          </div>

          <div className="card" style={{ padding: 22, border: '1px solid var(--danger)' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--danger)' }}>Danger Zone</h4>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)} style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
                Delete Account
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  This permanently deletes your account and all journal entries. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleDelete} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
                    Yes, delete everything
                  </button>
                  <button onClick={() => setDeleteConfirm(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const smallBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, padding: '8px 16px', fontSize: 13 };

export default ProfilePage;
