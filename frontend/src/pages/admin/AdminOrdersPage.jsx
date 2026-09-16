import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

const ORDER_STATUSES = [
  { label: 'Chờ xử lý (PENDING)', value: 'PENDING' },
  { label: 'Đã xác nhận (CONFIRMED)', value: 'CONFIRMED' },
  { label: 'Đang giao (SHIPPING)', value: 'SHIPPING' },
  { label: 'Đã hoàn thành (COMPLETED)', value: 'COMPLETED' },
  { label: 'Đã hủy (CANCELLED)', value: 'CANCELLED' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await adminApi.getOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus);
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err?.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetail = async (order) => {
    try {
      setDetailLoading(true);
      const detail = await adminApi.getOrderById(order.id);
      setSelectedOrder(detail || order);
    } catch (err) {
      console.error('Error fetching detail:', err);
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý đơn hàng</h2>
          <p className="subtitle">Xem chi tiết đơn hàng, cập nhật tiến độ giao dịch và giao hàng</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="admin-filter-bar">
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Cập nhật trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Chưa có đơn hàng nào</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      <div>{order.recipientName || order.user?.fullName || order.user?.username || 'Khách hàng'}</div>
                      <small className="text-muted">{order.recipientPhone || order.user?.phoneNumber || ''}</small>
                    </td>
                    <td>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </td>
                    <td className="text-primary font-bold">
                      {Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-select-sm"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => handleViewDetail(order)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div className="admin-loading-container">
                <div className="spinner"></div>
                <p>Đang tải...</p>
              </div>
            ) : (
              <div className="admin-order-detail-content">
                <div className="order-info-grid mb-4">
                  <div className="info-block">
                    <h4>Thông tin khách hàng</h4>
                    <p><strong>Người nhận:</strong> {selectedOrder.recipientName || '---'}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.recipientPhone || '---'}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || '---'}</p>
                    {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
                  </div>
                  <div className="info-block">
                    <h4>Thông tin thanh toán</h4>
                    <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
                    <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <h4>Danh sách sản phẩm trong đơn</h4>
                <div className="order-items-list mb-4">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={idx} className="admin-order-item-row">
                      <img
                        src={item.productImage || '/placeholder.png'}
                        alt={item.productName}
                        className="order-item-thumb"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                      <div className="order-item-main-info">
                        <span className="item-title">{item.productName}</span>
                        {item.configurationId && (
                          <span className="badge-custom-pc-sm">PC Build #{item.configurationId}</span>
                        )}
                        <span className="item-sub">Số lượng: {item.quantity}</span>
                      </div>
                      <div className="order-item-price-info">
                        <span>{Number(item.price || 0).toLocaleString('vi-VN')} đ</span>
                        <strong>{(Number(item.price || 0) * item.quantity).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary-panel">
                  <div className="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <span>{Number(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="summary-row discount-text">
                      <span>Giảm giá:</span>
                      <span>- {Number(selectedOrder.discountAmount || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="summary-row total-highlight">
                    <span>Tổng thanh toán:</span>
                    <strong>{Number(selectedOrder.finalAmount || selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
