import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../api/client';

const BADGE_LABELS = {
  in_stock: { text: 'IN STOCK', cls: 'badge-instock' },
  pre_order: { text: 'PRE-ORDER', cls: 'badge-preorder' },
  limited: { text: 'LIMITED GRAIL', cls: 'badge-limited' },
  hot_deal: { text: 'HOT DEAL', cls: 'badge-hotdeal' }
};

export default function FigureCard({ figure }) {
  const { addToCart, setQuickViewFigure } = useCart();
  const badgeInfo = BADGE_LABELS[figure.badge] || BADGE_LABELS.in_stock;

  return (
    <article className="fv-card">
      <div className="fv-card-media">
        <Link to={`/figure/${figure.slug}`} className="fv-card-img-link">
          <img src={figure.image_url} alt={figure.title} loading="lazy" />
        </Link>

        <div className="fv-card-badges-top">
          <span className={`fv-status-ribbon ${badgeInfo.cls}`}>{badgeInfo.text}</span>
          {figure.discount_percent > 0 && (
            <span className="fv-discount-badge">SAVE {figure.discount_percent}%</span>
          )}
        </div>

        <button
          type="button"
          className="fv-quickview-btn"
          onClick={() => setQuickViewFigure(figure)}
          title="Quick View Specs"
        >
          <Eye size={16} /> Quick View
        </button>
      </div>

      <div className="fv-card-body">
        <div className="fv-card-taxonomy">
          <Link
            to={`/catalog?category=${figure.category_slug}`}
            className="fv-card-cat"
            style={{ color: figure.category_color || '#f43f5e' }}
          >
            {figure.category_name}
          </Link>
          {figure.team_name && (
            <Link to={`/catalog?team=${figure.team_slug}`} className="fv-card-team">
              <Shield size={11} /> {figure.team_name}
            </Link>
          )}
          <span className="fv-card-scale">{figure.scale}</span>
        </div>

        <Link to={`/figure/${figure.slug}`} className="fv-card-title">
          {figure.title}
        </Link>

        <div className="fv-card-sub">
          <span>{figure.manufacturer}</span>
          <span className="fv-card-rating">
            <Star size={12} fill="#f59e0b" color="#f59e0b" /> {figure.rating} ({figure.review_count})
          </span>
        </div>

        {Array.isArray(figure.tags) && figure.tags.length > 0 && (
          <div className="fv-card-tags">
            {figure.tags.slice(0, 2).map((tg) => (
              <span
                key={tg.id}
                className="fv-tag-chip"
                style={{ borderColor: `${tg.color}55`, color: tg.color }}
              >
                {tg.name}
              </span>
            ))}
          </div>
        )}

        <div className="fv-card-footer">
          <div className="fv-price-block">
            <span className="fv-price-current">{formatINR(figure.price)}</span>
            {figure.original_price && figure.original_price > figure.price && (
              <span className="fv-price-old">{formatINR(figure.original_price)}</span>
            )}
          </div>

          <button
            type="button"
            className="fv-add-btn"
            disabled={figure.stock <= 0}
            onClick={() => addToCart(figure, 1, true)}
          >
            <ShoppingBag size={16} />
            {figure.stock <= 0 ? 'Sold Out' : figure.badge === 'pre_order' ? 'Pre-Order' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
