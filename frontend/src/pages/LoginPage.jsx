import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const result = await login(username.trim(), password);
      if (result.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMsg(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-elevated-card elevation-lg">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Đăng Nhập Tài Khoản</h1>
          <p className="auth-card-subtitle">Chào mừng bạn trở lại với hệ thống TECHPC STORE</p>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập hoặc Email</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Nhập tên đăng nhập của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}
          </button>
        </form>

        <div className="auth-switch-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
