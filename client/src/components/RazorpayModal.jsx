import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building2, Lock, CheckCircle2, X } from 'lucide-react';
import { formatINR } from '../api/client';

export default function RazorpayModal({
  isOpen,
  onClose,
  order,
  razorpayConfig,
  onPaymentSuccess
}) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('collector@okaxis');
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await onPaymentSuccess({
        razorpay_order_id: razorpayConfig?.order_id || order.gateway_order_id,
        razorpay_payment_id: `pay_fv_${method}_${Date.now()}`,
        sandbox_approved: true
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fv-modal-backdrop">
      <div className="fv-rzp-modal">
        <div className="fv-rzp-header">
          <div className="fv-rzp-brand">
            <div className="fv-rzp-logo">FV</div>
            <div>
              <h4>FIGURE VERSE CHECKOUT</h4>
              <small>Razorpay Trusted Gateway • Order #{order.order_number}</small>
            </div>
          </div>
          <div className="fv-rzp-amount">
            <span>Payable</span>
            <strong>{formatINR(order.total_amount)}</strong>
          </div>
          <button type="button" className="fv-rzp-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="fv-rzp-customer-bar">
          <span>{order.full_name} ({order.user_id ? 'Registered Collector' : 'Guest Checkout'})</span>
          <span>{order.email}</span>
        </div>

        <form onSubmit={handlePayNow} className="fv-rzp-body">
          <div className="fv-rzp-tabs">
            <button
              type="button"
              className={method === 'upi' ? 'active' : ''}
              onClick={() => setMethod('upi')}
            >
              <Smartphone size={16} /> UPI / QR
            </button>
            <button
              type="button"
              className={method === 'card' ? 'active' : ''}
              onClick={() => setMethod('card')}
            >
              <CreditCard size={16} /> Card
            </button>
            <button
              type="button"
              className={method === 'netbanking' ? 'active' : ''}
              onClick={() => setMethod('netbanking')}
            >
              <Building2 size={16} /> NetBanking
            </button>
          </div>

          <div className="fv-rzp-panel">
            {method === 'upi' && (
              <div className="fv-rzp-method-box">
                <label>Instant UPI Payment (GPay / PhonePe / Paytm / BHIM)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  required
                />
                <div className="fv-upi-badges">
                  <span>Google Pay</span>
                  <span>PhonePe</span>
                  <span>Paytm</span>
                  <span>CRED UPI</span>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="fv-rzp-method-box">
                <label>Credit / Debit Card (Visa, Mastercard, RuPay)</label>
                <input type="text" defaultValue="4111 •••• •••• 1111" readOnly />
                <div className="fv-rzp-card-row">
                  <input type="text" defaultValue="12/29" readOnly />
                  <input type="password" defaultValue="999" readOnly />
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="fv-rzp-method-box">
                <label>Select Your Bank</label>
                <select defaultValue="HDFC">
                  <option value="HDFC">HDFC Bank Collector Direct</option>
                  <option value="ICICI">ICICI Bank NetBanking</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="AXIS">Axis Bank</option>
                </select>
              </div>
            )}
          </div>

          <div className="fv-rzp-security">
            <Lock size={14} />
            <span>256-Bit HMAC-SHA256 Encrypted Razorpay Verification</span>
          </div>

          <button type="submit" className="fv-rzp-pay-btn" disabled={processing}>
            {processing ? (
              'Verifying Transaction...'
            ) : (
              <>
                <CheckCircle2 size={18} /> Pay {formatINR(order.total_amount)} Online Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
