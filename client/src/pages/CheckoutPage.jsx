import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  UserCheck,
  PackageCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch, formatINR } from '../api/client';
import RazorpayModal from '../components/RazorpayModal';

export default function CheckoutPage() {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    packagingGrade,
    setPackagingGrade,
    packagingFee,
    shippingFee,
    total,
    clearCart
  } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="fv-container fv-empty-state">
        <h2>No Figures in Cart for Checkout</h2>
        <Link to="/catalog" className="fv-btn-primary">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        packaging_grade: packagingGrade,
        items: items.map((item) => ({
          figure_id: item.id,
          quantity: item.quantity
        }))
      };

      const data = await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCreatedOrder(data.order);
      setRazorpayConfig(data.razorpay);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message || 'Could not initiate checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentPayload) => {
    if (!createdOrder) return;
    try {
      const verified = await apiFetch(`/orders/${createdOrder.order_number}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify(paymentPayload)
      });
      clearCart();
      setShowPaymentModal(false);
      navigate(`/order-success/${verified.order.order_number}`, {
        state: { order: verified.order }
      });
    } catch (err) {
      setError(err.message || 'Payment verification failed');
    }
  };

  return (
    <div className="fv-container fv-checkout-page">
      <div className="fv-page-header">
        <span className="fv-eyebrow">EXPRESS COLLECTOR CHECKOUT</span>
        <h1>SHIPPING & ONLINE PAYMENT</h1>
      </div>

      {/* Prominent Guest vs Registered Status Banner */}
      {!user ? (
        <div className="fv-checkout-mode-banner guest">
          <div className="fv-mode-banner-text">
            <Sparkles size={20} />
            <div>
              <strong>Checking Out as a Guest — No Registration Required!</strong>
              <p>
                Enter your shipping address below and pay online via Razorpay. Want to save your
                address or view order history in an account?{' '}
                <Link to="/login?redirect=/checkout">Sign In</Link> or{' '}
                <Link to="/register?redirect=/checkout">Create an Optional Account</Link>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="fv-checkout-mode-banner member">
          <div className="fv-mode-banner-text">
            <UserCheck size={20} />
            <div>
              <strong>Signed in as {user.full_name} ({user.email})</strong>
              <p>This order will automatically be linked to your Collector Vault account.</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="fv-alert-error">{error}</div>}

      <form onSubmit={handleCheckoutSubmit} className="fv-checkout-grid">
        <div className="fv-checkout-form-card">
          <h3>1. Collector Contact & Delivery Address</h3>

          <div className="fv-form-grid">
            <div className="fv-field">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g., Aarav Verma"
                required
              />
            </div>

            <div className="fv-field">
              <label>Email Address (for Receipt & Guest Order Tracking) *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="fv-field">
              <label>Mobile Number (for Courier SMS Alerts) *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="fv-field">
              <label>Country *</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>

            <div className="fv-field fv-field-full">
              <label>Street Address / Flat / Building *</label>
              <input
                type="text"
                name="address_line1"
                value={form.address_line1}
                onChange={handleChange}
                placeholder="House No, Building, Street, Area"
                required
              />
            </div>

            <div className="fv-field fv-field-full">
              <label>Landmark / Apartment Suite (Optional)</label>
              <input
                type="text"
                name="address_line2"
                value={form.address_line2}
                onChange={handleChange}
                placeholder="Near landmark..."
              />
            </div>

            <div className="fv-field">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g., Indore / Mumbai / Bengaluru"
                required
              />
            </div>

            <div className="fv-field">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g., Madhya Pradesh"
                required
              />
            </div>

            <div className="fv-field">
              <label>PIN / Postal Code *</label>
              <input
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                placeholder="452001"
                required
              />
            </div>
          </div>

          <h3 className="mt-4">2. BBTS Collector Packaging Grade</h3>
          <div className="fv-grade-options">
            <label className={`fv-grade-card ${packagingGrade === 'standard' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="checkout_grade"
                checked={packagingGrade === 'standard'}
                onChange={() => setPackagingGrade('standard')}
              />
              <div>
                <strong>Standard Collector Box (FREE)</strong>
                <small>Factory-sealed figure packed inside sturdy outer corrugated box</small>
              </div>
            </label>
            <label className={`fv-grade-card ${packagingGrade === 'collector' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="checkout_grade"
                checked={packagingGrade === 'collector'}
                onChange={() => setPackagingGrade('collector')}
              />
              <div>
                <strong>Mint-Box Collector Grade (+₹199)</strong>
                <small>Hand-selected C9+ mint packaging + heavy corner armor & polybag</small>
              </div>
            </label>
          </div>
        </div>

        {/* Right Summary & Razorpay Trigger */}
        <aside className="fv-checkout-summary-card">
          <h3>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Figures)</h3>

          <div className="fv-checkout-items">
            {items.map((item) => (
              <div key={item.id} className="fv-checkout-item">
                <img src={item.image_url} alt={item.title} />
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    Qty: {item.quantity} × {formatINR(item.price)}
                  </small>
                </div>
                <span>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="fv-summary-rows">
            <div className="fv-summary-row">
              <span>Figures Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="fv-summary-row">
              <span>Collector Packaging Grade</span>
              <span>{packagingFee === 0 ? 'FREE' : formatINR(packagingFee)}</span>
            </div>
            <div className="fv-summary-row">
              <span>Express Insured Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
            </div>
            <div className="fv-summary-row fv-summary-total">
              <span>Total Online Payable</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <div className="fv-payment-gateway-box">
            <div className="fv-pg-head">
              <CreditCard size={18} />
              <strong>Razorpay Online Payment Gateway</strong>
            </div>
            <p>Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards & NetBanking.</p>
          </div>

          <button
            type="submit"
            className="fv-btn-primary fv-btn-block fv-btn-lg"
            disabled={submitting}
          >
            <Lock size={17} />{' '}
            {submitting
              ? 'Creating Collector Order...'
              : `Proceed to Pay ${formatINR(total)} Online`}
          </button>
        </aside>
      </form>

      <RazorpayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={createdOrder}
        razorpayConfig={razorpayConfig}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
