import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from '../context/AuthContext';
import AiRecommendationModal from '../components/common/AiRecommendationModal';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCatId = searchParams.get('category') || '';

  // Fetch categories & wishlist
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const catRes = await categoryApi.getAllCategories();
        const cats = catRes?.data || catRes;
        setCategories(Array.isArray(cats) ? cats : []);

        if (isAuthenticated) {
          try {
            const wlData = await wishlistApi.getMyWishlist();
            const items = Array.isArray(wlData) ? wlData : (wlData?.data || []);
            const ids = new Set(items.map((w) => w.productId || w.product?.id || w.id));
            setWishlistIds(ids);
          } catch (e) {
            // Wishlist is optional
          }
        }
      } catch (err) {
        console.error('Failed to load init categories:', err);
      }
    };
    fetchInit();
  }, [isAuthenticated]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        let res;
        if (selectedCatId) {
          res = await productApi.getProductsByCategory(selectedCatId);
        } else {
          res = await productApi.getAllProducts();
        }

        const data = res?.data || res;
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCatId]);

  const handleCategorySelect = (catId) => {
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      handleCategorySelect(selectedCatId);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await productApi.searchByName(searchTerm.trim());
      const data = res?.data || res;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Lỗi khi tìm kiếm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (wishlistIds.has(productId)) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await wishlistApi.addToWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  // Price filter and sorting
  let displayedProducts = [...products];

  if (priceRange.min) {
    displayedProducts = displayedProducts.filter((p) => Number(p.price || 0) >= Number(priceRange.min));
  }
  if (priceRange.max) {
    displayedProducts = displayedProducts.filter((p) => Number(p.price || 0) <= Number(priceRange.max));
  }

  if (sortBy === 'PRICE_ASC') {
    displayedProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortBy === 'PRICE_DESC') {
    displayedProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sortBy === 'NAME') {
    displayedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="container products-page">
      <div className="page-header">
        <div className="header-title-wrap">
          <h1>Sản Phẩm & Linh Kiện Máy Tính</h1>
          <p>Danh sách linh kiện phần cứng, case, màn hình và phụ kiện máy tính chính hãng</p>
        </div>
        <button
          className="btn btn-ai-consultant"
          onClick={() => setAiModalOpen(true)}
        >
          ✨ Tư vấn phần cứng với AI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="products-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên linh kiện, CPU, RTX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>

        <div className="filter-row-secondary">
          <div className="category-filter-chips">
            <button
              className={`chip ${!selectedCatId ? 'active' : ''}`}
              onClick={() => handleCategorySelect('')}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`chip ${selectedCatId === String(cat.id) ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="sort-filter-group">
            <select
              className="select-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="DEFAULT">Sắp xếp: Mặc định</option>
              <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
              <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
              <option value="NAME">Tên sản phẩm: A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang nạp danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : displayedProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>Không tìm thấy sản phẩm nào</h3>
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
        </div>
      ) : (
        <div className="product-grid">
          {displayedProducts.map((p) => {
            const imgUrl = p.images && p.images.length > 0 ? p.images[0].imageUrl : null;
            const isWishlisted = wishlistIds.has(p.id);

            return (
              <div key={p.id} className="product-card">
                <div className="product-card-top">
                  <button
                    className={`btn-wishlist-toggle ${isWishlisted ? 'wishlisted' : ''}`}
                    title={isWishlisted ? 'Bỏ thích' : 'Thêm vào yêu thích'}
                    onClick={(e) => handleToggleWishlist(e, p.id)}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>
                  <Link to={`/products/${p.id}`} className="product-img-wrapper">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.name} className="product-img" />
                    ) : (
                      <div className="product-img-placeholder">
                        <span>💻</span>
                      </div>
                    )}
                  </Link>
                </div>

                <div className="product-info">
                  <span className="product-brand">{p.brand || 'Chính hãng'}</span>
                  <h3 className="product-title">
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </h3>
                  <div className="product-price-row">
                    <span className="product-price">{formatPrice(p.price)}</span>
                    <span className={`stock-status ${p.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {p.stockQuantity > 0 ? `Còn: ${p.stockQuantity}` : 'Hết hàng'}
                    </span>
                  </div>

                  {p.specification && (
                    <div className="product-specs-preview">
                      {p.specification.socket && <span>Socket: {p.specification.socket}</span>}
                      {p.specification.ramType && <span>RAM: {p.specification.ramType}</span>}
                      {p.specification.formFactor && <span>Size: {p.specification.formFactor}</span>}
                      {p.specification.psuWattage && <span>{p.specification.psuWattage}W</span>}
                    </div>
                  )}

                  <div className="product-card-actions">
                    <Link to={`/products/${p.id}`} className="btn btn-sm btn-outline btn-block">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Recommendation Modal */}
      <AiRecommendationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
