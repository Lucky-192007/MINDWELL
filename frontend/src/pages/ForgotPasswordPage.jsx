import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard, { authInputStyle, authLabelStyle, authButtonStyle } from '../components/AuthCard';
import { forgotPassword, resetPassword } from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('request');
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
    <AuthCard icon="🔑" title="Reset Password" subtitle={step === 'request' ? "We'll email you a reset code" : `Enter the code sent to ${email}`}>
      <form onSubmit={step === 'request' ? handleRequest : handleReset}>
        {step === 'request' ? (
          <>
            <label style={authLabelStyle}>Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={authInputStyle} />
          </>
        ) : (
          <>
            <label style={authLabelStyle}>6-digit code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              required
              style={{ ...authInputStyle, letterSpacing: 6, textAlign: 'center', fontSize: 18 }}
            />
            <label style={authLabelStyle}>New password</label>
            <input type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required style={authInputStyle} />
          </>
        )}

        {msg && <p style={{ color: '#8B7FF2', fontSize: 12.5, margin: '0 0 10px' }}>{msg}</p>}
        {error && <p style={{ color: '#EE5D5D', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

        <button type="submit" style={authButtonStyle}>
          {step === 'request' ? 'Send Reset Code' : 'Reset Password'}
        </button>
      </form>
      <hr style={{ border: 'none', borderTop: '1px solid #212121', margin: '24px 0 16px' }} />
      <Link to="/login" style={{ fontSize: 13, color: '#A9A1E0' }}>Back to login</Link>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
