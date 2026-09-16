import React, { useState, useEffect } from 'react';
import { builderApi } from '../../api/builderApi';
import { BuilderProductCard } from './BuilderProductCard';

export const BuilderProductSelector = ({
  category,
  selectedComponents,
  currentProduct,
  onSelectProduct,
  onClose
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);

  // Extract relevant contextual components for hardware compatibility filtering
  const selectedCpuId = selectedComponents?.['cpu']?.product?.id ||
    Object.values(selectedComponents || {}).find(item => item?.product?.category?.builderComponentType === 'CPU')?.product?.id;

  const selectedCaseId = selectedComponents?.['case']?.product?.id ||
    Object.values(selectedComponents || {}).find(item => item?.product?.category?.builderComponentType === 'CASE')?.product?.id;

  const selectedMainboardId = selectedComponents?.['mainboard']?.product?.id ||
    Object.values(selectedComponents || {}).find(item => item?.product?.category?.builderComponentType === 'MAINBOARD')?.product?.id;

  const fetchProducts = async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError('');

      const res = await builderApi.filterProducts({
        categorySlug: category.slug,
        selectedCpuId,
        selectedCaseId,
        selectedMainboardId,
        brand: brandFilter || undefined,
        sort: sortOption || undefined
      });

      if (res?.data && Array.isArray(res.data)) {
        setProducts(res.data);

        // Populate unique brands list
        const brands = Array.from(new Set(res.data.map(p => p.brand).filter(Boolean)));
        setAvailableBrands(brands);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products for category:', err);
      setError('Không thể tải danh sách linh kiện tương thích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, brandFilter, sortOption]);

  // Client-side quick search by name
  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.modelCode && p.modelCode.toLowerCase().includes(term))
    );
  });

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="selector-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="selector-modal-header">
          <div>
            <span className="modal-category-badge">{category.builderComponentType || 'COMPONENT'}</span>
            <h3 className="modal-title">Chọn {category.name}</h3>
            <p className="modal-subtitle">
              Hệ thống tự động lọc các linh kiện tương thích với cấu hình đã chọn
            </p>
          </div>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Filters and Search toolbar */}
        <div className="selector-toolbar">
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder={`Tìm kiếm ${category.name.toLowerCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            {availableBrands.length > 0 && (
              <select
                className="form-control select-filter"
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
              >
                <option value="">Tất cả thương hiệu</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}

            <select
              className="form-control select-filter"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Content list */}
        <div className="selector-modal-body">
          {loading ? (
            <div className="selector-loading">
              <div className="spinner"></div>
              <p>Đang kiểm tra và tải các linh kiện tương thích...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="selector-empty">
              <span className="empty-icon">⚠️</span>
              <h4>Không tìm thấy linh kiện phù hợp</h4>
              <p>
                Không có sản phẩm nào thỏa mãn điều kiện lọc hoặc tương thích với các linh kiện khác bạn đã chọn.
              </p>
            </div>
          ) : (
            <div className="selector-products-list">
              {filteredProducts.map(prod => (
                <BuilderProductCard
                  key={prod.id}
                  product={prod}
                  isCurrentSelected={currentProduct?.id === prod.id}
                  onSelect={selectedProd => {
                    onSelectProduct(selectedProd);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="selector-modal-footer">
          <span className="product-count-note">
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm tương thích
          </span>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
