import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  Search,
  X,
  Check,
  IndianRupee,
  Shield,
  Tag
} from 'lucide-react';
import { apiFetch, formatINR } from '../../api/client';

const EMPTY_FORM = {
  title: '',
  sku: '',
  character_name: '',
  franchise: '',
  category_id: '',
  team_id: '',
  tag_ids: [],
  manufacturer: 'Medicom Toy',
  scale: '1/12',
  height_cm: 16,
  material: 'ABS & PVC',
  box_contents: 'Main figure, interchangeable hands, alternate portrait, display stand',
  description: '',
  price: 3999,
  original_price: 4999,
  stock: 12,
  badge: 'in_stock',
  image_url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85',
  is_featured: true,
  is_new_arrival: true
};

export default function AdminFiguresPage() {
  const [figures, setFigures] = useState([]);
  const [meta, setMeta] = useState({ categories: [], teams: [], tags: [] });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [loading, setLoading] = useState(true);

  // Inline Quick Price & Stock Editing State
  const [inlineEdits, setInlineEdits] = useState({});
  const [savedRowId, setSavedRowId] = useState(null);

  // Full Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [figRes, metaRes] = await Promise.all([
        apiFetch('/admin/figures'),
        apiFetch('/catalog-meta')
      ]);
      setFigures(figRes.figures || []);
      setMeta({
        categories: metaRes.categories || [],
        teams: metaRes.teams || [],
        tags: metaRes.tags || []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleInlineChange = (id, field, value) => {
    const fig = figures.find((f) => f.id === id);
    if (!fig) return;
    setInlineEdits((prev) => ({
      ...prev,
      [id]: {
        price: prev[id]?.price !== undefined ? prev[id].price : fig.price,
        original_price:
          prev[id]?.original_price !== undefined ? prev[id].original_price : fig.original_price || '',
        stock: prev[id]?.stock !== undefined ? prev[id].stock : fig.stock,
        [field]: value
      }
    }));
  };

  const handleInlineSave = async (id) => {
    const patch = inlineEdits[id];
    if (!patch) return;
    try {
      const res = await apiFetch(`/admin/figures/${id}/quick-update`, {
        method: 'PATCH',
        body: JSON.stringify({
          price: Number(patch.price),
          original_price: patch.original_price === '' ? null : Number(patch.original_price),
          stock: Number(patch.stock)
        })
      });
      setFigures((prev) => prev.map((f) => (f.id === id ? res.figure : f)));
      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setSavedRowId(id);
      setTimeout(() => setSavedRowId(null), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      category_id: meta.categories[0]?.id || '',
      team_id: meta.teams[0]?.id || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (fig) => {
    setEditingId(fig.id);
    setForm({
      title: fig.title || '',
      sku: fig.sku || '',
      character_name: fig.character_name || '',
      franchise: fig.franchise || '',
      category_id: fig.category_id || '',
      team_id: fig.team_id || '',
      tag_ids: Array.isArray(fig.tag_ids) ? fig.tag_ids : [],
      manufacturer: fig.manufacturer || '',
      scale: fig.scale || '1/12',
      height_cm: fig.height_cm || 16,
      material: fig.material || '',
      box_contents: fig.box_contents || '',
      description: fig.description || '',
      price: fig.price || 0,
      original_price: fig.original_price || '',
      stock: fig.stock ?? 10,
      badge: fig.badge || 'in_stock',
      image_url: fig.image_url || '',
      is_featured: Boolean(fig.is_featured),
      is_new_arrival: Boolean(fig.is_new_arrival)
    });
    setError('');
    setIsModalOpen(true);
  };

  const toggleTagInForm = (tagId) => {
    const numId = Number(tagId);
    setForm((prev) => {
      const exists = prev.tag_ids.includes(numId);
      return {
        ...prev,
        tag_ids: exists ? prev.tag_ids.filter((id) => id !== numId) : [...prev.tag_ids, numId]
      };
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await apiFetch(`/admin/figures/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      } else {
        await apiFetch('/admin/figures', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }
      setIsModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFigure = async (fig) => {
    if (!window.confirm(`Remove "${fig.title}" from Figure Verse catalogue?`)) return;
    try {
      await apiFetch(`/admin/figures/${fig.id}`, { method: 'DELETE' });
      setFigures((prev) => prev.filter((f) => f.id !== fig.id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = figures.filter((f) => {
    const matchesCat = filterCat === 'all' || String(f.category_id) === String(filterCat);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.character_name.toLowerCase().includes(q) ||
      (f.category_name && f.category_name.toLowerCase().includes(q)) ||
      (f.team_name && f.team_name.toLowerCase().includes(q)) ||
      (f.sku && f.sku.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fv-admin-page">
      <div className="fv-admin-header">
        <div>
          <span className="fv-eyebrow">INVENTORY & PRICING COMMAND</span>
          <h1>FIGURES, ITEMS & PRICE MANAGER</h1>
          <p>
            Add new figures, edit selling price & MRP directly inline or via full editor, assign
            Categories, Teams, and Tags, or remove items.
          </p>
        </div>
        <button type="button" className="fv-btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add New Figure
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="fv-admin-toolbar">
        <div className="fv-admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by figure title, character, SKU, team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All Categories ({figures.length})</option>
          {meta.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.figure_count || 0})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="fv-loading">Loading inventory...</div>
      ) : (
        <div className="fv-admin-panel">
          <div className="fv-admin-table-wrap">
            <table className="fv-admin-table">
              <thead>
                <tr>
                  <th>Figure</th>
                  <th>Category / Team / Tags</th>
                  <th>Selling Price (₹)</th>
                  <th>MRP Price (₹)</th>
                  <th>Stock</th>
                  <th>Quick Save</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fig) => {
                  const rowEdit = inlineEdits[fig.id];
                  const curPrice = rowEdit?.price !== undefined ? rowEdit.price : fig.price;
                  const curMrp =
                    rowEdit?.original_price !== undefined
                      ? rowEdit.original_price
                      : fig.original_price || '';
                  const curStock = rowEdit?.stock !== undefined ? rowEdit.stock : fig.stock;

                  return (
                    <tr key={fig.id}>
                      <td>
                        <div className="fv-admin-fig-cell">
                          <img src={fig.image_url} alt={fig.title} />
                          <div>
                            <strong>{fig.title}</strong>
                            <small>
                              SKU: {fig.sku} • {fig.scale} Scale • {fig.badge.toUpperCase()}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fv-admin-tax-cell">
                          <span
                            className="fv-pill-category"
                            style={{ backgroundColor: fig.category_color || '#e11d48' }}
                          >
                            {fig.category_name}
                          </span>
                          {fig.team_name && (
                            <span className="fv-pill-team">
                              <Shield size={11} /> {fig.team_name}
                            </span>
                          )}
                          {Array.isArray(fig.tags) &&
                            fig.tags.slice(0, 2).map((t) => (
                              <span key={t.id} className="fv-tag-chip">
                                #{t.name}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td>
                        <div className="fv-inline-input">
                          <span>₹</span>
                          <input
                            type="number"
                            value={curPrice}
                            onChange={(e) => handleInlineChange(fig.id, 'price', e.target.value)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fv-inline-input">
                          <span>₹</span>
                          <input
                            type="number"
                            value={curMrp}
                            placeholder="MRP"
                            onChange={(e) =>
                              handleInlineChange(fig.id, 'original_price', e.target.value)
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="fv-stock-input"
                          value={curStock}
                          onChange={(e) => handleInlineChange(fig.id, 'stock', e.target.value)}
                        />
                      </td>
                      <td>
                        {rowEdit ? (
                          <button
                            type="button"
                            className="fv-btn-primary fv-btn-sm"
                            onClick={() => handleInlineSave(fig.id)}
                          >
                            <Save size={14} /> Update Price
                          </button>
                        ) : savedRowId === fig.id ? (
                          <span className="fv-saved-badge">
                            <Check size={14} /> Updated!
                          </span>
                        ) : (
                          <span className="text-muted">{formatINR(fig.price)}</span>
                        )}
                      </td>
                      <td>
                        <div className="fv-admin-row-actions">
                          <button
                            type="button"
                            className="fv-icon-btn"
                            title="Full Edit Figure"
                            onClick={() => openEditModal(fig)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="fv-icon-btn danger"
                            title="Remove Figure"
                            onClick={() => handleDeleteFigure(fig)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Create / Edit Figure Modal */}
      {isModalOpen && (
        <div className="fv-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="fv-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-head">
              <h3>{editingId ? 'Update Figure & Price Details' : 'Add New Collector Figure'}</h3>
              <button
                type="button"
                className="fv-icon-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && <div className="fv-alert-error">{error}</div>}

            <form onSubmit={handleModalSubmit} className="fv-admin-modal-body">
              <div className="fv-form-grid">
                <div className="fv-field fv-field-full">
                  <label>Figure Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., MAFEX No.217 Daredevil (Comic Ver.)"
                    required
                  />
                </div>

                <div className="fv-field">
                  <label>Character Name *</label>
                  <input
                    type="text"
                    value={form.character_name}
                    onChange={(e) => setForm({ ...form, character_name: e.target.value })}
                    placeholder="e.g., Matt Murdock / Daredevil"
                    required
                  />
                </div>

                <div className="fv-field">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g., FV-MFX-217"
                  />
                </div>

                <div className="fv-field">
                  <label>Category / Brand *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {meta.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fv-field">
                  <label>Team / Faction</label>
                  <select
                    value={form.team_id}
                    onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                  >
                    <option value="">-- Optional Team --</option>
                    {meta.teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.franchise})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fv-field">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>

                <div className="fv-field">
                  <label>Original MRP Price (₹) (for discount badge)</label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                  />
                </div>

                <div className="fv-field">
                  <label>Vault Stock Quantity *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="fv-field">
                  <label>Availability Ribbon Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  >
                    <option value="in_stock">IN STOCK</option>
                    <option value="pre_order">PRE-ORDER</option>
                    <option value="limited">LIMITED GRAIL</option>
                    <option value="hot_deal">HOT DEAL</option>
                  </select>
                </div>

                <div className="fv-field">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={form.manufacturer}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  />
                </div>

                <div className="fv-field">
                  <label>Scale (e.g., 1/12, 1/9, 1/10)</label>
                  <input
                    type="text"
                    value={form.scale}
                    onChange={(e) => setForm({ ...form, scale: e.target.value })}
                  />
                </div>

                <div className="fv-field fv-field-full">
                  <label>Assign Collector Tags</label>
                  <div className="fv-tag-selector">
                    {meta.tags.map((tg) => {
                      const active = form.tag_ids.includes(Number(tg.id));
                      return (
                        <button
                          key={tg.id}
                          type="button"
                          className={`fv-tag-chip-btn ${active ? 'active' : ''}`}
                          onClick={() => toggleTagInForm(tg.id)}
                        >
                          <Tag size={12} /> {tg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="fv-field fv-field-full">
                  <label>Product Image URL *</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    required
                  />
                </div>

                <div className="fv-field fv-field-full">
                  <label>Box Contents</label>
                  <input
                    type="text"
                    value={form.box_contents}
                    onChange={(e) => setForm({ ...form, box_contents: e.target.value })}
                  />
                </div>

                <div className="fv-field fv-field-full">
                  <label>Collector Description *</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="fv-admin-modal-foot">
                <button
                  type="button"
                  className="fv-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fv-btn-primary">
                  <Save size={16} /> {editingId ? 'Save Figure Changes' : 'Create Figure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
