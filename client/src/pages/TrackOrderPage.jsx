import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, CheckCircle2, Truck, Clock, ShieldCheck } from 'lucide-react';
import { apiFetch, formatINR } from '../api/client';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/orders/track', {
        method: 'POST',
        body: JSON.stringify({
          order_number: orderNumber.trim(),
          email: email.trim()
        })
      });
      setOrder(data.order);
    } catch (err) {
      setOrder(null);
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('email')) {
      handleLookup();
    }
  }, []);

  return (
    <div className="fv-container fv-track-page">
      <div className="fv-page-header">
        <span className="fv-eyebrow">NO LOGIN REQUIRED</span>
        <h1>TRACK YOUR GUEST OR MEMBER ORDER</h1>
        <p>
          Enter your Figure Verse Order Number (e.g. <code>FV-100421</code>) and the Email used at
          checkout.
        </p>
      </div>

      <div className="fv-track-box">
        <form onSubmit={handleLookup} className="fv-track-form">
          <div className="fv-field">
            <label>Order Number *</label>
            <input
              type="text"
              placeholder="e.g., FV-100421"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="fv-field">
            <label>Checkout Email Address *</label>
            <input
              type="email"
              placeholder="e.g., rohan.guest@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="fv-btn-primary" disabled={loading}>
            <PackageSearch size={18} /> {loading ? 'Searching...' : 'Track Shipment'}
          </button>
        </form>

        <div className="fv-demo-hint">
          <span>Try Sample Guest Order:</span>
          <button
            type="button"
            className="fv-tag-chip-btn"
            onClick={() => {
              setOrderNumber('FV-100421');
              setEmail('rohan.guest@example.com');
            }}
          >
            Fill Demo Order (FV-100421 / rohan.guest@example.com)
          </button>
        </div>
      </div>

      {error && <div className="fv-alert-error">{error}</div>}

      {order && (
        <div className="fv-tracked-result">
          <div className="fv-tracked-header">
            <div>
              <span className="fv-eyebrow">
                {order.user_id ? 'REGISTERED MEMBER ORDER' : 'GUEST CHECKOUT ORDER'}
              </span>
              <h3>Order #{order.order_number}</h3>
              <small>Placed on {new Date(order.created_at).toLocaleString()}</small>
            </div>
            <div className="fv-tracked-badges">
              <span className={`fv-status-pill status-${order.payment_status}`}>
                Payment: {order.payment_status.toUpperCase()}
              </span>
              <span className={`fv-status-pill status-${order.order_status}`}>
                Fulfillment: {order.order_status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Fulfillment Stepper */}
          <div className="fv-progress-steps">
            {['processing', 'confirmed', 'shipped', 'delivered'].map((st, idx) => {
              const orderIdx = ['processing', 'confirmed', 'shipped', 'delivered'].indexOf(
                order.order_status
              );
              const done = orderIdx >= idx;
              return (
                <div key={st} className={`fv-step ${done ? 'done' : ''}`}>
                  <div className="fv-step-circle">{idx + 1}</div>
                  <span>{st.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          <div className="fv-receipt-grid">
            <div className="fv-receipt-box">
              <h5>Delivery Destination</h5>
              <p><strong>{order.full_name}</strong></p>
              <p>{order.email} • {order.phone}</p>
              <p>
                {order.address_line1}, {order.city}, {order.state} - {order.postal_code}
              </p>
            </div>
            <div className="fv-receipt-box">
              <h5>Payment & Box Grade</h5>
              <p>Gateway: Razorpay ({order.gateway_payment_id || 'Pending'})</p>
              <p>
                Packaging:{' '}
                <strong>
                  {order.packaging_grade === 'collector'
                    ? 'Mint-Box Collector Grade'
                    : 'Standard Collector Box'}
                </strong>
              </p>
              <p>Total Amount: <strong>{formatINR(order.total_amount)}</strong></p>
            </div>
          </div>

          <div className="fv-receipt-items">
            <h5>Items in Shipment</h5>
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="fv-receipt-item">
                <img src={item.figure_image_url} alt={item.figure_title} />
                <div>
                  <strong>{item.figure_title}</strong>
                  <small>Qty: {item.quantity}</small>
                </div>
                <span>{formatINR(Number(item.unit_price) * Number(item.quantity))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
