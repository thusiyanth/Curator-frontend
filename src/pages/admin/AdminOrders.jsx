import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiUser, FiMapPin, FiPhone, FiChevronDown, FiChevronUp, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
const TYPE_FILTERS = ['ALL', 'REGULAR', 'BUFFET'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.orderType = typeFilter;
      const res = await adminAPI.getOrders(params);
      const data = res.data.data;
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.approveOrder(id);
      toast.success('Order approved');
      fetchOrders();
    } catch {
      toast.error('Failed to approve order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.rejectOrder(id);
      toast.success('Order rejected');
      fetchOrders();
    } catch {
      toast.error('Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (type, value) => {
    setPage(0);
    if (type === 'status') setStatusFilter(value);
    if (type === 'type') setTypeFilter(value);
  };

  return (
    <div className="admin-orders fade-in">
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Orders</h1>
          <p className="orders-subtitle">{totalElements} total orders</p>
        </div>
        <button className="btn-icon" onClick={fetchOrders} title="Refresh">
          <FiRefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="filter-group">
          <span className="filter-label">Status</span>
          <div className="filter-chips">
            {STATUS_FILTERS.map((s) => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''} ${s.toLowerCase()}`}
                onClick={() => handleFilterChange('status', s)}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="filter-chips">
            {TYPE_FILTERS.map((t) => (
              <button key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', t)}>
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="orders-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="order-card-skeleton">
              <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '30%' }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>📋</p>
          <h3>No orders found</h3>
          <p>Try a different filter combination</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="order-card-left">
                  <div className="order-id">
                    <span className="order-hash">#{String(order.id).padStart(4, '0')}</span>
                    <span className={`badge badge-${order.status?.toLowerCase()}`}>
                      {order.status === 'APPROVED' && <FiCheckCircle size={11} />}
                      {order.status === 'REJECTED' && <FiXCircle size={11} />}
                      {order.status === 'PENDING' && <FiClock size={11} />}
                      {order.status}
                    </span>
                    {order.orderType === 'BUFFET' && (
                      <span className="badge badge-buffet">BUFFET</span>
                    )}
                  </div>
                  <div className="order-meta">
                    <span><FiUser size={13} /> {order.customerName}</span>
                    <span><FiMapPin size={13} /> {order.location?.substring(0, 40)}{order.location?.length > 40 ? '...' : ''}</span>
                  </div>
                </div>
                <div className="order-card-right">
                  <span className="order-time">{new Date(order.createdAt).toLocaleDateString()}</span>
                  {expandedOrder === order.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="order-card-body">
                  <div className="order-items-table">
                    <div className="oit-header">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Price</span>
                    </div>
                    {order.items?.map((item) => (
                      <div key={item.id} className="oit-row">
                        <span className="oit-name">
                          {item.foodImageUrl && <img src={item.foodImageUrl} alt="" className="oit-thumb" />}
                          {item.foodName}
                        </span>
                        <span className="oit-qty">{item.quantity}</span>
                        <span className="oit-price">Rs.{(item.foodPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="oit-total">
                      <span>Total</span>
                      <span></span>
                      <span>Rs.{order.items?.reduce((s, i) => s + i.foodPrice * i.quantity, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-full-meta">
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    {order.phoneNumber && <div><strong>Phone:</strong> {order.phoneNumber}</div>}
                    <div><strong>Location:</strong> {order.location}</div>
                    <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                    <div><strong>Type:</strong> {order.orderType || 'REGULAR'}</div>
                  </div>

                  {order.status === 'PENDING' && (
                    <div className="order-actions">
                      <button className="btn-success btn-sm" onClick={() => handleApprove(order.id)}
                        disabled={actionLoading === order.id}>
                        {actionLoading === order.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> :
                          <><FiCheckCircle size={14} /> Approve</>}
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleReject(order.id)}
                        disabled={actionLoading === order.id}>
                        {actionLoading === order.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> :
                          <><FiXCircle size={14} /> Reject</>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn-icon" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
            <FiChevronLeft size={18} />
          </button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button className="btn-icon" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
