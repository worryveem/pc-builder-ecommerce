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

  const { isAuthenticated } = useAuth();
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

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setAddingToCart(true);
      await cartApi.addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Không thể tiến hành đặt hàng ngay lúc này.' });
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
      <div className="container empty-state-container" style={{ marginTop: '3rem' }}>
        <h2>Thông báo sản phẩm</h2>
        <p>{error || 'Không tìm thấy sản phẩm'}</p>
        <Link to="/products" className="btn btn-primary">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const spec = product.specification || product.specifications;
  const images = product.images || [];

  return (
    <div className="container product-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/products">Sản phẩm</Link>
        {product.category && (
          <>
            <span className="breadcrumb-sep">/</span>
            <Link to={`/products?category=${product.category.id}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Detail Card */}
      <div className="product-detail-card">
        <div className="product-detail-grid">
          {/* Gallery Left Column */}
          <div className="product-gallery-col">
            <div className="main-preview-frame">
              {selectedImg ? (
                <img
                  src={selectedImg}
                  alt={product.name}
                  className="main-preview-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="product-img-placeholder">
                  <span>TECHPC</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="gallery-thumbs-row">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumb-btn ${selectedImg === img.imageUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImg(img.imageUrl)}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Ảnh ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Right Column */}
          <div className="product-details-col">
            <div className="detail-header-meta">
              <span className="brand-pill">{product.brand || 'Chính hãng'}</span>
              <span className="model-code-text">Model: {product.modelCode || 'N/A'}</span>
            </div>

            <h1 className="detail-product-title">{product.name}</h1>

            <div className="detail-rating-row">
              <div className="star-rating-pill">
                <span>★ {ratingSummary.averageRating.toFixed(1)}</span>
              </div>
              <span className="review-count-link">
                ({ratingSummary.totalRatings} lượt đánh giá)
              </span>
              <span style={{ color: 'var(--text-light)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Tình trạng: <strong>{product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Hết hàng'}</strong>
              </span>
            </div>

            {/* Price Box */}
            <div className="detail-price-box">
              <span className="detail-price-main">{formatPrice(product.price)}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                (Đã bao gồm VAT)
              </span>
            </div>

            {/* Warranty Info */}
            <div className="detail-warranty-badge">
              <span>Bảo hành:</span>
              <strong>{product.warrantyMonths || 36} tháng chính hãng</strong>
            </div>

            {/* Action Feedback Message */}
            {actionMsg.text && (
              <div className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {actionMsg.text}
              </div>
            )}

            {/* Purchase Controls */}
            <div className="detail-purchase-section">
              <div className="detail-qty-row">
                <span className="detail-qty-label">Số lượng:</span>
                <div className="qty-buttons">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={quantity}
                  />
                  <button
                    type="button"
                    disabled={quantity >= (product.stockQuantity || 99)}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className={`btn btn-sm ${isWishlisted ? 'btn-danger' : 'btn-outline'}`}
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={handleToggleWishlist}
                  title={isWishlisted ? 'Bỏ lưu yêu thích' : 'Lưu vào yêu thích'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span>{isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>
              </div>

              <div className="detail-cta-row">
                <button
                  type="button"
                  className="btn btn-add-cart-detail"
                  disabled={addingToCart || product.stockQuantity <= 0}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                </button>
                <button
                  type="button"
                  className="btn btn-buy-now-detail"
                  disabled={addingToCart || product.stockQuantity <= 0}
                  onClick={handleBuyNow}
                >
                  Mua Ngay
                </button>
              </div>
            </div>

            {/* Store Commitments */}
            <div className="store-commitments-box">
              <div className="commitment-item">
                <strong>Cam kết chính hãng 100%</strong>
                <span>Hóa đơn VAT, xuất xứ nguồn gốc minh bạch</span>
              </div>
              <div className="commitment-item">
                <strong>Đổi mới trong 30 ngày</strong>
                <span>Nếu phát sinh lỗi phần cứng từ nhà sản xuất</span>
              </div>
              <div className="commitment-item">
                <strong>Giao hàng hỏa tốc 2H</strong>
                <span>Miễn phí nội thành cho đơn hàng từ 5 triệu</span>
              </div>
              <div className="commitment-item">
                <strong>Hỗ trợ kỹ thuật 24/7</strong>
                <span>Lắp ráp, cài đặt và tối ưu hiệu năng trọn đời</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table Section */}
      {spec && (
        <div className="specs-section-container">
          <h2 className="specs-section-title">Thông Số Kỹ Thuật Chi Tiết</h2>
          <table className="specs-modern-table">
            <tbody>
              {spec.socket && (
                <tr>
                  <td className="specs-label-col">Socket vi xử lý</td>
                  <td className="specs-val-col">{spec.socket}</td>
                </tr>
              )}
              {spec.chipset && (
                <tr>
                  <td className="specs-label-col">Chipset Bo mạch chủ</td>
                  <td className="specs-val-col">{spec.chipset}</td>
                </tr>
              )}
              {spec.ramType && (
                <tr>
                  <td className="specs-label-col">Chuẩn bộ nhớ (RAM Type)</td>
                  <td className="specs-val-col">{spec.ramType}</td>
                </tr>
              )}
              {spec.speedMhz && (
                <tr>
                  <td className="specs-label-col">Tốc độ bus</td>
                  <td className="specs-val-col">{spec.speedMhz} MHz</td>
                </tr>
              )}
              {spec.capacityGb && (
                <tr>
                  <td className="specs-label-col">Dung lượng</td>
                  <td className="specs-val-col">
                    {spec.capacityGb} GB {spec.modulesCount > 1 ? `(Kit ${spec.modulesCount} thanh)` : ''}
                  </td>
                </tr>
              )}
              {spec.formFactor && (
                <tr>
                  <td className="specs-label-col">Kích thước (Form Factor)</td>
                  <td className="specs-val-col">{spec.formFactor}</td>
                </tr>
              )}
              {spec.supportedSockets && (
                <tr>
                  <td className="specs-label-col">Các socket hỗ trợ</td>
                  <td className="specs-val-col">{spec.supportedSockets}</td>
                </tr>
              )}
              {spec.coolerHeightMm && (
                <tr>
                  <td className="specs-label-col">Chiều cao tản nhiệt</td>
                  <td className="specs-val-col">{spec.coolerHeightMm} mm</td>
                </tr>
              )}
              {spec.gpuLengthMm && (
                <tr>
                  <td className="specs-label-col">Chiều dài card (GPU Length)</td>
                  <td className="specs-val-col">{spec.gpuLengthMm} mm</td>
                </tr>
              )}
              {spec.maxGpuLengthMm && (
                <tr>
                  <td className="specs-label-col">VGA hỗ trợ tối đa</td>
                  <td className="specs-val-col">{spec.maxGpuLengthMm} mm</td>
                </tr>
              )}
              {spec.maxCoolerHeightMm && (
                <tr>
                  <td className="specs-label-col">Tản CPU hỗ trợ tối đa</td>
                  <td className="specs-val-col">{spec.maxCoolerHeightMm} mm</td>
                </tr>
              )}
              {spec.tdpW && (
                <tr>
                  <td className="specs-label-col">Công suất thiết kế (TDP)</td>
                  <td className="specs-val-col">{spec.tdpW} W</td>
                </tr>
              )}
              {spec.powerConsumptionW && (
                <tr>
                  <td className="specs-label-col">Công suất tiêu thụ</td>
                  <td className="specs-val-col">{spec.powerConsumptionW} W</td>
                </tr>
              )}
              {spec.recommendedPsuW && (
                <tr>
                  <td className="specs-label-col">Nguồn đề xuất</td>
                  <td className="specs-val-col">{spec.recommendedPsuW} W</td>
                </tr>
              )}
              {spec.psuWattage && (
                <tr>
                  <td className="specs-label-col">Công suất thực nguồn (PSU)</td>
                  <td className="specs-val-col">{spec.psuWattage} W</td>
                </tr>
              )}
              {spec.screenSize && (
                <tr>
                  <td className="specs-label-col">Kích thước màn hình</td>
                  <td className="specs-val-col">{spec.screenSize} inch</td>
                </tr>
              )}
              {spec.resolution && (
                <tr>
                  <td className="specs-label-col">Độ phân giải</td>
                  <td className="specs-val-col">{spec.resolution}</td>
                </tr>
              )}
              {spec.refreshRate && (
                <tr>
                  <td className="specs-label-col">Tần số quét</td>
                  <td className="specs-val-col">{spec.refreshRate} Hz</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Description Section */}
      <div className="specs-section-container">
        <h2 className="specs-section-title">Mô Tả Sản Phẩm</h2>
        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-body)' }}>
          <p>{product.description || 'Sản phẩm linh kiện máy tính chính hãng với hiệu năng ổn định và độ bền cao.'}</p>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="specs-section-container">
        <h2 className="specs-section-title">Đánh Giá Từ Khách Hàng</h2>

        {/* Rating Summary Banner */}
        <div className="summary-banner" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {ratingSummary.averageRating.toFixed(1)} / 5
            </div>
            <div style={{ color: '#d97706', fontSize: '1.25rem', marginTop: '0.25rem' }}>
              {'★'.repeat(Math.round(ratingSummary.averageRating))}
              {'☆'.repeat(5 - Math.round(ratingSummary.averageRating))}
            </div>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Dựa trên <strong>{ratingSummary.totalRatings}</strong> lượt đánh giá từ khách hàng đã mua sản phẩm
          </div>
        </div>

        {/* Submit Review Form */}
        <div style={{ marginTop: '2rem', marginBottom: '2.5rem', padding: '1.75rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Viết đánh giá của bạn
          </h3>

          {reviewMsg.text && (
            <div className={`alert ${reviewMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {reviewMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Chất lượng sản phẩm:</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: star <= userRating ? '#d97706' : '#cbd5e1'
                    }}
                    onClick={() => setUserRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm này với cộng đồng..."
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
              {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        {ratingsLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Đang nạp đánh giá...</p>
        ) : ratings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ratings.map((r, i) => (
              <div key={i} className="review-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <span className="reviewer-name">{r.userName || r.userFullName || 'Khách hàng'}</span>
                  <span style={{ color: '#d97706', fontSize: '0.95rem' }}>
                    {'★'.repeat(r.rating || r.star || 5)}
                  </span>
                  <span className="review-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Đã mua hàng'}
                  </span>
                </div>
                <div className="review-content">{r.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
