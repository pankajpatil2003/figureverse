import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Shield, Ruler, Layers, Box, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../api/client';

export default function QuickViewModal() {
  const { quickViewFigure, setQuickViewFigure, addToCart } = useCart();

  if (!quickViewFigure) return null;

  const fig = quickViewFigure;

  return (
    <div className="fv-modal-backdrop" onClick={() => setQuickViewFigure(null)}>
      <div className="fv-quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="fv-modal-close"
          onClick={() => setQuickViewFigure(null)}
        >
          <X size={20} />
        </button>

        <div className="fv-quickview-grid">
          <div className="fv-quickview-img">
            <img src={fig.image_url} alt={fig.title} />
          </div>

          <div className="fv-quickview-content">
            <div className="fv-quickview-meta">
              <span className="fv-pill-category">{fig.category_name}</span>
              {fig.team_name && (
                <span className="fv-pill-team">
                  <Shield size={12} /> {fig.team_name}
                </span>
              )}
              <span className="fv-pill-sku">SKU: {fig.sku}</span>
            </div>

            <h3>{fig.title}</h3>

            <div className="fv-quickview-rating">
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <strong>{fig.rating}</strong>
              <span>({fig.review_count} verified collector reviews)</span>
            </div>

            <div className="fv-quickview-price">
              <span className="fv-price-lg">{formatINR(fig.price)}</span>
              {fig.original_price && fig.original_price > fig.price && (
                <>
                  <span className="fv-price-old-lg">{formatINR(fig.original_price)}</span>
                  <span className="fv-discount-badge">SAVE {fig.discount_percent}%</span>
                </>
              )}
            </div>

            <p className="fv-quickview-desc">{fig.description}</p>

            <div className="fv-specs-mini">
              <div>
                <Ruler size={15} />
                <span>Scale: <strong>{fig.scale}</strong> ({fig.height_cm} cm)</span>
              </div>
              <div>
                <Layers size={15} />
                <span>Maker: <strong>{fig.manufacturer}</strong></span>
              </div>
              <div>
                <Box size={15} />
                <span>Box: <strong>{fig.box_contents}</strong></span>
              </div>
            </div>

            <div className="fv-quickview-actions">
              <button
                type="button"
                className="fv-btn-primary"
                onClick={() => {
                  addToCart(fig, 1, true);
                  setQuickViewFigure(null);
                }}
              >
                <ShoppingBag size={17} /> Add to Collector Cart
              </button>
              <Link
                to={`/figure/${fig.slug}`}
                className="fv-btn-outline"
                onClick={() => setQuickViewFigure(null)}
              >
                Full Collector Specs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
