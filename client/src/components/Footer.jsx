import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Package, CreditCard, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fv-footer">
      <div className="fv-trust-strip">
        <div className="fv-container fv-trust-grid">
          <div className="fv-trust-item">
            <ShieldCheck size={28} className="fv-trust-icon" />
            <div>
              <h4>100% Authentic Licenses</h4>
              <p>Official Medicom Mafex, Fondjoy, ZD Toys, CT Toys, Bandai & Marvel/DC imports.</p>
            </div>
          </div>
          <div className="fv-trust-item">
            <Package size={28} className="fv-trust-icon" />
            <div>
              <h4>BBTS-Grade Collector Packaging</h4>
              <p>Choose Standard or Mint-Box Collector Grade double-wall armor protection at checkout.</p>
            </div>
          </div>
          <div className="fv-trust-item">
            <Sparkles size={28} className="fv-trust-icon" />
            <div>
              <h4>Instant Guest Checkout</h4>
              <p>Buy immediately without registration, or create an account anytime to track your vault.</p>
            </div>
          </div>
          <div className="fv-trust-item">
            <CreditCard size={28} className="fv-trust-icon" />
            <div>
              <h4>Razorpay Verified Payments</h4>
              <p>Pay securely via UPI, Credit/Debit Cards, NetBanking & EMI with instant confirmation.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fv-container fv-footer-main">
        <div className="fv-footer-brand">
          <div className="fv-brand">
            <div className="fv-brand-emblem">FV</div>
            <div>
              <span className="fv-brand-title">FIGURE VERSE</span>
              <span className="fv-brand-sub">ULTIMATE COLLECTOR VAULT</span>
            </div>
          </div>
          <p className="fv-footer-desc">
            India’s premier action figure and statue destination inspired by Superhero Toy Store &
            BigBadToyStore. Curating Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex, and Gaming
            grails.
          </p>
        </div>

        <div className="fv-footer-col">
          <h5>Catalog Universe</h5>
          <ul>
            <li><Link to="/catalog?category=marvel">Marvel Legends & Imports</Link></li>
            <li><Link to="/catalog?category=dc">DC Multiverse</Link></li>
            <li><Link to="/catalog?category=fondjoy">Fondjoy 1/9 Deluxe</Link></li>
            <li><Link to="/catalog?category=ct-toys">CT Toys 1/12 Series</Link></li>
            <li><Link to="/catalog?category=zd-toys">ZD Toys Hall of Armor</Link></li>
            <li><Link to="/catalog?category=anime">Anime Statues & S.H.Figuarts</Link></li>
            <li><Link to="/catalog?category=mafex">Medicom Toy MAFEX</Link></li>
            <li><Link to="/catalog?category=gaming-figures">Gaming Figures</Link></li>
          </ul>
        </div>

        <div className="fv-footer-col">
          <h5>Collector Services</h5>
          <ul>
            <li><Link to="/track-order">Track Guest Order</Link></li>
            <li><Link to="/cart">Shopping Cart & Box Grade</Link></li>
            <li><Link to="/checkout">Express Guest Checkout</Link></li>
            <li><Link to="/login">Collector Sign In</Link></li>
            <li><Link to="/admin">Custom Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="fv-footer-bottom">
        <div className="fv-container fv-footer-bottom-inner">
          <span>© {new Date().getFullYear()} Figure Verse Collector Store. Built with React, Node.js & PostgreSQL.</span>
          <span>Guest Checkout Enabled • Razorpay Secured</span>
        </div>
      </div>
    </footer>
  );
}
