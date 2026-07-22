import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { getThemes, createTheme as createThemeApi, applyTheme, deleteTheme } from '../services/api';
import { useAuth } from '../context/AuthContext';

const INITIAL_COLORS = {
  primary: '#6C5CE7',
  secondary: '#8B7FF2',
  background: '#000000',
  elevated: '#131313',
  sidebar: '#0A0A0A',
  text: '#F1EFFA',
  textSecondary: '#9490AC',
  border: '#212121',
  danger: '#F0837E',
};

const ThemesPage = () => {
  const { user, setUser } = useAuth();
  const [publicThemes, setPublicThemes] = useState([]);
  const [personalThemes, setPersonalThemes] = useState([]);
  const [tab, setTab] = useState('public');
  const [showCreator, setShowCreator] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadThemes = () => {
    getThemes().then((res) => {
      setPublicThemes(res.data.public || []);
      setPersonalThemes(res.data.personal || []);
    });
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      alert('Theme name required');
      return;
    }
    setSaving(true);
    try {
      await createThemeApi({ name: themeName, description: themeDesc, colors, isPublic });
      setThemeName('');
      setThemeDesc('');
      setColors(INITIAL_COLORS);
      setShowCreator(false);
      alert('✓ Theme created!');
      loadThemes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create theme');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (themeId) => {
    try {
      await applyTheme(themeId);
      setUser({ ...user, currentTheme: themeId });
      alert('✓ Theme applied!');
    } catch (err) {
      alert('Failed to apply theme');
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (!window.confirm('Delete this theme?')) return;
    try {
      await deleteTheme(themeId);
      loadThemes();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const ThemeCard = ({ theme, isPersonal }) => (
    <div className="card" style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{theme.name}</h4>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
            by {theme.creator?.name || 'Unknown'}
          </p>
          {theme.description && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              {theme.description}
            </p>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          ❤️ {theme.likes?.length || 0}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
        {Object.entries(theme.colors).slice(0, 8).map(([key, color]) => (
          <div
            key={key}
            title={key}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: color,
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => handleApplyTheme(theme._id)}
          style={{
            flex: 1,
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '8px 0',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Apply
        </button>
        {isPersonal && (
          <button
            onClick={() => handleDeleteTheme(theme._id)}
            style={{
              background: 'transparent',
              border: '1px solid var(--danger)',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              color: 'var(--danger)',
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout title="Custom Themes" subtitle="Create or choose a theme for your journal">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab('public')}
          style={{
            padding: '8px 16px',
            borderRadius: 16,
            border: 'none',
            background: tab === 'public' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: tab === 'public' ? 'white' : 'var(--text-secondary)',
            fontSize: 13.5,
          }}
        >
          Community Themes
        </button>
        <button
          onClick={() => setTab('personal')}
          style={{
            padding: '8px 16px',
            borderRadius: 16,
            border: 'none',
            background: tab === 'personal' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: tab === 'personal' ? 'white' : 'var(--text-secondary)',
            fontSize: 13.5,
          }}
        >
          My Themes
        </button>
        <button
          onClick={() => setShowCreator(!showCreator)}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: 16,
            border: 'none',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {showCreator ? '✕ Cancel' : '+ Create Theme'}
        </button>
      </div>

      {showCreator && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}>Design Your Theme</h3>

          <input
            type="text"
            placeholder="Theme name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />

          <textarea
            placeholder="Description (optional)"
            value={themeDesc}
            onChange={(e) => setThemeDesc(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: 10, marginBottom: 14, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'none' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 16 }}>
            {Object.keys(colors).map((key) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input
              type="checkbox"
              id="publicTheme"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="publicTheme" style={{ fontSize: 14 }}>
              Share with community
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSaveTheme}
              disabled={saving}
              style={{
                flex: 1,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
            <button
              onClick={() => setShowCreator(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 20px',
                fontSize: 14,
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
          </div>

          <h4 style={{ margin: '20px 0 10px' }}>Preview</h4>
          <div
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 16,
              color: colors.text,
            }}
          >
            <p style={{ margin: '0 0 8px', color: colors.primary, fontWeight: 600 }}>This is primary text</p>
            <p style={{ margin: '0 0 8px', color: colors.textSecondary, fontSize: 13 }}>This is secondary text</p>
            <button style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
              Sample Button
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 600 }}>
        {tab === 'public'
          ? publicThemes.map((theme) => <ThemeCard key={theme._id} theme={theme} isPersonal={false} />)
          : personalThemes.map((theme) => <ThemeCard key={theme._id} theme={theme} isPersonal={true} />)}

        {(tab === 'public' ? publicThemes : personalThemes).length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            {tab === 'public' ? 'No community themes yet' : 'Create your first theme!'}
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default ThemesPage;