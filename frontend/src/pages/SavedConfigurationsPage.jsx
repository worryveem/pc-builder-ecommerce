import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { builderApi } from '../api/builderApi';
import { useAuth } from '../context/AuthContext';
import { ShareConfigurationModal } from '../components/builder/ShareConfigurationModal';
import { formatCategorySlug } from '../utils/categoryFormatter';

export const SavedConfigurationsPage = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Active share modal state
  const [activeShareConfig, setActiveShareConfig] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await builderApi.getMyConfigurations();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setConfigurations(list);
    } catch (err) {
      console.error('Failed to load user configurations:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách cấu hình đã lưu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfigurations();
    }
  }, [isAuthenticated]);

  // Format currency
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Add to Cart
  const handleAddToCart = async (config) => {
    try {
      setActionLoadingId(config.id);
      setError('');
      await builderApi.addConfigurationToCart(config.id);
      setActionSuccess(`Đã thêm toàn bộ linh kiện của "${config.name}" vào giỏ hàng!`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to add configuration to cart:', err);
      alert(err?.response?.data?.message || 'Không thể thêm cấu hình vào giỏ hàng. Vui lòng kiểm tra tồn kho.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Buy Now
  const handleBuyNow = async (config) => {
    try {
      setActionLoadingId(config.id);
      setError('');
      await builderApi.addConfigurationToCart(config.id);
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to buy configuration now:', err);
      alert(err?.response?.data?.message || 'Không thể mua cấu hình ngay. Vui lòng thử lại sau.');
      setActionLoadingId(null);
    }
  };

  // Delete configuration
  const handleDelete = async (config) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cấu hình "${config.name}" không?`)) {
      return;
    }

    try {
      setActionLoadingId(config.id);
      setError('');
      await builderApi.deleteConfiguration(config.id);
      setConfigurations((prev) => prev.filter((c) => c.id !== config.id));
      setActionSuccess(`Đã xóa cấu hình "${config.name}" thành công`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete configuration:', err);
      alert(err?.response?.data?.message || 'Không thể xóa cấu hình');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container saved-configs-page" style={{ padding: '2rem 1rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumb-nav mb-4">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/builder">Tự Build PC</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Cấu hình PC đã lưu</span>
      </div>

      {/* Header */}
      <div className="d-flex justify-between align-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Cấu Hình PC Đã Lưu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Quản lý, chia sẻ hoặc đặt mua ngay các bộ máy tính bạn đã tự thiết kế
          </p>
        </div>
        <Link to="/builder" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span>+ Tự Build Cấu Hình Mới</span>
        </Link>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="alert alert-success mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{actionSuccess}</span>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}>✕</button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-container py-12 text-center" style={{ padding: '4rem 0' }}>
          <div className="spinner"></div>
          <p className="mt-3 text-muted">Đang tải danh sách cấu hình của bạn...</p>
        </div>
      ) : configurations.length === 0 ? (
        /* Empty State */
        <div className="empty-state-card text-center" style={{ background: '#fff', border: '1px dashed var(--border)', borderRadius: '12px', padding: '3.5rem 1.5rem', margin: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bạn chưa có cấu hình PC nào được lưu</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
            Hãy ghé qua công cụ Tự Build PC để thiết kế cấu hình tối ưu theo nhu cầu và ngân sách của bạn.
          </p>
          <Link to="/builder" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontWeight: 600 }}>
            Bắt đầu Build PC ngay
          </Link>
        </div>
      ) : (
        /* Configuration List */
        <div className="saved-configs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {configurations.map((config) => {
            const itemCount = config.items?.length || 0;
            const isLoading = actionLoadingId === config.id;

            return (
              <div
                key={config.id}
                className="saved-config-card"
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Card Top */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {config.name}
                    </h3>
                    <span className="badge badge-builder" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {itemCount} linh kiện
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Cập nhật: {formatDate(config.updatedAt || config.createdAt)}
                  </div>
                </div>

                {/* Card Items Summary */}
                <div style={{ padding: '1.25rem', flex: '1 0 auto' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng dự toán linh kiện:</span>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {formatVND(config.totalPrice)}
                    </div>
                  </div>

                  {/* Component list preview */}
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {config.items && config.items.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {config.items.map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                              <span className="badge badge-builder" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', fontWeight: 800 }}>
                                {formatCategorySlug(item.componentType || item.product?.category?.builderComponentType || item.product?.category?.slug || 'LINH KIỆN')}
                              </span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                                {item.product?.name || 'Linh kiện'}
                              </span>
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                              x{item.quantity || 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">Chưa có thông tin linh kiện</span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ padding: '1.25rem', background: '#fff', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Primary Buy / Add actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={isLoading || itemCount === 0}
                      onClick={() => handleBuyNow(config)}
                      style={{ fontWeight: 700, padding: '0.6rem 0.5rem' }}
                    >
                      {isLoading ? 'Đang xử lý...' : 'Mua cấu hình'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={isLoading || itemCount === 0}
                      onClick={() => handleAddToCart(config)}
                      style={{ fontWeight: 700, padding: '0.6rem 0.5rem' }}
                    >
                      {isLoading ? 'Đang thêm...' : 'Vào giỏ hàng'}
                    </button>
                  </div>

                  {/* Secondary Edit, Share, Delete */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <Link
                      to={`/builder/configuration/${config.id}`}
                      className="btn btn-outline btn-xs"
                      style={{ textAlign: 'center', padding: '0.45rem 0.25rem', fontSize: '0.8rem' }}
                    >
                      Sửa build
                    </Link>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-xs"
                      onClick={() => setActiveShareConfig(config)}
                      style={{ padding: '0.45rem 0.25rem', fontSize: '0.8rem' }}
                    >
                      Chia sẻ
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-xs"
                      disabled={isLoading}
                      onClick={() => handleDelete(config)}
                      style={{ padding: '0.45rem 0.25rem', fontSize: '0.8rem' }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal Dialog */}
      {activeShareConfig && (
        <ShareConfigurationModal
          isOpen={!!activeShareConfig}
          configurationName={activeShareConfig.name}
          shareToken={activeShareConfig.shareToken}
          configurationId={activeShareConfig.id}
          onAddToCart={() => handleAddToCart(activeShareConfig)}
          onBuyNow={() => handleBuyNow(activeShareConfig)}
          onClose={() => setActiveShareConfig(null)}
        />
      )}
    </div>
  );
};

export default SavedConfigurationsPage;
