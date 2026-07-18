import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setToast('✓ Code sent to your email');
      setTimeout(() => navigate('/verify-otp'), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell toast={toast}>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: 40, width: 380, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={{ margin: 0 }}>Create your space</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: -8 }}>Private, encrypted, yours alone.</p>

        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />

        {error && <p style={{ color: 'var(--danger)', fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
};

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text-primary)',
  fontSize: 15,
};

const buttonStyle = {
  background: 'var(--accent)',
  color: 'white',
  border: 'none',
  borderRadius: 20,
  padding: '12px 0',
  fontSize: 15,
};

export default Register;
