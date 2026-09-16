import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';

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
        const id = item.productId || (item.product && item.product.id) || item.id;
        return id !== productId;
      }));
      setActionMsg('Đã xóa sản phẩm khỏi danh sách yêu thích.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setActionMsg('Không thể xóa sản phẩm khỏi danh sách yêu thích.');
    }
  };

  const handleAddToCart = async (productOrId) => {
    const productId = typeof productOrId === 'object' ? (productOrId.id || productOrId.productId) : productOrId;
    try {
      await cartApi.addToCart(productId, 1);
      setActionMsg('Đã thêm sản phẩm vào giỏ hàng thành công.');
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
      <div className="container empty-state-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <span className="badge badge-brand" style={{ fontSize: '13px', padding: '6px 14px', marginBottom: '16px' }}>YÊU CẦU ĐĂNG NHẬP</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: 'var(--color-slate-500)', maxWidth: '440px', margin: '0 auto 24px' }}>
          Đăng nhập tài khoản để xem và quản lý các linh kiện và sản phẩm công nghệ bạn đã lưu lại.
        </p>
        <Link to="/login" state={{ from: { pathname: '/wishlist' } }} className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 600 }}>
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container loading-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--color-slate-500)' }}>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className="container wishlist-page" style={{ padding: '32px 16px 64px' }}>
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '6px' }}>Danh Sách Yêu Thích</h1>
        <p style={{ color: 'var(--color-slate-500)', fontSize: '14px' }}>Lưu trữ các linh kiện máy tính và sản phẩm công nghệ bạn quan tâm</p>
      </div>

      {actionMsg && <div className="alert alert-info" style={{ marginBottom: '20px' }}>{actionMsg}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-state-container" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
          <span className="badge badge-brand" style={{ fontSize: '12px', padding: '6px 12px', marginBottom: '14px' }}>DANH SÁCH TRỐNG</span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>Chưa có sản phẩm yêu thích nào</h2>
          <p style={{ color: 'var(--color-slate-500)', maxWidth: '460px', margin: '0 auto 24px', fontSize: '14px' }}>
            Khám phá danh mục linh kiện máy tính, PC Gaming và nhấn biểu tượng lưu để theo dõi giá và mua sắm sau.
          </p>
          <div className="empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '10px 22px' }}>
              Khám phá sản phẩm
            </Link>
            <Link to="/builder" className="btn btn-outline" style={{ padding: '10px 22px' }}>
              Tự Build PC
            </Link>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((item) => {
            const prodId = item.productId || (item.product && item.product.id) || item.id;
            const normalizedProduct = {
              id: prodId,
              name: item.productName || (item.product && item.product.name) || item.name || 'Linh kiện máy tính',
              price: item.price != null ? item.price : (item.product && item.product.price),
              brand: item.categoryName || (item.product && item.product.brand) || item.brand || 'Chính hãng',
              images: item.imageUrl
                ? [{ imageUrl: item.imageUrl }]
                : (item.product?.images?.length > 0 ? item.product.images : (item.images || [])),
              specification: item.product?.specification || item.specification,
              stockQuantity: item.stockQuantity != null ? item.stockQuantity : (item.product?.stockQuantity != null ? item.product.stockQuantity : 10),
            };

            return (
              <ProductCard
                key={prodId}
                product={normalizedProduct}
                isWishlisted={true}
                onToggleWishlist={(e, id) => handleRemove(id || prodId)}
                onAddToCart={handleAddToCart}
                onRemove={handleRemove}
                actionLabel="Xem chi tiết"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
