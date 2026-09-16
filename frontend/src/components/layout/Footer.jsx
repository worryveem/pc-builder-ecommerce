import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-columns-grid">
        {/* Brand & Hotline */}
        <div className="footer-col-brand">
          <div className="footer-brand-title">
            TECH<span style={{ color: '#38bdf8' }}>PC</span> STORE
          </div>
          <p className="footer-company-desc">
            Hệ thống bán lẻ linh kiện máy tính, PC Gaming, PC Đồ họa và thiết bị công nghệ hàng đầu. Tích hợp công cụ Tự Build PC thông minh với khả năng kiểm tra tương thích phần cứng theo thời gian thực.
          </p>
          <div className="footer-hotline-badge">
            <span>TỔNG ĐÀI TƯ VẤN MIỄN PHÍ</span>
            <strong>1900 8888</strong>
            <span>(8:00 - 21:30 các ngày trong tuần)</span>
          </div>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4 className="footer-column-heading">Linh Kiện Cốt Lõi</h4>
          <ul className="footer-links-list">
            <li><Link to="/products?category=1">Bộ vi xử lý Intel & AMD</Link></li>
            <li><Link to="/products?category=2">Bo mạch chủ Mainboard</Link></li>
            <li><Link to="/products?category=3">Card màn hình VGA RTX</Link></li>
            <li><Link to="/products?category=4">Bộ nhớ RAM DDR4 & DDR5</Link></li>
            <li><Link to="/products?category=5">Ổ cứng SSD NVMe Gen 4</Link></li>
            <li><Link to="/products?category=7">Nguồn máy tính PSU chuẩn 80 Plus</Link></li>
          </ul>
        </div>

        {/* Customer Support Policies */}
        <div className="footer-col">
          <h4 className="footer-column-heading">Chăm Sóc Khách Hàng</h4>
          <ul className="footer-links-list">
            <li><Link to="/products">Chính sách bảo hành 1 đổi 1</Link></li>
            <li><Link to="/products">Chính sách giao hàng siêu tốc 2h</Link></li>
            <li><Link to="/products">Chính sách đổi trả trong 30 ngày</Link></li>
            <li><Link to="/builder">Hướng dẫn tự chọn cấu hình PC</Link></li>
            <li><Link to="/orders">Tra cứu tình trạng đơn hàng</Link></li>
          </ul>
        </div>

        {/* Showrooms & Contact */}
        <div className="footer-col">
          <h4 className="footer-column-heading">Hệ Thống Cửa Hàng</h4>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <strong style={{ color: 'white', display: 'block' }}>Showroom Hà Nội:</strong>
              <span>Số 182 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội</span>
            </div>
            <div>
              <strong style={{ color: 'white', display: 'block' }}>Showroom TP. Hồ Chí Minh:</strong>
              <span>Số 78-80 Hoàng Hoa Thám, Phường 12, Quận Tân Bình</span>
            </div>
            <div>
              <strong style={{ color: 'white', display: 'block' }}>Email hỗ trợ:</strong>
              <span>cskh@techpcstore.vn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p>&copy; {new Date().getFullYear()} TECHPC STORE. Nền Tảng Thương Mại Điện Tử & Tự Build PC Chuẩn Tương Thích.</p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <span>Thanh toán: COD / VNPAY / Chuyển khoản</span>
            <span>Hàng chính hãng 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
