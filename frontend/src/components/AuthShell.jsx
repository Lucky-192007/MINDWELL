import { motion, AnimatePresence } from 'framer-motion';

// Shared two-panel shell for Login/Register/etc: a branding side + form side.
const AuthShell = ({ children, toast }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(160deg, var(--accent) 0%, #4B3FB0 100%)',
          color: 'white',
          minWidth: 0,
        }}
        className="auth-brand-panel"
      >
        <span style={{ fontSize: 34, marginBottom: 12 }}></span>
        <h1 style={{ fontSize: 36, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>MindWell</h1>
        <p style={{ fontSize: 16, maxWidth: 380, opacity: 0.9, lineHeight: 1.6 }}>
          A quiet, private space to write, track how you feel, and breathe — with every entry encrypted
          before it ever touches a database.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
          <MiniStat label="AES-256" sub="encryption" />
          <MiniStat label="4" sub="breathing modes" />
          <MiniStat label="100%" sub="private" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
        {children}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--accent)', color: 'white', padding: '10px 20px', borderRadius: 20, fontSize: 13.5,
                boxShadow: '0 8px 24px var(--shadow)',
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MiniStat = ({ label, sub }) => (
  <div>
    <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{label}</p>
    <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{sub}</p>
  </div>
);

export default AuthShell;
