import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, PackageSearch, ShoppingBag, ShieldCheck, Copy, Check } from 'lucide-react';
import { apiFetch, formatINR } from '../api/client';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order && orderNumber) {
      apiFetch(`/orders/${orderNumber}`)
        .then((data) => setOrder(data.order))
        .catch(() => {});
    }
  }, [order, orderNumber]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard?.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return <div className="fv-container fv-loading">Loading your order receipt...</div>;
  }

  return (
    <div className="fv-container fv-success-page">
      <div className="fv-success-card">
        <div className="fv-success-icon">
          <CheckCircle2 size={54} />
        </div>
        <span className="fv-eyebrow">RAZORPAY PAYMENT VERIFIED</span>
        <h1>THANK YOU FOR YOUR COLLECTOR ORDER!</h1>
        <p>
          Your order has been confirmed and sent to our fulfillment vault.{' '}
          {!order.user_id && (
            <strong>
              Save your Order Number below to track your shipment anytime without logging in!
            </strong>
          )}
        </p>

        <div className="fv-order-number-pill">
          <div>
            <small>ORDER NUMBER</small>
            <strong>{order.order_number}</strong>
          </div>
          <button type="button" className="fv-btn-outline fv-btn-sm" onClick={copyOrderNumber}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>

        <div className="fv-receipt-grid">
          <div className="fv-receipt-box">
            <h5>Collector & Shipping Details</h5>
            <p><strong>{order.full_name}</strong> ({order.user_id ? 'Member' : 'Guest Checkout'})</p>
            <p>{order.email} • {order.phone}</p>
            <p>
              {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ''}, {order.city}, {order.state}{' '}
              - {order.postal_code}
            </p>
          </div>

          <div className="fv-receipt-box">
            <h5>Payment & Box Protection</h5>
            <p>
              Payment Status: <span className="fv-badge-paid">{order.payment_status.toUpperCase()}</span>
            </p>
            <p>
              Order Status: <span className="fv-badge-confirmed">{order.order_status.toUpperCase()}</span>
            </p>
            <p>Razorpay Payment ID: <code>{order.gateway_payment_id}</code></p>
            <p>
              Box Grade:{' '}
              <strong>
                {order.packaging_grade === 'collector'
                  ? 'Mint-Box Collector Grade (+₹199)'
                  : 'Standard Collector Box'}
              </strong>
            </p>
          </div>
        </div>

        <div className="fv-receipt-items">
          <h5>Ordered Figures</h5>
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="fv-receipt-item">
              <img src={item.figure_image_url} alt={item.figure_title} />
              <div>
                <strong>{item.figure_title}</strong>
                <small>
                  {item.category_name} • Qty: {item.quantity}
                </small>
              </div>
              <span>{formatINR(Number(item.unit_price) * Number(item.quantity))}</span>
            </div>
          ))}
          <div className="fv-receipt-total">
            <span>Total Paid Online</span>
            <strong>{formatINR(order.total_amount)}</strong>
          </div>
        </div>

        <div className="fv-success-actions">
          <Link
            to={`/track-order?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.email)}`}
            className="fv-btn-primary"
          >
            <PackageSearch size={18} /> Track Order Status
          </Link>
          <Link to="/catalog" className="fv-btn-outline">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
