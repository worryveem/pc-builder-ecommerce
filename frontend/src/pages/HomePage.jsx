import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.allSettled([
          categoryApi.getAllCategories(),
          productApi.getAllProducts()
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data) {
          setCategories(Array.isArray(catRes.value.data) ? catRes.value.data.slice(0, 8) : []);
        }

        if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
          const prods = Array.isArray(prodRes.value.data) ? prodRes.value.data : [];
          setFeaturedProducts(prods.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container hero-content">
          <span className="badge hero-badge">Công Nghệ Đỉnh Cao</span>
          <h1 className="hero-title">Xây Dựng Cấu Hình PC Tương Thích Chuẩn Xác</h1>
          <p className="hero-subtitle">
            Khám phá hàng ngàn linh kiện máy tính, case máy tính gaming, đồ họa chính hãng cùng công cụ kiểm tra tương thích phần cứng theo thời gian thực.
          </p>
          <div className="hero-actions">
            <Link to="/builder" className="btn btn-lg btn-primary">
              ⚡ Bắt đầu Tự Build PC
            </Link>
            <Link to="/products" className="btn btn-lg btn-outline-light">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Danh Mục Linh Kiện Nổi Bật</h2>
            <Link to="/products" className="view-more-link">Xem tất cả &rarr;</Link>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
                <div className="category-icon">⚙️</div>
                <h3 className="category-name">{cat.name}</h3>
                {cat.builderComponentType && (
                  <span className="category-tag">{cat.builderComponentType}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section products-section">
        <div className="container">
          <div className="section-header">
            <h2>Sản Phẩm Mới Nhất</h2>
            <Link to="/products" className="view-more-link">Xem tất cả &rarr;</Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((p) => {
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
                          {p.stockQuantity > 0 ? `Còn hàng (${p.stockQuantity})` : 'Hết hàng'}
                        </span>
                      </div>
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
      </section>
    </div>
  );
};
