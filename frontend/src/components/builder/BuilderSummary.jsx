import React from 'react';

export const BuilderSummary = ({
  selectedComponents,
  onReset,
  onOpenSave,
  onOpenShare,
  configurationId,
  shareToken,
  saving
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

  return (
    <div className="builder-summary-card">
      <h3 className="summary-title">Tổng Quan Cấu Hình</h3>

      <div className="summary-stats">
        <div className="summary-stat-row">
          <span>Số linh kiện đã chọn:</span>
          <strong>{items.length} mục ({totalQuantity} món)</strong>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-total-row">
          <span className="total-label">Tổng chi phí dự tính:</span>
          <span className="total-price-val">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="summary-actions">
        {/* Save / Update Button */}
        <button
          type="button"
          className="btn btn-primary btn-block mb-2"
          onClick={onOpenSave}
          disabled={items.length === 0 || saving}
        >
          {saving
            ? 'Đang lưu...'
            : configurationId
            ? '💾 Cập nhật cấu hình'
            : '💾 Lưu cấu hình'}
        </button>

        {/* Share Button (Active if shareToken exists) */}
        {shareToken && (
          <button
            type="button"
            className="btn btn-outline btn-block mb-2"
            onClick={onOpenShare}
          >
            🔗 Chia sẻ cấu hình
          </button>
        )}

        {/* Reset Button */}
        <button
          type="button"
          className="btn btn-outline-danger btn-block btn-sm"
          onClick={onReset}
          disabled={items.length === 0 || saving}
        >
          🗑️ Làm mới cấu hình
        </button>
      </div>
    </div>
  );
};
