import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryApi } from '../../api/categoryApi';
import { cartApi } from '../../api/cartApi';
import AiRecommendationModal from '../common/AiRecommendationModal';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const megaMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getAllCategories();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        // Fail gracefully
      }
    };
    fetchCats();
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    const fetchCartCount = async () => {
      try {
        const res = await cartApi.getCart();
        if (res?.data && Array.isArray(res.data.items)) {
          const totalQty = res.data.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalQty);
        }
      } catch (e) {
        // Optional
      }
    };
    fetchCartCount();
  }, [isAuthenticated, location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const isAdmin = isAuthenticated && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  return (
    <>
      {/* Top Utility Strip */}
      <div className="header-top-strip">
        <div className="container header-top-inner">
          <div className="header-top-left">
            <div className="header-top-item">
              <span className="strip-label">Tư vấn kỹ thuật:</span>
              <strong className="strip-val">1900 8888</strong>
            </div>
            <div className="header-top-item hide-mobile">
              <span className="strip-label">Bảo hành:</span>
              <strong className="strip-val">1 đổi 1 tận nơi</strong>
            </div>
            <div className="header-top-item hide-tablet">
              <span className="strip-label">Giao hàng:</span>
              <strong className="strip-val">Miễn phí từ 5.000.000 đ</strong>
            </div>
          </div>
          <div className="header-top-right">
            <Link to="/products" className="header-top-link">Sản phẩm chính hãng</Link>
            <Link to="/builder" className="header-top-link highlight-link">Tự Build PC</Link>
            {isAdmin && (
              <Link to="/admin" className="header-top-link admin-pill-link">
                Quản trị Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="site-header">
        <div className="container header-main-row">
          {/* Mobile Drawer Hamburger Trigger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Mở menu danh mục"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="brand-logo-wrap">
            <div className="brand-logo-text">
              TECH<span className="logo-highlight">PC</span>
            </div>
            <span className="brand-badge">STORE</span>
          </Link>

          {/* Prominent Search Bar */}
          <div className="header-search-wrap">
            <form onSubmit={handleSearch} className="header-search-form">
              <input
                type="text"
                className="header-search-input"
                placeholder="Tìm linh kiện PC (RTX 4070, i5 14400, RAM DDR5, Nguồn 750W...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="header-search-btn">
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Header Action Buttons */}
          <div className="header-actions-group">
            {/* AI Advisor Modal Button */}
            <button
              type="button"
              className="header-action-pill ai-action-pill"
              onClick={() => setShowAiModal(true)}
              title="Tư vấn cấu hình PC bằng Trí tuệ nhân tạo"
            >
              <span className="pill-pulse"></span>
              <span className="pill-text">Tư vấn AI</span>
            </button>

            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                isActive ? 'header-nav-btn active' : 'header-nav-btn'
              }
              title="Danh sách sản phẩm yêu thích"
            >
              <span>Yêu thích</span>
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? 'header-nav-btn active' : 'header-nav-btn'
              }
              title="Giỏ hàng của bạn"
            >
              <span>Giỏ hàng</span>
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </NavLink>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="user-dropdown-container" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-dropdown-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  <span className="user-avatar-mini">
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="user-dropdown-name">
                    {user?.fullName || user?.username}
                  </span>
                  <span className="dropdown-caret"></span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu elevation-xl">
                    <Link to="/profile" className="dropdown-item">
                      Hồ sơ cá nhân
                    </Link>
                    <Link to="/orders" className="dropdown-item">
                      Lịch sử đơn hàng
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      Sản phẩm đã lưu
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin-item">
                        Bảng điều khiển Admin
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button type="button" onClick={handleLogout} className="dropdown-item logout-item">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn btn-sm btn-outline-light">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Primary Desktop Navigation Bar (No horizontal scroll!) */}
        <nav className="primary-nav-bar">
          <div className="container primary-nav-inner">
            {/* Mega Menu Dropdown Toggle */}
            <div
              className="nav-item-dropdown-wrap"
              ref={megaMenuRef}
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                type="button"
                className={`mega-menu-trigger-btn ${megaMenuOpen ? 'active' : ''}`}
                onClick={() => setMegaMenuOpen(prev => !prev)}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                <div className="trigger-bars">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>DANH MỤC LINH KIỆN</span>
                <span className={`menu-arrow ${megaMenuOpen ? 'up' : 'down'}`}></span>
              </button>

              {/* Mega Menu Panel */}
              {megaMenuOpen && (
                <div
                  className="mega-menu-panel elevation-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mega-menu-grid">
                    {/* Column 1: Core Hardware */}
                    <div className="mega-menu-column">
                      <div className="mega-column-title">Linh Kiện Cốt Lõi</div>
                      <ul className="mega-links-list">
                        <li>
                          <Link to="/products?category=1" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Bộ vi xử lý (CPU)</span>
                            <span className="mega-link-badge">LGA1700 / AM5</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=2" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Bo mạch chủ (Mainboard)</span>
                            <span className="mega-link-badge">B760 / Z790 / B650</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=4" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Bộ nhớ trong (RAM)</span>
                            <span className="mega-link-badge">DDR4 / DDR5</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=7" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Nguồn máy tính (PSU)</span>
                            <span className="mega-link-badge">550W - 1000W 80+</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Graphics & Storage */}
                    <div className="mega-menu-column">
                      <div className="mega-column-title">Đồ Họa & Lưu Trữ</div>
                      <ul className="mega-links-list">
                        <li>
                          <Link to="/products?category=3" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Card màn hình (GPU / VGA)</span>
                            <span className="mega-link-badge">RTX 40 Series</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=5" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Ổ cứng SSD NVMe</span>
                            <span className="mega-link-badge">Gen 4 M.2</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=6" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Ổ cứng HDD</span>
                            <span className="mega-link-badge">1TB - 4TB</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Cooling & Case */}
                    <div className="mega-menu-column">
                      <div className="mega-column-title">Tản Nhiệt & Vỏ Thùng</div>
                      <ul className="mega-links-list">
                        <li>
                          <Link to="/products?category=8" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Tản nhiệt CPU</span>
                            <span className="mega-link-badge">AIO Nước & Khí</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=9" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Vỏ case máy tính</span>
                            <span className="mega-link-badge">ATX / mATX</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=10" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Quạt tản nhiệt (Fan)</span>
                            <span className="mega-link-badge">ARGB 120mm</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 4: Gear & Systems */}
                    <div className="mega-menu-column">
                      <div className="mega-column-title">Màn Hình & Máy Bộ</div>
                      <ul className="mega-links-list">
                        <li>
                          <Link to="/products?category=11" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Màn hình máy tính</span>
                            <span className="mega-link-badge">2K / 165Hz IPS</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=12" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Bàn phím cơ & Chuột</span>
                            <span className="mega-link-badge">Gaming Gear</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/products?category=16" className="mega-link-item" onClick={() => setMegaMenuOpen(false)}>
                            <span className="mega-link-text">Máy bộ TechPC Build sẵn</span>
                            <span className="mega-link-badge">Bảo hành 36T</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Structured Nav Links (Home | Products | PC Builder | Prebuilts | Deals) */}
            <div className="primary-nav-links">
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link-item active' : 'nav-link-item')}>
                Trang chủ
              </NavLink>

              <NavLink to="/products" end className={({ isActive }) => (isActive ? 'nav-link-item active' : 'nav-link-item')}>
                Tất cả sản phẩm
              </NavLink>

              {/* FLAGSHIP PC BUILDER CTA BUTTON */}
              <NavLink
                to="/builder"
                className={({ isActive }) =>
                  isActive ? 'flagship-builder-nav-btn active' : 'flagship-builder-nav-btn'
                }
              >
                <span className="flagship-badge">FLAGSHIP</span>
                <span className="flagship-title">TỰ BUILD PC</span>
                <span className="flagship-sub">Real-time Check</span>
              </NavLink>

              <NavLink to="/products?category=16" className={({ isActive }) => (isActive ? 'nav-link-item active' : 'nav-link-item')}>
                Máy bộ lắp sẵn
              </NavLink>

              <button
                type="button"
                className="nav-link-item nav-ai-trigger"
                onClick={() => setShowAiModal(true)}
              >
                Tư vấn cấu hình AI
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-drawer-content elevation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-logo-text">
                TECH<span className="logo-highlight">PC</span> STORE
              </div>
              <button
                type="button"
                className="btn-drawer-close"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Đóng menu"
              >
                ✕
              </button>
            </div>

            {/* Search inside drawer */}
            <form onSubmit={handleSearch} className="drawer-search-form">
              <input
                type="text"
                placeholder="Tìm linh kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Tìm</button>
            </form>

            {/* Flagship Builder in Drawer */}
            <div className="drawer-flagship-box">
              <Link
                to="/builder"
                className="drawer-builder-btn"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <div className="drawer-builder-tag">FLAGSHIP TOOL</div>
                <div className="drawer-builder-title">TỰ BUILD PC CHUẨN TƯƠNG THÍCH</div>
                <div className="drawer-builder-desc">Tự ráp cấu hình máy tính, kiểm tra socket và nguồn tức thì</div>
              </Link>
            </div>

            {/* Main Drawer Links */}
            <div className="drawer-nav-list">
              <Link to="/" className="drawer-nav-link" onClick={() => setMobileDrawerOpen(false)}>
                Trang chủ
              </Link>
              <Link to="/products" className="drawer-nav-link" onClick={() => setMobileDrawerOpen(false)}>
                Tất cả sản phẩm
              </Link>
              <Link to="/products?category=16" className="drawer-nav-link" onClick={() => setMobileDrawerOpen(false)}>
                Máy bộ dựng sẵn
              </Link>

              {/* Accordion Categories */}
              <div className="drawer-accordion-block">
                <button
                  type="button"
                  className="drawer-accordion-toggle"
                  onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                >
                  <span>Danh mục linh kiện</span>
                  <span className={`accordion-caret ${mobileAccordionOpen ? 'open' : ''}`}>▼</span>
                </button>

                {mobileAccordionOpen && (
                  <div className="drawer-accordion-body">
                    <Link to="/products?category=1" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Bộ vi xử lý (CPU)
                    </Link>
                    <Link to="/products?category=2" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Bo mạch chủ (Mainboard)
                    </Link>
                    <Link to="/products?category=3" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Card màn hình (GPU/VGA)
                    </Link>
                    <Link to="/products?category=4" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Bộ nhớ trong (RAM)
                    </Link>
                    <Link to="/products?category=5" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Ổ cứng SSD M.2 NVMe
                    </Link>
                    <Link to="/products?category=7" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Nguồn máy tính (PSU)
                    </Link>
                    <Link to="/products?category=8" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Tản nhiệt CPU (Cooler)
                    </Link>
                    <Link to="/products?category=9" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Vỏ thùng máy (Case)
                    </Link>
                    <Link to="/products?category=11" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Màn hình máy tính
                    </Link>
                    <Link to="/products?category=12" className="drawer-sub-link" onClick={() => setMobileDrawerOpen(false)}>
                      Bàn phím & Chuột Gaming
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="drawer-nav-link text-left"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowAiModal(true);
                }}
              >
                Tư vấn cấu hình bằng AI
              </button>
            </div>

            {/* Drawer Account Links */}
            <div className="drawer-user-section">
              {isAuthenticated ? (
                <div className="drawer-user-info">
                  <div className="drawer-user-name">
                    Tài khoản: <strong>{user?.fullName || user?.username}</strong>
                  </div>
                  <div className="drawer-user-links">
                    <Link to="/profile" onClick={() => setMobileDrawerOpen(false)}>Hồ sơ</Link>
                    <Link to="/orders" onClick={() => setMobileDrawerOpen(false)}>Đơn hàng</Link>
                    <Link to="/wishlist" onClick={() => setMobileDrawerOpen(false)}>Yêu thích</Link>
                    <button type="button" onClick={handleLogout} className="drawer-logout-btn">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drawer-auth-buttons">
                  <Link to="/login" className="btn btn-primary btn-block" onClick={() => setMobileDrawerOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-block" onClick={() => setMobileDrawerOpen(false)}>
                    Đăng ký tài khoản
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global AI Recommendation modal */}
      <AiRecommendationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />
    </>
  );
};

export default Header;
