import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatINR } from '../api/client';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetch('/auth/orders')
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div className="fv-container fv-loading">Loading profile...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="fv-container fv-myorders-page">
      <div className="fv-page-header">
        <span className="fv-eyebrow">COLLECTOR ACCOUNT VAULT</span>
        <h1>WELCOME, {user.full_name.toUpperCase()}</h1>
        <p>Viewing all orders linked to {user.email} (including prior guest orders).</p>
      </div>

      {loading ? (
        <div className="fv-loading">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="fv-empty-state">
          <Package size={48} />
          <h3>No Orders Yet</h3>
          <p>Start building your Marvel, DC, Fondjoy, CT Toys, ZD Toys, Anime, or Mafex shelf.</p>
          <Link to="/catalog" className="fv-btn-primary">
            <ShoppingBag size={17} /> Browse Figures
          </Link>
        </div>
      ) : (
        <div className="fv-orders-list">
          {orders.map((order) => (
            <div key={order.id} className="fv-order-card">
              <div className="fv-order-card-head">
                <div>
                  <strong>Order #{order.order_number}</strong>
                  <small>{new Date(order.created_at).toLocaleString()}</small>
                </div>
                <div className="fv-tracked-badges">
                  <span className={`fv-status-pill status-${order.payment_status}`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                  <span className={`fv-status-pill status-${order.order_status}`}>
                    {order.order_status.toUpperCase()}
                  </span>
                  <strong>{formatINR(order.total_amount)}</strong>
                </div>
              </div>
              <div className="fv-receipt-items">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="fv-receipt-item">
                    <img src={item.figure_image_url} alt={item.figure_title} />
                    <div>
                      <strong>{item.figure_title}</strong>
                      <small>Qty: {item.quantity}</small>
                    </div>
                    <span>{formatINR(Number(item.unit_price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
