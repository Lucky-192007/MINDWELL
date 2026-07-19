import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { authInputStyle, authButtonStyle } from '../components/AuthCard';

const VerifyOtpPage = () => {
  const { pendingOtpEmail, verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pendingOtpEmail) navigate('/register');
  }, [pendingOtpEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(pendingOtpEmail, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    await resendOtp(pendingOtpEmail);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthCard icon="✉️" title="Check Your Email" subtitle={`We sent a 6-digit code to ${pendingOtpEmail || 'your email'}`}>
      <form onSubmit={handleSubmit}>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          required
          style={{ ...authInputStyle, fontSize: 26, letterSpacing: 10, textAlign: 'center' }}
        />

        {error && <p style={{ color: '#EE5D5D', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}
        {resent && <p style={{ color: '#8B7FF2', fontSize: 12.5, margin: '0 0 10px' }}>✓ A new code was sent</p>}

        <button type="submit" style={authButtonStyle}>Verify & Continue</button>
      </form>
      <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#A9A1E0', fontSize: 13, marginTop: 16 }}>
        Didn't get it? Resend code
      </button>
    </AuthCard>
  );
};

export default VerifyOtpPage;
