import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

const COMPONENT_TYPES = [
  { label: '-- Không phải linh kiện Builder --', value: '' },
  { label: 'Bộ vi xử lý (CPU)', value: 'CPU' },
  { label: 'Bo mạch chủ (MAINBOARD)', value: 'MAINBOARD' },
  { label: 'Bộ nhớ trong (RAM)', value: 'RAM' },
  { label: 'Card đồ họa (GPU)', value: 'GPU' },
  { label: 'Ổ cứng lưu trữ (STORAGE)', value: 'STORAGE' },
  { label: 'Nguồn máy tính (PSU)', value: 'PSU' },
  { label: 'Vỏ máy tính (CASE)', value: 'CASE' },
  { label: 'Tản nhiệt (COOLER)', value: 'COOLER' }
];

const INITIAL_FORM = {
  name: '',
  slug: '',
  description: '',
  builderSupported: false,
  builderComponentType: '',
  displayOrder: 0
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      builderSupported: !!cat.builderSupported,
      builderComponentType: cat.builderComponentType || '',
      displayOrder: cat.displayOrder || 0
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (cat) => {
    if (cat.builderSupported) {
      if (!window.confirm(`CẢNH BÁO: Danh mục "${cat.name}" đang được dùng cho PC Builder. Việc xóa có thể ảnh hưởng đến tính năng build PC. Bạn có chắc muốn xóa?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    }

    try {
      await adminApi.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err?.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name) {
      setFormError('Vui lòng nhập tên danh mục');
      return;
    }

    if (formData.builderSupported && !formData.builderComponentType) {
      setFormError('Nếu danh mục hỗ trợ PC Builder, bạn phải chọn Loại linh kiện Builder!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        builderSupported: formData.builderSupported,
        builderComponentType: formData.builderSupported ? formData.builderComponentType : null,
        displayOrder: Number(formData.displayOrder || 0)
      };

      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
      } else {
        await adminApi.createCategory(payload);
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      setFormError(err?.response?.data?.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý danh mục</h2>
          <p className="subtitle">Quản lý danh mục sản phẩm và linh kiện tương thích PC Builder</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm danh mục mới
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh mục...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>PC Builder</th>
                <th>Loại linh kiện</th>
                <th>Thứ tự</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Chưa có danh mục nào</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>#{cat.id}</td>
                    <td><strong>{cat.name}</strong></td>
                    <td className="text-muted">{cat.slug}</td>
                    <td>
                      {cat.builderSupported ? (
                        <span className="badge-builder-supported">✓ Hỗ trợ Builder</span>
                      ) : (
                        <span className="text-muted">Không</span>
                      )}
                    </td>
                    <td>
                      {cat.builderComponentType ? (
                        <span className="badge-component-type">{cat.builderComponentType}</span>
                      ) : (
                        '---'
                      )}
                    </td>
                    <td>{cat.displayOrder ?? 0}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-outline-danger btn-xs"
                          onClick={() => handleDelete(cat)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {formError && <div className="alert-box alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: Bo mạch chủ, Card đồ họa..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug (URL thân thiện)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  placeholder="Để trống sẽ tự tạo từ tên"
                />
              </div>

              <div className="form-group">
                <label>Mô tả danh mục</label>
                <textarea
                  rows="2"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-section-highlight">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="builderSupported"
                    name="builderSupported"
                    checked={formData.builderSupported}
                    onChange={handleFormChange}
                  />
                  <label htmlFor="builderSupported" className="font-bold">
                    Hỗ trợ trong hệ thống PC Builder
                  </label>
                </div>

                {formData.builderSupported && (
                  <div className="form-group mt-3">
                    <label>Loại linh kiện tương thích (Component Type) *</label>
                    <select
                      name="builderComponentType"
                      value={formData.builderComponentType}
                      onChange={handleFormChange}
                      required={formData.builderSupported}
                    >
                      {COMPONENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <small className="help-text text-warning">
                      ⚠️ Loại linh kiện này sẽ được hệ thống CompatibilityEngine sử dụng để kiểm tra tương thích!
                    </small>
                  </div>
                )}
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
                  {submitting ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
