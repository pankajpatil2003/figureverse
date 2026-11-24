import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fv-container fv-auth-page">
      <div className="fv-auth-card">
        <span className="fv-eyebrow">OPTIONAL COLLECTOR VAULT</span>
        <h1>SIGN IN TO FIGURE VERSE</h1>
        <p>
          Remember: <strong>Registration is never required to buy figures!</strong> Sign in only if
          you want to manage your saved orders or access the Custom Admin Panel.
        </p>

        {error && <div className="fv-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="fv-auth-form">
          <div className="fv-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@figureverse.com"
              required
            />
          </div>
          <div className="fv-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="fv-btn-primary fv-btn-block fv-btn-lg" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="fv-demo-credentials">
          <h5>Quick One-Click Demo Logins:</h5>
          <div className="fv-demo-btns">
            <button
              type="button"
              className="fv-tag-chip-btn"
              onClick={() => {
                setEmail('admin@figureverse.com');
                setPassword('Admin@123');
              }}
            >
              Fill Admin Login (admin@figureverse.com)
            </button>
            <button
              type="button"
              className="fv-tag-chip-btn"
              onClick={() => {
                setEmail('collector@figureverse.com');
                setPassword('Customer@123');
              }}
            >
              Fill Collector Login
            </button>
          </div>
        </div>

        <div className="fv-auth-footer">
          <span>New collector? <Link to="/register">Create an optional account</Link></span>
          <span>Or <Link to="/checkout">continue with Guest Checkout</Link></span>
        </div>
      </div>
    </div>
  );
}
