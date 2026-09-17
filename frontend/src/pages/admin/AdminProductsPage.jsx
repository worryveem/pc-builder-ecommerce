import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { formatCategorySlug } from '../../utils/categoryFormatter';
import { categoryApi } from '../../api/categoryApi';
import { getProductFallbackImage } from '../../utils/imagePlaceholder';

const INITIAL_FORM = {
  name: '',
  brand: '',
  modelCode: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  description: '',
  warrantyMonths: 12,
  imageUrl: '',
  // Hardware specifications
  socket: '',
  ramType: '',
  formFactor: '',
  wattage: '',
  tdp: '',
  capacityGb: '',
  vramGb: '',
  lengthMm: '',
  heightMm: '',
  modularType: '',
  busSpeed: '',
  modulesCount: ''
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        adminApi.getProducts(),
        categoryApi.getAllCategories()
      ]);
      const prodList = Array.isArray(prodsRes) ? prodsRes : (Array.isArray(prodsRes?.data) ? prodsRes.data : []);
      const catList = Array.isArray(catsRes) ? catsRes : (Array.isArray(catsRes?.data) ? catsRes.data : []);
      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching admin products/categories:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      categoryId: categories.length > 0 ? categories[0].id : ''
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = async (product) => {
    setEditingId(product.id);
    setFormError(null);

    const specs = product.specification || product.specifications || {};
    const img = product.images?.[0]?.imageUrl || product.imageUrl || '';

    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      modelCode: product.modelCode || '',
      price: product.price || '',
      stockQuantity: product.stockQuantity ?? '',
      categoryId: product.category?.id || product.categoryId || (categories[0]?.id || ''),
      description: product.description || '',
      warrantyMonths: product.warrantyMonths || 12,
      imageUrl: img,
      // Specs (support both backend field names and form field names)
      socket: specs.socket || '',
      ramType: specs.ramType || '',
      formFactor: specs.formFactor || '',
      wattage: specs.psuWattage ?? specs.wattage ?? '',
      tdp: specs.tdpW ?? specs.tdp ?? '',
      capacityGb: specs.capacityGb ?? '',
      vramGb: specs.vramGb ?? '',
      lengthMm: specs.gpuLengthMm ?? specs.lengthMm ?? '',
      heightMm: specs.coolerHeightMm ?? specs.heightMm ?? '',
      modularType: specs.modularType || '',
      busSpeed: specs.speedMhz ?? specs.busSpeed ?? '',
      modulesCount: specs.modulesCount ?? ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert(err?.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.price || !formData.categoryId) {
      setFormError('Vui lòng điền tên, giá và danh mục');
      return;
    }

    try {
      setSubmitting(true);
      const specPayload = {
        socket: formData.socket ? formData.socket.trim() : null,
        ramType: formData.ramType ? formData.ramType.trim() : null,
        formFactor: formData.formFactor ? formData.formFactor.trim() : null,
        psuWattage: formData.wattage ? Number(formData.wattage) : null,
        wattage: formData.wattage ? Number(formData.wattage) : null,
        tdpW: formData.tdp ? Number(formData.tdp) : null,
        tdp: formData.tdp ? Number(formData.tdp) : null,
        capacityGb: formData.capacityGb ? Number(formData.capacityGb) : null,
        vramGb: formData.vramGb ? Number(formData.vramGb) : null,
        gpuLengthMm: formData.lengthMm ? Number(formData.lengthMm) : null,
        lengthMm: formData.lengthMm ? Number(formData.lengthMm) : null,
        coolerHeightMm: formData.heightMm ? Number(formData.heightMm) : null,
        heightMm: formData.heightMm ? Number(formData.heightMm) : null,
        modularType: formData.modularType ? formData.modularType.trim() : null,
        speedMhz: formData.busSpeed ? Number(formData.busSpeed) : null,
        busSpeed: formData.busSpeed ? Number(formData.busSpeed) : null,
        modulesCount: formData.modulesCount ? Number(formData.modulesCount) : 1
      };

      const payload = {
        name: formData.name,
        brand: formData.brand,
        modelCode: formData.modelCode,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity || 0),
        categoryId: Number(formData.categoryId),
        description: formData.description,
        warrantyMonths: Number(formData.warrantyMonths || 12),
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : '',
        images: formData.imageUrl && formData.imageUrl.trim()
          ? [{ imageUrl: formData.imageUrl.trim() }]
          : [],
        specification: specPayload,
        specifications: specPayload
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to save product:', err);
      setFormError(err?.response?.data?.message || 'Không thể lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modelCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const catId = p.category?.id || p.categoryId;
    const matchesCategory = !selectedCategory || String(catId) === String(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý sản phẩm</h2>
          <p className="subtitle">Quản lý kho hàng, thông số kỹ thuật và giá cả</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm sản phẩm mới
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Tìm theo tên, hãng, mã sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="admin-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const fallbackUrl = getProductFallbackImage(p);
                  const img = p.images?.[0]?.imageUrl || fallbackUrl;
                  return (
                    <tr key={p.id}>
                      <td className="product-thumb-cell">
                        <img
                          src={img}
                          alt={p.name}
                          onError={(e) => { e.target.src = fallbackUrl; }}
                        />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.modelCode && <span className="text-muted d-block">{p.modelCode}</span>}
                      </td>
                      <td>
                        <span className="badge badge-builder" style={{ marginRight: '0.4rem', fontWeight: 800 }}>
                          {formatCategorySlug(p.category?.slug || p.category?.builderComponentType || '')}
                        </span>
                        <span>{p.category?.name || 'Chưa phân loại'}</span>
                      </td>
                      <td>{p.brand || '---'}</td>
                      <td className="text-primary font-bold">
                        {Number(p.price || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <span className={`stock-indicator ${p.stockQuantity <= 5 ? 'stock-low' : 'stock-ok'}`}>
                          {p.stockQuantity ?? 0}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(p)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-outline-danger btn-xs"
                            onClick={() => handleDelete(p.id, p.name)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {formError && <div className="alert-box alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="form-sections-grid">
                {/* General Info */}
                <div className="form-section">
                  <h4 className="section-title">Thông tin cơ bản</h4>

                  <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hãng (Brand)</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mã sản phẩm</label>
                      <input
                        type="text"
                        name="modelCode"
                        value={formData.modelCode}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Số lượng tồn kho *</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Danh mục *</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleFormChange}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Bảo hành (tháng)</label>
                      <input
                        type="number"
                        name="warrantyMonths"
                        value={formData.warrantyMonths}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>URL Hình ảnh</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleFormChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea
                      rows="3"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                </div>

                {/* Hardware Specs for PC Builder */}
                <div className="form-section">
                  <h4 className="section-title">Thông số phần cứng (PC Builder)</h4>
                  <p className="text-muted text-xs mb-3">
                    Dùng để kiểm tra tương thích trong cấu hình PC
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Socket (CPU / Mainboard)</label>
                      <input
                        type="text"
                        name="socket"
                        placeholder="LGA1700, AM5..."
                        value={formData.socket}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Chuẩn RAM (DDR4 / DDR5)</label>
                      <input
                        type="text"
                        name="ramType"
                        placeholder="DDR4, DDR5"
                        value={formData.ramType}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kích thước (Form Factor)</label>
                      <input
                        type="text"
                        name="formFactor"
                        placeholder="ATX, Micro-ATX, Mini-ITX"
                        value={formData.formFactor}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Công suất / PSU (W)</label>
                      <input
                        type="number"
                        name="wattage"
                        value={formData.wattage}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>TDP Tiêu thụ (W)</label>
                      <input
                        type="number"
                        name="tdp"
                        value={formData.tdp}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Dung lượng (GB)</label>
                      <input
                        type="number"
                        name="capacityGb"
                        value={formData.capacityGb}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>VRAM Card đồ họa (GB)</label>
                      <input
                        type="number"
                        name="vramGb"
                        value={formData.vramGb}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Chiều dài Card (mm)</label>
                      <input
                        type="number"
                        name="lengthMm"
                        value={formData.lengthMm}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
