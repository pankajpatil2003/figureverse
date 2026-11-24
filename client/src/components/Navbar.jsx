import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShieldCheck,
  Truck,
  Sparkles,
  User,
  PackageSearch,
  LayoutDashboard,
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api/client';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    apiFetch('/categories')
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <header className="fv-header">
      {/* Top Collector Ticker inspired by Superhero Toy Store & BBTS */}
      <div className="fv-topbar">
        <div className="fv-container fv-topbar-inner">
          <div className="fv-topbar-perks">
            <span>
              <Truck size={14} /> FREE Express Shipping on Orders Over ₹1,999
            </span>
            <span className="fv-divider">•</span>
            <span>
              <ShieldCheck size={14} /> 100% Authentic Collector Imports & Mint-Box Option
            </span>
            <span className="fv-divider">•</span>
            <span className="fv-highlight-pill">
              <Sparkles size={13} /> Instant Guest Checkout — No Account Required
            </span>
          </div>
          <div className="fv-topbar-links">
            <Link to="/track-order" className="fv-toplink">
              <PackageSearch size={14} /> Track Guest Order
            </Link>
            {isAdmin && (
              <Link to="/admin" className="fv-toplink fv-admin-badge">
                <LayoutDashboard size={14} /> Admin Command Center
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="fv-mainbar">
        <div className="fv-container fv-mainbar-inner">
          <Link to="/" className="fv-brand">
            <div className="fv-brand-emblem">FV</div>
            <div>
              <span className="fv-brand-title">FIGURE VERSE</span>
              <span className="fv-brand-sub">COLLECTOR ACTION FIGURES & STATUES</span>
            </div>
          </Link>

          <form className="fv-search-bar" onSubmit={handleSearch}>
            <Search size={18} className="fv-search-icon" />
            <input
              type="text"
              placeholder="Search Mafex, Fondjoy, ZD Toys, CT Toys, Spider-Man, Batman, Gojo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="fv-search-btn">
              Search
            </button>
          </form>

          <div className="fv-header-actions">
            {user ? (
              <div className="fv-user-menu">
                <Link to={isAdmin ? '/admin' : '/account/orders'} className="fv-action-btn">
                  <User size={18} />
                  <div className="fv-action-meta">
                    <small>{user.role === 'admin' ? 'Admin' : 'Collector'}</small>
                    <span>{user.full_name.split(' ')[0]}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="fv-icon-btn"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="fv-action-btn">
                <User size={18} />
                <div className="fv-action-meta">
                  <small>Optional Account</small>
                  <span>Sign In / Join</span>
                </div>
              </Link>
            )}

            <button
              type="button"
              className="fv-cart-trigger"
              onClick={() => setIsDrawerOpen(true)}
            >
              <ShoppingBag size={20} />
              <div className="fv-action-meta">
                <small>Collector Box</small>
                <span>Cart ({itemCount})</span>
              </div>
              {itemCount > 0 && <span className="fv-cart-badge">{itemCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 8-Category Department Mega Strip */}
      <nav className="fv-catbar">
        <div className="fv-container fv-catbar-inner">
          <Link
            to="/catalog"
            className={`fv-cat-pill ${location.pathname === '/catalog' && !location.search ? 'active' : ''}`}
          >
            <Flame size={14} /> All Figures
          </Link>
          {categories.map((cat) => {
            const isActive = location.search.includes(`category=${cat.slug}`);
            return (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className={`fv-cat-pill ${isActive ? 'active' : ''}`}
                style={{ '--cat-accent': cat.accent_color || '#e11d48' }}
              >
                <span
                  className="fv-cat-dot"
                  style={{ backgroundColor: cat.accent_color || '#e11d48' }}
                />
                {cat.name}
              </Link>
            );
          })}
          <Link
            to="/catalog?badge=pre_order"
            className={`fv-cat-pill fv-cat-special ${location.search.includes('badge=pre_order') ? 'active' : ''}`}
          >
            Pre-Orders
          </Link>
          <Link
            to="/catalog?badge=hot_deal"
            className={`fv-cat-pill fv-cat-deal ${location.search.includes('badge=hot_deal') ? 'active' : ''}`}
          >
            Hot Deals
          </Link>
        </div>
      </nav>
    </header>
  );
}
