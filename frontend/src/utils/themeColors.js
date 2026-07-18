// Preset accent palettes
export const THEME_COLORS = {
  purple: { label: 'Purple', accent: '#6C5CE7', accentSoft: '#EFECFF', accentLavender: '#A9A1E0' },
  teal: { label: 'Teal', accent: '#0F9B8E', accentSoft: '#E1F6F3', accentLavender: '#7FD6C9' },
  rose: { label: 'Rose', accent: '#E0607E', accentSoft: '#FCE9EE', accentLavender: '#F0A6B8' },
  amber: { label: 'Amber', accent: '#D98C2B', accentSoft: '#FCF0DE', accentLavender: '#F0C287' },
  sky: { label: 'Sky Blue', accent: '#0284C7', accentSoft: '#F0F9FF', accentLavender: '#7DD3FC' },
  fuchsia: { label: 'Fuchsia', accent: '#C026D3', accentSoft: '#FDF4FF', accentLavender: '#E879F9' },
  lime: { label: 'Lime', accent: '#84CC16', accentSoft: '#F7FEE7', accentLavender: '#A3E635' },
  indigo: { label: 'Indigo', accent: '#4F46E5', accentSoft: '#EEF2FF', accentLavender: '#818CF8' },
  pink: { label: 'Pink', accent: '#DB2777', accentSoft: '#FFF1F9', accentLavender: '#F472B6' },
  emerald: { label: 'Emerald', accent: '#059669', accentSoft: '#ECFDF5', accentLavender: '#34D399' },
  cyan: { label: 'Cyan', accent: '#06B6D4', accentSoft: '#ECFEFF', accentLavender: '#22D3EE' },
  mint: { label: 'Mint', accent: '#10B981', accentSoft: '#E6FDF4', accentLavender: '#6EE7B7' },
};

// Helper to generate soft & lavender tints from any custom hex code
export const generateCustomTheme = (hex) => {
  return {
    label: 'Custom',
    accent: hex,
    accentSoft: `${hex}15`,        // ~8% opacity tint for soft background layers
    accentLavender: `${hex}88`,    // ~53% opacity mid-tone for borders/lavender highlights
  };
};

export const applyThemeColor = (colorKeyOrHex) => {
  const theme = THEME_COLORS[colorKeyOrHex] 
    ? THEME_COLORS[colorKeyOrHex] 
    : generateCustomTheme(colorKeyOrHex);

  const root = document.documentElement.style;
  root.setProperty('--accent', theme.accent);
  root.setProperty('--accent-soft', theme.accentSoft);
  root.setProperty('--accent-lavender', theme.accentLavender);
};