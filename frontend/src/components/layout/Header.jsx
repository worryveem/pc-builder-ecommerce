import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AiRecommendationModal from '../common/AiRecommendationModal';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const isAdmin = isAuthenticated && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TECHPC STORE</span>
          </Link>

          <nav className="main-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Sản phẩm
            </NavLink>
            <NavLink to="/builder" className={({ isActive }) => (isActive ? 'nav-link active nav-highlight' : 'nav-link nav-highlight')}>
              🛠️ Tự Build PC
            </NavLink>
            <button
              type="button"
              className="nav-link nav-ai-trigger"
              onClick={() => setShowAiModal(true)}
            >
              🤖 Gợi ý AI
            </button>
            <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              ❤️ Yêu thích
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🛒 Giỏ hàng
            </NavLink>
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-dropdown-container">
                <button
                  type="button"
                  className="user-dropdown-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="user-avatar-mini">
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="user-dropdown-name">
                    {user?.fullName || user?.username}
                  </span>
                  <span className="dropdown-caret">▼</span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu" onClick={() => setUserMenuOpen(false)}>
                    <Link to="/profile" className="dropdown-item">
                      👤 Hồ sơ cá nhân
                    </Link>
                    <Link to="/orders" className="dropdown-item">
                      📦 Lịch sử đơn hàng
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      ❤️ Sản phẩm yêu thích
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin-item">
                        ⚡ Quản trị Admin
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button type="button" onClick={handleLogout} className="dropdown-item logout-item">
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-sm btn-outline">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Recommendation modal triggerable globally from Header */}
      <AiRecommendationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />
    </>
  );
};

export default Header;
