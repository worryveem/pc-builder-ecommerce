import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recommendationApi } from '../../api/recommendationApi';

const SUGGESTED_QUERIES = [
  'PC Gaming 20 - 25 triệu',
  'Laptop sinh viên CNTT & lập trình',
  'Card đồ họa chơi game 2K mượt mà',
  'Cấu hình văn phòng mượt mà giá rẻ',
  'Nâng cấp RAM và SSD cho máy tính'
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
      if (res?.data) {
        setResult(res.data);
      } else {
        setError('Không nhận được phản hồi từ trợ lý AI.');
      }
    } catch (err) {
      console.error('AI recommendation error:', err);
      setError('Trợ lý AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau.');
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

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-header-title">
            <span className="ai-sparkle-icon">✨</span>
            <div>
              <h3 className="modal-title">Trợ Lý AI Tư Vấn Phần Cứng</h3>
              <p className="modal-subtitle">Gợi ý sản phẩm và linh kiện PC phù hợp nhất từ kho dữ liệu thực tế</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-modal-body">
          {/* Quick Query Pills */}
          <div className="ai-quick-pills">
            <span className="pills-label">Gợi ý câu hỏi:</span>
            <div className="pills-wrapper">
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

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="ai-search-form"
          >
            <input
              type="text"
              className="form-control ai-search-input"
              placeholder="Nhập nhu cầu của bạn (Ví dụ: Cần PC làm đồ họa 30 triệu, Tìm nguồn 750W...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary ai-submit-btn"
              disabled={loading || !query.trim()}
            >
              {loading ? 'Đang phân tích...' : '✨ Hỏi AI'}
            </button>
          </form>

          {/* Error feedback */}
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          {/* Loading state */}
          {loading && (
            <div className="ai-loading-state mt-4">
              <div className="spinner"></div>
              <p>AI đang phân tích nhu cầu và rà soát kho linh kiện phù hợp...</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="ai-result-section mt-4">
              {/* Advice bubble */}
              <div className="ai-advice-bubble mb-4">
                <div className="ai-bot-avatar">🤖</div>
                <div className="ai-advice-content">
                  <strong>Tư vấn từ AI:</strong>
                  <p>{result.advice}</p>
                </div>
              </div>

              {/* Products list */}
              {result.recommendedProducts && result.recommendedProducts.length > 0 ? (
                <div>
                  <div className="ai-products-header mb-3">
                    <h4 className="font-bold">Sản phẩm gợi ý ({result.recommendedProducts.length}):</h4>
                    {result.hasBuilderRecommendations && (
                      <Link
                        to="/builder"
                        className="btn btn-sm btn-outline-primary"
                        onClick={onClose}
                      >
                        ⚡ Tự ráp cấu hình trên PC Builder
                      </Link>
                    )}
                  </div>

                  <div className="ai-products-grid">
                    {result.recommendedProducts.map((prod) => {
                      const img = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;
                      const spec = prod.specification;

                      return (
                        <div key={prod.id} className="ai-product-card">
                          <div className="ai-prod-thumb">
                            {img ? <img src={img} alt={prod.name} /> : <span>💻</span>}
                          </div>
                          <div className="ai-prod-info">
                            <span className="ai-prod-brand">{prod.brand || 'Chính hãng'}</span>
                            <h5 className="ai-prod-name">
                              <Link to={`/products/${prod.id}`} onClick={onClose}>
                                {prod.name}
                              </Link>
                            </h5>
                            {spec && (
                              <div className="ai-prod-specs">
                                {spec.socket && <span>Socket {spec.socket}</span>}
                                {spec.ramType && <span>RAM {spec.ramType}</span>}
                                {spec.psuWattage && <span>{spec.psuWattage}W</span>}
                              </div>
                            )}
                            <div className="ai-prod-price-row mt-2">
                              <span className="price font-bold">{formatPrice(prod.price)}</span>
                              <Link
                                to={`/products/${prod.id}`}
                                className="btn btn-sm btn-primary"
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
                <div className="alert alert-info">
                  Không tìm thấy sản phẩm cụ thể. Bạn có thể thử tìm kiếm với từ khóa khác!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ai-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendationModal;
