import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: 40, width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={{ margin: 0 }}>Check your email</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: -8, fontSize: 14 }}>
          We sent a 6-digit code to <strong>{pendingOtpEmail}</strong>
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          required
          style={{
            padding: 14,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            fontSize: 24,
            letterSpacing: 8,
            textAlign: 'center',
          }}
        />

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
        {resent && <p style={{ color: 'var(--accent)', fontSize: 13 }}>✓ A new code was sent</p>}

        <button
          type="submit"
          style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontSize: 15 }}
        >
          Verify & continue
        </button>

        <button
          type="button"
          onClick={handleResend}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13.5 }}
        >
          Didn't get it? Resend code
        </button>
      </motion.form>
    </div>
  );
};

export default VerifyOtpPage;
