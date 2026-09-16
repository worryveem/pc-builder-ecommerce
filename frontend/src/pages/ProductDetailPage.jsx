import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [addingToCart, setAddingToCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getProductById(id);
        if (res?.data) {
          setProduct(res.data);
        } else {
          setError('Không tìm thấy thông tin sản phẩm');
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin sản phẩm từ máy chủ');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setAddingToCart(true);
      setActionMsg({ type: '', text: '' });
      await cartApi.addToCart(product.id, quantity);
      setActionMsg({ type: 'success', text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!` });
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi khi thêm sản phẩm vào giỏ hàng';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container error-container">
        <h2>Thông báo</h2>
        <p>{error || 'Không tìm thấy sản phẩm'}</p>
        <Link to="/products" className="btn btn-primary">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  const spec = product.specification;
  const imgUrl = product.images && product.images.length > 0 ? product.images[0].imageUrl : null;

  return (
    <div className="container product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/products">Sản phẩm</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        {/* Gallery */}
        <div className="product-gallery">
          {imgUrl ? (
            <img src={imgUrl} alt={product.name} className="product-detail-img" />
          ) : (
            <div className="product-img-placeholder large">
              <span>💻</span>
            </div>
          )}
        </div>

        {/* Info & Buying */}
        <div className="product-main-info">
          <span className="product-brand-badge">{product.brand || 'Chính hãng'}</span>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-model-code">Mã model: {product.modelCode || 'N/A'}</p>

          <div className="price-box">
            <span className="current-price">{formatPrice(product.price)}</span>
            <span className={`stock-badge ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity} sản phẩm)` : 'Hết hàng'}
            </span>
          </div>

          {product.warrantyMonths && (
            <p className="warranty-info">🛡️ Bảo hành chính hãng: {product.warrantyMonths} tháng</p>
          )}

          {actionMsg.text && (
            <div className={`alert ${actionMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {actionMsg.text}
            </div>
          )}

          <div className="purchase-controls">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="qty-buttons">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || addingToCart}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity || 99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={addingToCart}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product.stockQuantity || 99) || addingToCart}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg"
              disabled={product.stockQuantity <= 0 || addingToCart}
            >
              {addingToCart ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
            </button>
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Hardware Specs Table */}
      {spec && (
        <div className="product-specs-section">
          <h2>Thông số kỹ thuật phần cứng</h2>
          <table className="specs-table">
            <tbody>
              {spec.socket && (
                <tr><td>Socket hỗ trợ</td><td><strong>{spec.socket}</strong></td></tr>
              )}
              {spec.supportedSockets && (
                <tr><td>Các socket tương thích</td><td>{spec.supportedSockets}</td></tr>
              )}
              {spec.chipset && (
                <tr><td>Chipset</td><td>{spec.chipset}</td></tr>
              )}
              {spec.ramType && (
                <tr><td>Chuẩn RAM</td><td><strong>{spec.ramType}</strong></td></tr>
              )}
              {spec.ramSlots && (
                <tr><td>Số khe cắm RAM</td><td>{spec.ramSlots} khe</td></tr>
              )}
              {spec.maxRamCapacity && (
                <tr><td>Dung lượng RAM tối đa</td><td>{spec.maxRamCapacity} GB</td></tr>
              )}
              {spec.capacityGb && (
                <tr><td>Dung lượng mỗi thanh</td><td>{spec.capacityGb} GB</td></tr>
              )}
              {spec.modulesCount && (
                <tr><td>Số thanh trong 1 kit</td><td>{spec.modulesCount}</td></tr>
              )}
              {spec.speedMhz && (
                <tr><td>Tốc độ xung nhịp</td><td>{spec.speedMhz} MHz</td></tr>
              )}
              {spec.formFactor && (
                <tr><td>Kích thước / Form Factor</td><td><strong>{spec.formFactor}</strong></td></tr>
              )}
              {spec.supportedFormFactors && (
                <tr><td>Các form factor hỗ trợ</td><td>{spec.supportedFormFactors}</td></tr>
              )}
              {spec.tdpW && (
                <tr><td>Mức tiêu thụ điện (TDP)</td><td>{spec.tdpW} W</td></tr>
              )}
              {spec.powerConsumptionW && (
                <tr><td>Điện năng tiêu thụ (GPU)</td><td>{spec.powerConsumptionW} W</td></tr>
              )}
              {spec.recommendedPsuW && (
                <tr><td>Nguồn khuyến nghị (GPU)</td><td><strong>{spec.recommendedPsuW} W</strong></td></tr>
              )}
              {spec.psuWattage && (
                <tr><td>Công suất nguồn (PSU)</td><td><strong>{spec.psuWattage} W</strong></td></tr>
              )}
              {spec.gpuLengthMm && (
                <tr><td>Chiều dài card (GPU)</td><td>{spec.gpuLengthMm} mm</td></tr>
              )}
              {spec.maxGpuLengthMm && (
                <tr><td>Chiều dài GPU tối đa (Case)</td><td>{spec.maxGpuLengthMm} mm</td></tr>
              )}
              {spec.coolerHeightMm && (
                <tr><td>Chiều cao tản nhiệt</td><td>{spec.coolerHeightMm} mm</td></tr>
              )}
              {spec.maxCoolerHeightMm && (
                <tr><td>Chiều cao tản nhiệt tối đa (Case)</td><td>{spec.maxCoolerHeightMm} mm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
