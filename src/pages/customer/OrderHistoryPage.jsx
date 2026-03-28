import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import './OrderHistoryPage.css';

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  const handleTrack = () => {
    const id = orderId.trim().replace('#', '');
    if (!id || isNaN(Number(id))) {
      setError('Please enter a valid order number');
      return;
    }
    setError('');
    navigate(`/order/${id}`);
  };

  return (
    <div className="history-page fade-in">
      <header className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
        <h1>Order History</h1><div style={{width:40}} />
      </header>

      <div className="history-content">
        <div className="track-section card">
          <h2>Track Your Order</h2>
          <p style={{color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: 16}}>
            Enter your order number to check the status
          </p>
          <div className="track-input-group">
            <input type="text" className="input-field" placeholder="Enter order number (e.g. 1)"
              value={orderId} onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()} />
            <button className="btn-primary" onClick={handleTrack}>
              <FiSearch size={18} /> Track
            </button>
          </div>
          {error && <span className="input-error">{error}</span>}
        </div>

        <div className="info-section">
          <h3>How it works</h3>
          <div className="info-steps">
            <div className="info-step"><span className="info-num">1</span><p>Place your food order from our menu</p></div>
            <div className="info-step"><span className="info-num">2</span><p>Receive an order number after submission</p></div>
            <div className="info-step"><span className="info-num">3</span><p>Track your order status anytime using the number</p></div>
            <div className="info-step"><span className="info-num">4</span><p>Admin will approve or reject your request</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
