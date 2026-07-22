import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyOtp as verifyOtpApi, resendOtp as resendOtpApi, getMe } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingOtpEmail, setPendingOtpEmail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('mindwell_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('mindwell_token'))
      .finally(() => setLoading(false));
  }, []);

  // Login may succeed immediately, or come back requiring OTP verification
  // (e.g. account created but never verified).
  const login = async (emailOrPhone, password) => {
    try {
      const res = await loginUser({ emailOrPhone, password });
      localStorage.setItem('mindwell_token', res.data.token);
      setUser(res.data.user || res.data); // depending on your backend response structure
    } catch (err) {
      if (err.response?.data?.requiresOtp) {
        setPendingOtpEmail(err.response.data.pendingOtpEmail || err.response.data.email);
      }
      throw err;
    }
  };

  // Registration never logs the user in directly - it sends an OTP and
  // the caller should route to the verification screen.
const register = async (name, email, phone, password) => {
  const response = await registerUser({ name, email, phone, password });
  setPendingOtpEmail(response.data.pendingOtpEmail);
};

  const verifyOtp = async (email, otp) => {
    const res = await verifyOtpApi({ email, otp });
    localStorage.setItem('mindwell_token', res.data.token);
    setUser(res.data);
    setPendingOtpEmail(null);
  };

  const resendOtp = async (email) => resendOtpApi({ email });

  const logout = () => {
    localStorage.removeItem('mindwell_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, verifyOtp, resendOtp, logout, loading, pendingOtpEmail, setPendingOtpEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};
