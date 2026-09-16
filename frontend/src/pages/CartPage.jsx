import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

export const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await cartApi.getCart();
      if (res?.data && typeof res.data === 'object') {
        setCart(res.data);
      } else {
        setCart(null);
      }
    } catch (err) {
      setError('Lỗi khi nạp dữ liệu giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setActionMsg('');
      await cartApi.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (err) {
      setActionMsg('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    try {
      setActionMsg('');
      await cartApi.removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      setActionMsg('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng?')) return;
    try {
      setActionMsg('');
      await cartApi.clearCart();
      await fetchCart();
    } catch (err) {
      setActionMsg('Không thể làm trống giỏ hàng');
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state-container" style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Vui lòng đăng nhập để xem giỏ hàng
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Đăng nhập tài khoản giúp bạn lưu trữ và đồng bộ hóa giỏ hàng cũng như cấu hình PC tự build.
        </p>
        <Link to="/login" state={{ from: { pathname: '/cart' } }} className="btn btn-primary btn-lg">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice || items.reduce((sum, item) => {
    const p = item.product?.price || 0;
    return sum + p * (item.quantity || 1);
  }, 0);

  // Group items by configurationId
  const configGroups = {};
  const individualItems = [];

  items.forEach((item) => {
    if (item.configurationId) {
      if (!configGroups[item.configurationId]) {
        configGroups[item.configurationId] = [];
      }
      configGroups[item.configurationId].push(item);
    } else {
      individualItems.push(item);
    }
  });

  const renderItemRow = (item) => {
    const prod = item.product;
    const imgUrl = prod?.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;
    const itemTotal = (prod?.price || 0) * (item.quantity || 1);

    return (
      <div key={item.id} className="cart-row-item">
        <div className="cart-prod-cell">
          <div className="cart-thumb-box">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={prod?.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>TECHPC</span>
            )}
          </div>
          <div>
            <Link to={`/products/${prod?.id}`} className="cart-prod-name">
              {prod?.name || 'Linh kiện máy tính'}
            </Link>
            {item.configurationId && (
              <div style={{ marginTop: '0.25rem' }}>
                <span className="badge-builder">Cấu hình PC #{item.configurationId}</span>
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Hãng: {prod?.brand || 'Chính hãng'}
            </div>
          </div>
        </div>

        <div className="cart-unit-price">
          {formatPrice(prod?.price)}
        </div>

        <div>
          <div className="qty-buttons small">
            <button
              type="button"
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button
              type="button"
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={prod?.stockQuantity && item.quantity >= prod.stockQuantity}
            >
              +
            </button>
          </div>
        </div>

        <div className="cart-line-total">
          {formatPrice(itemTotal)}
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => handleRemoveItem(item.id)}
            className="btn-remove-cart"
            title="Xóa khỏi giỏ hàng"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container cart-page-wrap">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Giỏ hàng</span>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Giỏ Hàng Mua Sắm
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Kiểm tra danh sách linh kiện và cấu hình PC trước khi thanh toán
        </p>
      </div>

      {actionMsg && <div className="alert alert-info">{actionMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state-container elevation-sm">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Giỏ hàng của bạn đang trống
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Hãy khám phá các linh kiện máy tính chất lượng cao hoặc trải nghiệm công cụ Tự Build PC thông minh.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary">
              Khám Phá Linh Kiện
            </Link>
            <Link to="/builder" className="btn btn-outline-primary">
              Tự Build Cấu Hình PC
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Items List */}
          <div className="cart-table-card elevation-sm">
            <div className="cart-table-head">
              <span>Sản phẩm</span>
              <span>Đơn giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
              <span style={{ textAlign: 'right' }}>Xóa</span>
            </div>

            {/* Config groups */}
            {Object.keys(configGroups).map((configId) => (
              <div key={configId} style={{ marginTop: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                    Bộ Cấu Hình PC #{configId}
                  </span>
                  <Link to={`/builder/configuration/${configId}`} style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Chỉnh sửa trong Builder &rarr;
                  </Link>
                </div>
                {configGroups[configId].map((item) => renderItemRow(item))}
              </div>
            ))}

            {/* Individual items */}
            {individualItems.map((item) => renderItemRow(item))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ color: 'var(--price-red)', borderColor: 'var(--price-red-border)' }}
                onClick={handleClearCart}
              >
                Làm trống giỏ hàng
              </button>
              <Link to="/products" className="btn btn-sm btn-outline">
                &larr; Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Right Sticky Order Summary */}
          <aside className="order-summary-card elevation-md">
            <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

            <div className="summary-data-row">
              <span>Tổng số lượng:</span>
              <strong>{items.reduce((acc, i) => acc + (i.quantity || 1), 0)} linh kiện</strong>
            </div>

            <div className="summary-data-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="summary-data-row">
              <span>Phí vận chuyển:</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí giao hàng</span>
            </div>

            <div className="summary-data-row total-bold-row">
              <span>Tổng thanh toán:</span>
              <span className="summary-total-price">{formatPrice(totalPrice)}</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              (Đã bao gồm thuế giá trị gia tăng VAT 10%)
            </p>

            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate('/checkout')}
            >
              Tiến Hành Đặt Hàng
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
