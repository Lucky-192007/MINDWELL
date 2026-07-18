import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('mindwell_dark_mode');
    return saved === null ? true : saved === 'true';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mindwell_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('mindwell_dark_mode', String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('mindwell_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <ThemeContext.Provider value={{ dark, setDark, sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </ThemeContext.Provider>
  );
};
