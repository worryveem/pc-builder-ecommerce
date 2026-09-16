import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const PlaceholderPage = ({ title }) => {
  const location = useLocation();
  const pageTitle = title || location.pathname.replace('/', '').toUpperCase();

  return (
    <div className="container placeholder-page">
      <div className="placeholder-card">
        <span className="placeholder-icon">🚧</span>
        <h1>{pageTitle}</h1>
        <p className="subtitle">
          Khu vực chức năng này đang được phát triển và sẽ được hoàn thiện trong các phase tiếp theo.
        </p>
        <div className="placeholder-actions">
          <Link to="/" className="btn btn-primary">Về trang chủ</Link>
          <Link to="/products" className="btn btn-outline">Xem sản phẩm</Link>
        </div>
      </div>
    </div>
  );
};
