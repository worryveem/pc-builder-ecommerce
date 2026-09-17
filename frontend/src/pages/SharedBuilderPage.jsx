import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { builderApi } from '../api/builderApi';
import { CompatibilityPanel } from '../components/builder/CompatibilityPanel';
import { formatCategorySlug } from '../utils/categoryFormatter';
import { getProductFallbackImage } from '../utils/imagePlaceholder';

export const SharedBuilderPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [configuration, setConfiguration] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedConfig = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await builderApi.getConfiguration(token);
        if (res?.data) {
          setConfiguration(res.data);

          // Trigger live compatibility validation
          const items = (res.data.items || []).map(item => ({
            productId: item.productId || item.product?.id,
            quantity: item.quantity || 1
          }));

          if (items.length > 0) {
            try {
              const valRes = await builderApi.validateConfiguration(items);
              if (valRes?.data) {
                setCompatibility(valRes.data);
              }
            } catch (vErr) {
              console.error('Validation error for shared config:', vErr);
            }
          }
        } else {
          setError('Không tìm thấy cấu hình. Cấu hình có thể đã bị xóa hoặc link chia sẻ không hợp lệ.');
        }
      } catch (err) {
        console.error('Failed to load shared configuration:', err);
        setError('Không tìm thấy cấu hình hoặc link chia sẻ không hợp lệ.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedConfig();
    }
  }, [token]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleUseThisConfiguration = () => {
    if (!configuration) return;
    // Navigate to /builder and pass the imported configuration via router state
    navigate('/builder', { state: { importedConfig: configuration } });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang tải cấu hình PC được chia sẻ...</p>
      </div>
    );
  }

  if (error || !configuration) {
    return (
      <div className="container error-container">
        <span className="empty-state-badge">TÌM KIẾM</span>
        <h2>Không tìm thấy cấu hình</h2>
        <p>{error || 'Đường link chia sẻ không tồn tại hoặc đã hết hạn.'}</p>
        <div className="mt-4">
          <Link to="/builder" className="btn btn-primary">
            Tự tạo cấu hình mới
          </Link>
          <Link to="/" className="btn btn-outline ml-2">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const items = configuration.items || [];
  const totalPrice = configuration.totalPrice || items.reduce((sum, i) => sum + (i.product?.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="container shared-builder-page">
      <div className="shared-header-card elevation-sm">
        <div className="shared-header-meta">
          <span className="badge badge-builder">PC Configuration Shared</span>
          <h1 className="shared-config-title">{configuration.name || 'Cấu hình PC'}</h1>
          <p className="shared-config-sub">
            Mã Token: <strong>{configuration.shareToken || token}</strong>
            {configuration.createdAt && ` • Ngày tạo: ${new Date(configuration.createdAt).toLocaleDateString('vi-VN')}`}
          </p>
        </div>

        <div className="shared-header-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCopyLink}
          >
            {copied ? 'Đã sao chép link' : 'Sao chép liên kết'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleUseThisConfiguration}
          >
            Sử dụng cấu hình này
          </button>
        </div>
      </div>

      <div className="builder-main-layout mt-4">
        {/* Left column: List of items */}
        <div className="shared-items-container">
          <div className="slot-section elevation-sm">
            <div className="slot-section-title">
              <h2>Danh Sách Linh Kiện Trong Cấu Hình ({items.length} món)</h2>
            </div>

            <div className="shared-items-list">
              {items.map((item, idx) => {
                const p = item.product;
                const imgUrl = p?.images && p.images.length > 0 ? p.images[0].imageUrl : null;
                const spec = p?.specification;
                const itemTotal = (p?.price || 0) * (item.quantity || 1);

                return (
                  <div key={item.id || idx} className="shared-item-row">
                    <div className="shared-item-thumb">
                      <img
                        src={imgUrl || getProductFallbackImage(p)}
                        alt={p?.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getProductFallbackImage(p);
                        }}
                      />
                    </div>

                    <div className="shared-item-info">
                      <span className="slot-cat-type">{formatCategorySlug(item.componentType || p?.category?.builderComponentType || p?.category?.slug || 'LINH KIỆN')}</span>
                      <h4 className="shared-item-name">
                        <Link to={`/products/${p?.id}`}>{p?.name}</Link>
                      </h4>
                      {spec && (
                        <div className="slot-specs">
                          {spec.socket && <span>Socket: {spec.socket}</span>}
                          {spec.ramType && <span>RAM: {spec.ramType}</span>}
                          {spec.capacityGb && <span>{spec.capacityGb}GB</span>}
                          {spec.formFactor && <span>{spec.formFactor}</span>}
                          {spec.psuWattage && <span>{spec.psuWattage}W</span>}
                        </div>
                      )}
                    </div>

                    <div className="shared-item-qty">
                      <span>SL: {item.quantity || 1}</span>
                    </div>

                    <div className="shared-item-price">
                      <span className="price-val">{formatPrice(itemTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Summary */}
        <aside className="builder-sidebar-column">
          <div className="builder-sticky-sidebar">
            <div className="builder-summary-card elevation-md">
              <h3 className="summary-title">Tóm Tắt Cấu Hình</h3>

              <div className="summary-stats">
                <div className="summary-stat-row">
                  <span>Số lượng linh kiện:</span>
                  <strong>{items.length} mục</strong>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total-row">
                  <span className="total-label">Tổng chi phí dự tính:</span>
                  <span className="total-price-val">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="summary-actions mt-4">
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleUseThisConfiguration}
                >
                  Sử dụng cấu hình này
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
