import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Shield,
  Tag
} from 'lucide-react';
import { apiFetch, formatINR } from '../api/client';
import FigureCard from '../components/FigureCard';
import { useCart } from '../context/CartContext';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'MEDICOM TOY MAFEX & CT TOYS DROP',
    title: 'SPIDER-VERSE & SYMBIOTE GRAILS HAVE LANDED',
    subtitle:
      'From MAFEX No.185 Classic Comic Spider-Man to CT Toys 1/12 Black Suit Symbiote & Agent Venom. Guest checkout enabled — zero registration delay.',
    ctaText: 'Shop Spider-Verse & Mafex',
    ctaLink: '/catalog?category=mafex',
    secondaryText: 'Explore CT Toys 1/12',
    secondaryLink: '/catalog?category=ct-toys',
    bgImage:
      'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1400&q=85',
    badge: 'MINT-BOX GUARANTEED'
  },
  {
    id: 2,
    tag: 'FONDJOY 1/9 & ZD TOYS HALL OF ARMOR',
    title: 'ARMORED LEGENDS: DARK KNIGHT & IRON MAN MK 85 LED',
    subtitle:
      'USB-rechargeable LED Arc Reactors, diecast alloy frames, and wired cloth capes. Official licensed imports from Fondjoy and ZD Toys.',
    ctaText: 'Shop ZD Toys LED Armor',
    ctaLink: '/catalog?category=zd-toys',
    secondaryText: 'Shop Fondjoy DC 1/9',
    secondaryLink: '/catalog?category=fondjoy',
    bgImage:
      'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=1400&q=85',
    badge: 'LED LIGHT-UP SERIES'
  },
  {
    id: 3,
    tag: 'SHONEN JUMP & NEXT-GEN GAMING STATUES',
    title: 'GEAR 5 LUFFY, GOJO SATORU & BLACK MYTH: WUKONG',
    subtitle:
      'Imported Japanese S.H.Figuarts, MegaHouse P.O.P statues, and God of War Ragnarök Kratos with real diecast blades.',
    ctaText: 'Explore Anime Vault',
    ctaLink: '/catalog?category=anime',
    secondaryText: 'Shop Gaming Figures',
    secondaryLink: '/catalog?category=gaming-figures',
    bgImage:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1400&q=85',
    badge: 'IMPORT EXCLUSIVES'
  }
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [meta, setMeta] = useState({ categories: [], teams: [], tags: [] });
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([apiFetch('/catalog-meta'), apiFetch('/figures')])
      .then(([metaData, figData]) => {
        setMeta({
          categories: metaData.categories || [],
          teams: metaData.teams || [],
          tags: metaData.tags || []
        });
        setFigures(figData.figures || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = HERO_SLIDES[activeSlide];
  const featuredFigures = figures.filter((f) => f.is_featured).slice(0, 8);
  const hotDeals = figures.filter((f) => f.badge === 'hot_deal' || f.discount_percent >= 15).slice(0, 4);
  const spotlightGrail = figures[0];

  return (
    <div className="fv-home">
      {/* SuperheroToyStore & BBTS Inspired Hero Showcase */}
      <section className="fv-hero">
        <div
          className="fv-hero-bg"
          style={{ backgroundImage: `url(${currentHero.bgImage})` }}
        />
        <div className="fv-hero-overlay" />
        <div className="fv-container fv-hero-inner">
          <div className="fv-hero-content">
            <div className="fv-hero-tags">
              <span className="fv-hero-pill">
                <Sparkles size={13} /> {currentHero.tag}
              </span>
              <span className="fv-hero-badge">{currentHero.badge}</span>
            </div>
            <h1>{currentHero.title}</h1>
            <p>{currentHero.subtitle}</p>
            <div className="fv-hero-ctas">
              <Link to={currentHero.ctaLink} className="fv-btn-primary fv-btn-lg">
                {currentHero.ctaText} <ArrowRight size={18} />
              </Link>
              <Link to={currentHero.secondaryLink} className="fv-btn-glass fv-btn-lg">
                {currentHero.secondaryText}
              </Link>
            </div>

            <div className="fv-hero-dots">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`fv-hero-dot ${idx === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>

          {spotlightGrail && (
            <div className="fv-hero-spotlight-card">
              <span className="fv-spotlight-tag">
                <Flame size={13} /> COLLECTOR GRAIL OF THE WEEK
              </span>
              <img src={spotlightGrail.image_url} alt={spotlightGrail.title} />
              <div className="fv-spotlight-info">
                <small>{spotlightGrail.category_name} • {spotlightGrail.scale} Scale</small>
                <h3>{spotlightGrail.title}</h3>
                <div className="fv-spotlight-price-row">
                  <div>
                    <strong>{formatINR(spotlightGrail.price)}</strong>
                    {spotlightGrail.original_price && (
                      <span>{formatINR(spotlightGrail.original_price)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="fv-btn-primary fv-btn-sm"
                    onClick={() => addToCart(spotlightGrail, 1, true)}
                  >
                    Instant Buy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8 Official Categories Bento Grid */}
      <section className="fv-section">
        <div className="fv-container">
          <div className="fv-section-head">
            <div>
              <span className="fv-eyebrow">OFFICIAL DEPARTMENTS & BRANDS</span>
              <h2>SHOP BY CATALOGUE UNIVERSE</h2>
            </div>
            <Link to="/catalog" className="fv-link-arrow">
              View Complete Vault ({figures.length} Figures) <ArrowRight size={16} />
            </Link>
          </div>

          <div className="fv-cat-bento">
            {meta.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="fv-cat-card"
                style={{ '--cat-color': cat.accent_color || '#e11d48' }}
              >
                <img src={cat.banner_image_url} alt={cat.name} loading="lazy" />
                <div className="fv-cat-card-overlay" />
                <div className="fv-cat-card-content">
                  <span
                    className="fv-cat-count"
                    style={{ backgroundColor: cat.accent_color || '#e11d48' }}
                  >
                    {cat.figure_count || 0} Figures
                  </span>
                  <h3>{cat.name}</h3>
                  <p>{cat.tagline}</p>
                  <span className="fv-cat-explore">
                    Explore {cat.name} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Superhero & Anime Teams + Collector Tags */}
      <section className="fv-section fv-section-alt">
        <div className="fv-container">
          <div className="fv-section-head">
            <div>
              <span className="fv-eyebrow">ROSTER & FACTIONS</span>
              <h2>SHOP BY ICONIC TEAMS & SPECIALTY TAGS</h2>
            </div>
          </div>

          <div className="fv-teams-grid">
            {meta.teams.map((team) => (
              <Link
                key={team.id}
                to={`/catalog?team=${team.slug}`}
                className="fv-team-tile"
                style={{ '--team-color': team.badge_color || '#f59e0b' }}
              >
                <div className="fv-team-tile-top">
                  <span
                    className="fv-team-badge"
                    style={{ backgroundColor: `${team.badge_color}22`, color: team.badge_color }}
                  >
                    <Shield size={14} /> {team.franchise || 'Official Roster'}
                  </span>
                  <span className="fv-team-count">{team.figure_count || 0} items</span>
                </div>
                <h4>{team.name}</h4>
                <p>{team.description}</p>
              </Link>
            ))}
          </div>

          {meta.tags.length > 0 && (
            <div className="fv-tags-bar">
              <span className="fv-tags-bar-label">
                <Tag size={14} /> Filter by Collector Feature:
              </span>
              {meta.tags.map((tg) => (
                <Link
                  key={tg.id}
                  to={`/catalog?tag=${tg.slug}`}
                  className="fv-tag-pill"
                  style={{ borderColor: `${tg.color}66`, color: tg.color }}
                >
                  #{tg.name} ({tg.figure_count || 0})
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collector Grails */}
      <section className="fv-section">
        <div className="fv-container">
          <div className="fv-section-head">
            <div>
              <span className="fv-eyebrow">CURATED BY FIGURE VERSE</span>
              <h2>FEATURED COLLECTOR GRAILS</h2>
            </div>
            <Link to="/catalog?featured=true" className="fv-link-arrow">
              See All Featured <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="fv-loading">Loading Collector Vault...</div>
          ) : (
            <div className="fv-product-grid">
              {featuredFigures.map((fig) => (
                <FigureCard key={fig.id} figure={fig} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guest Checkout Callout Banner */}
      <section className="fv-container">
        <div className="fv-promo-banner">
          <div className="fv-promo-left">
            <span className="fv-promo-chip">
              <Zap size={14} /> ZERO-FRICTION COLLECTOR CHECKOUT
            </span>
            <h3>BUY WITHOUT REGISTRATION — OR CREATE YOUR OPTIONAL VAULT</h3>
            <p>
              Found a limited MAFEX, Fondjoy, or ZD Toys drop? Check out directly as a Guest in 30
              seconds with Razorpay UPI/Card payment and track your shipment anytime with your Order
              ID + Email.
            </p>
          </div>
          <div className="fv-promo-actions">
            <Link to="/catalog" className="fv-btn-primary">
              Start Shopping Now
            </Link>
            <Link to="/track-order" className="fv-btn-outline">
              Track Guest Order
            </Link>
          </div>
        </div>
      </section>

      {/* Collector Hot Deals */}
      {hotDeals.length > 0 && (
        <section className="fv-section">
          <div className="fv-container">
            <div className="fv-section-head">
              <div>
                <span className="fv-eyebrow">LIMITED TIME MARKDOWNS</span>
                <h2>SUPERHERO & ANIME HOT DEALS</h2>
              </div>
              <Link to="/catalog?sort=discount" className="fv-link-arrow">
                View All Deals <ArrowRight size={16} />
              </Link>
            </div>
            <div className="fv-product-grid">
              {hotDeals.map((fig) => (
                <FigureCard key={fig.id} figure={fig} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
