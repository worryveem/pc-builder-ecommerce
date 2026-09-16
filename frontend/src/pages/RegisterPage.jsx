import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    district: '',
    ward: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập, email và mật khẩu');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        ward: formData.ward.trim()
      };

      const result = await register(payload);
      if (result.success) {
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(result.message || 'Đăng ký thất bại, vui lòng thử lại');
      }
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-elevated-card register-card-wide elevation-lg">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Tạo Tài Khoản Mới</h1>
          <p className="auth-card-subtitle">
            Tham gia cộng đồng TECHPC STORE để lưu cấu hình PC và nhận ưu đãi độc quyền
          </p>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="username">Tên đăng nhập *</label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                placeholder="Ví dụ: hoangpc"
                value={formData.username}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="form-group col">
              <label htmlFor="email">Email liên hệ *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="form-group col">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-control"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            <div className="form-group col">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-control"
                placeholder="Ví dụ: 0912345678"
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="addressLine">Địa chỉ nhận hàng</label>
            <input
              id="addressLine"
              name="addressLine"
              type="text"
              className="form-control"
              placeholder="Số nhà, tên đường, quận/huyện..."
              value={formData.addressLine}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="auth-switch-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
