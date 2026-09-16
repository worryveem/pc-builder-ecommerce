import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'year'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        setStats(res?.data || res);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Không thể tải dữ liệu thống kê quản trị');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Compute chart data according to active period
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    if (period === 'week') return stats.weeklyStats || [];
    if (period === 'month') return stats.monthlyStats || [];
    if (period === 'year') return stats.yearlyStats || [];
    return [];
  }, [stats, period]);

  const maxRevenue = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return Math.max(...chartData.map((d) => d.revenue || 0), 0);
  }, [chartData]);

  const totalPeriodRevenue = React.useMemo(() => {
    if (!chartData) return 0;
    return chartData.reduce((acc, d) => acc + (d.revenue || 0), 0);
  }, [chartData]);

  const totalPeriodOrders = React.useMemo(() => {
    if (!chartData) return 0;
    return chartData.reduce((acc, d) => acc + (d.orders || 0), 0);
  }, [chartData]);

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

      {/* Revenue & Orders Statistics Chart Section */}
      <div className="dashboard-section chart-section">
        <div className="section-header">
          <div>
            <h3>Biểu đồ thống kê doanh thu & đơn hàng</h3>
            <p className="section-subtitle">Theo dõi tăng trưởng kinh doanh theo chu kỳ thời gian</p>
          </div>

          <div className="chart-controls">
            <div className="chart-period-tabs">
              <button
                type="button"
                className={`chart-tab-btn ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                7 Ngày qua (Tuần)
              </button>
              <button
                type="button"
                className={`chart-tab-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                12 Tháng qua (Năm nay)
              </button>
              <button
                type="button"
                className={`chart-tab-btn ${period === 'year' ? 'active' : ''}`}
                onClick={() => setPeriod('year')}
              >
                5 Năm qua
              </button>
            </div>
          </div>
        </div>

        {/* Chart Summary Cards */}
        <div className="chart-summary-row">
          <div className="chart-summary-item">
            <span className="summary-label">Doanh thu trong kỳ</span>
            <strong className="summary-value text-primary">
              {Number(totalPeriodRevenue).toLocaleString('vi-VN')} đ
            </strong>
          </div>
          <div className="chart-summary-item">
            <span className="summary-label">Tổng đơn hàng trong kỳ</span>
            <strong className="summary-value text-secondary">
              {totalPeriodOrders} đơn
            </strong>
          </div>
          <div className="chart-summary-item">
            <span className="summary-label">Giá trị đơn trung bình (AOV)</span>
            <strong className="summary-value text-accent">
              {totalPeriodOrders > 0
                ? Number(Math.round(totalPeriodRevenue / totalPeriodOrders)).toLocaleString('vi-VN')
                : 0} đ
            </strong>
          </div>
        </div>

        {/* Dynamic Responsive Bar Chart */}
        <div className="chart-container">
          <div className="chart-bars-wrapper">
            {chartData.map((item, idx) => {
              const revenueHeight = maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 3) : 3;
              const hasData = (item.revenue || 0) > 0 || (item.orders || 0) > 0;

              return (
                <div key={idx} className="chart-bar-group" title={`${item.fullDate || item.label}: ${Number(item.revenue || 0).toLocaleString('vi-VN')} đ (${item.orders || 0} đơn)`}>
                  <div className="chart-bar-track">
                    <div
                      className={`chart-bar-fill ${hasData ? 'has-value' : 'zero-value'}`}
                      style={{ height: `${revenueHeight}%` }}
                    >
                      <div className="chart-bar-tooltip">
                        <div className="tooltip-date">{item.fullDate || item.label}</div>
                        <div className="tooltip-revenue">{Number(item.revenue || 0).toLocaleString('vi-VN')} đ</div>
                        <div className="tooltip-orders">{item.orders || 0} đơn hàng</div>
                      </div>
                    </div>
                  </div>
                  <span className="chart-bar-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-indicator legend-revenue"></span>
            Doanh thu thực tế (đã trừ đơn hủy)
          </span>
          <span className="legend-tip">
            * Rê chuột vào từng cột để xem chi tiết doanh số và số lượng đơn
          </span>
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
                    <td>{Number(order.totalPrice || order.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
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
