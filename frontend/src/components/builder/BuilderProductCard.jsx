import React from 'react';
import { formatCategorySlug } from '../../utils/categoryFormatter';
import { getProductFallbackImage } from '../../utils/imagePlaceholder';

export const BuilderProductCard = ({ product, onSelect, isCurrentSelected }) => {
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const fallbackUrl = getProductFallbackImage(product);
  const rawImgUrl = product.images && product.images.length > 0 ? product.images[0].imageUrl : null;
  const imgUrl = rawImgUrl || fallbackUrl;
  const spec = product.specification;
  const inStock = product.stockQuantity != null ? product.stockQuantity > 0 : true;
  const stockCount = product.stockQuantity != null ? product.stockQuantity : 0;

  return (
    <div className={`builder-product-card elevation-sm ${isCurrentSelected ? 'selected-item' : ''}`}>
      <div className="card-thumb">
        <img
          src={imgUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackUrl;
          }}
        />
      </div>

      <div className="card-details">
        <div className="card-brand-model">
          {product.category && (
            <span className="badge badge-builder" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', fontWeight: 800 }}>
              {formatCategorySlug(product.category.slug || product.category.builderComponentType || product.category.name)}
            </span>
          )}
          <span className="brand-badge">{product.brand || 'Chính hãng'}</span>
          {product.modelCode && <span className="model-code">Mã: {product.modelCode}</span>}
        </div>

        <h4 className="card-title">{product.name}</h4>

        {spec && (
          <div className="card-specs-tags">
            {spec.socket && <span className="spec-tag">Socket: {spec.socket}</span>}
            {spec.ramType && <span className="spec-tag">RAM: {spec.ramType}</span>}
            {spec.capacityGb && (
              <span className="spec-tag">
                {spec.capacityGb}GB{spec.modulesCount ? ` (${spec.modulesCount}x${spec.capacityGb/spec.modulesCount}GB)` : ''}
              </span>
            )}
            {spec.speedMhz && <span className="spec-tag">{spec.speedMhz}MHz</span>}
            {spec.formFactor && <span className="spec-tag">Form: {spec.formFactor}</span>}
            {spec.psuWattage && <span className="spec-tag">Công suất: {spec.psuWattage}W</span>}
            {spec.tdpW && <span className="spec-tag">TDP: {spec.tdpW}W</span>}
            {spec.powerConsumptionW && <span className="spec-tag">Điện tiêu thụ: {spec.powerConsumptionW}W</span>}
            {spec.recommendedPsuW && <span className="spec-tag">Nguồn đề xuất: {spec.recommendedPsuW}W</span>}
            {spec.coolerHeightMm && <span className="spec-tag">Cao: {spec.coolerHeightMm}mm</span>}
            {spec.maxCoolerHeightMm && <span className="spec-tag">Tản tối đa: {spec.maxCoolerHeightMm}mm</span>}
            {spec.gpuLengthMm && <span className="spec-tag">Dài: {spec.gpuLengthMm}mm</span>}
            {spec.maxGpuLengthMm && <span className="spec-tag">VGA tối đa: {spec.maxGpuLengthMm}mm</span>}
          </div>
        )}
      </div>

      <div className="card-action-column">
        <div className="price-tag">{formatPrice(product.price)}</div>
        <div className={`stock-info ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `Sẵn hàng (${stockCount})` : 'Hết hàng'}
        </div>

        <button
          type="button"
          className={`btn btn-sm ${isCurrentSelected ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => onSelect(product)}
          disabled={!inStock}
        >
          {isCurrentSelected ? 'Đang chọn' : inStock ? 'Chọn linh kiện' : 'Hết hàng'}
        </button>
      </div>
    </div>
  );
};

export default BuilderProductCard;
