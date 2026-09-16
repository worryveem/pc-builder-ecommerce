import React from 'react';
import { Link } from 'react-router-dom';

export const ProductCard = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onRemove,
  actionLabel = 'Xem chi tiết',
  actionTo,
  showSpecs = true,
  customBadge
}) => {
  if (!product) return null;

  const imgUrl = product.images && product.images.length > 0 ? product.images[0].imageUrl : null;
  const spec = product.specification;
  const inStock = product.stockQuantity != null ? product.stockQuantity > 0 : true;
  const stockCount = product.stockQuantity != null ? product.stockQuantity : 0;

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  const destination = actionTo || `/products/${product.id}`;

  return (
    <div className="product-card elevation-sm">
      {/* Top Image Area */}
      <div className="product-card-top">
        {/* Wishlist toggle button */}
        {onToggleWishlist && (
          <button
            type="button"
            className={`btn-wishlist-toggle ${isWishlisted ? 'wishlisted' : ''}`}
            title={isWishlisted ? 'Bỏ lưu yêu thích' : 'Lưu vào yêu thích'}
            onClick={(e) => onToggleWishlist(e, product.id)}
            aria-label={isWishlisted ? 'Bỏ lưu yêu thích' : 'Lưu vào yêu thích'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#ef4444' : 'none'} stroke={isWishlisted ? '#ef4444' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        )}

        {/* Custom Badges (HOT, DISCOUNT, NEW) */}
        {customBadge && (
          <span className="product-badge-flag">{customBadge}</span>
        )}

        <Link to={destination} className="product-img-wrapper">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={product.name}
              className="product-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="product-img-placeholder">
              <span className="placeholder-brand">TECHPC</span>
              <span className="placeholder-sub">Hardware</span>
            </div>
          )}
        </Link>
      </div>

      {/* Product Information */}
      <div className="product-info">
        {/* Brand & Stock Header */}
        <div className="product-meta-header">
          <span className="product-brand">{product.brand || 'Chính hãng'}</span>
          <span className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? 'Sẵn hàng' : 'Hết hàng'}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="product-title">
          <Link to={destination} title={product.name}>
            {product.name}
          </Link>
        </h3>

        {/* Main Hardware Specs Preview (Clean tags, no emojis) */}
        {showSpecs && spec && (
          <div className="product-specs-preview">
            {spec.socket && <span className="spec-pill">{spec.socket}</span>}
            {spec.ramType && <span className="spec-pill">{spec.ramType}</span>}
            {spec.formFactor && <span className="spec-pill">{spec.formFactor}</span>}
            {spec.capacityGb && <span className="spec-pill">{spec.capacityGb}GB</span>}
            {spec.psuWattage && <span className="spec-pill">{spec.psuWattage}W</span>}
            {spec.tdpW && <span className="spec-pill">TDP {spec.tdpW}W</span>}
          </div>
        )}

        {/* Price Row */}
        <div className="product-price-row">
          <div className="price-stack">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          {product.discountPercent && (
            <span className="discount-tag">-{product.discountPercent}%</span>
          )}
        </div>

        {/* Action Button */}
        <div className="product-card-actions">
          {onRemove ? (
            <div className="dual-actions">
              {onAddToCart && inStock ? (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product);
                  }}
                >
                  + Giỏ hàng
                </button>
              ) : (
                <Link to={destination} className="btn btn-sm btn-outline">
                  Chi tiết
                </Link>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(product.id);
                }}
                title="Xóa khỏi danh sách yêu thích"
              >
                Xóa
              </button>
            </div>
          ) : onAddToCart && inStock ? (
            <div className="dual-actions">
              <Link to={destination} className="btn btn-sm btn-outline">
                Chi tiết
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
              >
                + Giỏ hàng
              </button>
            </div>
          ) : (
            <Link to={destination} className="btn btn-sm btn-primary btn-block">
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
