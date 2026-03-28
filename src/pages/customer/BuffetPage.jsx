import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodAPI, orderAPI } from '../../services/api';
import { FiArrowLeft, FiUsers, FiUser, FiMapPin, FiCheck, FiMinus, FiPlus, FiSend, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './BuffetPage.css';

export default function BuffetPage() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = select foods, 2 = enter details

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await foodAPI.getAll({ size: 50 });
        setFoods(res.data.data?.content || []);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const toggleItem = (food) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[food.id]) {
        delete copy[food.id];
      } else {
        copy[food.id] = { food, quantity: guestCount };
      }
      return copy;
    });
  };

  const updateItemQty = (foodId, qty) => {
    if (qty < 1) return;
    setSelectedItems((prev) => ({
      ...prev,
      [foodId]: { ...prev[foodId], quantity: qty },
    }));
  };

  const selectedCount = Object.keys(selectedItems).length;

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Name is required';
    if (customerName.trim().length < 2) errs.customerName = 'Name must be at least 2 characters';
    if (phoneNumber.trim() && !/^[0-9+\-\s]{7,20}$/.test(phoneNumber.trim())) errs.phoneNumber = 'Enter a valid phone number';
    if (!location.trim()) errs.location = 'Location is required';
    if (location.trim().length < 5) errs.location = 'Please enter a valid address';
    if (selectedCount === 0) errs.items = 'Select at least one dish';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        location: location.trim(),
        orderType: 'BUFFET',
        items: Object.values(selectedItems).map(({ food, quantity }) => ({
          foodId: food.id,
          quantity,
        })),
      };
      const res = await orderAPI.createBuffet(orderData);
      const orderId = res.data.data?.id;
      toast.success('Buffet order placed successfully!');
      navigate(`/order/${orderId}`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place buffet order';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [...new Set(foods.map((f) => f.category))];

  if (loading) {
    return (
      <div className="buffet-page">
        <header className="page-header">
          <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
          <h1>Buffet Menu</h1>
          <div style={{ width: 40 }} />
        </header>
        <div className="buffet-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="buffet-card-skeleton">
              <div className="skeleton" style={{ height: 120, borderRadius: '12px' }} />
              <div className="skeleton" style={{ height: 16, width: '60%', marginTop: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="buffet-page fade-in">
      <header className="page-header">
        <button className="btn-icon" onClick={() => step === 2 ? setStep(1) : navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <h1>{step === 1 ? 'Buffet Menu' : 'Buffet Details'}</h1>
        <div style={{ width: 40 }} />
      </header>

      {/* Progress Steps */}
      <div className="buffet-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="progress-dot">{step > 1 ? <FiCheck size={14} /> : '1'}</div>
          <span>Select Dishes</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="progress-dot">2</div>
          <span>Your Details</span>
        </div>
      </div>

      {step === 1 && (
        <>
          {/* Guest Count */}
          <div className="guest-selector card">
            <div className="guest-label">
              <FiUsers size={18} />
              <span>Number of Guests</span>
            </div>
            <div className="quantity-controls">
              <button className="qty-btn" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} disabled={guestCount <= 1}>
                <FiMinus size={14} />
              </button>
              <span className="qty-value">{guestCount}</span>
              <button className="qty-btn" onClick={() => setGuestCount(Math.min(100, guestCount + 1))}>
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          {/* Food Selection */}
          {categories.map((cat) => (
            <section key={cat} className="buffet-category">
              <h2 className="category-title">{cat}</h2>
              <div className="buffet-grid">
                {foods.filter((f) => f.category === cat).map((food) => {
                  const isSelected = !!selectedItems[food.id];
                  return (
                    <div key={food.id}
                      className={`buffet-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleItem(food)}>
                      <div className="buffet-card-image">
                        {food.imageUrl ? (
                          <img src={food.imageUrl} alt={food.name} loading="lazy" />
                        ) : (
                          <div className="buffet-card-placeholder">🍲</div>
                        )}
                        {isSelected && (
                          <div className="selected-overlay">
                            <FiCheck size={24} />
                          </div>
                        )}
                      </div>
                      <div className="buffet-card-info">
                        <h3>{food.name}</h3>
                        <p className="buffet-card-desc">{food.description?.substring(0, 50)}...</p>
                        <span className="buffet-card-price">Rs.{food.price?.toFixed(2)}</span>
                      </div>
                      {isSelected && (
                        <div className="buffet-qty-row" onClick={(e) => e.stopPropagation()}>
                          <span className="buffet-qty-label">Qty per table</span>
                          <div className="quantity-controls small">
                            <button className="qty-btn" onClick={() => updateItemQty(food.id, selectedItems[food.id].quantity - 1)}>
                              <FiMinus size={12} />
                            </button>
                            <span className="qty-value">{selectedItems[food.id].quantity}</span>
                            <button className="qty-btn" onClick={() => updateItemQty(food.id, selectedItems[food.id].quantity + 1)}>
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Floating Action */}
          {selectedCount > 0 && (
            <div className="buffet-footer">
              <button className="btn-primary w-full" onClick={() => setStep(2)}>
                Continue with {selectedCount} dish{selectedCount > 1 ? 'es' : ''} →
              </button>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="buffet-details">
          <div className="summary-section card">
            <h2 className="summary-section-title">Your Details</h2>
            <div className="input-group">
              <label><FiUser size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Your Name</label>
              <input type="text" className="input-field" placeholder="Enter your name"
                value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
              {errors.customerName && <span className="input-error">{errors.customerName}</span>}
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label><FiPhone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Phone Number</label>
              <input type="tel" className="input-field" placeholder="Enter your phone number"
                value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={20} />
              {errors.phoneNumber && <span className="input-error">{errors.phoneNumber}</span>}
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label><FiMapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Delivery Location</label>
              <textarea className="input-field" placeholder="Enter your delivery address" rows={3}
                value={location} onChange={(e) => setLocation(e.target.value)} maxLength={500}
                style={{ resize: 'vertical' }} />
              {errors.location && <span className="input-error">{errors.location}</span>}
            </div>
          </div>

          <div className="summary-section card" style={{ marginTop: 16 }}>
            <h2 className="summary-section-title">Buffet Summary</h2>
            <div className="buffet-summary-row">
              <span>Guests</span><span>{guestCount}</span>
            </div>
            {Object.values(selectedItems).map(({ food, quantity }) => (
              <div key={food.id} className="buffet-summary-row">
                <span>{quantity}x {food.name}</span>
                <span>Rs.{(food.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="buffet-summary-row total">
              <span>Total</span>
              <span>Rs.{Object.values(selectedItems).reduce((s, { food, quantity }) => s + food.price * quantity, 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="notice-card">
            <p>🎉 This is a <strong>buffet request order</strong>. No payment required now. Your order will be reviewed by our team.</p>
          </div>

          <button className="btn-primary w-full place-order-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Placing...</> :
              <><FiSend size={18} /> Place Buffet Request</>}
          </button>
        </div>
      )}
    </div>
  );
}
