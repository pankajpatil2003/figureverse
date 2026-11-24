import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Boxes,
  AlertTriangle,
  Layers,
  Shield,
  Tag,
  ArrowRight,
  Plus
} from 'lucide-react';
import { apiFetch, formatINR } from '../../api/client';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/dashboard')
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="fv-loading">Loading Admin Command Center telemetry...</div>;
  }

  const { stats, low_stock_figures, recent_orders, categories } = data;

  return (
    <div className="fv-admin-page">
      <div className="fv-admin-header">
        <div>
          <span className="fv-eyebrow">CUSTOM ADMIN PANEL • BUILT FROM SCRATCH</span>
          <h1>FIGURE VERSE COMMAND CENTER</h1>
        </div>
        <div className="fv-admin-header-actions">
          <Link to="/admin/figures" className="fv-btn-primary">
            <Plus size={16} /> Manage Figures & Prices
          </Link>
          <Link to="/admin/taxonomy" className="fv-btn-outline">
            <Layers size={16} /> Categories, Teams & Tags
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="fv-kpi-grid">
        <div className="fv-kpi-card">
          <div className="fv-kpi-icon kpi-green">
            <IndianRupee size={22} />
          </div>
          <div>
            <small>Verified Online Revenue</small>
            <strong>{formatINR(stats.total_revenue)}</strong>
            <span>From {stats.paid_orders} paid Razorpay orders</span>
          </div>
        </div>

        <div className="fv-kpi-card">
          <div className="fv-kpi-icon kpi-blue">
            <ShoppingBag size={22} />
          </div>
          <div>
            <small>Total Orders</small>
            <strong>{stats.total_orders}</strong>
            <span>{stats.guest_orders} Guest • {stats.total_orders - stats.guest_orders} Member</span>
          </div>
        </div>

        <div className="fv-kpi-card">
          <div className="fv-kpi-icon kpi-purple">
            <Boxes size={22} />
          </div>
          <div>
            <small>Catalogue Taxonomy</small>
            <strong>{stats.total_figures} Figures</strong>
            <span>
              {stats.total_categories} Categories • {stats.total_teams} Teams • {stats.total_tags} Tags
            </span>
          </div>
        </div>

        <div className="fv-kpi-card">
          <div className="fv-kpi-icon kpi-amber">
            <AlertTriangle size={22} />
          </div>
          <div>
            <small>Low Stock Alerts</small>
            <strong>{stats.low_stock_count} Items</strong>
            <span>Figures with ≤ 8 units remaining</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards for Admin CRUD */}
      <div className="fv-admin-quick-grid">
        <Link to="/admin/figures" className="fv-admin-quick-card">
          <Boxes size={24} />
          <div>
            <h4>Figures & Pricing Manager</h4>
            <p>Add new figures, edit selling prices & MRP inline, update stock, or remove items.</p>
          </div>
          <ArrowRight size={18} />
        </Link>

        <Link to="/admin/taxonomy?tab=categories" className="fv-admin-quick-card">
          <Layers size={24} />
          <div>
            <h4>Categories Manager ({stats.total_categories})</h4>
            <p>Add, update, and remove Categories (Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, Mafex, Gaming).</p>
          </div>
          <ArrowRight size={18} />
        </Link>

        <Link to="/admin/taxonomy?tab=teams" className="fv-admin-quick-card">
          <Shield size={24} />
          <div>
            <h4>Teams Manager ({stats.total_teams})</h4>
            <p>Add, update, and remove Teams (Avengers, Justice League, X-Men, Spider-Verse, etc.).</p>
          </div>
          <ArrowRight size={18} />
        </Link>

        <Link to="/admin/taxonomy?tab=tags" className="fv-admin-quick-card">
          <Tag size={24} />
          <div>
            <h4>Specialty Tags Manager ({stats.total_tags})</h4>
            <p>Add, update, and remove collector Tags (LED Light-Up, Diecast Parts, Deluxe Edition, etc.).</p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="fv-admin-two-col">
        {/* Recent Orders Table */}
        <div className="fv-admin-panel">
          <div className="fv-admin-panel-head">
            <h3>Recent Customer Orders (Guest & Member)</h3>
            <Link to="/admin/orders" className="fv-link-arrow">
              Manage All Orders <ArrowRight size={15} />
            </Link>
          </div>

          <div className="fv-admin-table-wrap">
            <table className="fv-admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((ord) => (
                  <tr key={ord.id}>
                    <td><strong>{ord.order_number}</strong></td>
                    <td>
                      <div>{ord.full_name}</div>
                      <small className="text-muted">{ord.email}</small>
                    </td>
                    <td>
                      <span className={`fv-type-badge ${ord.user_id ? 'member' : 'guest'}`}>
                        {ord.user_id ? 'Member' : 'Guest'}
                      </span>
                    </td>
                    <td><strong>{formatINR(ord.total_amount)}</strong></td>
                    <td>
                      <span className={`fv-status-pill status-${ord.payment_status}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`fv-status-pill status-${ord.order_status}`}>
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Distribution & Low Stock */}
        <div className="fv-admin-panel">
          <div className="fv-admin-panel-head">
            <h3>8-Category Inventory Breakdown</h3>
            <Link to="/admin/taxonomy" className="fv-link-arrow">
              Edit Categories <ArrowRight size={15} />
            </Link>
          </div>

          <div className="fv-cat-dist-list">
            {categories.map((cat) => (
              <div key={cat.id} className="fv-cat-dist-row">
                <div className="fv-cat-dist-label">
                  <span
                    className="fv-color-dot"
                    style={{ backgroundColor: cat.accent_color || '#e11d48' }}
                  />
                  <strong>{cat.name}</strong>
                </div>
                <span>{cat.figure_count || 0} figures</span>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Low Stock Watchlist</h4>
          <div className="fv-lowstock-list">
            {low_stock_figures.map((fig) => (
              <div key={fig.id} className="fv-lowstock-row">
                <img src={fig.image_url} alt={fig.title} />
                <div>
                  <strong>{fig.title}</strong>
                  <small>{fig.category_name} • {formatINR(fig.price)}</small>
                </div>
                <span className="fv-lowstock-count">{fig.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
