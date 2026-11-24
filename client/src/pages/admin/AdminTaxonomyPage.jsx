import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Shield, Tag, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { apiFetch } from '../../api/client';

export default function AdminTaxonomyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'categories';

  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Category Form State
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({
    name: '',
    tagline: '',
    accent_color: '#e11d48',
    banner_image_url:
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1200&q=85'
  });

  // Team Form State
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    franchise: '',
    description: '',
    badge_color: '#f59e0b'
  });

  // Tag Form State
  const [editingTagId, setEditingTagId] = useState(null);
  const [tagForm, setTagForm] = useState({
    name: '',
    color: '#38bdf8'
  });

  const loadTaxonomy = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/catalog-meta');
      setCategories(data.categories || []);
      setTeams(data.teams || []);
      setTags(data.tags || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const switchTab = (tab) => {
    setError('');
    setSearchParams({ tab });
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCatId) {
        await apiFetch(`/admin/categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(catForm)
        });
      } else {
        await apiFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(catForm)
        });
      }
      setEditingCatId(null);
      setCatForm({
        name: '',
        tagline: '',
        accent_color: '#e11d48',
        banner_image_url:
          'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1200&q=85'
      });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryDelete = async (cat) => {
    if (!window.confirm(`Remove category "${cat.name}"?`)) return;
    try {
      await apiFetch(`/admin/categories/${cat.id}`, { method: 'DELETE' });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- TEAM CRUD HANDLERS ---
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingTeamId) {
        await apiFetch(`/admin/teams/${editingTeamId}`, {
          method: 'PUT',
          body: JSON.stringify(teamForm)
        });
      } else {
        await apiFetch('/admin/teams', {
          method: 'POST',
          body: JSON.stringify(teamForm)
        });
      }
      setEditingTeamId(null);
      setTeamForm({ name: '', franchise: '', description: '', badge_color: '#f59e0b' });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTeamDelete = async (tm) => {
    if (!window.confirm(`Remove team "${tm.name}"?`)) return;
    try {
      await apiFetch(`/admin/teams/${tm.id}`, { method: 'DELETE' });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- TAG CRUD HANDLERS ---
  const handleTagSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingTagId) {
        await apiFetch(`/admin/tags/${editingTagId}`, {
          method: 'PUT',
          body: JSON.stringify(tagForm)
        });
      } else {
        await apiFetch('/admin/tags', {
          method: 'POST',
          body: JSON.stringify(tagForm)
        });
      }
      setEditingTagId(null);
      setTagForm({ name: '', color: '#38bdf8' });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTagDelete = async (tg) => {
    if (!window.confirm(`Remove tag "#${tg.name}"?`)) return;
    try {
      await apiFetch(`/admin/tags/${tg.id}`, { method: 'DELETE' });
      await loadTaxonomy();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fv-admin-page">
      <div className="fv-admin-header">
        <div>
          <span className="fv-eyebrow">CATALOGUE TAXONOMY STUDIO</span>
          <h1>MANAGE CATEGORIES, TEAMS & TAGS</h1>
          <p>
            Add, update, and remove Categories (Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex,
            Gaming Figures), Superhero/Anime Teams, and Specialty Collector Tags.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="fv-taxonomy-tabs">
        <button
          type="button"
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => switchTab('categories')}
        >
          <Layers size={16} /> Categories ({categories.length})
        </button>
        <button
          type="button"
          className={activeTab === 'teams' ? 'active' : ''}
          onClick={() => switchTab('teams')}
        >
          <Shield size={16} /> Teams & Factions ({teams.length})
        </button>
        <button
          type="button"
          className={activeTab === 'tags' ? 'active' : ''}
          onClick={() => switchTab('tags')}
        >
          <Tag size={16} /> Specialty Tags ({tags.length})
        </button>
      </div>

      {error && <div className="fv-alert-error">{error}</div>}

      {/* TAB 1: CATEGORIES CRUD */}
      {activeTab === 'categories' && (
        <div className="fv-admin-two-col">
          <div className="fv-admin-panel">
            <h3>{editingCatId ? 'Update Category' : 'Add New Category'}</h3>
            <form onSubmit={handleCategorySubmit} className="fv-auth-form">
              <div className="fv-field">
                <label>Category / Brand Name *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g., Hot Toys / SH Figuarts / Marvel"
                  required
                />
              </div>
              <div className="fv-field">
                <label>Collector Tagline</label>
                <input
                  type="text"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm({ ...catForm, tagline: e.target.value })}
                  placeholder="Short description shown on storefront banner"
                />
              </div>
              <div className="fv-field">
                <label>Brand Accent Color</label>
                <div className="fv-color-picker-row">
                  <input
                    type="color"
                    value={catForm.accent_color}
                    onChange={(e) => setCatForm({ ...catForm, accent_color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={catForm.accent_color}
                    onChange={(e) => setCatForm({ ...catForm, accent_color: e.target.value })}
                  />
                </div>
              </div>
              <div className="fv-field">
                <label>Banner Image URL</label>
                <input
                  type="url"
                  value={catForm.banner_image_url}
                  onChange={(e) => setCatForm({ ...catForm, banner_image_url: e.target.value })}
                />
              </div>

              <div className="fv-form-actions">
                <button type="submit" className="fv-btn-primary">
                  <Save size={16} /> {editingCatId ? 'Update Category' : 'Add Category'}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    className="fv-btn-outline"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatForm({
                        name: '',
                        tagline: '',
                        accent_color: '#e11d48',
                        banner_image_url: ''
                      });
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="fv-admin-panel">
            <h3>Active Categories ({categories.length})</h3>
            <div className="fv-taxonomy-list">
              {categories.map((cat) => (
                <div key={cat.id} className="fv-taxonomy-item">
                  <div className="fv-taxonomy-item-left">
                    <span
                      className="fv-color-swatch"
                      style={{ backgroundColor: cat.accent_color || '#e11d48' }}
                    />
                    <div>
                      <strong>{cat.name}</strong>
                      <small>
                        Slug: <code>{cat.slug}</code> • {cat.figure_count || 0} figures
                      </small>
                      <p>{cat.tagline}</p>
                    </div>
                  </div>
                  <div className="fv-admin-row-actions">
                    <button
                      type="button"
                      className="fv-icon-btn"
                      title="Edit Category"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatForm({
                          name: cat.name,
                          tagline: cat.tagline || '',
                          accent_color: cat.accent_color || '#e11d48',
                          banner_image_url: cat.banner_image_url || ''
                        });
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="fv-icon-btn danger"
                      title="Remove Category"
                      onClick={() => handleCategoryDelete(cat)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAMS CRUD */}
      {activeTab === 'teams' && (
        <div className="fv-admin-two-col">
          <div className="fv-admin-panel">
            <h3>{editingTeamId ? 'Update Team' : 'Add New Team / Faction'}</h3>
            <form onSubmit={handleTeamSubmit} className="fv-auth-form">
              <div className="fv-field">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g., Avengers / Justice League / Akatsuki"
                  required
                />
              </div>
              <div className="fv-field">
                <label>Franchise / Universe</label>
                <input
                  type="text"
                  value={teamForm.franchise}
                  onChange={(e) => setTeamForm({ ...teamForm, franchise: e.target.value })}
                  placeholder="e.g., Marvel Universe / DC Multiverse / One Piece"
                />
              </div>
              <div className="fv-field">
                <label>Team Description</label>
                <input
                  type="text"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  placeholder="Short description of the team roster"
                />
              </div>
              <div className="fv-field">
                <label>Team Badge Color</label>
                <div className="fv-color-picker-row">
                  <input
                    type="color"
                    value={teamForm.badge_color}
                    onChange={(e) => setTeamForm({ ...teamForm, badge_color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={teamForm.badge_color}
                    onChange={(e) => setTeamForm({ ...teamForm, badge_color: e.target.value })}
                  />
                </div>
              </div>

              <div className="fv-form-actions">
                <button type="submit" className="fv-btn-primary">
                  <Save size={16} /> {editingTeamId ? 'Update Team' : 'Add Team'}
                </button>
                {editingTeamId && (
                  <button
                    type="button"
                    className="fv-btn-outline"
                    onClick={() => {
                      setEditingTeamId(null);
                      setTeamForm({
                        name: '',
                        franchise: '',
                        description: '',
                        badge_color: '#f59e0b'
                      });
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="fv-admin-panel">
            <h3>Active Teams ({teams.length})</h3>
            <div className="fv-taxonomy-list">
              {teams.map((tm) => (
                <div key={tm.id} className="fv-taxonomy-item">
                  <div className="fv-taxonomy-item-left">
                    <span
                      className="fv-color-swatch"
                      style={{ backgroundColor: tm.badge_color || '#f59e0b' }}
                    />
                    <div>
                      <strong>{tm.name}</strong>
                      <small>
                        {tm.franchise} • Slug: <code>{tm.slug}</code> • {tm.figure_count || 0} figures
                      </small>
                      <p>{tm.description}</p>
                    </div>
                  </div>
                  <div className="fv-admin-row-actions">
                    <button
                      type="button"
                      className="fv-icon-btn"
                      title="Edit Team"
                      onClick={() => {
                        setEditingTeamId(tm.id);
                        setTeamForm({
                          name: tm.name,
                          franchise: tm.franchise || '',
                          description: tm.description || '',
                          badge_color: tm.badge_color || '#f59e0b'
                        });
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="fv-icon-btn danger"
                      title="Remove Team"
                      onClick={() => handleTeamDelete(tm)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAGS CRUD */}
      {activeTab === 'tags' && (
        <div className="fv-admin-two-col">
          <div className="fv-admin-panel">
            <h3>{editingTagId ? 'Update Specialty Tag' : 'Add New Specialty Tag'}</h3>
            <form onSubmit={handleTagSubmit} className="fv-auth-form">
              <div className="fv-field">
                <label>Tag Name *</label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  placeholder="e.g., LED Light-Up / Diecast Parts / Cloth Cape"
                  required
                />
              </div>
              <div className="fv-field">
                <label>Tag Chip Color</label>
                <div className="fv-color-picker-row">
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  />
                  <input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="fv-form-actions">
                <button type="submit" className="fv-btn-primary">
                  <Save size={16} /> {editingTagId ? 'Update Tag' : 'Add Tag'}
                </button>
                {editingTagId && (
                  <button
                    type="button"
                    className="fv-btn-outline"
                    onClick={() => {
                      setEditingTagId(null);
                      setTagForm({ name: '', color: '#38bdf8' });
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="fv-admin-panel">
            <h3>Active Specialty Tags ({tags.length})</h3>
            <div className="fv-taxonomy-list">
              {tags.map((tg) => (
                <div key={tg.id} className="fv-taxonomy-item">
                  <div className="fv-taxonomy-item-left">
                    <span
                      className="fv-color-swatch"
                      style={{ backgroundColor: tg.color || '#38bdf8' }}
                    />
                    <div>
                      <strong>#{tg.name}</strong>
                      <small>
                        Slug: <code>{tg.slug}</code> • Assigned to {tg.figure_count || 0} figures
                      </small>
                    </div>
                  </div>
                  <div className="fv-admin-row-actions">
                    <button
                      type="button"
                      className="fv-icon-btn"
                      title="Edit Tag"
                      onClick={() => {
                        setEditingTagId(tg.id);
                        setTagForm({
                          name: tg.name,
                          color: tg.color || '#38bdf8'
                        });
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="fv-icon-btn danger"
                      title="Remove Tag"
                      onClick={() => handleTagDelete(tg)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
