import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DarkModeToggle = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle dark mode"
      style={{
        width: 52,
        height: 28,
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        position: 'relative',
        padding: 2,
      }}
    >
      <motion.div
        animate={{ x: dark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: dark ? 'var(--accent-lavender)' : 'var(--accent)',
        }}
      />
    </button>
  );
};

export default DarkModeToggle;
