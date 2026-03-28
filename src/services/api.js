import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.url.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    const token = localStorage.getItem('adminToken');
    return api.post('/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ===== FOOD API (Public) =====
export const foodAPI = {
  getAll: (params = {}) => api.get('/foods', { params }),
  getById: (id) => api.get(`/foods/${id}`),
  search: (query, category) => {
    const params = {};
    if (query) params.search = query;
    if (category && category !== 'All') params.category = category;
    return api.get('/foods', { params });
  },
};

// ===== ORDER API (Public) =====
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  createBuffet: (data) => api.post('/orders/buffet', data),
  getById: (id) => api.get(`/orders/${id}`),
};

// ===== ADMIN API (Protected) =====
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),

  // Food management
  createFood: (formData) =>
    api.post('/admin/foods', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    }),
  updateFood: (id, formData) =>
    api.put(`/admin/foods/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    }),
  deleteFood: (id) => api.delete(`/admin/foods/${id}`),

  // Order management
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  approveOrder: (id) => api.put(`/admin/orders/${id}/approve`),
  rejectOrder: (id) => api.put(`/admin/orders/${id}/reject`),
};

export default api;
