import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

export const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await wishlistApi.getWishlist();
      if (res?.data && Array.isArray(res.data)) {
        setWishlist(res.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError('Không thể tải danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => {
        const prod = item.product || item;
        return prod.id !== productId;
      }));
      setActionMsg('Đã xóa sản phẩm khỏi danh sách yêu thích.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setActionMsg('Không thể xóa sản phẩm khỏi danh sách yêu thích.');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartApi.addToCart(productId, 1);
      setActionMsg('✓ Đã thêm sản phẩm vào giỏ hàng!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setActionMsg('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container empty-state-container">
        <span className="empty-icon">🔒</span>
        <h2>Vui lòng đăng nhập</h2>
        <p>Đăng nhập tài khoản để xem và quản lý các sản phẩm yêu thích của bạn.</p>
        <Link to="/login" state={{ from: { pathname: '/wishlist' } }} className="btn btn-primary btn-lg">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <div className="page-header">
        <h1>Danh Sách Yêu Thích</h1>
        <p>Lưu lại các linh kiện máy tính và sản phẩm công nghệ bạn quan tâm</p>
      </div>

      {actionMsg && <div className="alert alert-info">{actionMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-state-container">
          <span className="empty-icon">❤️</span>
          <h2>Danh sách yêu thích đang trống</h2>
          <p>Hãy khám phá các linh kiện máy tính và nhấn nút "Thêm vào yêu thích" để lưu lại.</p>
          <div className="empty-actions mt-3">
            <Link to="/products" className="btn btn-primary">
              Khám phá sản phẩm
            </Link>
            <Link to="/builder" className="btn btn-outline ml-2">
              Tự Ráp PC
            </Link>
          </div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const product = item.product || item;
            const imgUrl = product.images && product.images.length > 0 ? product.images[0].imageUrl : null;
            const inStock = product.stockQuantity != null ? product.stockQuantity > 0 : true;

            return (
              <div key={product.id} className="wishlist-card">
                <div className="wishlist-card-thumb">
                  {imgUrl ? (
                    <img src={imgUrl} alt={product.name} />
                  ) : (
                    <span>💻</span>
                  )}
                </div>

                <div className="wishlist-card-body">
                  <span className="product-brand">{product.brand || 'Chính hãng'}</span>
                  <h3 className="wishlist-product-title">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="price-row">
                    <span className="price font-bold">{formatPrice(product.price)}</span>
                    <span className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                </div>

                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={!inStock}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm btn-block mt-2"
                    onClick={() => handleRemove(product.id)}
                  >
                    ✕ Xóa khỏi yêu thích
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
