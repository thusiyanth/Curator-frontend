import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiShoppingBag, FiList, FiCoffee, FiLogOut, FiUser } from 'react-icons/fi';
import './AdminLayout.css';

const navItems = [
  { path: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { path: '/admin/buffet', icon: FiCoffee, label: 'Buffet' },
  { path: '/admin/menu', icon: FiList, label: 'Menu' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-text">Sara's<br />Curator</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <FiUser size={16} />
            <span>{user?.username || 'Admin'}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
