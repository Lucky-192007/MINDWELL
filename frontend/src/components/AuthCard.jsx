import { motion, AnimatePresence } from 'framer-motion';

// Centered single-card auth layout (matches the reference: dark bg, icon badge, centered card)
const AuthCard = ({ icon = '🌸', title, subtitle, children, toast }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: 420,
          maxWidth: '100%',
          background: '#131313',
          border: '1px solid #212121',
          borderRadius: 20,
          padding: '44px 40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #6C5CE7, #8B7FF2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}
        >
          {icon}
        </div>
        <h2 style={{ margin: '0 0 6px', color: '#F1EFFA', fontSize: 24 }}>{title}</h2>
        {subtitle && <p style={{ margin: '0 0 28px', color: '#9490AC', fontSize: 13.5 }}>{subtitle}</p>}
        {children}
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
              background: '#6C5CE7', color: 'white', padding: '10px 20px', borderRadius: 20, fontSize: 13.5,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const authInputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 10,
  border: '1px solid #262626',
  background: '#0D0D0D',
  color: '#F1EFFA',
  fontSize: 14.5,
  marginBottom: 14,
};

export const authLabelStyle = {
  display: 'block',
  textAlign: 'left',
  fontSize: 11.5,
  letterSpacing: 0.5,
  color: '#8B889C',
  marginBottom: 6,
  textTransform: 'uppercase',
};

export const authButtonStyle = {
  width: '100%',
  background: 'linear-gradient(90deg, #6C5CE7, #8B5CE7)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  padding: '14px 0',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginTop: 4,
};

export default AuthCard;
