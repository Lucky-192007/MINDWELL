import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/journal', label: 'Write Journal', icon: '📝' },
  { to: '/analytics', label: 'Mood Analytics', icon: '📊' },
  { to: '/breathe', label: 'Breathing Exercise', icon: '🌬️' },
  { to: '/journals', label: 'Journals', icon: '📓' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/premium', label: 'Premium', icon: '👑' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 16px',
        gap: 4,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 28px' }}>
        <span style={{ fontSize: 22 }}>🌸</span>
        <h2 style={{ margin: 0, fontSize: 20 }}>MindWell</h2>
      </div>

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            fontSize: 14.5,
          })}
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div
        className="card"
        style={{ padding: 16, background: 'var(--accent-soft)', border: 'none', marginBottom: 12 }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>You're doing great! 💜</p>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
          Keep going, you're taking care of your mind.
        </p>
      </div>

      <button
        onClick={() => { logout(); navigate('/login'); }}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '10px 14px',
          color: 'var(--text-secondary)',
          fontSize: 14,
        }}
      >
        Log out
      </button>
    </aside>
  );
};

export default Sidebar;
