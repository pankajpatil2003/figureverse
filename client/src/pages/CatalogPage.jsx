import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search, SlidersHorizontal, Shield, Tag } from 'lucide-react';
import { apiFetch } from '../api/client';
import FigureCard from '../components/FigureCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], teams: [], tags: [] });
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedTeam = searchParams.get('team') || 'all';
  const selectedTag = searchParams.get('tag') || 'all';
  const selectedBadge = searchParams.get('badge') || 'all';
  const selectedScale = searchParams.get('scale') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';

  useEffect(() => {
    apiFetch('/catalog-meta')
      .then((data) =>
        setMeta({
          categories: data.categories || [],
          teams: data.teams || [],
          tags: data.tags || []
        })
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedTeam !== 'all') params.set('team', selectedTeam);
    if (selectedTag !== 'all') params.set('tag', selectedTag);
    if (selectedBadge !== 'all') params.set('badge', selectedBadge);
    if (selectedScale !== 'all') params.set('scale', selectedScale);
    if (searchQuery) params.set('search', searchQuery);
    if (sort) params.set('sort', sort);

    apiFetch(`/figures?${params.toString()}`)
      .then((data) => setFigures(data.figures || []))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedTeam, selectedTag, selectedBadge, selectedScale, searchQuery, sort]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchParams({});
  };

  const activeCategoryObj = meta.categories.find((c) => c.slug === selectedCategory);
  const activeTeamObj = meta.teams.find((t) => t.slug === selectedTeam);

  return (
    <div className="fv-catalog-page fv-container">
      {/* Category Hero Header */}
      <div className="fv-catalog-banner">
        <div>
          <span className="fv-eyebrow">
            {activeCategoryObj
              ? `OFFICIAL ${activeCategoryObj.name.toUpperCase()} VAULT`
              : activeTeamObj
              ? `TEAM ROSTER: ${activeTeamObj.name.toUpperCase()}`
              : 'COMPLETE COLLECTOR CATALOGUE'}
          </span>
          <h1>
            {activeCategoryObj
              ? activeCategoryObj.name
              : activeTeamObj
              ? activeTeamObj.name
              : 'All Action Figures & Statues'}
          </h1>
          <p>
            {activeCategoryObj
              ? activeCategoryObj.tagline
              : activeTeamObj
              ? activeTeamObj.description
              : 'Browse authentic Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex, and Gaming figures.'}
          </p>
        </div>
        <div className="fv-catalog-count-box">
          <strong>{figures.length}</strong>
          <span>Collector Releases</span>
        </div>
      </div>

      <div className="fv-catalog-layout">
        {/* BBTS-Style Sidebar Filter */}
        <aside className="fv-filter-sidebar">
          <div className="fv-filter-head">
            <span>
              <Filter size={16} /> Filter Vault
            </span>
            <button type="button" onClick={resetAllFilters} className="fv-reset-link">
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          {/* Keyword Filter */}
          <div className="fv-filter-group">
            <h5>Keyword / SKU</h5>
            <div className="fv-sidebar-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Filter character, brand..."
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
          </div>

          {/* 8 Categories Filter */}
          <div className="fv-filter-group">
            <h5>Categories & Brands</h5>
            <div className="fv-filter-list">
              <button
                type="button"
                className={`fv-filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => updateFilter('category', 'all')}
              >
                <span>All Categories</span>
              </button>
              {meta.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`fv-filter-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat.slug)}
                >
                  <span>
                    <i
                      className="fv-color-dot"
                      style={{ backgroundColor: cat.accent_color || '#e11d48' }}
                    />
                    {cat.name}
                  </span>
                  <small>{cat.figure_count || 0}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Teams Filter */}
          <div className="fv-filter-group">
            <h5>
              <Shield size={14} /> Teams & Factions
            </h5>
            <div className="fv-filter-list">
              <button
                type="button"
                className={`fv-filter-item ${selectedTeam === 'all' ? 'active' : ''}`}
                onClick={() => updateFilter('team', 'all')}
              >
                <span>All Teams</span>
              </button>
              {meta.teams.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  className={`fv-filter-item ${selectedTeam === tm.slug ? 'active' : ''}`}
                  onClick={() => updateFilter('team', tm.slug)}
                >
                  <span>{tm.name}</span>
                  <small>{tm.figure_count || 0}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Collector Tags Filter */}
          <div className="fv-filter-group">
            <h5>
              <Tag size={14} /> Specialty Tags
            </h5>
            <div className="fv-sidebar-tags">
              <button
                type="button"
                className={`fv-tag-chip-btn ${selectedTag === 'all' ? 'active' : ''}`}
                onClick={() => updateFilter('tag', 'all')}
              >
                All
              </button>
              {meta.tags.map((tg) => (
                <button
                  key={tg.id}
                  type="button"
                  className={`fv-tag-chip-btn ${selectedTag === tg.slug ? 'active' : ''}`}
                  onClick={() => updateFilter('tag', tg.slug)}
                >
                  #{tg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          <div className="fv-filter-group">
            <h5>Availability</h5>
            <div className="fv-filter-list">
              {[
                { id: 'all', label: 'All Releases' },
                { id: 'in_stock', label: 'In Stock Ready to Ship' },
                { id: 'pre_order', label: 'Collector Pre-Orders' },
                { id: 'limited', label: 'Limited Edition Grails' },
                { id: 'hot_deal', label: 'Hot Deals & Markdowns' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`fv-filter-item ${selectedBadge === b.id ? 'active' : ''}`}
                  onClick={() => updateFilter('badge', b.id)}
                >
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Figure Scale */}
          <div className="fv-filter-group">
            <h5>Scale</h5>
            <div className="fv-sidebar-tags">
              {['all', '1/12', '1/10', '1/9', '1/8'].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  className={`fv-tag-chip-btn ${selectedScale === sc ? 'active' : ''}`}
                  onClick={() => updateFilter('scale', sc)}
                >
                  {sc === 'all' ? 'All Scales' : sc}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Listing */}
        <div className="fv-catalog-main">
          <div className="fv-catalog-toolbar">
            <div className="fv-active-filters">
              {selectedCategory !== 'all' && (
                <span className="fv-active-chip" onClick={() => updateFilter('category', 'all')}>
                  Category: {selectedCategory} ✕
                </span>
              )}
              {selectedTeam !== 'all' && (
                <span className="fv-active-chip" onClick={() => updateFilter('team', 'all')}>
                  Team: {selectedTeam} ✕
                </span>
              )}
              {selectedTag !== 'all' && (
                <span className="fv-active-chip" onClick={() => updateFilter('tag', 'all')}>
                  Tag: #{selectedTag} ✕
                </span>
              )}
              {selectedBadge !== 'all' && (
                <span className="fv-active-chip" onClick={() => updateFilter('badge', 'all')}>
                  Status: {selectedBadge} ✕
                </span>
              )}
            </div>

            <div className="fv-sort-control">
              <SlidersHorizontal size={15} />
              <span>Sort by:</span>
              <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                <option value="popular">Collector Popularity</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="fv-loading">Loading figures...</div>
          ) : figures.length === 0 ? (
            <div className="fv-empty-state">
              <h3>No figures match these exact filter criteria</h3>
              <p>Try clearing one of the active filters or searching a different universe.</p>
              <button type="button" className="fv-btn-primary" onClick={resetAllFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="fv-product-grid">
              {figures.map((fig) => (
                <FigureCard key={fig.id} figure={fig} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
