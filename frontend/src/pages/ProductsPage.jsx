import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from '../context/AuthContext';
import AiRecommendationModal from '../components/common/AiRecommendationModal';
import { ProductCard } from '../components/common/ProductCard';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [pricePreset, setPricePreset] = useState('ALL');
  const [customPrice, setCustomPrice] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCatId = searchParams.get('category') || '';
  const urlSearchTerm = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(urlSearchTerm);

  // Sync search input when URL param changes
  useEffect(() => {
    setSearchInput(urlSearchTerm);
  }, [urlSearchTerm]);

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
            // Optional
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchInit();
  }, [isAuthenticated]);

  // Fetch products based on category or search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        let res;

        if (urlSearchTerm) {
          res = await productApi.searchByName(urlSearchTerm);
        } else if (selectedCatId) {
          res = await productApi.getProductsByCategory(selectedCatId);
        } else {
          res = await productApi.getAllProducts();
        }

        const data = res?.data || res;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCatId, urlSearchTerm]);

  // Extract available brands
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Category selection handler
  const handleCategorySelect = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Brand toggle
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedBrands(new Set());
    setPricePreset('ALL');
    setCustomPrice({ min: '', max: '' });
    setInStockOnly(false);
    setSearchInput('');
    setSearchParams({});
  };

  // Wishlist toggle
  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/products' } } });
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

  // Filter and sort products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Brand filter
    if (selectedBrands.size > 0) {
      list = list.filter((p) => p.brand && selectedBrands.has(p.brand.trim()));
    }

    // In-stock filter
    if (inStockOnly) {
      list = list.filter((p) => p.stockQuantity > 0);
    }

    // Price preset filter
    if (pricePreset === 'UNDER_2M') {
      list = list.filter((p) => Number(p.price || 0) < 2000000);
    } else if (pricePreset === '2M_TO_5M') {
      list = list.filter((p) => Number(p.price || 0) >= 2000000 && Number(p.price || 0) <= 5000000);
    } else if (pricePreset === '5M_TO_15M') {
      list = list.filter((p) => Number(p.price || 0) >= 5000000 && Number(p.price || 0) <= 15000000);
    } else if (pricePreset === 'ABOVE_15M') {
      list = list.filter((p) => Number(p.price || 0) > 15000000);
    }

    // Custom price range
    if (customPrice.min) {
      list = list.filter((p) => Number(p.price || 0) >= Number(customPrice.min));
    }
    if (customPrice.max) {
      list = list.filter((p) => Number(p.price || 0) <= Number(customPrice.max));
    }

    // Sorting
    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'NAME') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [products, selectedBrands, inStockOnly, pricePreset, customPrice, sortBy]);

  const activeCategoryObj = categories.find((c) => String(c.id) === String(selectedCatId));

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return Number(price).toLocaleString('vi-VN') + ' đ';
  };

  const hasActiveFilters =
    selectedCatId ||
    urlSearchTerm ||
    selectedBrands.size > 0 ||
    pricePreset !== 'ALL' ||
    customPrice.min ||
    customPrice.max ||
    inStockOnly;

  return (
    <div className="container products-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/products" onClick={handleClearAllFilters}>
          Sản phẩm
        </Link>
        {activeCategoryObj && (
          <>
            <span className="breadcrumb-sep">/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {activeCategoryObj.name}
            </span>
          </>
        )}
        {urlSearchTerm && (
          <>
            <span className="breadcrumb-sep">/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              Tìm kiếm: "{urlSearchTerm}"
            </span>
          </>
        )}
      </div>

      {/* Page Title & AI Trigger */}
      <div className="products-page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            {activeCategoryObj ? activeCategoryObj.name : urlSearchTerm ? `Kết quả tìm kiếm: "${urlSearchTerm}"` : 'Tất Cả Linh Kiện & Sản Phẩm'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Phần cứng máy tính, thiết bị ngoại vi và máy bộ chính hãng
          </p>
        </div>
        <div className="header-page-actions">
          <button
            type="button"
            className="btn btn-outline mobile-filter-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            {mobileFilterOpen ? 'Đóng bộ lọc' : 'Bộ lọc tìm kiếm'}
          </button>
          <button
            className="btn btn-outline-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setAiModalOpen(true)}
          >
            <span>Tư vấn phần cứng AI</span>
          </button>
        </div>
      </div>

      {/* Mobile filter backdrop */}
      {mobileFilterOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileFilterOpen(false)}></div>
      )}

      {/* 2-Column E-Commerce Layout */}
      <div className="products-layout-grid">
        {/* Left Sidebar Filter Panel */}
        <aside className={`filters-sidebar-card elevation-sm ${mobileFilterOpen ? 'mobile-drawer-active' : ''}`}>
          <div className="filter-card-header">
            <h3 className="filter-card-title">Bộ Lọc Tìm Kiếm</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-clear-filters"
                  onClick={handleClearAllFilters}
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                className="btn-drawer-close filter-drawer-close-btn"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Đóng bộ lọc"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 1. Category Tree */}
          <div className="filter-group-block">
            <div className="filter-group-heading">Danh Mục Linh Kiện</div>
            <div className="filter-options-list">
              <button
                type="button"
                className={`filter-category-link-item ${!selectedCatId ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`filter-category-link-item ${selectedCatId === String(cat.id) ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Presets */}
          <div className="filter-group-block">
            <div className="filter-group-heading">Mức Giá Phổ Biến</div>
            <div className="price-presets-list">
              <button
                type="button"
                className={`price-preset-chip ${pricePreset === 'ALL' && !customPrice.min && !customPrice.max ? 'active' : ''}`}
                onClick={() => {
                  setPricePreset('ALL');
                  setCustomPrice({ min: '', max: '' });
                }}
              >
                Tất cả mức giá
              </button>
              <button
                type="button"
                className={`price-preset-chip ${pricePreset === 'UNDER_2M' ? 'active' : ''}`}
                onClick={() => {
                  setPricePreset('UNDER_2M');
                  setCustomPrice({ min: '', max: '' });
                }}
              >
                Dưới 2.000.000 đ
              </button>
              <button
                type="button"
                className={`price-preset-chip ${pricePreset === '2M_TO_5M' ? 'active' : ''}`}
                onClick={() => {
                  setPricePreset('2M_TO_5M');
                  setCustomPrice({ min: '', max: '' });
                }}
              >
                2.000.000 đ - 5.000.000 đ
              </button>
              <button
                type="button"
                className={`price-preset-chip ${pricePreset === '5M_TO_15M' ? 'active' : ''}`}
                onClick={() => {
                  setPricePreset('5M_TO_15M');
                  setCustomPrice({ min: '', max: '' });
                }}
              >
                5.000.000 đ - 15.000.000 đ
              </button>
              <button
                type="button"
                className={`price-preset-chip ${pricePreset === 'ABOVE_15M' ? 'active' : ''}`}
                onClick={() => {
                  setPricePreset('ABOVE_15M');
                  setCustomPrice({ min: '', max: '' });
                }}
              >
                Trên 15.000.000 đ
              </button>
            </div>

            {/* Custom min/max inputs */}
            <div className="price-custom-inputs">
              <input
                type="number"
                placeholder="Từ (VNĐ)"
                value={customPrice.min}
                onChange={(e) => {
                  setCustomPrice({ ...customPrice, min: e.target.value });
                  setPricePreset('CUSTOM');
                }}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Đến (VNĐ)"
                value={customPrice.max}
                onChange={(e) => {
                  setCustomPrice({ ...customPrice, max: e.target.value });
                  setPricePreset('CUSTOM');
                }}
              />
            </div>
          </div>

          {/* 3. Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="filter-group-block">
              <div className="filter-group-heading">Thương Hiệu</div>
              <div className="filter-options-list">
                {availableBrands.map((brand) => (
                  <label key={brand} className="filter-checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedBrands.has(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Stock Availability */}
          <div className="filter-group-block">
            <label className="filter-checkbox-row" style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>Chỉ hiển thị hàng có sẵn</span>
            </label>
          </div>
        </aside>

        {/* Right Main Product Content */}
        <main className="products-main-col">
          {/* Controls Bar: Search & Sort */}
          <div className="products-top-bar">
            <div className="products-counter-text">
              Tìm thấy <strong>{displayedProducts.length}</strong> sản phẩm phù hợp
            </div>

            <div className="sort-select-wrap">
              <label>Sắp xếp:</label>
              <select
                className="sort-dropdown-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="DEFAULT">Mặc định</option>
                <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
                <option value="NAME">Tên sản phẩm: A - Z</option>
              </select>
            </div>
          </div>

          {/* Active Filters Row */}
          {hasActiveFilters && (
            <div className="active-filter-chips-row">
              {activeCategoryObj && (
                <div className="active-filter-pill">
                  <span>Danh mục: {activeCategoryObj.name}</span>
                  <button type="button" onClick={() => handleCategorySelect('')}>
                    ×
                  </button>
                </div>
              )}
              {urlSearchTerm && (
                <div className="active-filter-pill">
                  <span>Từ khóa: "{urlSearchTerm}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      setSearchParams(newParams);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              {Array.from(selectedBrands).map((b) => (
                <div key={b} className="active-filter-pill">
                  <span>Hãng: {b}</span>
                  <button type="button" onClick={() => toggleBrand(b)}>
                    ×
                  </button>
                </div>
              ))}
              {pricePreset !== 'ALL' && (
                <div className="active-filter-pill">
                  <span>
                    {pricePreset === 'UNDER_2M'
                      ? 'Dưới 2 triệu'
                      : pricePreset === '2M_TO_5M'
                      ? '2tr - 5tr'
                      : pricePreset === '5M_TO_15M'
                      ? '5tr - 15tr'
                      : pricePreset === 'ABOVE_15M'
                      ? 'Trên 15 triệu'
                      : 'Khoảng giá tùy chỉnh'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPricePreset('ALL');
                      setCustomPrice({ min: '', max: '' });
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              {inStockOnly && (
                <div className="active-filter-pill">
                  <span>Chỉ còn hàng</span>
                  <button type="button" onClick={() => setInStockOnly(false)}>
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Product Grid Content */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang nạp danh sách sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : displayedProducts.length === 0 ? (
            <div className="empty-state-container">
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Không tìm thấy sản phẩm nào</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Không có linh kiện nào thỏa mãn các điều kiện tìm kiếm hoặc bộ lọc hiện tại.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearAllFilters}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.has(p.id)}
                  onToggleWishlist={handleToggleWishlist}
                  actionLabel="Xem chi tiết"
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* AI Recommendation Modal */}
      <AiRecommendationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
