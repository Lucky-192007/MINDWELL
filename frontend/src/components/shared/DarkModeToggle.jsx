import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const DarkModeToggle = ({ compact }) => {
  const { dark, setDark } = useTheme();

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 44,
        height: 24,
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'relative',
        padding: 2,
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: dark ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: dark ? 'var(--accent-lavender)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        }}
      >
        {dark ? '🌙' : '☀️'}
      </motion.div>
    </button>
  );
};

export default DarkModeToggle;
