import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="admin-login-page">
      <div className="login-bg-pattern" />

      <div className="login-container">
        <div className="login-card-wrapper">
          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">🍽️</div>
            <h1 className="login-brand-title">Sara's Curator</h1>
            <p className="login-brand-sub">Admin Dashboard</p>
          </div>

          {/* Login Card */}
          <form className={`login-card ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
            <h2 className="login-heading">Sign In</h2>
            <p className="login-subheading">Enter your credentials to access the admin panel</p>

            {error && (
              <div className="login-error">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-username">Username</label>
              <div className="login-input-wrap">
                <FiUser className="login-input-icon" size={18} />
                <input id="login-username" type="text" placeholder="Enter your username"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username" autoFocus />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <FiLock className="login-input-icon" size={18} />
                <input id="login-password" type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} /> Signing in...</>
              ) : (
                <><FiLogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="login-footer-text">
            Secure admin portal • Sara's Curator
          </p>
        </div>
      </div>
    </div>
  );
}
