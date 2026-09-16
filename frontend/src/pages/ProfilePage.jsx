import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'address', 'password'

  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    addressLine: '',
    city: '',
    district: '',
    ward: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getMyProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        addressLine: data.address?.addressLine || data.addressLine || '',
        city: data.address?.city || data.city || '',
        district: data.address?.district || data.district || '',
        ward: data.address?.ward || data.ward || ''
      });

      // Try fetching discount if available
      try {
        const disc = await userApi.getUserDiscount();
        setDiscountInfo(disc);
      } catch (err) {
        // Optional feature
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Không thể tải thông tin tài khoản' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await userApi.updateProfile(profile.id, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        addressLine: formData.addressLine,
        city: formData.city,
        district: formData.district,
        ward: formData.ward
      });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      await fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Cập nhật thông tin thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng điền đầy đủ mật khẩu' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMsg({ type: '', text: '' });
      await userApi.changePassword(profile.id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin cá nhân...</p>
        </div>
      </div>
    );
  }

  const isAdmin = authUser?.role === 'ROLE_ADMIN' || authUser?.role === 'ADMIN';

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>Tài khoản của tôi</h1>
        <p>Quản lý thông tin hồ sơ và địa chỉ nhận hàng của bạn</p>
      </div>

      <div className="profile-layout">
        {/* Sidebar info & navigation */}
        <div className="profile-sidebar">
          <div className="profile-user-card">
            <div className="user-avatar-circle">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="user-username">{profile?.username}</h3>
            <p className="user-email">{profile?.email}</p>
            {isAdmin && (
              <span className="badge-admin">Quản trị viên</span>
            )}
            {discountInfo && (
              <div className="user-discount-badge">
                Chiết khấu thành viên: <strong>{discountInfo.discountRate || discountInfo.discount || 0}%</strong>
              </div>
            )}
          </div>

          <div className="profile-menu">
            <button
              className={`profile-menu-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              Địa chỉ giao hàng
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Đổi mật khẩu
            </button>
          </div>

          <div className="profile-quick-links">
            <h4>Lối tắt nhanh</h4>
            <Link to="/orders" className="quick-link-btn">
              Đơn hàng của tôi
            </Link>
            <Link to="/wishlist" className="quick-link-btn">
              Sản phẩm yêu thích
            </Link>
            {isAdmin && (
              <Link to="/admin" className="quick-link-btn admin-link">
                Trang Quản Trị (Admin)
              </Link>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          {message.text && (
            <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="profile-card">
              <h2>Thông tin cá nhân</h2>
              <form onSubmit={handleSubmitProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Tên đăng nhập</label>
                  <input
                    type="text"
                    id="username"
                    value={profile?.username || ''}
                    disabled
                    className="input-disabled"
                  />
                  <small className="help-text">Tên đăng nhập không thể thay đổi</small>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="input-disabled"
                  />
                  <small className="help-text">Email được gắn liền với tài khoản</small>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại nhận hàng"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="profile-card">
              <h2>Địa chỉ giao hàng mặc định</h2>
              <p className="card-desc">Địa chỉ này sẽ được tự động điền khi bạn tạo đơn hàng</p>
              <form onSubmit={handleSubmitProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="addressLine">Địa chỉ (Số nhà, đường) *</label>
                  <input
                    type="text"
                    id="addressLine"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 123 Đường Cầu Giấy"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ward">Phường / Xã</label>
                    <input
                      type="text"
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Phường Dịch Vọng"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="district">Quận / Huyện</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Cầu Giấy"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="city">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Hà Nội"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu địa chỉ...' : 'Cập nhật địa chỉ'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-card">
              <h2>Đổi mật khẩu</h2>
              <p className="card-desc">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              {passwordMsg.text && (
                <div className={`alert-box ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                  {passwordMsg.text}
                </div>
              )}
              <form onSubmit={handleSubmitPassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="oldPassword">Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ít nhất 6 ký tự"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
