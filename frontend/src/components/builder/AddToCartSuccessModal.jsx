import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AddToCartSuccessModal = ({
  isOpen,
  configurationName,
  itemCount,
  totalPrice,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="save-modal-container add-cart-success-modal elevation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <h3 className="modal-title text-success">Thêm Vào Giỏ Hàng Thành Công</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="save-modal-body">
          <div className="alert alert-success">
            <strong>Đã thêm toàn bộ linh kiện cấu hình PC vào giỏ hàng</strong>
            <p className="mt-1">
              Tất cả {itemCount} linh kiện trong cấu hình đã được đưa vào giỏ hàng của bạn và gắn kết theo bộ cấu hình.
            </p>
          </div>

          <div className="config-meta-info mb-4">
            <span className="text-muted text-sm">Cấu hình:</span>
            <h4 className="font-bold text-lg">{configurationName}</h4>
            <div className="mt-1 text-sm">
              <span>Tổng số linh kiện: <strong>{itemCount} món</strong></span>
              <span className="mx-2">•</span>
              <span>Tổng chi phí: <strong className="text-primary">{formatPrice(totalPrice)}</strong></span>
            </div>
          </div>
        </div>

        <div className="save-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Tiếp tục build
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/cart')}
          >
            Xem giỏ hàng ngay
          </button>
        </div>
      </div>
    </div>
  );
};
