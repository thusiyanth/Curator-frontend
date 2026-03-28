import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiUser, FiMapPin, FiPhone, FiChevronDown, FiChevronUp, FiRefreshCw, FiChevronLeft, FiChevronRight, FiCoffee } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminBuffet.css';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminBuffet() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, orderType: 'BUFFET' };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await adminAPI.getOrders(params);
      const data = res.data.data;
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      toast.error('Failed to load buffet orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.approveOrder(id);
      toast.success('Buffet order approved');
      fetchOrders();
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.rejectOrder(id);
      toast.success('Buffet order rejected');
      fetchOrders();
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (value) => {
    setPage(0);
    setStatusFilter(value);
  };

  return (
    <div className="admin-buffet fade-in">
      <div className="buffet-admin-header">
        <div className="buffet-admin-title-group">
          <div className="buffet-admin-icon">
            <FiCoffee size={22} />
          </div>
          <div>
            <h1 className="buffet-admin-title">Buffet Orders</h1>
            <p className="buffet-admin-subtitle">{totalElements} buffet orders</p>
          </div>
        </div>
        <button className="btn-icon" onClick={fetchOrders} title="Refresh">
          <FiRefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {/* Status Filters */}
      <div className="buffet-filters">
        {STATUS_FILTERS.map((s) => (
          <button key={s} className={`buffet-filter-chip ${statusFilter === s ? 'active' : ''} ${s.toLowerCase()}`}
            onClick={() => handleFilterChange(s)}>
            {s === 'PENDING' && <FiClock size={13} />}
            {s === 'APPROVED' && <FiCheckCircle size={13} />}
            {s === 'REJECTED' && <FiXCircle size={13} />}
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="buffet-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="buffet-order-skeleton">
              <div className="skeleton" style={{ height: 22, width: '35%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 16, width: '55%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '25%' }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>🎉</p>
          <h3>No buffet orders</h3>
          <p>{statusFilter !== 'ALL' ? 'Try changing the status filter' : 'Buffet orders will appear here'}</p>
        </div>
      ) : (
        <div className="buffet-list">
          {orders.map((order) => (
            <div key={order.id} className={`buffet-order-card status-${order.status?.toLowerCase()}`}>
              <div className="boc-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="boc-left">
                  <div className="boc-id-row">
                    <span className="boc-hash">#{String(order.id).padStart(4, '0')}</span>
                    <span className={`badge badge-${order.status?.toLowerCase()}`}>
                      {order.status === 'APPROVED' && <FiCheckCircle size={11} />}
                      {order.status === 'REJECTED' && <FiXCircle size={11} />}
                      {order.status === 'PENDING' && <FiClock size={11} />}
                      {order.status}
                    </span>
                  </div>
                  <div className="boc-meta">
                    <span><FiUser size={13} /> {order.customerName}</span>
                    <span className="boc-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="boc-toggle">
                  {expandedOrder === order.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="boc-body">
                  <div className="boc-detail-grid">
                    <div className="boc-detail">
                      <FiUser size={14} />
                      <div>
                        <span className="boc-detail-label">Customer</span>
                        <span className="boc-detail-value">{order.customerName}</span>
                      </div>
                    </div>
                    {order.phoneNumber && (
                      <div className="boc-detail">
                        <FiPhone size={14} />
                        <div>
                          <span className="boc-detail-label">Phone</span>
                          <span className="boc-detail-value">{order.phoneNumber}</span>
                        </div>
                      </div>
                    )}
                    <div className="boc-detail">
                      <FiMapPin size={14} />
                      <div>
                        <span className="boc-detail-label">Location</span>
                        <span className="boc-detail-value">{order.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="boc-items">
                    <h4 className="boc-items-title">Menu Items ({order.items?.length || 0})</h4>
                    {order.items?.map((item) => (
                      <div key={item.id} className="boc-item">
                        <div className="boc-item-left">
                          {item.foodImageUrl && <img src={item.foodImageUrl} alt="" className="boc-item-img" />}
                          <div>
                            <span className="boc-item-name">{item.foodName}</span>
                            <span className="boc-item-qty">{item.quantity} servings</span>
                          </div>
                        </div>
                        <span className="boc-item-price">Rs.{(item.foodPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="boc-total">
                      <span>Total</span>
                      <span>Rs.{order.items?.reduce((s, i) => s + i.foodPrice * i.quantity, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {order.status === 'PENDING' && (
                    <div className="boc-actions">
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
