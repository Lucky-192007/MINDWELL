import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { useAuth } from '../context/AuthContext';
import { THEME_COLORS, applyThemeColor } from '../utils/themeColors';
import { getCurrentStreak, getLongestStreak } from '../utils/streak';
import {
  getEntries,
  downloadJsonExport,
  downloadPdfExport,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
  getActivityLog,
  importEntries,
  sendDigestNow,
  getVapidPublicKey,
  savePushSubscription,
  removePushSubscription,
  sendTestPush,
} from '../services/api';
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '../utils/push';

const PROMPT_CATEGORY_OPTIONS = [
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'goals', label: 'Goals' },
];

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [editingName, setEditingName] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [dailyReminder, setDailyReminder] = useState(user?.notificationPrefs?.dailyReminder || false);
  const [reminderTime, setReminderTime] = useState(user?.notificationPrefs?.reminderTime || '20:00');
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [promptCategories, setPromptCategories] = useState(user?.promptCategories || ['gratitude', 'reflection', 'goals']);

  const [weeklyDigest, setWeeklyDigest] = useState(user?.notificationPrefs?.weeklyDigest || false);
  const [monthlyDigest, setMonthlyDigest] = useState(user?.notificationPrefs?.monthlyDigest || false);
  const [aiReflectionEnabled, setAiReflectionEnabled] = useState(user?.aiReflectionEnabled || false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported] = useState(isPushSupported());
  const [digestSending, setDigestSending] = useState(false);
  const [pushTestSending, setPushTestSending] = useState(false);

  const [activity, setActivity] = useState([]);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    getEntries().then((res) => setEntries(res.data));
    getActivityLog().then((res) => setActivity(res.data)).catch(() => {});
  }, []);

  const currentStreak = getCurrentStreak(entries);
  const longestStreak = getLongestStreak(entries);
  const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter(Boolean).length, 0);
  const starredCount = entries.filter((e) => e.starred).length;

  const badges = [
    { label: 'First Entry', earned: entries.length >= 1, emoji: '🌱' },
    { label: '7 Day Streak', earned: longestStreak >= 7, emoji: '🔥' },
    { label: '10 Entries', earned: entries.length >= 10, emoji: '📓' },
    { label: '1000 Words', earned: totalWords >= 1000, emoji: '✍️' },
  ];

  // --- Avatar ---
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

  // --- Theme ---
  const chooseTheme = async (key) => {
    applyThemeColor(key); // instant visual feedback
    const res = await updateProfile({ themeColor: key });
    setUser(res.data);
  };

  // --- Password ---
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

  // --- Preferences (including digest + AI) ---
  const savePreferences = async () => {
    const res = await updatePreferences({ 
      dailyReminder, 
      reminderTime, 
      promptCategories,
      weeklyDigest,
      monthlyDigest,
      aiReflectionEnabled,
    });
    setUser(res.data);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  };

  const handleDigestTest = async () => {
    setDigestSending(true);
    try {
      await sendDigestNow();
      alert('✓ Test digest email sent - check your inbox!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send test digest');
    } finally {
      setDigestSending(false);
    }
  };

  // --- Push notifications ---
  const handlePushEnable = async () => {
    try {
      const keyRes = await getVapidPublicKey();
      if (!keyRes.data.key) {
        alert('Push notifications are not configured on this server.');
        return;
      }
      const subscription = await subscribeToPush(keyRes.data.key);
      await savePushSubscription(subscription);
      setPushEnabled(true);
      alert('✓ Push notifications enabled');
    } catch (err) {
      alert(err.message || 'Failed to enable push notifications');
    }
  };

  const handlePushDisable = async () => {
    try {
      await unsubscribeFromPush();
      await removePushSubscription();
      setPushEnabled(false);
      alert('✓ Push notifications disabled');
    } catch (err) {
      alert('Failed to disable push notifications');
    }
  };

  const handlePushTest = async () => {
    setPushTestSending(true);
    try {
      await sendTestPush();
      alert('✓ Test notification sent (check system notifications)');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send test notification');
    } finally {
      setPushTestSending(false);
    }
  };

  const toggleCategory = (key) => {
    setPromptCategories((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  };

  // --- Data import ---
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg('Importing...');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const entriesToImport = parsed.entries || parsed; // supports our own export shape or a raw array
      const res = await importEntries(entriesToImport);
      setImportMsg(`✓ ${res.data.message}`);
      getEntries().then((r) => setEntries(r.data));
    } catch (err) {
      setImportMsg(err.response?.data?.message || 'Import failed - check the file format');
    }
    e.target.value = '';
  };

  // --- Delete account ---
  const handleDelete = async () => {
    await deleteAccount();
    logout();
    navigate('/register');
  };

  return (
    <AppLayout title="Profile" subtitle="Your account and preferences.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, maxWidth: 1000 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)', flexWrap: 'wrap', rowGap: 12 }}>
              <Stat value={entries.length} label="Journals" />
              <Stat value={currentStreak} label="Streak" />
              <Stat value={longestStreak} label="Best Streak" />
              <Stat value={starredCount} label="Starred" />
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 12px' }}>Achievements</h4>
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
            <h4 style={{ margin: '0 0 4px' }}>Activity heatmap</h4>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)' }}>Last 16 weeks</p>
            <CalendarHeatmap entries={entries} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 14px' }}>Appearance</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(THEME_COLORS).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => chooseTheme(key)}
                  title={t.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', background: t.accent,
                    border: user?.themeColor === key ? '3px solid var(--text-primary)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 14px' }}>Notifications & Prompts</h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>Daily reminder</span>
              <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24 }}>
                <input type="checkbox" checked={dailyReminder} onChange={(e) => setDailyReminder(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: dailyReminder ? 'var(--accent)' : 'var(--border)', borderRadius: 12, transition: '0.2s' }} />
                <span style={{ position: 'absolute', top: 3, left: dailyReminder ? 21 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
              </label>
            </div>

            {dailyReminder && (
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', marginBottom: 12 }}
              />
            )}

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 14px' }}>
              Note: this saves your preference, but sending the actual reminder needs a background scheduler which isn't wired up in this build yet.
            </p>

            <p style={{ fontSize: 13.5, margin: '0 0 8px', fontWeight: 600 }}>Prompt categories</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {PROMPT_CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => toggleCategory(c.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 14, fontSize: 12.5,
                    border: promptCategories.includes(c.key) ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: promptCategories.includes(c.key) ? 'var(--accent-soft)' : 'transparent',
                    color: promptCategories.includes(c.key) ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button onClick={savePreferences} style={smallBtn}>{prefsSaved ? '✓ Saved' : 'Save preferences'}</button>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 14px' }}>Email Digest & AI Features</h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>Weekly digest email</span>
              <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24 }}>
                <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: weeklyDigest ? 'var(--accent)' : 'var(--border)', borderRadius: 12, transition: '0.2s' }} />
                <span style={{ position: 'absolute', top: 3, left: weeklyDigest ? 21 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>Monthly digest email</span>
              <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24 }}>
                <input type="checkbox" checked={monthlyDigest} onChange={(e) => setMonthlyDigest(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: monthlyDigest ? 'var(--accent)' : 'var(--border)', borderRadius: 12, transition: '0.2s' }} />
                <span style={{ position: 'absolute', top: 3, left: monthlyDigest ? 21 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
              </label>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Digests run on Mondays (weekly) and the 1st (monthly) at 8am server time.
            </p>

            <button onClick={handleDigestTest} disabled={digestSending} style={{ ...smallBtn, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
              {digestSending ? 'Sending...' : 'Send test digest'}
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>AI-assisted reflection</span>
              <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24 }}>
                <input type="checkbox" checked={aiReflectionEnabled} onChange={(e) => setAiReflectionEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: aiReflectionEnabled ? 'var(--accent)' : 'var(--border)', borderRadius: 12, transition: '0.2s' }} />
                <span style={{ position: 'absolute', top: 3, left: aiReflectionEnabled ? 21 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
              </label>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Get a gentle follow-up question for each entry to help you reflect deeper. Uses Claude AI — your entry text is never stored on Claude's servers.
            </p>

            <button onClick={savePreferences} style={smallBtn}>{prefsSaved ? '✓ Saved' : 'Save features'}</button>
          </div>

          {pushSupported && (
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ margin: '0 0 12px' }}>Push Notifications</h4>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                Get system notifications for reminders, even when the app is closed.
              </p>
              {!pushEnabled ? (
                <button onClick={handlePushEnable} style={smallBtn}>Enable push notifications</button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handlePushTest} disabled={pushTestSending} style={smallBtn}>
                    {pushTestSending ? 'Sending...' : 'Send test'}
                  </button>
                  <button onClick={handlePushDisable} style={{ ...smallBtn, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    Disable
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 8px' }}>Export & Import</h4>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
              Download everything you've written, or bring in entries from a previous export.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={downloadJsonExport} style={smallBtn}>Export JSON</button>
              <button onClick={downloadPdfExport} style={smallBtn}>Export PDF</button>
              <button onClick={() => importInputRef.current?.click()} style={{ ...smallBtn, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                Import JSON
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
            </div>
            {importMsg && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>{importMsg}</p>}
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

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ margin: '0 0 12px' }}>Account activity</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
              {activity.length ? activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-primary)' }}>{a.action}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{new Date(a.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )) : <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)' }}>No activity recorded yet.</p>}
            </div>
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

const Stat = ({ value, label }) => (
  <div style={{ minWidth: 60 }}>
    <p style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{value}</p>
    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{label}</p>
  </div>
);

const smallBtn = { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, padding: '8px 16px', fontSize: 13 };

export default ProfilePage;
