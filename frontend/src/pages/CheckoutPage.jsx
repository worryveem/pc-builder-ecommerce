import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cartApi';
import { orderApi } from '../api/orderApi';
import { voucherApi } from '../api/voucherApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shipping & Contact form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherMsg, setVoucherMsg] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setLoading(true);
        // Load cart
        const cartRes = await cartApi.getCart();
        if (cartRes?.data && typeof cartRes.data === 'object') {
          setCart(cartRes.data);
        }

        // Prefill user profile if logged in
        if (isAuthenticated) {
          try {
            const profileRes = await userApi.getMyProfile();
            if (profileRes?.data) {
              const u = profileRes.data;
              if (u.fullName) setFullName(u.fullName);
              if (u.phone) setPhone(u.phone);
              if (u.email) setEmail(u.email);
              if (u.address) {
                if (u.address.addressLine) setAddressLine(u.address.addressLine);
                if (u.address.city) setCity(u.address.city);
                if (u.address.district) setDistrict(u.address.district);
                if (u.address.ward) setWard(u.address.ward);
              }
            }
          } catch (pErr) {
            console.error('Failed to load profile for prefill:', pErr);
          }
        }
      } catch (err) {
        console.error('Failed to initialize checkout:', err);
        setErrorMsg('Không thể tải dữ liệu giỏ hàng để thanh toán.');
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [isAuthenticated]);

  const items = cart?.items || [];
  const subtotal = cart?.totalPrice || items.reduce((sum, i) => sum + (i.product?.price || 0) * (i.quantity || 1), 0);
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const shippingFee = 0; // Free shipping
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    try {
      setApplyingVoucher(true);
      setVoucherMsg('');
      const res = await voucherApi.applyVoucher(voucherCode.trim(), subtotal);
      if (res?.data && res.data.valid) {
        setAppliedVoucher(res.data);
        setVoucherMsg(`✓ Áp dụng thành công! Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.data.discountAmount)}`);
      } else {
        setAppliedVoucher(null);
        setVoucherMsg(res?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện.');
      }
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherMsg(err.response?.data?.message || 'Không thể kiểm tra mã giảm giá.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrorMsg('Giỏ hàng trống, không thể tạo đơn hàng.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    const fullAddress = `${addressLine.trim()}${ward ? `, ${ward}` : ''}${district ? `, ${district}` : ''}${city ? `, ${city}` : ''}`;

    const orderPayload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || (user?.email || 'customer@pcbuilder.vn'),
      address: fullAddress,
      notes: notes.trim(),
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      discountAmount: discountAmount,
      shippingFee: shippingFee,
      totalPrice: finalTotal,
      voucherCode: appliedVoucher ? voucherCode.trim() : null,
      orderItems: items.map(item => ({
        product: { id: item.product.id },
        quantity: item.quantity || 1,
        configurationId: item.configurationId || null
      }))
    };

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await orderApi.placeOrder(orderPayload);
      if (res === true || res?.data === true || res?.success === true) {
        setOrderSuccess(true);
      } else {
        setErrorMsg('Đặt hàng không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Place order failed:', err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang chuẩn bị thông tin thanh toán...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container checkout-success-container">
        <div className="success-icon-badge">✓</div>
        <h2>Đặt Hàng Thành Công!</h2>
        <p className="success-desc">
          Cảm ơn bạn đã đặt hàng tại PC Builder Shop. Đơn hàng của bạn đang được hệ thống tiếp nhận và xử lý.
        </p>
        <div className="success-meta-card">
          <div className="meta-row">
            <span>Người nhận:</span>
            <strong>{fullName} ({phone})</strong>
          </div>
          <div className="meta-row">
            <span>Địa chỉ giao hàng:</span>
            <strong>{addressLine}, {district}, {city}</strong>
          </div>
          <div className="meta-row">
            <span>Phương thức thanh toán:</span>
            <strong>{paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</strong>
          </div>
          <div className="meta-row total-row">
            <span>Tổng thanh toán:</span>
            <strong className="text-primary text-xl">{formatPrice(finalTotal)}</strong>
          </div>
        </div>

        <div className="mt-4 success-actions">
          <Link to="/orders" className="btn btn-primary btn-lg">
            📋 Xem lịch sử đơn hàng
          </Link>
          <Link to="/products" className="btn btn-outline btn-lg ml-3">
            Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container empty-state-container">
        <span className="empty-icon">🛒</span>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Vui lòng thêm sản phẩm hoặc hoàn thành cấu hình PC trước khi tiến hành thanh toán.</p>
        <div className="mt-3">
          <Link to="/products" className="btn btn-primary">Khám phá sản phẩm</Link>
          <Link to="/builder" className="btn btn-outline ml-2">Tự Build PC</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <div className="page-header">
        <h1>Thanh Toán Đơn Hàng</h1>
        <p>Hoàn tất thông tin giao hàng và chọn phương thức thanh toán</p>
      </div>

      {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}

      <form onSubmit={handleSubmitOrder} className="checkout-layout">
        {/* Left column: Shipping form and Payment Method */}
        <div className="checkout-main-form">
          <div className="checkout-section-card">
            <h3 className="section-title">1. Thông Tin Người Nhận</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Họ và tên <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email (Nhận thông báo đơn hàng)</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ nhận hàng (Số nhà, tên đường) <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: 123 Đường Cầu Giấy, Tòa nhà FPT"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Tỉnh / Thành phố</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Quận / Huyện</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Quận / Huyện"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phường / Xã</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Phường / Xã"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú cho shipper / đơn hàng</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="checkout-section-card mt-4">
            <h3 className="section-title">2. Phương Thức Thanh Toán</h3>
            <div className="payment-options">
              <label className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div className="option-info">
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <p>Kiểm tra sản phẩm và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng.</p>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                />
                <div className="option-info">
                  <strong>Chuyển khoản Ngân hàng / Quét mã VietQR</strong>
                  <p>Hỗ trợ tất cả ngân hàng Việt Nam, xác nhận đơn hàng tự động và nhanh chóng.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right column: Order Summary & Voucher */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3 className="summary-title">Tóm Tắt Đơn Hàng ({items.length} món)</h3>

            {/* Product items mini-list */}
            <div className="checkout-items-preview">
              {items.map((item) => {
                const p = item.product;
                const img = p?.images && p.images.length > 0 ? p.images[0].imageUrl : null;
                return (
                  <div key={item.id} className="checkout-item-mini">
                    <div className="mini-thumb">
                      {img ? <img src={img} alt={p?.name} /> : <span>💻</span>}
                    </div>
                    <div className="mini-info">
                      <span className="mini-name">{p?.name}</span>
                      {item.configurationId && (
                        <span className="badge badge-builder text-xs">Cấu hình #{item.configurationId}</span>
                      )}
                      <span className="mini-qty-price">
                        {item.quantity} × {formatPrice(p?.price)}
                      </span>
                    </div>
                    <div className="mini-total">
                      {formatPrice((p?.price || 0) * (item.quantity || 1))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voucher Section */}
            <div className="checkout-voucher-section mt-3">
              <label className="text-sm font-semibold">Mã giảm giá (Voucher)</label>
              <div className="voucher-input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã voucher..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={applyingVoucher}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleApplyVoucher}
                  disabled={applyingVoucher || !voucherCode.trim()}
                >
                  {applyingVoucher ? 'Kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
              {voucherMsg && (
                <div className={`text-xs mt-1 ${appliedVoucher ? 'text-success font-semibold' : 'text-danger'}`}>
                  {voucherMsg}
                </div>
              )}
            </div>

            <div className="summary-divider my-3"></div>

            {/* Totals */}
            <div className="checkout-price-breakdown">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row text-success">
                  <span>Giảm giá voucher:</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span className="text-success">Miễn phí</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span className="total-amount">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-4 font-bold"
              disabled={submitting}
            >
              {submitting ? 'Đang tạo đơn hàng...' : 'Xác Nhận Đặt Hàng'}
            </button>

            <p className="checkout-secure-note text-center text-xs text-muted mt-3">
              🔒 Đơn hàng được bảo vệ và kiểm tra kỹ lưỡng trước khi vận chuyển.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
