import React from 'react';

const CATEGORY_ICONS = {
  CPU: '⚡',
  MAINBOARD: '🖲️',
  RAM: '💾',
  GPU: '🎮',
  SSD: '💽',
  HDD: '📁',
  PSU: '🔌',
  COOLER: '❄️',
  CPU_COOLER: '❄️',
  CASE: '🖥️',
  FAN: '🌀',
  CASE_FAN: '🌀',
  MONITOR: '🖥️',
  KEYBOARD: '⌨️',
  MOUSE: '🖱️',
  HEADSET: '🎧',
  WEBCAM: '📷'
};

export const SelectedComponentCard = ({
  category,
  selectedItem,
  onOpenSelector,
  onRemove,
  onUpdateQuantity
}) => {
  const compType = category.builderComponentType ? category.builderComponentType.toUpperCase() : '';
  const icon = CATEGORY_ICONS[compType] || '⚙️';

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const product = selectedItem?.product;
  const quantity = selectedItem?.quantity || 1;
  const imgUrl = product?.images && product.images.length > 0 ? product.images[0].imageUrl : null;
  const spec = product?.specification;
  const lineTotal = (product?.price || 0) * quantity;

  // Allow quantity adjustment for RAM, Fans, Storage
  const isMultiQuantitySupported = ['RAM', 'FAN', 'CASE_FAN', 'SSD', 'HDD'].includes(compType);

  return (
    <div className={`builder-slot-card ${product ? 'slot-filled' : 'slot-empty'}`}>
      {/* Category header / badge */}
      <div className="slot-category-col">
        <span className="slot-icon">{icon}</span>
        <div className="slot-cat-info">
          <span className="slot-cat-name">{category.name}</span>
          <span className="slot-cat-type">{category.builderComponentType || 'OPTIONAL'}</span>
        </div>
      </div>

      {/* Main product representation */}
      <div className="slot-product-col">
        {product ? (
          <div className="slot-selected-content">
            <div className="slot-thumb">
              {imgUrl ? (
                <img src={imgUrl} alt={product.name} />
              ) : (
                <span>💻</span>
              )}
            </div>

            <div className="slot-meta">
              <span className="slot-brand">{product.brand || 'Chính hãng'}</span>
              <h4 className="slot-product-title">{product.name}</h4>

              {spec && (
                <div className="slot-specs">
                  {spec.socket && <span>Socket: {spec.socket}</span>}
                  {spec.ramType && <span>RAM: {spec.ramType}</span>}
                  {spec.capacityGb && <span>{spec.capacityGb}GB</span>}
                  {spec.speedMhz && <span>{spec.speedMhz}MHz</span>}
                  {spec.formFactor && <span>Form: {spec.formFactor}</span>}
                  {spec.psuWattage && <span>Công suất: {spec.psuWattage}W</span>}
                  {spec.tdpW && <span>TDP: {spec.tdpW}W</span>}
                  {spec.gpuLengthMm && <span>Dài: {spec.gpuLengthMm}mm</span>}
                  {spec.coolerHeightMm && <span>Cao: {spec.coolerHeightMm}mm</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="slot-empty-prompt">
            <span className="empty-text">Chưa chọn {category.name}</span>
          </div>
        )}
      </div>

      {/* Quantity column */}
      <div className="slot-quantity-col">
        {product && isMultiQuantitySupported ? (
          <div className="slot-qty-picker">
            <label className="qty-label">Số lượng:</label>
            <div className="qty-buttons small">
              <button
                type="button"
                onClick={() => onUpdateQuantity(category.slug, Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(category.slug, quantity + 1)}
                disabled={product.stockQuantity != null && quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>
          </div>
        ) : product ? (
          <span className="qty-single">SL: {quantity}</span>
        ) : null}
      </div>

      {/* Price column */}
      <div className="slot-price-col">
        {product ? (
          <div className="price-display">
            <span className="price-total">{formatPrice(lineTotal)}</span>
            {quantity > 1 && (
              <span className="price-unit">({formatPrice(product.price)} / cái)</span>
            )}
          </div>
        ) : (
          <span className="price-placeholder">—</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="slot-action-col">
        {product ? (
          <div className="slot-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onOpenSelector(category)}
              title="Thay đổi linh kiện khác"
            >
              Thay đổi
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRemove(category.slug)}
              title="Xóa linh kiện khỏi cấu hình"
            >
              Xóa
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary btn-choose"
            onClick={() => onOpenSelector(category)}
          >
            + Chọn {category.name}
          </button>
        )}
      </div>
    </div>
  );
};
