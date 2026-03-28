import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foodAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './FoodDetailPage.css';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await foodAPI.getById(id);
        setFood(res.data.data);
      } catch (err) {
        toast.error('Failed to load food details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (food) {
      addItem(food, quantity);
      toast.success(`${food.name} added to cart!`);
      navigate('/');
    }
  };

  if (loading) return (
    <div className="food-detail-page">
      <div className="skeleton" style={{ height: 320 }} />
      <div style={{ padding: '24px' }}>
        <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 80, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 48 }} />
      </div>
    </div>
  );

  if (!food) return null;

  return (
    <div className="food-detail-page fade-in">
      <div className="detail-image-section">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt={food.name} className="detail-image" />
        ) : (
          <div className="detail-image-placeholder">🍲</div>
        )}
        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </button>
        <span className="detail-category">{food.category}</span>
      </div>

      <div className="detail-content">
        <div className="detail-header">
          <h1 className="detail-name">{food.name}</h1>
          <span className="detail-price">Rs.{food.price?.toFixed(2)}</span>
        </div>

        <p className="detail-description">{food.description}</p>

        <div className="detail-quantity">
          <span className="quantity-label">Quantity</span>
          <div className="quantity-controls">
            <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}>
              <FiMinus size={16} />
            </button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => setQuantity(Math.min(99, quantity + 1))}>
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        <div className="detail-total">
          <span>Total</span>
          <span className="total-price">Rs.{(food.price * quantity).toFixed(2)}</span>
        </div>

        <button className="btn-primary w-full detail-add-btn" onClick={handleAddToCart}>
          <FiShoppingCart size={18} />
          Add to Order
        </button>
      </div>
    </div>
  );
}
