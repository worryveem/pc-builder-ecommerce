import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { ProductCard } from '../components/common/ProductCard';
import { formatCategorySlug } from '../utils/categoryFormatter';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [prebuiltPcs, setPrebuiltPcs] = useState([]);
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
          const cats = Array.isArray(catRes.value.data) ? catRes.value.data : [];
          setCategories(cats.slice(0, 10));
        }

        if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
          const prods = Array.isArray(prodRes.value.data) ? prodRes.value.data : [];
          // Core components for featured
          const components = prods.filter(p => p.productType === 'COMPONENT').slice(0, 8);
          setFeaturedProducts(components.length > 0 ? components : prods.slice(0, 8));

          // Prebuilts & Systems
          const systems = prods.filter(p => p.productType === 'PREBUILT_PC' || p.productType === 'LAPTOP').slice(0, 4);
          setPrebuiltPcs(systems);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      <div className="container">
        {/* 1. Hero Commercial Section */}
        <section className="hero-commercial">
          <div className="hero-grid hero-grid-single">
            <div className="hero-content-col">
              <span className="hero-badge-pill">Hệ Thống PC & Linh Kiện Số 1</span>
              <h1 className="hero-title">
                Xây Dựng Cấu Hình PC <span className="text-gradient">Chuẩn Tương Thích</span>
              </h1>
              <p className="hero-subtitle">
                Hơn 10.000+ linh kiện phần cứng chính hãng từ Intel, AMD, ASUS, MSI, Corsair. Hệ thống kiểm tra tương thích tự động phát hiện sai lệch socket, kích thước case, chiều cao tản nhiệt và công suất nguồn.
              </p>
              <div className="hero-actions-row">
                <Link to="/builder" className="btn btn-lg btn-primary">
                  Tự Build PC Ngay
                </Link>
                <Link to="/products" className="btn btn-lg btn-outline-light">
                  Khám Phá Linh Kiện
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FLAGSHIP PC BUILDER SHOWCASE SECTION (PROMINENT POSITION) */}
        <section className="home-flagship-builder-section elevation-lg">
          <div className="builder-showcase-header">
            <div className="showcase-badge">FLAGSHIP HARDWARE CONFIGURATOR</div>
            <h2 className="showcase-title">
              Công Cụ Tự Ráp PC <span className="text-highlight">Thông Minh & Chuẩn Xác</span>
            </h2>
            <p className="showcase-desc">
              Không còn lo lắng về sự cố phần cứng. Thuật toán phân tích thời gian thực tự động kiểm tra Socket CPU ↔ Mainboard, kích thước VGA, chiều cao tản nhiệt và ước tính điện năng tiêu thụ tổng thể.
            </p>
          </div>

          {/* Stepper overview (8 steps, no horizontal scroll) */}
          <div className="showcase-steps-grid">
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 01</span>
              <span className="step-name">Bộ Vi Xử Lý (CPU)</span>
              <span className="step-spec">LGA1700 / AM5</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 02</span>
              <span className="step-name">Bo Mạch Chủ</span>
              <span className="step-spec">Khớp Socket & Form</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 03</span>
              <span className="step-name">Bộ Nhớ RAM</span>
              <span className="step-spec">DDR4 / DDR5 Dual</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 04</span>
              <span className="step-name">Card Đồ Họa (GPU)</span>
              <span className="step-spec">Check chiều dài Case</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 05</span>
              <span className="step-name">Ổ Cứng SSD</span>
              <span className="step-spec">NVMe PCIe Gen 4</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 06</span>
              <span className="step-name">Nguồn Điện (PSU)</span>
              <span className="step-spec">Tính tổng công suất</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 07</span>
              <span className="step-name">Tản Nhiệt CPU</span>
              <span className="step-spec">Check chiều cao tản</span>
            </div>
            <div className="showcase-step-card active">
              <span className="step-tag">BƯỚC 08</span>
              <span className="step-name">Vỏ Thùng Máy</span>
              <span className="step-spec">Khớp Form Factor</span>
            </div>
          </div>

          {/* Telemetry and Action Banner */}
          <div className="showcase-telemetry-bar">
            <div className="telemetry-item">
              <span className="telemetry-label">Kiểm tra tương thích:</span>
              <span className="telemetry-val text-success">100% An Toàn Phần Cứng</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Công suất nguồn đề xuất:</span>
              <span className="telemetry-val text-primary">Tự động tính theo TDP</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Tính năng:</span>
              <span className="telemetry-val">Lưu cấu hình & Thêm cả bộ vào giỏ</span>
            </div>
            <div className="telemetry-action">
              <Link to="/builder" className="btn btn-primary btn-lg showcase-cta-btn">
                Bắt Đầu Tự Build PC Ngay
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Trust & Service Pillars */}
        <section className="trust-section">
          <div className="trust-grid">
            <div className="trust-card elevation-sm">
              <span className="trust-tag">Chính Hãng 100%</span>
              <h3 className="trust-title">Linh Kiện Nhập Khẩu</h3>
              <p className="trust-desc">Đầy đủ hóa đơn VAT, chứng từ bảo hành chính hãng từ nhà phân phối.</p>
            </div>
            <div className="trust-card elevation-sm">
              <span className="trust-tag">Đổi Mới 30 Ngày</span>
              <h3 className="trust-title">Bảo Hành Siêu Tốc</h3>
              <p className="trust-desc">Đổi mới ngay lập tức nếu phát sinh lỗi phần cứng trong 30 ngày đầu.</p>
            </div>
            <div className="trust-card elevation-sm">
              <span className="trust-tag">Miễn Phí Giao Hàng</span>
              <h3 className="trust-title">Hỏa Tốc 2 Giờ</h3>
              <p className="trust-desc">Giao hàng miễn phí nội thành cho mọi đơn hàng giá trị từ 5 triệu đồng.</p>
            </div>
            <div className="trust-card elevation-sm">
              <span className="trust-tag">Hỗ Trợ 24/7</span>
              <h3 className="trust-title">Lắp Ráp Chuyên Nghiệp</h3>
              <p className="trust-desc">Miễn phí tư vấn tương thích, đi dây gọn gàng và cài đặt Windows/Driver.</p>
            </div>
          </div>
        </section>

        {/* 4. Featured Products Grid (Using Unified ProductCard) */}
        <section className="home-section">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <h2>Linh Kiện Bán Chạy Nhất</h2>
              <p>Các mẫu CPU, Card màn hình và RAM hiệu năng cao được cộng đồng game thủ tin dùng</p>
            </div>
            <Link to="/products" className="view-all-link">
              <span>Xem toàn bộ sản phẩm</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải danh sách linh kiện...</p>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  actionLabel="Xem chi tiết"
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Categories Grid (No horizontal scroll!) */}
        <section className="home-section">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <h2>Danh Mục Linh Kiện Nổi Bật</h2>
              <p>Lựa chọn linh kiện chất lượng cao xây dựng bộ máy tính chuyên nghiệp</p>
            </div>
            <Link to="/products" className="view-all-link">
              <span>Xem tất cả danh mục</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="category-cards-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card elevation-sm">
                {(cat.builderComponentType || cat.slug) && (
                  <span className="category-card-tag">{formatCategorySlug(cat.builderComponentType || cat.slug)}</span>
                )}
                <h3 className="category-card-name">{cat.name}</h3>
                <p className="category-card-desc">{cat.description || 'Linh kiện phần cứng chính hãng'}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Promotional Campaign Banner */}
        <section className="promo-campaign-banner elevation-lg">
          <div className="promo-campaign-content">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CÔNG CỤ THÔNG MINH
            </span>
            <h2 className="promo-campaign-title">
              Chưa Rõ Cấu Hình Nào Tối Ưu Với Ngân Sách?
            </h2>
            <p className="promo-campaign-desc">
              Sử dụng công cụ Tự Build PC thông minh của TechStore để tự thiết kế bộ máy tính hoàn hảo, tự động kiểm tra tương thích linh kiện và cân đối chi phí theo nhu cầu chơi game, dựng hình 3D hoặc lập trình.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/builder" className="btn btn-primary">
                Trải Nghiệm Tự Build PC
              </Link>
              <Link to="/products" className="btn btn-outline-light">
                Xem Báo Giá Mới Nhất
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Prebuilt PC & Systems (Using Unified ProductCard) */}
        {prebuiltPcs.length > 0 && (
          <section className="home-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <h2>Máy Bộ Lắp Sẵn & Laptop Gaming</h2>
                <p>Cấu hình được kỹ sư TechPC tối ưu xung nhịp và nhiệt độ, cắm điện là sử dụng</p>
              </div>
              <Link to="/products?category=16" className="view-all-link">
                <span>Xem máy bộ dựng sẵn</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="product-grid">
              {prebuiltPcs.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  actionLabel="Xem chi tiết"
                  customBadge="PREBUILT"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
