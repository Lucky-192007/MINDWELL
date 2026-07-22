import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { authInputStyle, authLabelStyle, authButtonStyle } from '../components/AuthCard';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [loginMethod, setLoginMethod] = useState('email');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (loginMethod === 'email' && !email.includes('@')) {
      setError('Valid email required');
      return false;
    }
    if (loginMethod === 'phone' && !phone.replace(/\D/g, '').length) {
      setError('Valid phone number required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(
        name,
        loginMethod === 'email' ? email : null,
        loginMethod === 'phone' ? phone : null,
        password
      );
      setToast('✓ Check your ' + (loginMethod === 'email' ? 'email' : 'phone') + ' for code');
      setTimeout(() => navigate('/verify-otp'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon="🌸" title="Create Your Space" subtitle="Private, encrypted, yours alone" toast={toast}>
      <form onSubmit={handleSubmit}>
        <label style={authLabelStyle}>Name</label>
        <input 
          placeholder="Your full name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={authInputStyle} 
        />

        <label style={authLabelStyle}>Choose Login Method</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" value="email" checked={loginMethod === 'email'} onChange={(e) => setLoginMethod(e.target.value)} />
            <span style={{ fontSize: 14 }}>Email</span>
          </label>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" value="phone" checked={loginMethod === 'phone'} onChange={(e) => setLoginMethod(e.target.value)} />
            <span style={{ fontSize: 14 }}>Phone</span>
          </label>
        </div>

        {loginMethod === 'email' ? (
          <>
            <label style={authLabelStyle}>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={authInputStyle} />
          </>
        ) : (
          <>
            <label style={authLabelStyle}>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required style={authInputStyle} />
          </>
        )}

        <label style={authLabelStyle}>Password</label>
        <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={authInputStyle} />

        {error && <p style={{ color: '#EE5D5D', fontSize: 13, margin: '0 0 10px', textAlign: 'center' }}>⚠️ {error}</p>}

        <button type="submit" disabled={loading} style={{ ...authButtonStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid #212121', margin: '24px 0' }} />
      <p style={{ fontSize: 13, color: '#9490AC', margin: 0, textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#A9A1E0' }}>Log in</Link>
      </p>
    </AuthCard>
  );
};

export default Register;