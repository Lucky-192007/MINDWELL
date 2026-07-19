import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { authInputStyle, authLabelStyle, authButtonStyle } from '../components/AuthCard';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const { register } = useAuth();
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await register(name, email, phone, password); // Pass phone
    setToast('✓ Code sent - check your email');
    setTimeout(() => navigate('/verify-otp'), 500);
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};
return (
  <AuthCard icon="🌸" title="Create Your Space" subtitle="Private, encrypted, yours alone" toast={toast}>
    <form onSubmit={handleSubmit}>
      <label style={authLabelStyle}>Name</label>
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required style={authInputStyle} />

      <label style={authLabelStyle}>Email address</label>
      <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={authInputStyle} />

      <label style={authLabelStyle}>Phone (Optional)</label>
      <input type="tel" placeholder="+1 (555) 000-0000 - leave blank if you don't have one" value={phone} onChange={(e) => setPhone(e.target.value)} style={authInputStyle} />

      <label style={authLabelStyle}>Password</label>
      <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={authInputStyle} />

      {error && <p style={{ color: '#EE5D5D', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

      <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <hr style={{ border: 'none', borderTop: '1px solid #212121', margin: '24px 0' }} />
    <p style={{ fontSize: 13, color: '#9490AC', margin: 0 }}>
      Already have an account? <Link to="/login" style={{ color: '#A9A1E0' }}>Log in</Link>
    </p>
  </AuthCard>
);
};

export default Register;
