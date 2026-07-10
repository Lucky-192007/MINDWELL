import { useEffect } from 'react';
import Sidebar from './Sidebar';
import DarkModeToggle from '../shared/DarkModeToggle';
import { useAuth } from '../../context/AuthContext';
import { applyThemeColor } from '../../utils/themeColors';

const AppLayout = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  useEffect(() => {
    applyThemeColor(user?.themeColor || 'purple');
  }, [user?.themeColor]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '28px 40px 0',
          }}
        >
          <div>
            {title && <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>}
            {subtitle && <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          <DarkModeToggle />
        </div>
        <div style={{ padding: '24px 40px 60px' }}>{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
