import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiCheckCircle, FiClock, FiXCircle, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import './OrderTrackingPage.css';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: FiCheckCircle },
  { key: 'REVIEW', label: 'Under Review', icon: FiClock },
  { key: 'RESULT', label: 'Decision', icon: FiCheckCircle },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(id);
        setOrder(res.data.data);
      } catch { setOrder(null); }
      finally { setLoading(false); }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const getStepStatus = (stepIdx) => {
    if (!order) return 'pending';
    const status = order.status;
    if (stepIdx === 0) return 'completed';
    if (stepIdx === 1) return status === 'PENDING' ? 'active' : 'completed';
    if (stepIdx === 2) {
      if (status === 'APPROVED') return 'completed';
      if (status === 'REJECTED') return 'rejected';
      return 'pending';
    }
    return 'pending';
  };

  if (loading) return (
    <div className="tracking-page"><div className="loading-overlay"><div className="spinner" /></div></div>
  );

  if (!order) return (
    <div className="tracking-page">
      <header className="page-header">
        <button className="btn-icon" onClick={() => navigate('/')}><FiArrowLeft size={20} /></button>
        <h1>Order Status</h1><div style={{width:40}} />
      </header>
      <div className="empty-state"><p>🔍</p><h3>Order not found</h3>
        <button className="btn-primary" style={{marginTop: 16}} onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="tracking-page fade-in">
      <header className="page-header">
        <button className="btn-icon" onClick={() => navigate('/')}><FiArrowLeft size={20} /></button>
        <h1>Order Status</h1><div style={{width:40}} />
      </header>

      <div className="tracking-content">
        <div className="order-id-banner">
          <span>Order</span>
          <span className="order-id-text">#{String(order.id).padStart(4, '0')}</span>
        </div>

        <div className={`status-badge-large badge-${order.status.toLowerCase()}`}>
          {order.status === 'APPROVED' && <FiCheckCircle size={20} />}
          {order.status === 'REJECTED' && <FiXCircle size={20} />}
          {order.status === 'PENDING' && <FiClock size={20} />}
          {order.status}
        </div>

        <div className="timeline">
          {STEPS.map((step, idx) => {
            const stepStatus = getStepStatus(idx);
            const resultLabel = idx === 2 && order.status !== 'PENDING'
              ? (order.status === 'APPROVED' ? 'Approved ✓' : 'Rejected ✗')
              : step.label;
            return (
              <div key={step.key} className={`timeline-step ${stepStatus}`}>
                <div className="timeline-node" />
                {idx < STEPS.length - 1 && <div className="timeline-line" />}
                <div className="timeline-info">
                  <span className="timeline-label">{resultLabel}</span>
                  {idx === 0 && <span className="timeline-time">{new Date(order.createdAt).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="order-details card">
          <h3>Order Details</h3>
          <div className="detail-row"><FiUser size={16} /><span>{order.customerName}</span></div>
          {order.phoneNumber && <div className="detail-row"><FiPhone size={16} /><span>{order.phoneNumber}</span></div>}
          <div className="detail-row"><FiMapPin size={16} /><span>{order.location}</span></div>

          <div className="items-list">
            {order.items?.map(item => (
              <div key={item.id} className="tracking-item">
                <span>{item.quantity}x {item.foodName}</span>
                <span>Rs.{(item.foodPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-secondary w-full" onClick={() => navigate('/')}>Back to Menu</button>
      </div>
    </div>
  );
}
