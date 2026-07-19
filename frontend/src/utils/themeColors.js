// Alternate accent palettes a user can choose in Profile > Appearance.
// Each overrides --accent / --accent-soft / --accent-lavender on top of the base theme.
export const THEME_COLORS = {
  purple: { label: 'Purple', accent: '#6C5CE7', accentSoft: '#EFECFF', accentLavender: '#A9A1E0' },
  teal: { label: 'Teal', accent: '#0F9B8E', accentSoft: '#E1F6F3', accentLavender: '#7FD6C9' },
  rose: { label: 'Rose', accent: '#E0607E', accentSoft: '#FCE9EE', accentLavender: '#F0A6B8' },
  amber: { label: 'Amber', accent: '#D98C2B', accentSoft: '#FCF0DE', accentLavender: '#F0C287' },
};

export const applyThemeColor = (colorKey) => {
  const theme = THEME_COLORS[colorKey] || THEME_COLORS.purple;
  const root = document.documentElement.style;
  root.setProperty('--accent', theme.accent);
  root.setProperty('--accent-soft', theme.accentSoft);
  root.setProperty('--accent-lavender', theme.accentLavender);
};
