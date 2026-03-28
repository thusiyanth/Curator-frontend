import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiMapPin, FiUser, FiSend, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './OrderSummaryPage.css';

export default function OrderSummaryPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Name is required';
    if (customerName.trim().length < 2) errs.customerName = 'Name must be at least 2 characters';
    if (phoneNumber.trim() && !/^[0-9+\-\s]{7,20}$/.test(phoneNumber.trim())) errs.phoneNumber = 'Enter a valid phone number';
    if (!location.trim()) errs.location = 'Delivery location is required';
    if (location.trim().length < 5) errs.location = 'Please enter a valid address';
    if (items.length === 0) errs.items = 'Cart is empty';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        location: location.trim(),
        items: items.map(({ food, quantity }) => ({ foodId: food.id, quantity })),
      };
      const res = await orderAPI.create(orderData);
      const orderId = res.data.data?.id;
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${orderId}`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="order-summary-page">
        <header className="page-header">
          <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
          <h1>Order Summary</h1><div style={{width:40}} />
        </header>
        <div className="empty-state"><p>🛒</p><h3>No items to order</h3>
          <button className="btn-primary" style={{marginTop: 16}} onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary-page fade-in">
      <header className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
        <h1>Order Summary</h1><div style={{width:40}} />
      </header>

      <div className="summary-content">
        <div className="summary-section card">
          <h2 className="summary-section-title">Your Details</h2>
          <div className="input-group">
            <label><FiUser size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Your Name</label>
            <input type="text" className="input-field" placeholder="Enter your name"
              value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
            {errors.customerName && <span className="input-error">{errors.customerName}</span>}
          </div>
          <div className="input-group" style={{marginTop: 16}}>
            <label><FiPhone size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Phone Number</label>
            <input type="tel" className="input-field" placeholder="Enter your phone number"
              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={20} />
            {errors.phoneNumber && <span className="input-error">{errors.phoneNumber}</span>}
          </div>
          <div className="input-group" style={{marginTop: 16}}>
            <label><FiMapPin size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Delivery Location</label>
            <textarea className="input-field" placeholder="Enter your delivery address" rows={3}
              value={location} onChange={(e) => setLocation(e.target.value)} maxLength={500}
              style={{resize: 'vertical'}} />
            {errors.location && <span className="input-error">{errors.location}</span>}
          </div>
        </div>

        <div className="summary-section card">
          <h2 className="summary-section-title">Order Items</h2>
          {items.map(({ food, quantity }) => (
            <div key={food.id} className="order-item-row">
              <div className="order-item-info">
                <span className="order-item-qty">{quantity}x</span>
                <span>{food.name}</span>
              </div>
              <span className="order-item-price">Rs.{(food.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-total-row">
            <span>Total</span><span>Rs.{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="notice-card">
          <p>📋 This is a <strong>request-based order</strong>. No payment is required now. Your order will be reviewed and you'll be notified once approved.</p>
        </div>

        <button className="btn-primary w-full place-order-btn" onClick={handlePlaceOrder}
          disabled={submitting}>
          {submitting ? <><div className="spinner" style={{width:18,height:18}} /> Placing...</> :
            <><FiSend size={18} /> Place Request</>}
        </button>
      </div>
    </div>
  );
}
