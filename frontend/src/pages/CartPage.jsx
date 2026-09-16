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
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state-container">
        <span className="empty-icon">🔒</span>
        <h2>Vui lòng đăng nhập để xem giỏ hàng</h2>
        <p>Đăng nhập tài khoản giúp bạn lưu trữ và đồng bộ hóa giỏ hàng và cấu hình PC của mình.</p>
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

  return (
    <div className="container cart-page">
      <div className="page-header">
        <h1>Giỏ Hàng Của Bạn</h1>
        <p>Quản lý các linh kiện và cấu hình máy tính đã chọn</p>
      </div>

      {actionMsg && <div className="alert alert-info">{actionMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state-container">
          <span className="empty-icon">🛒</span>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy khám phá các linh kiện máy tính chất lượng cao hoặc tự build cấu hình PC ưng ý.</p>
          <div className="empty-actions">
            <Link to="/products" className="btn btn-primary">Mua sắm linh kiện</Link>
            <Link to="/builder" className="btn btn-outline">Tự Build PC</Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-list">
            <div className="cart-header-row">
              <span className="col-prod">Sản phẩm</span>
              <span className="col-price">Đơn giá</span>
              <span className="col-qty">Số lượng</span>
              <span className="col-total">Thành tiền</span>
              <span className="col-action">Thao tác</span>
            </div>

            {items.map((item) => {
              const prod = item.product;
              const imgUrl = prod?.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;
              const itemTotal = (prod?.price || 0) * (item.quantity || 1);

              return (
                <div key={item.id} className="cart-item-row">
                  <div className="col-prod prod-info-cell">
                    <div className="cart-item-thumb">
                      {imgUrl ? (
                        <img src={imgUrl} alt={prod?.name} />
                      ) : (
                        <span>💻</span>
                      )}
                    </div>
                    <div className="cart-item-meta">
                      <Link to={`/products/${prod?.id}`} className="cart-item-name">
                        {prod?.name || 'Sản phẩm'}
                      </Link>
                      {item.configurationId && (
                        <span className="badge badge-builder">PC Build #{item.configurationId}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-price">
                    {formatPrice(prod?.price)}
                  </div>

                  <div className="col-qty">
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

                  <div className="col-total font-weight-bold">
                    {formatPrice(itemTotal)}
                  </div>

                  <div className="col-action">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn-text-danger"
                      title="Xóa khỏi giỏ hàng"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="cart-actions-footer">
              <button onClick={handleClearCart} className="btn btn-outline-danger btn-sm">
                Làm trống giỏ hàng
              </button>
              <Link to="/products" className="btn btn-outline btn-sm">
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>

          <div className="cart-summary-box">
            <h3>Tổng Đơn Hàng</h3>
            <div className="summary-row">
              <span>Số lượng sản phẩm:</span>
              <span>{items.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
            </div>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="text-success">Miễn phí</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Tổng thanh toán:</span>
              <span className="total-amount">{formatPrice(totalPrice)}</span>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg mt-3"
              onClick={() => alert('Chức năng đặt hàng & thanh toán sẽ hoàn thiện ở các phase tiếp theo!')}
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
