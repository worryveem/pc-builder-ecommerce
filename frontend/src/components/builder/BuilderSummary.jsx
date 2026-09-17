import React from 'react';

export const BuilderSummary = ({
  selectedComponents,
  compatibility,
  onReset,
  onOpenSave,
  onOpenShare,
  onAddToCart,
  configurationId,
  shareToken,
  saving,
  addingToCart,
  missingMandatory = []
}) => {
  const items = Object.values(selectedComponents || {}).filter(item => item && item.product);

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = items.reduce((sum, item) => {
    const p = item.product?.price || 0;
    return sum + p * (item.quantity || 1);
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const hasMissingMandatory = missingMandatory.length > 0;

  // 6 mandatory components progress calculation
  const mandatoryCount = 6 - missingMandatory.length;
  const progressPercent = Math.min(100, Math.round((mandatoryCount / 6) * 100));

  return (
    <div className="builder-summary-card elevation-md">
      <div className="summary-header">
        <h3 className="summary-title">Tổng Quan Cấu Hình</h3>
        <span className="summary-progress-pill">{mandatoryCount}/6 cốt lõi</span>
      </div>

      {/* Progress bar */}
      <div className="summary-progress-bar-wrap">
        <div
          className="summary-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="summary-stats">
        <div className="summary-stat-row">
          <span className="stat-label">Linh kiện đã chọn:</span>
          <strong>{items.length} mục ({totalQuantity} món)</strong>
        </div>

        {items.length > 0 && compatibility?.estimatedWattage != null && (
          <div className="summary-stat-row">
            <span className="stat-label">Công suất ước tính:</span>
            <strong className="text-primary">{compatibility.estimatedWattage} W</strong>
          </div>
        )}

        <div className="summary-stat-row">
          <span className="stat-label">Trạng thái cốt lõi:</span>
          <strong className={hasMissingMandatory ? 'text-danger' : 'text-success'}>
            {hasMissingMandatory ? `Thiếu ${missingMandatory.length} linh kiện bắt buộc` : 'Đã đủ 6 linh kiện cốt lõi'}
          </strong>
        </div>

        <div className="summary-stat-row">
          <span className="stat-label">Trạng thái tương thích:</span>
          <strong className={compatibility?.isCompatible ? 'text-success' : 'text-danger'}>
            {compatibility?.isCompatible ? 'Sẵn sàng' : 'Có xung đột'}
          </strong>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-total-row">
          <span className="total-label">Tổng chi phí dự tính:</span>
          <span className="total-price-val">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="summary-actions">
        {/* Mandatory warning banner */}
        {hasMissingMandatory && items.length > 0 && (
          <div className="builder-save-first-hint mb-2" style={{ color: '#e11d48', borderColor: '#fecdd3', background: '#fff1f2' }}>
            Bắt buộc phải có đủ: CPU, Mainboard, GPU, RAM, SSD, Nguồn để tạo cấu hình.
          </div>
        )}

        {/* Add to Cart Button (Only when configuration has ID) */}
        {configurationId ? (
          <button
            type="button"
            className="btn btn-success btn-block mb-2 font-bold action-cart-btn"
            onClick={onAddToCart}
            disabled={items.length === 0 || addingToCart || saving || !compatibility?.isCompatible || hasMissingMandatory}
          >
            {addingToCart ? 'Đang thêm vào giỏ hàng...' : 'Thêm toàn bộ cấu hình vào giỏ'}
          </button>
        ) : items.length > 0 && !hasMissingMandatory ? (
          <div className="builder-save-first-hint mb-2">
            Lưu cấu hình để thêm toàn bộ vào giỏ hàng hoặc chia sẻ
          </div>
        ) : null}

        {/* Save / Update Button */}
        <button
          type="button"
          className="btn btn-primary btn-block mb-2 action-save-btn"
          onClick={onOpenSave}
          disabled={items.length === 0 || saving || addingToCart || hasMissingMandatory}
          title={hasMissingMandatory ? 'Cần chọn đủ 6 linh kiện bắt buộc: CPU, GPU, RAM, SSD, Nguồn, Main' : ''}
        >
          {saving
            ? 'Đang lưu dữ liệu...'
            : configurationId
            ? 'Cập nhật cấu hình đã lưu'
            : 'Lưu cấu hình PC này'}
        </button>

        {/* Share Button (Active if shareToken exists) */}
        {shareToken && (
          <button
            type="button"
            className="btn btn-outline btn-block mb-2"
            onClick={onOpenShare}
            disabled={saving || addingToCart}
          >
            Chia sẻ liên kết cấu hình
          </button>
        )}

        {/* Reset Button */}
        <button
          type="button"
          className="btn btn-outline-danger btn-block btn-sm"
          onClick={onReset}
          disabled={items.length === 0 || saving || addingToCart}
        >
          Làm mới toàn bộ cấu hình
        </button>
      </div>
    </div>
  );
};

export default BuilderSummary;
