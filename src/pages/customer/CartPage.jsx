import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import './CartPage.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <header className="page-header">
          <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
          <h1>Your Cart</h1>
          <div style={{ width: 40 }} />
        </header>
        <div className="empty-state">
          <p>🛒</p><h3>Your cart is empty</h3><p>Add some delicious dishes!</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page fade-in">
      <header className="page-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
        <h1>Your Cart</h1>
        <button className="btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>Clear</button>
      </header>

      <div className="cart-items">
        {items.map(({ food, quantity }) => (
          <div key={food.id} className="cart-item card">
            <div className="cart-item-image">
              {food.imageUrl ? <img src={food.imageUrl} alt={food.name} /> : <span>🍲</span>}
            </div>
            <div className="cart-item-info">
              <h3>{food.name}</h3>
              <p className="cart-item-price">Rs.{food.price?.toFixed(2)}</p>
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(food.id, quantity - 1)}>
                    <FiMinus size={14} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(food.id, quantity + 1)}>
                    <FiPlus size={14} />
                  </button>
                </div>
                <button className="remove-btn" onClick={() => removeItem(food.id)}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary card">
        <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
        <div className="summary-row total"><span>Total</span><span>Rs.{totalPrice.toFixed(2)}</span></div>
        <button className="btn-primary w-full" onClick={() => navigate('/order-summary')}>
          Proceed to Order — Rs.{totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
