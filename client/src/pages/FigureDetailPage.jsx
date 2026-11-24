import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  PackageCheck,
  Truck,
  Star,
  Shield,
  Tag,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { apiFetch, formatINR } from '../api/client';
import { useCart } from '../context/CartContext';
import FigureCard from '../components/FigureCard';

export default function FigureDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, packagingGrade, setPackagingGrade } = useCart();

  const [figure, setFigure] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/figures/${slug}`)
      .then((data) => {
        setFigure(data.figure);
        setRelated(data.related || []);
        setActiveImage(data.figure.image_url);
        setQty(1);
      })
      .catch(() => setFigure(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="fv-container fv-loading">Loading collector specifications...</div>;
  }

  if (!figure) {
    return (
      <div className="fv-container fv-empty-state">
        <h2>Figure Not Found</h2>
        <Link to="/catalog" className="fv-btn-primary">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const gallery =
    Array.isArray(figure.gallery_urls) && figure.gallery_urls.length > 0
      ? figure.gallery_urls
      : [figure.image_url];

  const handleBuyNow = () => {
    addToCart(figure, qty, false);
    navigate('/checkout');
  };

  return (
    <div className="fv-detail-page fv-container">
      <div className="fv-breadcrumb">
        <Link to="/catalog" className="fv-back-link">
          <ArrowLeft size={15} /> Back to Vault
        </Link>
        <span>/</span>
        <Link to={`/catalog?category=${figure.category_slug}`}>{figure.category_name}</Link>
        {figure.team_name && (
          <>
            <span>/</span>
            <Link to={`/catalog?team=${figure.team_slug}`}>{figure.team_name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-muted">{figure.title}</span>
      </div>

      <div className="fv-detail-grid">
        {/* Left: Product Image Gallery */}
        <div className="fv-detail-gallery">
          <div className="fv-detail-main-img">
            <img src={activeImage || figure.image_url} alt={figure.title} />
            {figure.discount_percent > 0 && (
              <span className="fv-discount-badge">SAVE {figure.discount_percent}%</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="fv-detail-thumbs">
              {gallery.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`fv-thumb-btn ${activeImage === url ? 'active' : ''}`}
                  onClick={() => setActiveImage(url)}
                >
                  <img src={url} alt={`${figure.title} view ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Collector Controls */}
        <div className="fv-detail-info">
          <div className="fv-detail-badges">
            <Link
              to={`/catalog?category=${figure.category_slug}`}
              className="fv-pill-category"
              style={{ backgroundColor: figure.category_color || '#e11d48' }}
            >
              {figure.category_name}
            </Link>
            {figure.team_name && (
              <Link to={`/catalog?team=${figure.team_slug}`} className="fv-pill-team">
                <Shield size={13} /> Team: {figure.team_name}
              </Link>
            )}
            <span className="fv-pill-sku">SKU: {figure.sku}</span>
          </div>

          <h1>{figure.title}</h1>

          <div className="fv-detail-rating-row">
            <div className="fv-stars">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <strong>{figure.rating}</strong>
              <span>({figure.review_count} Collector Reviews)</span>
            </div>
            <span className="fv-stock-pill">
              <CheckCircle2 size={14} />{' '}
              {figure.stock > 0 ? `${figure.stock} Units in Collector Vault` : 'Out of Stock'}
            </span>
          </div>

          <div className="fv-detail-price-box">
            <div>
              <span className="fv-detail-price">{formatINR(figure.price)}</span>
              {figure.original_price && figure.original_price > figure.price && (
                <span className="fv-detail-mrp">MRP {formatINR(figure.original_price)}</span>
              )}
            </div>
            <small>Inclusive of all taxes • Instant Guest or Member Checkout</small>
          </div>

          <p className="fv-detail-description">{figure.description}</p>

          {/* Collector Tags */}
          {Array.isArray(figure.tags) && figure.tags.length > 0 && (
            <div className="fv-detail-tags">
              {figure.tags.map((tg) => (
                <Link
                  key={tg.id}
                  to={`/catalog?tag=${tg.slug}`}
                  className="fv-tag-pill"
                  style={{ borderColor: `${tg.color}77`, color: tg.color }}
                >
                  <Tag size={12} /> {tg.name}
                </Link>
              ))}
            </div>
          )}

          {/* BBTS Inspired Packaging Grade Option */}
          <div className="fv-detail-grade-box">
            <h5>
              <PackageCheck size={16} /> Select BBTS-Style Collector Box Grade:
            </h5>
            <div className="fv-grade-options">
              <label className={`fv-grade-card ${packagingGrade === 'standard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="detail_grade"
                  checked={packagingGrade === 'standard'}
                  onChange={() => setPackagingGrade('standard')}
                />
                <div>
                  <strong>Standard Collector Grade (FREE)</strong>
                  <small>Brand-new factory sealed figure shipped in double-wall carton</small>
                </div>
              </label>
              <label className={`fv-grade-card ${packagingGrade === 'collector' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="detail_grade"
                  checked={packagingGrade === 'collector'}
                  onChange={() => setPackagingGrade('collector')}
                />
                <div>
                  <strong>Mint-Box Collector Grade (+₹199)</strong>
                  <small>Hand-picked C9+ mint window box + extra bubble wrap & polybag</small>
                </div>
              </label>
            </div>
          </div>

          {/* Purchase CTA Bar */}
          <div className="fv-detail-buy-row">
            <div className="fv-qty-stepper fv-qty-lg">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(figure.stock || 10, q + 1))}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="fv-btn-primary fv-btn-lg"
              disabled={figure.stock <= 0}
              onClick={() => addToCart(figure, qty, true)}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>

            <button
              type="button"
              className="fv-btn-gold fv-btn-lg"
              disabled={figure.stock <= 0}
              onClick={handleBuyNow}
            >
              <Zap size={18} /> Instant Guest Buy
            </button>
          </div>

          {/* Technical Specifications Table */}
          <div className="fv-spec-card">
            <h4>Collector Specifications & Box Contents</h4>
            <div className="fv-spec-table">
              <div>
                <span>Character</span>
                <strong>{figure.character_name}</strong>
              </div>
              <div>
                <span>Franchise / Series</span>
                <strong>{figure.franchise || figure.category_name}</strong>
              </div>
              <div>
                <span>Manufacturer / Line</span>
                <strong>{figure.manufacturer}</strong>
              </div>
              <div>
                <span>Scale & Height</span>
                <strong>
                  {figure.scale} Scale ({figure.height_cm} cm)
                </strong>
              </div>
              <div>
                <span>Materials</span>
                <strong>{figure.material}</strong>
              </div>
              <div>
                <span>Team Affiliation</span>
                <strong>{figure.team_name || 'Solo Release'}</strong>
              </div>
              <div className="fv-spec-full">
                <span>Included in Box</span>
                <strong>{figure.box_contents}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Figures */}
      {related.length > 0 && (
        <section className="fv-section">
          <div className="fv-section-head">
            <div>
              <span className="fv-eyebrow">COMPLETE YOUR DISPLAY SHELF</span>
              <h2>RELATED FIGURES IN THIS UNIVERSE</h2>
            </div>
          </div>
          <div className="fv-product-grid">
            {related.map((fig) => (
              <FigureCard key={fig.id} figure={fig} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
