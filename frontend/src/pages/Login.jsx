import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { authInputStyle, authLabelStyle, authButtonStyle } from '../components/AuthCard';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
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
      if (!emailOrPhone || !password) {
        setError('Email/phone and password required');
        setLoading(false);
        return;
      }

      await login(emailOrPhone, password);
      setToast('✓ Welcome back!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.data?.requiresOtp) {
        setToast('✓ Verification code sent');
        setTimeout(() => navigate('/verify-otp'), 1000);
        return;
      }

      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon="🔐" title="Welcome Back" subtitle="Login with email or phone number" toast={toast}>
      <form onSubmit={handleSubmit}>
        <label style={authLabelStyle}>Email or Phone</label>
        <input
          type="text"
          placeholder="your@email.com or +1 (555) 000-0000"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
          style={authInputStyle}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={authLabelStyle}>Password</label>
          <Link to="/forgot-password" style={{ fontSize: 11.5, color: '#A9A1E0', marginBottom: 6 }}>Forgot?</Link>
        </div>
        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={authInputStyle} />

        {error && <p style={{ color: '#EE5D5D', fontSize: 13, margin: '0 0 10px', textAlign: 'center' }}>⚠️ {error}</p>}

        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid #212121', margin: '24px 0' }} />
      <p style={{ fontSize: 13, color: '#9490AC', margin: 0, textAlign: 'center' }}>
        No account? <Link to="/register" style={{ color: '#A9A1E0' }}>Register here</Link>
      </p>
    </AuthCard>
  );
};

export default Login;