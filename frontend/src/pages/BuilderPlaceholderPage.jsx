import React from 'react';
import { Link } from 'react-router-dom';

export const BuilderPlaceholderPage = () => {
  return (
    <div className="container placeholder-page">
      <div className="placeholder-card">
        <span className="placeholder-icon">⚡</span>
        <h1>Công Cụ Tự Build PC Thông Minh</h1>
        <p className="subtitle">
          Tính năng Tự Build PC với động cơ kiểm tra tương thích phần cứng theo thời gian thực (Real-time Hardware Compatibility Engine) đang được chuẩn bị phát hành trong <strong>Phase 4</strong>.
        </p>
        <div className="features-preview">
          <div className="preview-item">
            <span>✅</span> Tự động kiểm tra tương thích Socket CPU ↔ Bo mạch chủ
          </div>
          <div className="preview-item">
            <span>✅</span> So khớp chuẩn RAM DDR4/DDR5, giới hạn dung lượng và số khe cắm
          </div>
          <div className="preview-item">
            <span>✅</span> Tính toán công suất nguồn (PSU) và khuyến nghị an toàn
          </div>
          <div className="preview-item">
            <span>✅</span> Kiểm tra kích thước card đồ họa & chiều cao tản nhiệt với vỏ case
          </div>
          <div className="preview-item">
            <span>✅</span> Lưu cấu hình, chia sẻ qua Token và thêm toàn bộ cấu hình vào giỏ hàng
          </div>
        </div>
        <div className="placeholder-actions">
          <Link to="/products" className="btn btn-primary">Khám phá linh kiện</Link>
          <Link to="/" className="btn btn-outline">Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
};
