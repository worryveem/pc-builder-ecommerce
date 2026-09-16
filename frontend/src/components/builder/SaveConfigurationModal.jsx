import React, { useState, useEffect } from 'react';

export const SaveConfigurationModal = ({
  isOpen,
  currentName,
  isUpdate,
  compatibility,
  onSave,
  onClose,
  saving
}) => {
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setName(currentName || 'Cấu hình PC Gaming ' + new Date().getFullYear());
    setFormError('');
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const hasErrors = compatibility?.errors && compatibility.errors.length > 0;
  const hasWarnings = compatibility?.warnings && compatibility.warnings.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên cho cấu hình PC');
      return;
    }

    if (hasErrors) {
      setFormError('Cấu hình có linh kiện không tương thích, không thể lưu.');
      return;
    }

    onSave(name.trim());
  };

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="save-modal-container elevation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <h3 className="modal-title">
            {isUpdate ? 'Cập Nhật Cấu Hình PC' : 'Lưu Cấu Hình PC'}
          </h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="save-modal-body">
          {formError && <div className="alert alert-danger">{formError}</div>}

          {/* Block if there are compatibility errors */}
          {hasErrors ? (
            <div className="alert alert-danger mb-4">
              <strong>Không thể lưu cấu hình</strong>
              <p className="mt-1">
                Cấu hình đang có {compatibility.errors.length} lỗi tương thích phần cứng. Vui lòng khắc phục các điểm không tương thích trước khi lưu.
              </p>
              <ul className="mt-2 pl-4 list-disc text-sm">
                {compatibility.errors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          ) : hasWarnings ? (
            <div className="alert alert-warning mb-4">
              <strong>Lưu ý về cấu hình</strong>
              <p className="mt-1">
                Cấu hình có cảnh báo về công suất nguồn hoặc linh kiện. Bạn vẫn có thể lưu cấu hình này để theo dõi hoặc chia sẻ.
              </p>
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="configName">Tên cấu hình <span className="text-danger">*</span></label>
            <input
              id="configName"
              type="text"
              className="form-control"
              placeholder="Ví dụ: Gaming PC 1440p, Workstation AI..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving || hasErrors}
              required
            />
          </div>

          <div className="save-modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={saving}
            >
              {hasErrors ? 'Quay lại cấu hình' : 'Hủy'}
            </button>
            {!hasErrors && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !name.trim()}
              >
                {saving ? 'Đang lưu...' : (isUpdate ? 'Cập nhật cấu hình' : 'Lưu cấu hình')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
