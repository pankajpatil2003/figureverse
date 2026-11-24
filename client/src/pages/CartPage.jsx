import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, PackageCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../api/client';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    packagingGrade,
    setPackagingGrade,
    packagingFee,
    shippingFee,
    total
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="fv-container fv-empty-state">
        <ShoppingBag size={52} />
        <h2>Your Collector Cart is Empty</h2>
        <p>Add figures from Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex, or Gaming Figures.</p>
        <Link to="/catalog" className="fv-btn-primary">
          Explore the Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="fv-container fv-cart-page">
      <div className="fv-page-header">
        <span className="fv-eyebrow">COLLECTOR SHIPMENT</span>
        <h1>YOUR SHOPPING CART</h1>
      </div>

      <div className="fv-cart-grid">
        <div className="fv-cart-list">
          {items.map((item) => (
            <div key={item.id} className="fv-cart-row">
              <img src={item.image_url} alt={item.title} />
              <div className="fv-cart-row-details">
                <span className="fv-drawer-item-cat">
                  {item.category_name} {item.team_name ? `• ${item.team_name}` : ''}
                </span>
                <Link to={`/figure/${item.slug}`} className="fv-cart-row-title">
                  {item.title}
                </Link>
                <span className="fv-cart-unit-price">Unit Price: {formatINR(item.price)}</span>
              </div>

              <div className="fv-qty-stepper">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="fv-cart-row-subtotal">
                <strong>{formatINR(item.price * item.quantity)}</strong>
              </div>

              <button
                type="button"
                className="fv-remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        <aside className="fv-cart-summary-card">
          <h3>Order & Box Summary</h3>

          <div className="fv-grade-selector">
            <div className="fv-grade-header">
              <PackageCheck size={16} />
              <span>Collector Packaging Grade</span>
            </div>
            <div className="fv-grade-options">
              <label className={`fv-grade-card ${packagingGrade === 'standard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cart_grade"
                  checked={packagingGrade === 'standard'}
                  onChange={() => setPackagingGrade('standard')}
                />
                <div>
                  <strong>Standard Box (FREE)</strong>
                  <small>Double-wall outer shipping carton</small>
                </div>
              </label>
              <label className={`fv-grade-card ${packagingGrade === 'collector' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cart_grade"
                  checked={packagingGrade === 'collector'}
                  onChange={() => setPackagingGrade('collector')}
                />
                <div>
                  <strong>Mint-Box Collector Grade (+₹199)</strong>
                  <small>C9+ box inspection & triple-layer armor</small>
                </div>
              </label>
            </div>
          </div>

          <div className="fv-summary-rows">
            <div className="fv-summary-row">
              <span>Items Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="fv-summary-row">
              <span>Packaging Protection</span>
              <span>{packagingFee === 0 ? 'FREE' : formatINR(packagingFee)}</span>
            </div>
            <div className="fv-summary-row">
              <span>Express Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
            </div>
            <div className="fv-summary-row fv-summary-total">
              <span>Total Payable</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <div className="fv-guest-callout">
            <Sparkles size={15} />
            <span>No account required! Proceed directly as a Guest or sign in at checkout.</span>
          </div>

          <button
            type="button"
            className="fv-btn-primary fv-btn-block fv-btn-lg"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
}
