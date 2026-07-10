import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: 40, width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={{ margin: 0 }}>Create your space</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: -8 }}>Private, encrypted, yours alone.</p>

        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

        <button type="submit" style={buttonStyle}>Create account</button>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
        </p>
      </motion.form>
    </div>
  );
};

const inputStyle = {
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
