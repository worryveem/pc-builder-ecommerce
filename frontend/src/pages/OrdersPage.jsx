import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';

const STATUS_TABS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Chờ xử lý', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đang giao', value: 'SHIPPING' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
      if (!status || status === 'ALL') {
        data = await orderApi.getMyOrders();
      } else {
        data = await orderApi.getMyOrdersByStatus(status);
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      setActionLoading(orderId);
      await orderApi.cancelOrder(orderId);
      await fetchOrders(activeTab);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err?.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="status-badge status-pending">Chờ xử lý</span>;
      case 'CONFIRMED':
        return <span className="status-badge status-confirmed">Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="status-badge status-shipping">Đang giao</span>;
      case 'COMPLETED':
        return <span className="status-badge status-completed">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="orders-page-container">
      <div className="orders-header">
        <h1>Lịch sử đơn hàng</h1>
        <p>Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
      </div>

      <div className="orders-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="orders-error-state">
          <p className="error-msg">{error}</p>
          <button className="btn btn-primary" onClick={() => fetchOrders(activeTab)}>Thử lại</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">📦</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào trong trạng thái này.</p>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const itemCount = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
            const hasCustomPc = order.orderItems?.some((item) => !!item.configurationId);

            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info-left">
                    <span className="order-id">Đơn hàng #{order.id}</span>
                    <span className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                  <div className="order-info-right">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.orderItems?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="order-item-img-wrap">
                          <img
                            src={item.productImage || '/placeholder.png'}
                            alt={item.productName}
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                        </div>
                        <div className="order-item-info">
                          <span className="order-item-name">{item.productName}</span>
                          <span className="order-item-meta">
                            {Number(item.price || 0).toLocaleString('vi-VN')} đ x {item.quantity}
                            {item.configurationId && (
                              <span className="badge-custom-pc-sm">Cấu hình PC #{item.configurationId}</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.orderItems?.length > 3 && (
                      <p className="order-items-more">+ {order.orderItems.length - 3} sản phẩm khác</p>
                    )}
                  </div>

                  <div className="order-card-summary">
                    {hasCustomPc && (
                      <div className="custom-pc-note">
                        🛠️ Bao gồm cấu hình PC tùy chọn
                      </div>
                    )}
                    <div className="order-summary-row">
                      <span>Tổng sản phẩm:</span>
                      <strong>{itemCount} món</strong>
                    </div>
                    <div className="order-summary-row">
                      <span>Phương thức:</span>
                      <span>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</span>
                    </div>
                    <div className="order-summary-row total-row">
                      <span>Tổng thanh toán:</span>
                      <strong className="order-total-price">
                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="footer-actions-left">
                    {order.status === 'PENDING' && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={actionLoading === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        {actionLoading === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                      </button>
                    )}
                  </div>
                  <div className="footer-actions-right">
                    <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
