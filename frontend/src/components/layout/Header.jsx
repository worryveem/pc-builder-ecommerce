import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand-logo">
          <span className="logo-icon">💻</span>
          <span className="logo-text">TECHPC STORE</span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Sản phẩm & Linh kiện
          </NavLink>
          <NavLink to="/builder" className={({ isActive }) => (isActive ? 'nav-link active nav-highlight' : 'nav-link nav-highlight')}>
            ⚡ Tự Build PC
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            🛒 Giỏ hàng
          </NavLink>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">
                Xin chào, <strong>{user?.fullName || user?.username}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-sm btn-outline">
                Đăng xuất
              </button>
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
  );
};
