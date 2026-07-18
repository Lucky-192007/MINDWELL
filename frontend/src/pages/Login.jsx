import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setToast('✓ Welcome back!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      if (err.response?.data?.requiresOtp) {
        navigate('/verify-otp');
        return;
      }
      setError(err.response?.data?.message || 'Login failed');
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
        <h2 style={{ margin: 0 }}>Welcome back</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: -8 }}>Your journal is waiting.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: 12.5, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
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

export default Login;
