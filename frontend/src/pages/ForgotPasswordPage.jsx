import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthShell from '../components/AuthShell';
import { forgotPassword, resetPassword } from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('request'); // request | reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    await forgotPassword({ email });
    setMsg('If that email exists, a reset code has been sent.');
    setStep('reset');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await resetPassword({ email, otp, newPassword });
      setMsg('✓ Password reset. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <AuthShell>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={step === 'request' ? handleRequest : handleReset}
        className="card"
        style={{ padding: 40, width: 380, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={{ margin: 0 }}>Reset your password</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: -8, fontSize: 14 }}>
          {step === 'request' ? "We'll email you a reset code." : `Enter the code sent to ${email}.`}
        </p>

        {step === 'request' ? (
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        ) : (
          <>
            <input
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              required
              style={{ ...inputStyle, letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
            />
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              style={inputStyle}
            />
          </>
        )}

        {msg && <p style={{ color: 'var(--accent)', fontSize: 13, margin: 0 }}>{msg}</p>}
        {error && <p style={{ color: 'var(--danger)', fontSize: 14, margin: 0 }}>{error}</p>}

        <button type="submit" style={buttonStyle}>
          {step === 'request' ? 'Send reset code' : 'Reset password'}
        </button>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--accent)' }}>Back to login</Link>
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

export default ForgotPasswordPage;
