import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { foodAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { FiSearch, FiShoppingCart, FiClock, FiChevronRight } from 'react-icons/fi';
import './HomePage.css';

const CATEGORIES = ['All', 'Soup', 'Drinks', 'Spicy', 'Traditional', 'Sweet'];

export default function HomePage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const fetchFoods = useCallback(async (search = '', category = 'All') => {
    setLoading(true);
    try {
      const params = { size: 20 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await foodAPI.getAll(params);
      setFoods(res.data.data?.content || []);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods('', activeCategory);
  }, [activeCategory, fetchFoods]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFoods(value, activeCategory);
    }, 400);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-top">
          <div>
            <p className="header-greeting">Good day! 👋</p>
            <h1 className="header-title">Sara's Curator</h1>
          </div>
          <div className="header-actions">
            <Link to="/orders" className="btn-icon" title="Order History">
              <FiClock size={20} />
            </Link>
            <Link to="/cart" className="cart-btn" title="Cart">
              <FiShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search for dishes..." className="search-input"
            value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Buffet Banner */}
      <section className="buffet-banner" onClick={() => navigate('/buffet')}>
        <div className="buffet-content">
          <h3>🎉 Buffet Special</h3>
          <p>Select your own menu for a group feast</p>
        </div>
        <FiChevronRight size={24} />
      </section>

      {/* Food Grid */}
      <section className="food-section">
        <h2 className="section-title">
          {activeCategory === 'All' ? 'Popular Dishes' : activeCategory}
          <span className="food-count">{foods.length} items</span>
        </h2>

        {loading ? (
          <div className="food-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="food-card-skeleton">
                <div className="skeleton" style={{ height: 160, borderRadius: '12px' }} />
                <div className="skeleton" style={{ height: 18, width: '70%', marginTop: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '50%', marginTop: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '30%', marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="empty-state">
            <p>🍽️</p>
            <h3>No dishes found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food, idx) => (
              <div key={food.id} className="food-card fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/food/${food.id}`)}>
                <div className="food-image-wrap">
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt={food.name} className="food-image" loading="lazy" />
                  ) : (
                    <div className="food-image-placeholder">🍲</div>
                  )}
                  <span className="food-category-badge">{food.category}</span>
                </div>
                <div className="food-info">
                  <h3 className="food-name">{food.name}</h3>
                  <p className="food-desc">{food.description?.substring(0, 60)}...</p>
                  <div className="food-bottom">
                    <span className="food-price">Rs.{food.price?.toFixed(2)}</span>
                    <button className="food-add-btn" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/food/${food.id}`);
                    }}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
