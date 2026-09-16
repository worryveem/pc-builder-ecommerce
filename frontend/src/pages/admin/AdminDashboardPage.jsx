import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Không thể tải dữ liệu thống kê quản trị');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-box">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-title-row">
        <h2>Tổng quan hệ thống</h2>
        <span className="last-updated">Cập nhật thời gian thực</span>
      </div>

      {/* Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue-card elevation-sm">
          <div className="stat-icon-badge">VND</div>
          <div className="stat-details">
            <span className="stat-label">Tổng doanh thu</span>
            <strong className="stat-value">
              {Number(stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
            </strong>
          </div>
        </div>

        <div className="stat-card orders-card elevation-sm">
          <div className="stat-icon-badge">ORD</div>
          <div className="stat-details">
            <span className="stat-label">Tổng đơn hàng</span>
            <strong className="stat-value">{stats?.totalOrders || 0}</strong>
          </div>
          {stats?.pendingOrdersCount > 0 && (
            <span className="stat-sub-tag warning-tag">
              {stats.pendingOrdersCount} đơn chờ xử lý
            </span>
          )}
        </div>

        <div className="stat-card products-card elevation-sm">
          <div className="stat-icon-badge">PRD</div>
          <div className="stat-details">
            <span className="stat-label">Tổng sản phẩm</span>
            <strong className="stat-value">{stats?.totalProducts || 0}</strong>
          </div>
          {stats?.lowStockCount > 0 && (
            <span className="stat-sub-tag danger-tag">
              {stats.lowStockCount} sắp hết hàng
            </span>
          )}
        </div>

        <div className="stat-card users-card elevation-sm">
          <div className="stat-icon-badge">USR</div>
          <div className="stat-details">
            <span className="stat-label">Khách hàng</span>
            <strong className="stat-value">{stats?.totalUsers || 0}</strong>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Đơn hàng gần đây</h3>
          <Link to="/admin/orders" className="view-all-link">Xem tất cả đơn hàng →</Link>
        </div>

        {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
          <p className="no-data-text">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </td>
                    <td>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to="/admin/orders" className="btn btn-outline btn-xs">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
