import React from 'react';

export const CompatibilityPanel = ({ compatibility, selectedComponents, validating }) => {
  const errors = compatibility?.errors || [];
  const warnings = compatibility?.warnings || [];

  const estimatedWattage = compatibility?.estimatedWattage || 0;
  const recommendedPsuWattage = compatibility?.recommendedPsuWattage || 0;

  // Find if a PSU is selected
  const psuItem = Object.values(selectedComponents || {}).find(
    item => item?.product?.category?.builderComponentType === 'PSU'
  );
  const selectedPsuWattage = psuItem?.product?.specification?.psuWattage;

  const selectedCount = Object.values(selectedComponents || {}).filter(item => item?.product).length;

  return (
    <div className="compatibility-panel elevation-sm">
      {/* Top Status Header */}
      <div className="panel-header">
        <h3 className="panel-title">Trạng Thái Tương Thích</h3>
        {validating && <span className="validating-badge">Đang kiểm tra...</span>}
      </div>

      <div className="status-banner-wrapper">
        {errors.length > 0 ? (
          <div className="status-banner banner-error">
            <span className="status-indicator-badge badge-err">ERROR</span>
            <div className="status-text">
              <strong>Xung đột phần cứng ({errors.length} lỗi)</strong>
              <p>Phát hiện linh kiện không khớp chuẩn cắm hoặc kích thước. Cần đổi trước khi thêm giỏ.</p>
            </div>
          </div>
        ) : warnings.length > 0 ? (
          <div className="status-banner banner-warning">
            <span className="status-indicator-badge badge-warn">WARN</span>
            <div className="status-text">
              <strong>Tương thích có lưu ý ({warnings.length} cảnh báo)</strong>
              <p>Hệ thống có thể chạy nhưng nên cân nhắc tối ưu công suất nguồn hoặc tản nhiệt.</p>
            </div>
          </div>
        ) : selectedCount === 0 ? (
          <div className="status-banner banner-neutral">
            <span className="status-indicator-badge badge-init">READY</span>
            <div className="status-text">
              <strong>Đang bắt đầu cấu hình</strong>
              <p>Chọn CPU, Mainboard và các linh kiện để hệ thống bắt đầu kiểm tra đồng bộ.</p>
            </div>
          </div>
        ) : (
          <div className="status-banner banner-success">
            <span className="status-indicator-badge badge-ok">PASS</span>
            <div className="status-text">
              <strong>Tương thích hoàn toàn</strong>
              <p>Tất cả linh kiện đã chọn khớp chuẩn socket, form factor và công suất vận hành.</p>
            </div>
          </div>
        )}
      </div>

      {/* Errors & Warnings dynamic list */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="issues-list">
          {errors.map((err, idx) => (
            <div key={`err-${idx}`} className="issue-item issue-error">
              <span className="issue-code-pill">[XUNG ĐỘT]</span>
              <div className="issue-content">
                <span className="issue-code">{err.code}</span>
                <p className="issue-msg">{err.message}</p>
              </div>
            </div>
          ))}

          {warnings.map((warn, idx) => (
            <div key={`warn-${idx}`} className="issue-item issue-warning">
              <span className="issue-code-pill warn">[CẢNH BÁO]</span>
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
        <h4 className="power-title">Ước Tính Điện Năng (Power Estimate)</h4>

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

            {selectedPsuWattage ? (
              <div className="psu-compare-row">
                <span>Nguồn đã chọn: <strong>{selectedPsuWattage} W</strong></span>
                {selectedPsuWattage < estimatedWattage ? (
                  <span className="badge-error">Thiếu công suất</span>
                ) : selectedPsuWattage < recommendedPsuWattage ? (
                  <span className="badge-warning">Dưới mức tối ưu</span>
                ) : (
                  <span className="badge-success">Đủ công suất an toàn</span>
                )}
              </div>
            ) : (
              <div className="psu-compare-row psu-missing-hint">
                <span className="text-muted text-xs">Gợi ý: Chưa chọn nguồn (PSU) cho dàn máy này.</span>
              </div>
            )}
          </>
        ) : (
          <p className="power-empty-note">Chọn CPU, VGA để ước tính công suất nguồn yêu cầu.</p>
        )}
      </div>

      {/* Rules verification summary */}
      <div className="rules-checklist">
        <h4 className="checklist-title">Quy Chuẩn Phần Cứng Tự Động</h4>
        <ul className="checklist-items">
          <li className="check-item">
            <span className="check-bullet">•</span> CPU ↔ Socket Bo Mạch Chủ
          </li>
          <li className="check-item">
            <span className="check-bullet">•</span> Chuẩn RAM DDR4/DDR5 & Số khe cắm
          </li>
          <li className="check-item">
            <span className="check-bullet">•</span> Chiều dài Card Đồ Họa ↔ Kích thước Case
          </li>
          <li className="check-item">
            <span className="check-bullet">•</span> Chiều cao Tản Nhiệt CPU ↔ Độ rộng Case
          </li>
          <li className="check-item">
            <span className="check-bullet">•</span> Bo Mạch Chủ ↔ Form Factor Thùng Máy
          </li>
          <li className="check-item">
            <span className="check-bullet">•</span> Tổng Công Suất Điện ↔ Nguồn Máy Tính (PSU)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CompatibilityPanel;
