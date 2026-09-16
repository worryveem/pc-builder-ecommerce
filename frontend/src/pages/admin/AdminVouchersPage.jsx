import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

const INITIAL_FORM = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  active: true
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getVouchers();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setVouchers(list);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      code: v.code || '',
      description: v.description || '',
      discountType: v.discountType || 'PERCENTAGE',
      discountValue: v.discountValue ?? '',
      minOrderAmount: v.minOrderAmount ?? '',
      maxDiscountAmount: v.maxDiscountAmount ?? '',
      usageLimit: v.usageLimit ?? '',
      startDate: v.startDate ? v.startDate.slice(0, 10) : '',
      endDate: v.endDate ? v.endDate.slice(0, 10) : '',
      active: v.active !== false
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) return;
    try {
      await adminApi.deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Failed to delete voucher:', err);
      alert(err?.response?.data?.message || 'Không thể xóa voucher');
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

    if (!formData.code || !formData.discountValue) {
      setFormError('Vui lòng nhập mã code và giá trị giảm');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
        active: formData.active
      };

      if (editingId) {
        await adminApi.updateVoucher(editingId, payload);
      } else {
        await adminApi.createVoucher(payload);
      }

      setModalOpen(false);
      await fetchVouchers();
    } catch (err) {
      console.error('Failed to save voucher:', err);
      setFormError(err?.response?.data?.message || 'Không thể lưu voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý mã giảm giá (Vouchers)</h2>
          <p className="subtitle">Tạo và cấu hình các chương trình khuyến mại, chiết khấu</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm voucher mới
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách voucher...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Mô tả</th>
                <th>Kiểu giảm</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Đã dùng / Giới hạn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Chưa có voucher nào</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className="voucher-code-badge">{v.code}</span>
                    </td>
                    <td>{v.description || '---'}</td>
                    <td>{v.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}</td>
                    <td className="font-bold text-primary">
                      {v.discountType === 'PERCENTAGE'
                        ? `${v.discountValue}%`
                        : `${Number(v.discountValue || 0).toLocaleString('vi-VN')} đ`}
                    </td>
                    <td>
                      {v.minOrderAmount
                        ? `${Number(v.minOrderAmount).toLocaleString('vi-VN')} đ`
                        : 'Không giới hạn'}
                    </td>
                    <td>
                      {v.usedCount ?? 0} / {v.usageLimit ? v.usageLimit : '∞'}
                    </td>
                    <td>
                      <span className={`status-badge ${v.active ? 'status-completed' : 'status-cancelled'}`}>
                        {v.active ? 'Đang kích hoạt' : 'Ngừng áp dụng'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => handleOpenEdit(v)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-outline-danger btn-xs"
                          onClick={() => handleDelete(v.id, v.code)}
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

      {/* Modal Create/Edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Chỉnh sửa voucher' : 'Tạo mã voucher mới'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {formError && <div className="alert-box alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Mã Voucher (Code) *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: SALE10, PCBUILDER2026"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả chương trình</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: Giảm 10% cho đơn từ 5 triệu"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại chiết khấu *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleFormChange}
                  >
                    <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    {formData.discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleFormChange}
                    placeholder="0 nếu không yêu cầu"
                  />
                </div>
                <div className="form-group">
                  <label>Mức giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleFormChange}
                    placeholder="Cho loại phần trăm"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số lượt sử dụng tối đa</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleFormChange}
                    placeholder="Để trống nếu vô hạn"
                  />
                </div>
                <div className="form-group">
                  <label>Ngày hết hạn</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="checkbox-item mt-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                />
                <label htmlFor="active" className="font-bold">
                  Kích hoạt mã voucher ngay
                </label>
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
                  {submitting ? 'Đang lưu...' : 'Lưu voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
