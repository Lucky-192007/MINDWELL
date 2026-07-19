import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🔐',
    title: 'Private By Design',
    short: 'Your entries are encrypted before they ever touch a database.',
    long: 'AES-256 encryption is applied to every journal entry the moment you save it. Not even a database administrator with direct access can read your words — only you, with your session, can decrypt them.',
  },
  {
    icon: '📊',
    title: 'Understand Your Patterns',
    short: 'Mood and energy tracked automatically, visualized clearly.',
    long: 'Every entry logs how you felt and your energy level. Over time, MindWell surfaces trends — weekly averages, your most common moods, and streaks — so you can actually see your own patterns, not just guess at them.',
  },
  {
    icon: '🌬️',
    title: 'Built-In Calm Tools',
    short: 'Four guided breathing techniques, ready whenever you need them.',
    long: '4-7-8, Box Breathing, Coherent Breathing, and Deep Calm — each with its own rhythm and purpose, from falling asleep to staying steady under pressure. No account setup, no ads, just a circle to follow.',
  },
];

const LandingPage = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#F1EFFA' }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #EB5A9C, #6C5CE7, #4A9FE0)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#1A1A1A', border: '1px solid #262626', borderRadius: 20,
              padding: '5px 12px 5px 5px', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5,
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
              🌸
            </span>
            MINDWELL
          </span>
        </div>

        <div style={{ textAlign: 'center', padding: '90px 20px 60px' }}>
          <span
            style={{
              display: 'inline-block', fontSize: 12.5, padding: '6px 14px', borderRadius: 20,
              border: '1px solid #3A3650', color: '#B8AEDD', marginBottom: 24,
            }}
          >
            ✨ Next-Gen Journal Engine Active
          </span>

          <h1 style={{ fontSize: 48, lineHeight: 1.15, margin: '0 0 8px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Write Your Private Story
            <br />
            <span style={{ background: 'linear-gradient(90deg, #A78BFA, #6C9FE0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              In Less Than A Minute.
            </span>
          </h1>

          <p style={{ color: '#9490AC', maxWidth: 460, margin: '20px auto 0', fontSize: 15, lineHeight: 1.6 }}>
            An encrypted journaling environment crafted to store, protect, and visualize your mood and
            reflections — natively.
          </p>

          <p style={{ marginTop: 60, fontSize: 12.5, color: '#7A76A0' }}>
            Explore Platform Features
            <br />
            <span style={{ fontSize: 16 }}>⌄</span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 70 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              animate={{ scale: hovered === i ? 1.03 : 1, y: hovered === i ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: '#131313',
                border: hovered === i ? '1px solid #6C5CE7' : '1px solid #212121',
                borderRadius: 16,
                padding: 24,
                cursor: 'default',
                boxShadow: hovered === i ? '0 12px 32px rgba(108,92,231,0.25)' : 'none',
              }}
            >
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <h3 style={{ margin: '12px 0 8px', fontSize: 16 }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#9490AC', lineHeight: 1.6 }}>
                {hovered === i ? f.long : f.short}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 90 }}>
          <h2 style={{ fontSize: 24, margin: '0 0 10px' }}>Ready for a space that's actually yours?</h2>
          <p style={{ color: '#9490AC', fontSize: 14, margin: '0 0 28px' }}>
            Free to start. No long forms, no credit card.
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-block', background: '#6C5CE7', color: 'white', textDecoration: 'none',
              padding: '13px 32px', borderRadius: 24, fontSize: 14.5, fontWeight: 600,
            }}
          >
            Start Journaling Free
          </Link>
          <p style={{ marginTop: 16, fontSize: 13, color: '#6C6980' }}>
            Already have an account? <Link to="/login" style={{ color: '#A9A1E0' }}>Log in</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #1A1A1A', fontSize: 11.5, color: '#5C5870' }}>
          POWERED BY REACT + NODE + MONGODB · 2026
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
