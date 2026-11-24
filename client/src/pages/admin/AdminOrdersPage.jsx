import React, { useEffect, useState } from 'react';
import { PackageCheck, Eye, X, Check } from 'lucide-react';
import { apiFetch, formatINR } from '../../api/client';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedOrderNum, setUpdatedOrderNum] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/orders');
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderNumber, field, value) => {
    try {
      const res = await apiFetch(`/admin/orders/${orderNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value })
      });
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? res.order : o))
      );
      if (selectedOrder?.order_number === orderNumber) {
        setSelectedOrder(res.order);
      }
      setUpdatedOrderNum(orderNumber);
      setTimeout(() => setUpdatedOrderNum(''), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = orders.filter(
    (o) => filterStatus === 'all' || o.order_status === filterStatus || o.payment_status === filterStatus
  );

  return (
    <div className="fv-admin-page">
      <div className="fv-admin-header">
        <div>
          <span className="fv-eyebrow">FULFILLMENT & RAZORPAY LEDGER</span>
          <h1>CUSTOMER ORDERS (GUEST & MEMBER)</h1>
          <p>Inspect shipping addresses, collector box grades, and update order fulfillment statuses.</p>
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Orders ({orders.length})</option>
          <option value="paid">Paid Orders</option>
          <option value="pending">Pending Payment</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {loading ? (
        <div className="fv-loading">Loading customer orders...</div>
      ) : (
        <div className="fv-admin-panel">
          <div className="fv-admin-table-wrap">
            <table className="fv-admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Checkout Mode</th>
                  <th>Box Grade</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Fulfillment Status</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <strong>{ord.order_number}</strong>
                      <div>
                        <small className="text-muted">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <strong>{ord.full_name}</strong>
                      <div>
                        <small className="text-muted">{ord.email}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`fv-type-badge ${ord.user_id ? 'member' : 'guest'}`}>
                        {ord.user_id ? 'Registered Member' : 'Guest Checkout'}
                      </span>
                    </td>
                    <td>
                      <span>
                        {ord.packaging_grade === 'collector' ? 'Mint-Box (+₹199)' : 'Standard'}
                      </span>
                    </td>
                    <td>
                      <strong>{formatINR(ord.total_amount)}</strong>
                    </td>
                    <td>
                      <select
                        className={`fv-status-select status-${ord.payment_status}`}
                        value={ord.payment_status}
                        onChange={(e) =>
                          handleStatusChange(ord.order_number, 'payment_status', e.target.value)
                        }
                      >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="failed">FAILED</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                          className={`fv-status-select status-${ord.order_status}`}
                          value={ord.order_status}
                          onChange={(e) =>
                            handleStatusChange(ord.order_number, 'order_status', e.target.value)
                          }
                        >
                          <option value="processing">PROCESSING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        {updatedOrderNum === ord.order_number && (
                          <span className="fv-saved-badge">
                            <Check size={13} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fv-btn-outline fv-btn-sm"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fv-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="fv-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fv-admin-modal-head">
              <h3>
                Order #{selectedOrder.order_number} (
                {selectedOrder.user_id ? 'Registered Member' : 'Guest Checkout'})
              </h3>
              <button
                type="button"
                className="fv-icon-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="fv-admin-modal-body">
              <div className="fv-receipt-grid">
                <div className="fv-receipt-box">
                  <h5>Shipping Address</h5>
                  <p><strong>{selectedOrder.full_name}</strong></p>
                  <p>{selectedOrder.email} • {selectedOrder.phone}</p>
                  <p>
                    {selectedOrder.address_line1}
                    {selectedOrder.address_line2 ? `, ${selectedOrder.address_line2}` : ''},{' '}
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postal_code}
                  </p>
                </div>
                <div className="fv-receipt-box">
                  <h5>Razorpay Gateway Info</h5>
                  <p>Order ID: <code>{selectedOrder.gateway_order_id}</code></p>
                  <p>Payment ID: <code>{selectedOrder.gateway_payment_id || 'Pending'}</code></p>
                  <p>Box Grade: <strong>{selectedOrder.packaging_grade}</strong></p>
                  <p>Total: <strong>{formatINR(selectedOrder.total_amount)}</strong></p>
                </div>
              </div>

              <div className="fv-receipt-items" style={{ marginTop: '1rem' }}>
                <h5>Ordered Line Items</h5>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="fv-receipt-item">
                    <img src={item.figure_image_url} alt={item.figure_title} />
                    <div>
                      <strong>{item.figure_title}</strong>
                      <small>
                        {item.category_name} • Qty: {item.quantity} × {formatINR(item.unit_price)}
                      </small>
                    </div>
                    <span>{formatINR(Number(item.unit_price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
