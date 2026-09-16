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
            // Optional
          }
        }
      } catch (err) {
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
        setVoucherMsg(`Áp dụng thành công: Giảm ${Number(res.data.discountAmount).toLocaleString('vi-VN')} đ`);
      } else {
        setAppliedVoucher(null);
        setVoucherMsg(res?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng.');
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
      orderItems: items.map((item) => ({
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
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return Number(price).toLocaleString('vi-VN') + ' đ';
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
      <div className="container empty-state-container elevation-lg" style={{ marginTop: '3.5rem', maxWidth: '650px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--success-light)', border: '2px solid var(--success-border)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, margin: '0 auto 1.25rem auto', letterSpacing: '0.05em' }}>
          PASS
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Đặt Hàng Thành Công!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
          Cảm ơn bạn đã tin tưởng lựa chọn TECHPC STORE. Đơn hàng của bạn đã được ghi nhận vào hệ thống và sẽ được xử lý sớm nhất.
        </p>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span>
            <strong>{fullName} ({phone})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Địa chỉ nhận:</span>
            <strong>{addressLine}, {district}, {city}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hình thức:</span>
            <strong>{paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '1.1rem' }}>
            <span>Tổng thanh toán:</span>
            <strong style={{ color: 'var(--price-red)' }}>{formatPrice(finalTotal)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">
            Xem Lịch Sử Đơn Hàng
          </Link>
          <Link to="/products" className="btn btn-outline">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container empty-state-container" style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Vui lòng thêm linh kiện hoặc chọn cấu hình PC trước khi thanh toán.
        </p>
        <Link to="/products" className="btn btn-primary">
          Khám phá linh kiện ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page-wrap">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Thanh toán</span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Xác Nhận & Thanh Toán Đơn Hàng
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Hoàn tất thông tin giao hàng và lựa chọn hình thức thanh toán an toàn
        </p>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmitOrder} className="checkout-grid-layout">
        {/* Left Column: Delivery Form & Payment Options */}
        <div>
          {/* Step 1: Contact & Address */}
          <div className="checkout-form-card elevation-sm">
            <h3 className="checkout-step-title">
              <span className="checkout-step-num">1</span>
              <span>Thông Tin Nhận Hàng</span>
            </h3>

            <div className="form-row">
              <div className="form-group col">
                <label>Họ và tên người nhận *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group col">
                <label>Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ví dụ: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email nhận thông báo đơn hàng</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label>Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group col">
                <label>Quận / Huyện</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Hai Bà Trưng"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
              <div className="form-group col">
                <label>Phường / Xã</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Bách Khoa"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ số nhà, tên đường *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Số nhà, tên ngõ, tên đường..."
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Ghi chú cho đơn hàng</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-form-card">
            <h3 className="checkout-step-title">
              <span className="checkout-step-num">2</span>
              <span>Hình Thức Thanh Toán</span>
            </h3>

            <div className="payment-methods-grid">
              <label className={`payment-method-label ${paymentMethod === 'COD' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Kiểm tra linh kiện và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng
                  </div>
                </div>
              </label>

              <label className={`payment-method-label ${paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    Chuyển khoản ngân hàng qua mã QR
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Chuyển khoản nhanh qua tài khoản ngân hàng của TechPC Store
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Voucher */}
        <aside className="order-summary-card elevation-md">
          <h3 className="summary-title">Đơn Hàng Của Bạn</h3>

          {/* Mini Items List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ fontWeight: 600 }}>{item.product?.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>x{item.quantity}</span>
                </div>
                <strong>{formatPrice((item.product?.price || 0) * item.quantity)}</strong>
              </div>
            ))}
          </div>

          {/* Voucher Section */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Mã Giảm Giá / Voucher
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="Ví dụ: TECH500, BUILDER5"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                disabled={applyingVoucher}
                onClick={handleApplyVoucher}
              >
                {applyingVoucher ? '...' : 'Áp dụng'}
              </button>
            </div>
            {voucherMsg && (
              <div style={{ fontSize: '0.8rem', marginTop: '0.45rem', color: appliedVoucher ? 'var(--success)' : 'var(--price-red)' }}>
                {voucherMsg}
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="summary-data-row">
            <span>Tạm tính ({items.length} món):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-data-row" style={{ color: 'var(--success)' }}>
              <span>Giảm giá Voucher:</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="summary-data-row">
            <span>Vận chuyển:</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí</span>
          </div>

          <div className="summary-data-row total-bold-row">
            <span>Tổng thanh toán:</span>
            <span className="summary-total-price">{formatPrice(finalTotal)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting}
          >
            {submitting ? 'Đang Xử Lý...' : 'Xác Nhận Đặt Hàng'}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
