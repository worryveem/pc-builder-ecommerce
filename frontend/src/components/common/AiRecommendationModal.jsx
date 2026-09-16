import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recommendationApi } from '../../api/recommendationApi';

const SUGGESTED_QUERIES = [
  'PC Gaming 20 - 25 triệu chơi mượt GTA V, Valorant',
  'Cấu hình đồ họa 3D, Premiere & Photoshop',
  'Card màn hình chơi game 2K giá tốt nhất',
  'PC văn phòng làm việc mượt, nhỏ gọn giá rẻ',
  'Combo CPU, Mainboard và RAM DDR5 tối ưu'
];

export const AiRecommendationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await recommendationApi.getRecommendations({ query: q.trim() });
      const payload = res?.data?.data || res?.data || res;
      if (payload && (payload.advice || payload.recommendedProducts)) {
        setResult(payload);
      } else {
        setError('Không nhận được dữ liệu phản hồi từ hệ thống AI.');
      }
    } catch (err) {
      console.error('AI recommendation error:', err);
      setError('Hệ thống tư vấn AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuery = (text) => {
    setQuery(text);
    handleSearch(text);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format AI advice into clean paragraphs and structured bullet points
  const renderFormattedAdvice = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    return (
      <div className="ai-advice-paragraphs">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
          const cleanText = isBullet ? trimmed.replace(/^[-*]\s*|^\d+\.\s*/, '') : trimmed;

          if (isBullet) {
            return (
              <div key={idx} className="ai-advice-bullet-item">
                <span className="ai-bullet-dot"></span>
                <span>{cleanText}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="ai-advice-text-p">
              {cleanText}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-header-left">
            <div className="ai-header-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="ai-header-text">
              <div className="ai-header-badge-row">
                <span className="ai-advisor-badge">AI HARDWARE ADVISOR</span>
                <span className="ai-advisor-status">Tư vấn tự động 24/7</span>
              </div>
              <h3 className="ai-modal-title">Trợ Lý AI Tư Vấn Phần Cứng & Build PC</h3>
            </div>
          </div>
          <button type="button" className="ai-modal-close-btn" onClick={onClose} aria-label="Đóng cửa sổ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="ai-modal-body">
          {/* Quick suggestions */}
          <div className="ai-quick-pills-section">
            <div className="ai-pills-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Nhu cầu phổ biến:</span>
            </div>
            <div className="ai-pills-container">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  className="ai-pill-btn"
                  onClick={() => handleQuickQuery(sq)}
                  disabled={loading}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="ai-search-form"
          >
            <div className="ai-search-input-wrapper">
              <svg className="ai-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="ai-search-input"
                placeholder="Nhập nhu cầu của bạn (Ví dụ: Cần PC chơi game 20 triệu, Tìm VGA làm đồ họa, Nguồn 750W...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                autoFocus
              />
              {query && !loading && (
                <button
                  type="button"
                  className="ai-input-clear-btn"
                  onClick={() => setQuery('')}
                  aria-label="Xóa nội dung"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary ai-submit-btn"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="ai-spinner-small"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Tư vấn ngay</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Error feedback */}
          {error && (
            <div className="ai-error-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="ai-loading-box">
              <div className="ai-pulse-radar">
                <div className="ai-radar-ring"></div>
                <div className="ai-radar-ring"></div>
                <div className="ai-radar-center">AI</div>
              </div>
              <p className="ai-loading-title">Trợ lý AI đang phân tích yêu cầu phần cứng...</p>
              <p className="ai-loading-desc">Đang so khớp thông số kỹ thuật, khả năng tương thích và giá bán tối ưu từ kho dữ liệu</p>
            </div>
          )}

          {/* Results section */}
          {!loading && result && (
            <div className="ai-results-wrapper">
              {/* Advice card */}
              {result.advice && (
                <div className="ai-advice-bubble">
                  <div className="ai-advice-badge-tag">
                    <span className="ai-bot-avatar">AI</span>
                    <strong>Phân Tích & Tư Vấn Cấu Hình</strong>
                  </div>
                  <div className="ai-advice-content">
                    {renderFormattedAdvice(result.advice)}
                  </div>
                </div>
              )}

              {/* Products list */}
              {result.recommendedProducts && result.recommendedProducts.length > 0 ? (
                <div className="ai-products-section">
                  <div className="ai-products-heading-row">
                    <div className="ai-products-title-wrap">
                      <h4 className="ai-products-title">Linh Kiện Được Đề Xuất Phù Hợp</h4>
                      <span className="ai-products-count">{result.recommendedProducts.length} sản phẩm</span>
                    </div>
                    {result.hasBuilderRecommendations && (
                      <Link
                        to="/builder"
                        className="btn btn-sm btn-outline-primary ai-open-builder-btn"
                        onClick={onClose}
                      >
                        Mở Trình Ráp PC Builder
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    )}
                  </div>

                  <div className="ai-products-grid">
                    {result.recommendedProducts.map((prod) => {
                      const img = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;
                      const spec = prod.specification;

                      return (
                        <div key={prod.id} className="ai-product-card">
                          <div className="ai-prod-thumb-container">
                            {img ? (
                              <img
                                src={img}
                                alt={prod.name}
                                className="ai-prod-thumb-img"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="ai-prod-thumb-placeholder">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="2" y="2" width="20" height="20" rx="4"></rect>
                                  <circle cx="12" cy="12" r="3"></circle>
                                  <path d="M7 2v3M17 2v3M7 19v3M17 19v3M2 7h3M2 17h3M19 7h3M19 17h3"></path>
                                </svg>
                                <span>Linh kiện</span>
                              </div>
                            )}
                            <span className="ai-prod-brand-tag">{prod.brand || 'Chính hãng'}</span>
                          </div>

                          <div className="ai-prod-details">
                            <h5 className="ai-prod-title" title={prod.name}>
                              <Link to={`/products/${prod.id}`} onClick={onClose}>
                                {prod.name}
                              </Link>
                            </h5>

                            {spec && (
                              <div className="ai-prod-spec-badges">
                                {spec.socket && <span className="ai-spec-pill">Socket {spec.socket}</span>}
                                {spec.ramType && <span className="ai-spec-pill">RAM {spec.ramType}</span>}
                                {spec.psuWattage && <span className="ai-spec-pill">{spec.psuWattage}W</span>}
                                {spec.formFactor && <span className="ai-spec-pill">{spec.formFactor}</span>}
                              </div>
                            )}

                            <div className="ai-prod-bottom-row">
                              <div className="ai-prod-price-wrap">
                                <span className="ai-price-label">Giá niêm yết</span>
                                <span className="ai-price-value">{formatPrice(prod.price)}</span>
                              </div>
                              <Link
                                to={`/products/${prod.id}`}
                                className="btn btn-sm btn-primary ai-prod-action-btn"
                                onClick={onClose}
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="ai-empty-products-box">
                  <div className="ai-empty-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 12h8"></path>
                    </svg>
                  </div>
                  <h5>Chưa tìm thấy linh kiện tương thích trực tiếp</h5>
                  <p>Hãy thử gõ câu hỏi chi tiết hơn hoặc nhấp vào các câu hỏi gợi ý bên trên!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ai-modal-footer">
          <div className="ai-footer-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Dữ liệu phần cứng được cập nhật liên tục theo kho hàng thực tế</span>
          </div>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendationModal;
