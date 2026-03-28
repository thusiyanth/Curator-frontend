import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiList, FiCoffee, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const STAT_CARDS = [
  { key: 'totalOrders', label: 'Total Orders', icon: FiShoppingBag, color: '#914c00', bg: 'linear-gradient(135deg, #fff3e6, #ffe0c2)' },
  { key: 'pendingOrders', label: 'Pending', icon: FiClock, color: '#f57f17', bg: 'linear-gradient(135deg, #fff8e1, #ffecb3)' },
  { key: 'approvedOrders', label: 'Approved', icon: FiCheckCircle, color: '#2e7d32', bg: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' },
  { key: 'rejectedOrders', label: 'Rejected', icon: FiXCircle, color: '#c62828', bg: 'linear-gradient(135deg, #ffebee, #ffcdd2)' },
  { key: 'totalFoodItems', label: 'Menu Items', icon: FiList, color: '#1565c0', bg: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' },
  { key: 'buffetOrders', label: 'Buffet Orders', icon: FiCoffee, color: '#6a1b9a', bg: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your food ordering system</p>
        </div>
        <div className="dashboard-badge">
          <FiTrendingUp size={14} />
          <span>Live</span>
        </div>
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }, idx) => (
          <div key={key} className="stat-card" style={{ background: bg, animationDelay: `${idx * 0.08}s` }}>
            <div className="stat-icon-wrap" style={{ background: `${color}15` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{label}</span>
              {loading ? (
                <div className="skeleton" style={{ height: 32, width: 60, marginTop: 4 }} />
              ) : (
                <span className="stat-value" style={{ color }}>
                  <AnimatedCounter value={stats?.[key] ?? 0} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary */}
      {!loading && stats && (
        <div className="dashboard-summary-section">
          <h2 className="summary-heading">Quick Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-bar-wrap">
                <div className="insight-bar approved" style={{ width: `${stats.totalOrders > 0 ? (stats.approvedOrders / stats.totalOrders * 100) : 0}%` }} />
              </div>
              <div className="insight-info">
                <span className="insight-label">Approval Rate</span>
                <span className="insight-value">{stats.totalOrders > 0 ? Math.round(stats.approvedOrders / stats.totalOrders * 100) : 0}%</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-bar-wrap">
                <div className="insight-bar pending" style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders * 100) : 0}%` }} />
              </div>
              <div className="insight-info">
                <span className="insight-label">Pending Rate</span>
                <span className="insight-value">{stats.totalOrders > 0 ? Math.round(stats.pendingOrders / stats.totalOrders * 100) : 0}%</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-bar-wrap">
                <div className="insight-bar buffet" style={{ width: `${stats.totalOrders > 0 ? (stats.buffetOrders / stats.totalOrders * 100) : 0}%` }} />
              </div>
              <div className="insight-info">
                <span className="insight-label">Buffet Share</span>
                <span className="insight-value">{stats.totalOrders > 0 ? Math.round(stats.buffetOrders / stats.totalOrders * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Animated counter component */
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}
