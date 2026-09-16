import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <div className="brand-logo footer-logo">
            <span className="logo-icon">💻</span>
            <span className="logo-text">TECHPC STORE</span>
          </div>
          <p className="footer-desc">
            Hệ thống chuyên cung cấp linh kiện máy tính chính hãng, cấu hình PC Gaming, PC Đồ họa và công cụ Tự Build PC thông minh.
          </p>
        </div>

        <div className="footer-col">
          <h4>Danh mục chính</h4>
          <ul className="footer-links">
            <li><Link to="/products">Linh kiện máy tính</Link></li>
            <li><Link to="/products">Máy tính đồng bộ & Gaming</Link></li>
            <li><Link to="/products">Laptop & Phụ kiện</Link></li>
            <li><Link to="/builder">Công cụ Tự Build PC</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Chăm sóc khách hàng</h4>
          <ul className="footer-links">
            <li><a href="#support">Chính sách bảo hành</a></li>
            <li><a href="#shipping">Phương thức vận chuyển</a></li>
            <li><a href="#returns">Quy định đổi trả</a></li>
            <li><a href="#faq">Câu hỏi thường gặp</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Liên hệ</h4>
          <p>📍 Địa chỉ: Hà Nội, Việt Nam</p>
          <p>📞 Hotline: 1900 xxxx (8:00 - 21:00)</p>
          <p>✉️ Email: support@techpcstore.vn</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} TECHPC STORE. Bản quyền thuộc về đồ án tốt nghiệp / BTL.</p>
        </div>
      </div>
    </footer>
  );
};
