import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Customer pages
import HomePage from './pages/customer/HomePage';
import FoodDetailPage from './pages/customer/FoodDetailPage';
import CartPage from './pages/customer/CartPage';
import OrderSummaryPage from './pages/customer/OrderSummaryPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import BuffetPage from './pages/customer/BuffetPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminBuffet from './pages/admin/AdminBuffet';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: 'toast-custom',
            style: {
              background: '#1a1c1c',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '0.875rem',
              fontFamily: "'Inter', sans-serif",
            },
          }}
        />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
          <Route path="/order/:id" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/buffet" element={<BuffetPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="buffet" element={<AdminBuffet />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
