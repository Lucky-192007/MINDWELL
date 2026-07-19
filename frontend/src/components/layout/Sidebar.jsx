import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DarkModeToggle from '../shared/DarkModeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/journal', label: 'Write Journal', icon: '📝' },
  { to: '/analytics', label: 'Mood Analytics', icon: '📊' },
  { to: '/breathe', label: 'Breathing Exercise', icon: '🌬️' },
  { to: '/journals', label: 'Journals', icon: '📓' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/premium', label: 'Premium', icon: '👑' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useTheme();
  const navigate = useNavigate();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      style={{
        width: collapsed ? 76 : 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '28px 12px' : '28px 16px',
        gap: 4,
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.2s ease, padding 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '0 4px 28px', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🌸</span>
          {!collapsed && <h2 style={{ margin: 0, fontSize: 20, whiteSpace: 'nowrap' }}>MindWell</h2>}
        </div>
        {!collapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse sidebar"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 16, padding: 4 }}
          >
            «
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          title="Expand sidebar"
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, padding: '8px 0', marginBottom: 12 }}
        >
          »
        </button>
      )}

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={item.label}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '11px 0' : '11px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            fontSize: 14.5,
            whiteSpace: 'nowrap',
          })}
        >
          <span>{item.icon}</span>
          {!collapsed && item.label}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      {!collapsed && (
        <div className="card" style={{ padding: 16, background: 'var(--accent-soft)', border: 'none', marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>You're doing great! 💜</p>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Keep going, you're taking care of your mind.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '4px 4px 12px', gap: 8 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0,
              }}
            >
              {!user?.avatar && (user?.name?.[0]?.toUpperCase() || '🙂')}
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</span>
          </div>
        )}
        <DarkModeToggle />
      </div>

      <button
        onClick={() => { logout(); navigate('/login'); }}
        title="Log out"
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '10px 14px',
          color: 'var(--text-secondary)',
          fontSize: 14,
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? '🚪' : 'Log out'}
      </button>
    </aside>
  );
};

export default Sidebar;
