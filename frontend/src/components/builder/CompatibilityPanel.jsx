import React from 'react';

export const CompatibilityPanel = ({ compatibility, selectedComponents, validating }) => {
  const errors = compatibility?.errors || [];
  const warnings = compatibility?.warnings || [];
  const isCompatible = compatibility ? compatibility.isCompatible : true;

  const estimatedWattage = compatibility?.estimatedWattage || 0;
  const recommendedPsuWattage = compatibility?.recommendedPsuWattage || 0;

  // Find if a PSU is selected
  const psuItem = Object.values(selectedComponents || {}).find(
    item => item?.product?.category?.builderComponentType === 'PSU'
  );
  const selectedPsuWattage = psuItem?.product?.specification?.psuWattage;

  const selectedCount = Object.values(selectedComponents || {}).filter(item => item?.product).length;

  return (
    <div className="compatibility-panel">
      {/* Top Status Header */}
      <div className="panel-header">
        <h3 className="panel-title">Trạng Thái Tương Thích</h3>
        {validating && <span className="validating-badge">Đang kiểm tra...</span>}
      </div>

      <div className="status-banner-wrapper">
        {errors.length > 0 ? (
          <div className="status-banner banner-error">
            <span className="status-icon">✕</span>
            <div className="status-text">
              <strong>Cấu hình không tương thích!</strong>
              <p>Phát hiện {errors.length} điểm xung đột phần cứng cần thay đổi.</p>
            </div>
          </div>
        ) : warnings.length > 0 ? (
          <div className="status-banner banner-warning">
            <span className="status-icon">⚠</span>
            <div className="status-text">
              <strong>Tương thích (Có cảnh báo tối ưu)</strong>
              <p>Cấu hình có thể hoạt động nhưng nên xem xét khuyến nghị bên dưới.</p>
            </div>
          </div>
        ) : (
          <div className="status-banner banner-success">
            <span className="status-icon">✓</span>
            <div className="status-text">
              <strong>Tương thích hoàn toàn</strong>
              <p>Các linh kiện phần cứng đã chọn hoạt động đồng bộ, tương thích tốt.</p>
            </div>
          </div>
        )}
      </div>

      {/* Errors & Warnings dynamic list */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="issues-list">
          {errors.map((err, idx) => (
            <div key={`err-${idx}`} className="issue-item issue-error">
              <span className="issue-icon">✕</span>
              <div className="issue-content">
                <span className="issue-code">{err.code}</span>
                <p className="issue-msg">{err.message}</p>
              </div>
            </div>
          ))}

          {warnings.map((warn, idx) => (
            <div key={`warn-${idx}`} className="issue-item issue-warning">
              <span className="issue-icon">⚠️</span>
              <div className="issue-content">
                <span className="issue-code">{warn.code}</span>
                <p className="issue-msg">{warn.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Power Estimation Box */}
      <div className="power-box">
        <h4 className="power-title">⚡ Ước Tính Điện Năng (Power Consumption)</h4>

        {selectedCount > 0 ? (
          <>
            <div className="power-stats-grid">
              <div className="power-stat">
                <span className="power-label">Ước tính tiêu thụ:</span>
                <span className="power-val text-primary">{estimatedWattage} W</span>
              </div>
              <div className="power-stat">
                <span className="power-label">Nguồn khuyến nghị:</span>
                <span className="power-val text-success">{recommendedPsuWattage} W</span>
              </div>
            </div>

            {selectedPsuWattage && (
              <div className="psu-compare-row">
                <span>Nguồn đã chọn: <strong>{selectedPsuWattage} W</strong></span>
                {selectedPsuWattage < estimatedWattage ? (
                  <span className="badge-error">Thiếu công suất</span>
                ) : selectedPsuWattage < recommendedPsuWattage ? (
                  <span className="badge-warning">Dưới mức tối ưu</span>
                ) : (
                  <span className="badge-success">Dư dả an toàn</span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="power-empty-note">Chọn CPU, GPU hoặc Mainboard để ước tính công suất nguồn.</p>
        )}
      </div>

      {/* Rules verification summary */}
      <div className="rules-checklist">
        <h4 className="checklist-title">Quy Tắc Kiểm Tra Phần Cứng</h4>
        <ul className="checklist-items">
          <li className="check-item">
            <span className="check-icon">✓</span> CPU ↔ Mainboard Socket
          </li>
          <li className="check-item">
            <span className="check-icon">✓</span> RAM ↔ Mainboard (Chuẩn RAM & Số khe cắm)
          </li>
          <li className="check-item">
            <span className="check-icon">✓</span> Tản nhiệt CPU ↔ CPU Socket & Chiều cao Case
          </li>
          <li className="check-item">
            <span className="check-icon">✓</span> Card màn hình (GPU) ↔ Chiều dài Case
          </li>
          <li className="check-item">
            <span className="check-icon">✓</span> Mainboard ↔ Form Factor Vỏ Case
          </li>
          <li className="check-item">
            <span className="check-icon">✓</span> Nguồn máy tính (PSU) ↔ Tổng công suất dàn máy
          </li>
        </ul>
      </div>
    </div>
  );
};
