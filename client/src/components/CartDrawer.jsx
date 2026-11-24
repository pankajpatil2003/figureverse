import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ShieldCheck, ArrowRight, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../api/client';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
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

  if (!isDrawerOpen) return null;

  const freeShippingRemaining = Math.max(0, 1999 - subtotal);

  return (
    <div className="fv-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
      <aside className="fv-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="fv-drawer-header">
          <div className="fv-drawer-title">
            <ShoppingBag size={20} />
            <span>COLLECTOR CART ({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <button
            type="button"
            className="fv-icon-btn"
            onClick={() => setIsDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="fv-shipping-meter">
          {freeShippingRemaining > 0 ? (
            <p>
              Add <strong>{formatINR(freeShippingRemaining)}</strong> more for{' '}
              <span className="text-accent">FREE Express Shipping!</span>
            </p>
          ) : (
            <p className="fv-shipping-unlocked">
              <ShieldCheck size={16} /> You unlocked <strong>FREE Express Collector Shipping!</strong>
            </p>
          )}
        </div>

        <div className="fv-drawer-body">
          {items.length === 0 ? (
            <div className="fv-empty-drawer">
              <ShoppingBag size={46} strokeWidth={1.3} />
              <h4>Your Collector Vault is Empty</h4>
              <p>Explore Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex & Gaming figures.</p>
              <button
                type="button"
                className="fv-btn-primary"
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/catalog');
                }}
              >
                Browse All Figures
              </button>
            </div>
          ) : (
            <>
              <div className="fv-drawer-items">
                {items.map((item) => (
                  <div key={item.id} className="fv-drawer-item">
                    <img src={item.image_url} alt={item.title} />
                    <div className="fv-drawer-item-info">
                      <span className="fv-drawer-item-cat">{item.category_name}</span>
                      <Link
                        to={`/figure/${item.slug}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className="fv-drawer-item-title"
                      >
                        {item.title}
                      </Link>
                      <div className="fv-drawer-item-controls">
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
                        <span className="fv-drawer-item-price">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="fv-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BBTS Inspired Collector Grade Packaging Selector */}
              <div className="fv-grade-selector">
                <div className="fv-grade-header">
                  <PackageCheck size={16} />
                  <span>BBTS-Style Packaging Grade</span>
                </div>
                <div className="fv-grade-options">
                  <label className={`fv-grade-card ${packagingGrade === 'standard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="drawer_grade"
                      checked={packagingGrade === 'standard'}
                      onChange={() => setPackagingGrade('standard')}
                    />
                    <div>
                      <strong>Standard Collector Box</strong>
                      <small>FREE • Sturdy corrugated box + foam corners</small>
                    </div>
                  </label>
                  <label className={`fv-grade-card ${packagingGrade === 'collector' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="drawer_grade"
                      checked={packagingGrade === 'collector'}
                      onChange={() => setPackagingGrade('collector')}
                    />
                    <div>
                      <strong>Mint-Box Collector Grade (+₹199)</strong>
                      <small>Hand-inspected C9+ mint box + heavy bubble armor</small>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="fv-drawer-footer">
            <div className="fv-summary-rows">
              <div className="fv-summary-row">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {packagingFee > 0 && (
                <div className="fv-summary-row">
                  <span>Collector Grade Mint Box</span>
                  <span>{formatINR(packagingFee)}</span>
                </div>
              )}
              <div className="fv-summary-row">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
              </div>
              <div className="fv-summary-row fv-summary-total">
                <span>Estimated Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <div className="fv-drawer-actions">
              <button
                type="button"
                className="fv-btn-primary fv-btn-block"
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/checkout');
                }}
              >
                Instant Checkout (Guest or Member) <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="fv-btn-outline fv-btn-block"
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/cart');
                }}
              >
                View Full Cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
