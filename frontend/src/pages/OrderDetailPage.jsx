import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { getProductFallbackImage } from '../utils/imagePlaceholder';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getMyOrderDetail(id);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError(err?.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      setCancelling(true);
      await orderApi.cancelOrder(id);
      await fetchOrderDetail();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err?.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
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

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-container">
        <div className="orders-error-state">
          <p className="error-msg">{error || 'Không tìm thấy đơn hàng'}</p>
          <div className="btn-group-center">
            <button className="btn btn-primary" onClick={fetchOrderDetail}>Thử lại</button>
            <Link to="/orders" className="btn btn-outline">Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  // Group items by standalone products vs PC configurations
  const configGroups = {};
  const standaloneItems = [];

  (order.orderItems || []).forEach((item) => {
    if (item.configurationId) {
      if (!configGroups[item.configurationId]) {
        configGroups[item.configurationId] = [];
      }
      configGroups[item.configurationId].push(item);
    } else {
      standaloneItems.push(item);
    }
  });

  return (
    <div className="order-detail-container">
      <div className="order-detail-nav">
        <button className="btn-back" onClick={() => navigate('/orders')}>
          ← Quay lại danh sách đơn hàng
        </button>
      </div>

      <div className="order-detail-header">
        <div className="order-header-left">
          <h1>Chi tiết đơn hàng #{order.id}</h1>
          <p className="order-created-date">
            Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
          </p>
        </div>
        <div className="order-header-right">
          {getStatusBadge(order.status)}
          {order.status === 'PENDING' && (
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={cancelling}
              onClick={handleCancelOrder}
            >
              {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Left Column: Products and Items */}
        <div className="order-detail-main">
          <div className="order-card-section">
            <h3>Danh sách sản phẩm</h3>

            {/* Custom PC Configurations */}
            {Object.entries(configGroups).map(([configId, items]) => {
              const groupTotal = items.reduce(
                (sum, it) => sum + (Number(it.price || 0) * (it.quantity || 1)),
                0
              );
              return (
                <div key={configId} className="order-config-group">
                  <div className="order-config-header">
                    <div className="config-header-title">
                      <span className="builder-tag">[BUILDER] Cấu hình PC #{configId}</span>
                      <span className="config-items-count">({items.length} linh kiện)</span>
                    </div>
                    <span className="config-group-total">
                      Tổng cấu hình: {groupTotal.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="order-config-items">
                    {items.map((item) => (
                      <div key={item.id} className="order-item-detail-row">
                        <img
                          src={item.productImage || getProductFallbackImage({ name: item.productName, category: { slug: item.componentType } })}
                          alt={item.productName}
                          className="item-detail-img"
                          onError={(e) => { e.target.src = getProductFallbackImage({ name: item.productName, category: { slug: item.componentType } }); }}
                        />
                        <div className="item-detail-content">
                          <Link to={`/products/${item.productId}`} className="item-detail-name">
                            {item.productName}
                          </Link>
                          {item.componentType && (
                            <span className="item-component-type">Loại: {item.componentType}</span>
                          )}
                          <span className="item-detail-qty">Số lượng: {item.quantity}</span>
                        </div>
                        <div className="item-detail-price">
                          <span className="item-unit-price">{Number(item.price || 0).toLocaleString('vi-VN')} đ</span>
                          <strong className="item-subtotal-price">
                            {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Standalone Items */}
            {standaloneItems.length > 0 && (
              <div className="order-standalone-items">
                {Object.keys(configGroups).length > 0 && (
                  <h4 className="section-subtitle">Sản phẩm mua lẻ</h4>
                )}
                {standaloneItems.map((item) => (
                  <div key={item.id} className="order-item-detail-row">
                    <img
                      src={item.productImage || getProductFallbackImage({ name: item.productName, category: { slug: item.componentType } })}
                      alt={item.productName}
                      className="item-detail-img"
                      onError={(e) => { e.target.src = getProductFallbackImage({ name: item.productName, category: { slug: item.componentType } }); }}
                    />
                    <div className="item-detail-content">
                      <Link to={`/products/${item.productId}`} className="item-detail-name">
                        {item.productName}
                      </Link>
                      <span className="item-detail-qty">Số lượng: {item.quantity}</span>
                    </div>
                    <div className="item-detail-price">
                      <span className="item-unit-price">{Number(item.price || 0).toLocaleString('vi-VN')} đ</span>
                      <strong className="item-subtotal-price">
                        {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Address, Payment, Summary */}
        <div className="order-detail-side">
          <div className="order-side-card">
            <h3>Thông tin nhận hàng</h3>
            <div className="delivery-info">
              <p><strong>Người nhận:</strong> {order.recipientName || 'Chưa cập nhật'}</p>
              <p><strong>Số điện thoại:</strong> {order.recipientPhone || 'Chưa cập nhật'}</p>
              <p><strong>Địa chỉ:</strong> {order.shippingAddress || 'Chưa cập nhật'}</p>
              {order.note && (
                <p><strong>Ghi chú:</strong> <em>{order.note}</em></p>
              )}
            </div>
          </div>

          <div className="order-side-card">
            <h3>Thanh toán</h3>
            <div className="payment-info">
              <p>
                <strong>Phương thức:</strong>{' '}
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
              </p>
              <p>
                <strong>Trạng thái thanh toán:</strong>{' '}
                <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </p>
            </div>
          </div>

          <div className="order-side-card">
            <h3>Tổng kết đơn hàng</h3>
            <div className="order-totals-breakdown">
              <div className="breakdown-row">
                <span>Tổng tiền hàng:</span>
                <span>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="breakdown-row discount-row">
                  <span>Giảm giá / Voucher:</span>
                  <span>- {Number(order.discountAmount || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Phí vận chuyển:</span>
                <span className="free-shipping">Miễn phí</span>
              </div>
              <div className="breakdown-row final-total-row">
                <span>Tổng thanh toán:</span>
                <strong className="final-amount">
                  {Number(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
