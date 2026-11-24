import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fv-container fv-auth-page">
      <div className="fv-auth-card">
        <span className="fv-eyebrow">OPTIONAL MEMBER ACCOUNT</span>
        <h1>JOIN THE FIGURE VERSE VAULT</h1>
        <p>
          Create an optional collector profile to auto-fill checkout details and link past guest
          orders placed with your email.
        </p>

        {error && <div className="fv-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="fv-auth-form">
          <div className="fv-field">
            <label>Full Name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Aarav Collector"
              required
            />
          </div>
          <div className="fv-field">
            <label>Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="fv-field">
            <label>Mobile Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="fv-field">
            <label>Password (6+ chars) *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="fv-btn-primary fv-btn-block fv-btn-lg" disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Create Collector Account'}
          </button>
        </form>

        <div className="fv-auth-footer">
          <span>Already have an account? <Link to="/login">Sign in</Link></span>
          <span>Want to skip registration? <Link to="/checkout">Use Guest Checkout</Link></span>
        </div>
      </div>
    </div>
  );
}
