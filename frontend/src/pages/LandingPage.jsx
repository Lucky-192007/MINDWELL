import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const modalContent = {
    privacy: {
      title: 'Privacy Policy',
      text: 'Your entries are encrypted using AES-256 before they touch our database. We do not read, share, or sell your personal data.',
    },
    contact: {
      title: 'Contact Us',
      text: 'You can reach out to us directly via email at ranjan192007@gmail.com or through our community support channels.',
    },
    timeline: {
      title: 'Project Timeline',
      text: 'MindWell is continuously evolving. Check back here for updates on upcoming analytics features and mobile companion apps.',
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#F1EFFA' }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #EB5A9C, #6C5CE7, #4A9FE0)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28, height: 28, borderRadius: 8, background: '#6C5CE7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
            }}
          >
            
          </span>
          <strong style={{ fontSize: 13, letterSpacing: 1 }}>MINDWELL</strong>
        </div>

        <div style={{ textAlign: 'center', padding: '90px 20px 60px' }}>
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-block', fontSize: 12.5, padding: '6px 14px', borderRadius: 20,
              border: '1px solid #3A3650', color: '#B8AEDD', marginBottom: 24,
            }}
          >
            ✨ Encrypted Journaling, Active
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 48, lineHeight: 1.15, margin: '0 0 8px', fontFamily: 'var(--font-display)' }}
          >
            Write Freely.
            <br />
            <span style={{ background: 'linear-gradient(90deg, #A78BFA, #6C9FE0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Nobody Else Can Read It.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: '#9490AC', maxWidth: 460, margin: '20px auto 0', fontSize: 15, lineHeight: 1.6 }}
          >
            A minimalist mental wellness journal built around one idea: your private thoughts should stay private —
            even from us.
          </motion.p>
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

        {/* Footer Section with Inline SVG Icons */}
        <div style={{ textAlign: 'center', padding: '30px 0 20px', borderTop: '1px solid #1A1A1A' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', fontSize: 13, fontWeight: 500, color: '#9490AC', marginBottom: '20px' }}>
            <span style={{ cursor: 'pointer' }}>FAQ</span>
            <button 
              onClick={() => openModal('contact')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              Contact Us
            </button>
            <button 
              onClick={() => openModal('privacy')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              Privacy
            </button>
            <button 
              onClick={() => openModal('timeline')} 
              style={{ background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              Timeline
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {/* LinkedIn SVG */}
            <a 
              href="https://www.linkedin.com/in/jyoti-ranjan-swain-764872382?utm" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#9490AC', display: 'flex', alignItems: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            {/* Instagram SVG */}
            <a 
              href="https://www.instagram.com/ranjan__2o07" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#9490AC', display: 'flex', alignItems: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8a4 4 0 0 1 3.37 3.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>

          <div style={{ fontSize: 11.5, color: '#5C5870' }}>
            © 2026 MindWell. All rights reserved.
          </div>
        </div>
      </div>

      {/* Pop-up Modal */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', padding: '16px' }}>
          <div style={{ background: '#131313', border: '1px solid #3A3650', borderRadius: 16, maxWidth: 420, width: '100%', padding: '24px', position: 'relative', color: '#F1EFFA' }}>
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#9490AC', cursor: 'pointer' }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#FFF' }}>
              {modalContent[activeModal]?.title}
            </h3>
            <p style={{ fontSize: 13, color: '#9490AC', lineHeight: 1.6, margin: 0 }}>
              {modalContent[activeModal]?.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;