import { useState, useEffect, useCallback } from 'react';
import { foodAPI, adminAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminMenu.css';

const CATEGORIES = ['Soup', 'Drinks', 'Spicy', 'Traditional', 'Sweet'];

const emptyForm = { name: '', description: '', price: '', category: CATEGORIES[0], image: null };

export default function AdminMenu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = new, food object = editing
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (searchQuery) params.search = searchQuery;
      const res = await foodAPI.getAll(params);
      const data = res.data.data;
      setFoods(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (food) => {
    setEditing(food);
    setForm({
      name: food.name || '',
      description: food.description || '',
      price: food.price?.toString() || '',
      category: food.category || CATEGORIES[0],
      image: null,
    });
    setFormErrors({});
    setImagePreview(food.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Valid price is required';
    if (!form.category) errs.category = 'Category is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      const foodJson = JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
      });
      formData.append('food', new Blob([foodJson], { type: 'application/json' }));
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editing) {
        await adminAPI.updateFood(editing.id, formData);
        toast.success('Food item updated');
      } else {
        await adminAPI.createFood(formData);
        toast.success('Food item created');
      }
      closeModal();
      fetchFoods();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save food item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    setDeleting(id);
    try {
      await adminAPI.deleteFood(id);
      toast.success('Food item deleted');
      fetchFoods();
    } catch {
      toast.error('Failed to delete food item');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-menu fade-in">
      <div className="menu-header">
        <div>
          <h1 className="menu-title">Menu Management</h1>
          <p className="menu-subtitle">{totalElements} food items</p>
        </div>
        <div className="menu-header-actions">
          <button className="btn-icon" onClick={fetchFoods} title="Refresh">
            <FiRefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          </button>
          <button className="btn-primary btn-sm" onClick={openCreateModal}>
            <FiPlus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="menu-search">
        <FiSearch className="menu-search-icon" />
        <input type="text" className="input-field" placeholder="Search menu items..."
          value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} />
      </div>

      {/* Food Table */}
      {loading ? (
        <div className="menu-table-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 12 }} />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="empty-state">
          <p>🍽️</p>
          <h3>No menu items found</h3>
          <p>Add your first dish to get started</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={openCreateModal}>
            <FiPlus size={16} /> Add Food Item
          </button>
        </div>
      ) : (
        <div className="menu-table">
          <div className="mt-header">
            <span className="mt-cell-image">Image</span>
            <span className="mt-cell-name">Name</span>
            <span className="mt-cell-cat">Category</span>
            <span className="mt-cell-price">Price</span>
            <span className="mt-cell-actions">Actions</span>
          </div>
          {foods.map((food, idx) => (
            <div key={food.id} className="mt-row" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="mt-cell-image">
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt={food.name} className="mt-thumb" />
                ) : (
                  <div className="mt-thumb-placeholder">🍲</div>
                )}
              </div>
              <div className="mt-cell-name">
                <span className="mt-food-name">{food.name}</span>
                <span className="mt-food-desc">{food.description?.substring(0, 60)}{food.description?.length > 60 ? '...' : ''}</span>
              </div>
              <span className="mt-cell-cat">
                <span className="badge">{food.category}</span>
              </span>
              <span className="mt-cell-price">Rs.{food.price?.toFixed(2)}</span>
              <div className="mt-cell-actions">
                <button className="btn-icon btn-sm" onClick={() => openEditModal(food)} title="Edit">
                  <FiEdit2 size={15} />
                </button>
                <button className="btn-icon btn-sm" onClick={() => handleDelete(food.id)} title="Delete"
                  disabled={deleting === food.id}
                  style={{ color: 'var(--error)' }}>
                  {deleting === food.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <FiTrash2 size={15} />}
                </button>
              </div>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Food Item' : 'Add New Item'}</h2>
              <button className="btn-icon" onClick={closeModal}><FiX size={18} /></button>
            </div>

            <div className="modal-body">
              {/* Image Upload */}
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview-wrap">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <label className="image-change-btn" htmlFor="food-image-input">
                      <FiImage size={14} /> Change
                    </label>
                  </div>
                ) : (
                  <label className="image-upload-label" htmlFor="food-image-input">
                    <FiImage size={24} />
                    <span>Upload Image</span>
                    <span className="image-hint">Click to select an image</span>
                  </label>
                )}
                <input type="file" id="food-image-input" accept="image/*" onChange={handleImageChange}
                  style={{ display: 'none' }} />
              </div>

              <div className="input-group">
                <label>Food Name *</label>
                <input type="text" className="input-field" placeholder="Enter food name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
                {formErrors.name && <span className="input-error">{formErrors.name}</span>}
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea className="input-field" placeholder="Enter description" rows={3}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={2000} style={{ resize: 'vertical' }} />
              </div>

              <div className="modal-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Price ($) *</label>
                  <input type="number" className="input-field" placeholder="0.00" step="0.01" min="0.01"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  {formErrors.price && <span className="input-error">{formErrors.price}</span>}
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Category *</label>
                  <select className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <span className="input-error">{formErrors.category}</span>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> :
                  editing ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
