import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  ShoppingCart,
  Store,
  LogOut,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (loading) {
    return <div className="fv-container fv-loading">Authenticating Admin Command Center...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="fv-container fv-auth-page">
        <div className="fv-auth-card">
          <ShieldAlert size={44} color="#e11d48" />
          <h2>ADMIN ACCESS REQUIRED</h2>
          <p>
            Please sign in with an Administrator account (e.g.{' '}
            <code>admin@figureverse.com</code> / <code>Admin@123</code>) to manage Figure Verse
            inventory, categories, tags, teams, prices, and orders.
          </p>
          <div className="fv-hero-ctas" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <Link to="/login?redirect=/admin" className="fv-btn-primary">
              Sign In as Admin
            </Link>
            <Link to="/" className="fv-btn-outline">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fv-admin-shell">
      <aside className="fv-admin-sidebar">
        <div className="fv-admin-brand">
          <div className="fv-brand-emblem">FV</div>
          <div>
            <strong>FIGURE VERSE</strong>
            <small>CUSTOM ADMIN STUDIO</small>
          </div>
        </div>

        <nav className="fv-admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <LayoutDashboard size={18} />
            <span>Dashboard & KPIs</span>
          </NavLink>
          <NavLink to="/admin/figures" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Boxes size={18} />
            <span>Figures & Prices CRUD</span>
          </NavLink>
          <NavLink to="/admin/taxonomy" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Layers size={18} />
            <span>Categories, Teams & Tags</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            <ShoppingCart size={18} />
            <span>Orders & Fulfillment</span>
          </NavLink>
        </nav>

        <div className="fv-admin-sidebar-footer">
          <button
            type="button"
            className="fv-admin-store-link"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>Switch to {theme === 'light' ? 'Dark' : 'White'} Theme</span>
          </button>
          <Link to="/" className="fv-admin-store-link">
            <Store size={16} /> View Live Storefront
          </Link>
          <button
            type="button"
            className="fv-admin-logout-btn"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut size={16} /> Sign Out ({user.full_name.split(' ')[0]})
          </button>
        </div>
      </aside>

      <main className="fv-admin-main">
        <Outlet />
      </main>
    </div>
  );
}
