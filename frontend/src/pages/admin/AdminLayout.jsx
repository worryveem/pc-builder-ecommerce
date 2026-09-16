import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  const isAdmin = isAuthenticated && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>403 - Quyền truy cập bị từ chối</h2>
        <p>Bạn không có quyền quản trị viên để truy cập trang này.</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-badge">ADMIN</span>
          <span className="brand-text">PC Builder CMS</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Tổng quan (Dashboard)
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Quản lý sản phẩm
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Quản lý danh mục
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Quản lý đơn hàng
          </NavLink>
          <NavLink to="/admin/vouchers" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Quản lý voucher
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            Quản lý người dùng
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="btn-return-store">
            ← Quay lại cửa hàng
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <span>Quản trị hệ thống</span>
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">Xin chào, {user?.username}</span>
            <span className="admin-role-badge">ADMINISTRATOR</span>
          </div>
        </header>

        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
