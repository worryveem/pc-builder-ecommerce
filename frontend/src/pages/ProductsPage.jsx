import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCatId = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAllCategories();
        if (res?.data) {
          setCategories(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

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

        if (res?.data) {
          setProducts(Array.isArray(res.data) ? res.data : []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối backend.');
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
      if (res?.data) {
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError('Lỗi khi tìm kiếm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="container products-page">
      <div className="page-header">
        <h1>Sản Phẩm & Linh Kiện Máy Tính</h1>
        <p>Danh sách linh kiện phần cứng, case, màn hình và phụ kiện máy tính chính hãng</p>
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
      </div>

      {/* Product Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang nạp danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>Không tìm thấy sản phẩm nào</h3>
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const imgUrl = p.images && p.images.length > 0 ? p.images[0].imageUrl : null;
            return (
              <div key={p.id} className="product-card">
                <Link to={`/products/${p.id}`} className="product-img-wrapper">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} className="product-img" />
                  ) : (
                    <div className="product-img-placeholder">
                      <span>💻</span>
                    </div>
                  )}
                </Link>
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
                      {p.specification.psuWattage && <span>Wattage: {p.specification.psuWattage}W</span>}
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
    </div>
  );
};
