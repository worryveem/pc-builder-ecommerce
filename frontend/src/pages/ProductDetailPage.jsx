import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { cartApi } from '../api/cartApi';
import { wishlistApi } from '../api/wishlistApi';
import { ratingApi } from '../api/ratingApi';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Ratings state
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await productApi.getProductById(id);
      const data = res?.data || res;
      if (data) {
        setProduct(data);
        const firstImg = data.images && data.images.length > 0 ? data.images[0].imageUrl : '';
        setSelectedImg(firstImg);
      } else {
        setError('Không tìm thấy thông tin sản phẩm');
      }
    } catch (err) {
      setError('Lỗi khi tải thông tin sản phẩm từ máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setRatingsLoading(true);
      const [reviewData, summaryData] = await Promise.allSettled([
        ratingApi.getProductRatings(id),
        ratingApi.getProductRatingSummary(id)
      ]);

      if (reviewData.status === 'fulfilled') {
        const revList = reviewData.value?.data || reviewData.value;
        setRatings(Array.isArray(revList) ? revList : []);
      }
      if (summaryData.status === 'fulfilled') {
        const sum = summaryData.value?.data || summaryData.value;
        if (sum) {
          setRatingSummary({
            averageRating: Number(sum.averageRating || 0),
            totalRatings: Number(sum.totalRatings || sum.totalReviews || 0)
          });
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setRatingsLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const wlData = await wishlistApi.getMyWishlist();
      const items = Array.isArray(wlData) ? wlData : (wlData?.data || []);
      const match = items.some((w) => String(w.productId || w.product?.id || w.id) === String(id));
      setIsWishlisted(match);
    } catch (err) {
      // Optional
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData();
      fetchReviews();
      checkWishlist();
    }
  }, [id, isAuthenticated]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(id);
        setIsWishlisted(false);
      } else {
        await wishlistApi.addToWishlist(id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setAddingToCart(true);
      setActionMsg({ type: '', text: '' });
      await cartApi.addToCart(product.id, quantity);
      setActionMsg({ type: 'success', text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!` });
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi khi thêm sản phẩm vào giỏ hàng';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMsg({ type: '', text: '' });
      await ratingApi.addRating({
        productId: Number(id),
        rating: userRating,
        comment: userComment
      });
      setReviewMsg({ type: 'success', text: 'Cảm ơn bạn đã gửi đánh giá!' });
      setUserComment('');
      await fetchReviews();
    } catch (err) {
      console.error('Review submit error:', err);
      setReviewMsg({
        type: 'error',
        text: err.response?.data?.message || 'Không thể gửi đánh giá. Bạn có thể cần mua hàng trước khi đánh giá.'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container error-container">
        <h2>Thông báo</h2>
        <p>{error || 'Không tìm thấy sản phẩm'}</p>
        <Link to="/products" className="btn btn-primary">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  const spec = product.specification || product.specifications;
  const images = product.images || [];

  return (
    <div className="container product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/products">Sản phẩm</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image-wrap">
            {selectedImg ? (
              <img src={selectedImg} alt={product.name} className="product-detail-img" />
            ) : (
              <div className="product-img-placeholder large">
                <span>💻</span>
              </div>
            )}
            <button
              className={`btn-wishlist-detail ${isWishlisted ? 'wishlisted' : ''}`}
              title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
              onClick={handleToggleWishlist}
            >
              {isWishlisted ? '❤️ Yêu thích' : '🤍 Lưu'}
            </button>
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-btn ${selectedImg === img.imageUrl ? 'active' : ''}`}
                  onClick={() => setSelectedImg(img.imageUrl)}
                >
                  <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Buying */}
        <div className="product-main-info">
          <div className="detail-top-tags">
            <span className="product-brand-badge">{product.brand || 'Chính hãng'}</span>
            {ratingSummary.totalRatings > 0 && (
              <span className="rating-pill">
                ⭐ {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalRatings} đánh giá)
              </span>
            )}
          </div>

          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-model-code">Mã model: {product.modelCode || 'N/A'}</p>

          <div className="price-box">
            <span className="current-price">{formatPrice(product.price)}</span>
            <span className={`stock-badge ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity} sản phẩm)` : 'Hết hàng'}
            </span>
          </div>

          {product.warrantyMonths && (
            <p className="warranty-info">🛡️ Bảo hành chính hãng: {product.warrantyMonths} tháng</p>
          )}

          {actionMsg.text && (
            <div className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {actionMsg.text}
            </div>
          )}

          <div className="purchase-controls">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="qty-buttons">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || addingToCart}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity || 99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={addingToCart}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product.stockQuantity || 99) || addingToCart}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg"
              disabled={product.stockQuantity <= 0 || addingToCart}
            >
              {addingToCart ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
            </button>
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hardware Specs Table */}
      {spec && (
        <div className="product-specs-section">
          <h2>Thông số kỹ thuật phần cứng</h2>
          <table className="specs-table">
            <tbody>
              {spec.socket && (
                <tr><td>Socket hỗ trợ</td><td><strong>{spec.socket}</strong></td></tr>
              )}
              {spec.supportedSockets && (
                <tr><td>Các socket tương thích</td><td>{spec.supportedSockets}</td></tr>
              )}
              {spec.chipset && (
                <tr><td>Chipset</td><td>{spec.chipset}</td></tr>
              )}
              {spec.ramType && (
                <tr><td>Chuẩn RAM</td><td><strong>{spec.ramType}</strong></td></tr>
              )}
              {spec.ramSlots && (
                <tr><td>Số khe cắm RAM</td><td>{spec.ramSlots} khe</td></tr>
              )}
              {spec.maxRamCapacity && (
                <tr><td>Dung lượng RAM tối đa</td><td>{spec.maxRamCapacity} GB</td></tr>
              )}
              {spec.capacityGb && (
                <tr><td>Dung lượng mỗi thanh</td><td>{spec.capacityGb} GB</td></tr>
              )}
              {spec.modulesCount && (
                <tr><td>Số thanh trong 1 kit</td><td>{spec.modulesCount}</td></tr>
              )}
              {spec.speedMhz && (
                <tr><td>Tốc độ xung nhịp</td><td>{spec.speedMhz} MHz</td></tr>
              )}
              {spec.formFactor && (
                <tr><td>Kích thước / Form Factor</td><td><strong>{spec.formFactor}</strong></td></tr>
              )}
              {spec.supportedFormFactors && (
                <tr><td>Các form factor hỗ trợ</td><td>{spec.supportedFormFactors}</td></tr>
              )}
              {spec.tdpW && (
                <tr><td>Mức tiêu thụ điện (TDP)</td><td>{spec.tdpW} W</td></tr>
              )}
              {spec.powerConsumptionW && (
                <tr><td>Điện năng tiêu thụ (GPU)</td><td>{spec.powerConsumptionW} W</td></tr>
              )}
              {spec.recommendedPsuW && (
                <tr><td>Nguồn khuyến nghị (GPU)</td><td><strong>{spec.recommendedPsuW} W</strong></td></tr>
              )}
              {spec.psuWattage && (
                <tr><td>Công suất nguồn (PSU)</td><td><strong>{spec.psuWattage} W</strong></td></tr>
              )}
              {spec.gpuLengthMm && (
                <tr><td>Chiều dài card (GPU)</td><td>{spec.gpuLengthMm} mm</td></tr>
              )}
              {spec.maxGpuLengthMm && (
                <tr><td>Chiều dài GPU tối đa (Case)</td><td>{spec.maxGpuLengthMm} mm</td></tr>
              )}
              {spec.coolerHeightMm && (
                <tr><td>Chiều cao tản nhiệt</td><td>{spec.coolerHeightMm} mm</td></tr>
              )}
              {spec.maxCoolerHeightMm && (
                <tr><td>Chiều cao tản nhiệt tối đa (Case)</td><td>{spec.maxCoolerHeightMm} mm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ratings and Reviews Section */}
      <div className="product-reviews-section">
        <div className="reviews-header">
          <h2>Đánh giá & Nhận xét của khách hàng</h2>
          <div className="summary-banner">
            <div className="big-rating">
              <strong>{ratingSummary.averageRating.toFixed(1)}</strong>
              <div className="stars-gold">
                {'★'.repeat(Math.round(ratingSummary.averageRating))}
                {'☆'.repeat(5 - Math.round(ratingSummary.averageRating))}
              </div>
              <span>{ratingSummary.totalRatings} lượt đánh giá</span>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="write-review-card">
          <h3>Gửi đánh giá của bạn</h3>
          {reviewMsg.text && (
            <div className={`alert ${reviewMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {reviewMsg.text}
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Chọn số sao đánh giá:</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${userRating >= star ? 'selected' : ''}`}
                      onClick={() => setUserRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-desc">
                    {userRating === 5 && 'Tuyệt vời'}
                    {userRating === 4 && 'Hài lòng'}
                    {userRating === 3 && 'Bình thường'}
                    {userRating === 2 && 'Không hài lòng'}
                    {userRating === 1 && 'Rất tệ'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Bình luận nhận xét:</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingReview}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <div className="login-to-review-hint">
              <p>Vui lòng <Link to="/login" state={{ from: { pathname: `/products/${id}` } }}>đăng nhập</Link> để gửi đánh giá sản phẩm.</p>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {ratingsLoading ? (
            <p>Đang tải đánh giá...</p>
          ) : ratings.length === 0 ? (
            <p className="no-reviews-msg">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
          ) : (
            ratings.map((rev) => (
              <div key={rev.id} className="review-item">
                <div className="review-meta">
                  <span className="reviewer-name">{rev.userName || rev.username || 'Khách hàng'}</span>
                  <div className="reviewer-stars">
                    {'★'.repeat(rev.rating || 5)}
                    {'☆'.repeat(5 - (rev.rating || 5))}
                  </div>
                  <span className="review-date">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                {rev.comment && <p className="review-content">{rev.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
