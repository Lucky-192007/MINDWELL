import { MOOD_CATEGORIES } from '../../utils/mood';

const MoodQuickSelect = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    {MOOD_CATEGORIES.map((cat) => {
      const active = value === cat.value;
      return (
        <button
          key={cat.label}
          onClick={() => onChange(cat.value)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '14px 18px',
            borderRadius: 16,
            border: active ? `1.5px solid ${cat.color}` : '1px solid var(--border)',
            background: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
            minWidth: 76,
          }}
        >
          <span
            style={{
              fontSize: 22,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active ? cat.color : 'var(--bg)',
            }}
          >
            {cat.emoji}
          </span>
          <span style={{ fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400 }}>
            {cat.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default MoodQuickSelect;
