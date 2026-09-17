import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ShareConfigurationModal = ({
  isOpen,
  configurationName,
  shareToken,
  configurationId,
  onAddToCart,
  onBuyNow,
  isCompatible = true,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [acting, setActing] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !shareToken) return null;

  const shareUrl = `${window.location.origin}/builder/share/${shareToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link to clipboard:', err);
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCartClick = async () => {
    if (onAddToCart) {
      setActing(true);
      try {
        await onAddToCart();
      } finally {
        setActing(false);
      }
    }
  };

  const handleBuyNowClick = async () => {
    if (onBuyNow) {
      setActing(true);
      try {
        await onBuyNow();
      } finally {
        setActing(false);
      }
    }
  };

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="save-modal-container share-modal elevation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <h3 className="modal-title">Cấu hình PC đã được lưu thành công</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="save-modal-body">
          <div className="alert alert-success">
            <strong>Đã lưu cấu hình vào mục "Cấu hình đã lưu"!</strong>
            <p className="mt-1">
              Bạn có thể mua cấu hình ngay, thêm vào giỏ hàng hoặc chia sẻ đường dẫn cho người khác.
            </p>
          </div>

          <div className="config-meta-info mb-4">
            <span className="text-muted text-sm">Tên cấu hình:</span>
            <h4 className="font-bold text-lg">{configurationName}</h4>
            <span className="badge badge-builder mt-1">Mã Token: {shareToken}</span>
          </div>

          {/* Action buttons: Mua ngay & Thêm vào giỏ hàng */}
          <div className="saved-config-modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={acting || !isCompatible}
                onClick={handleBuyNowClick}
                style={{ fontWeight: 700, padding: '0.75rem' }}
              >
                Mua cấu hình ngay
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={acting || !isCompatible}
                onClick={handleAddToCartClick}
                style={{ fontWeight: 700, padding: '0.75rem' }}
              >
                Thêm vào giỏ hàng
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                onClose();
                navigate('/saved-configurations');
              }}
              style={{ width: '100%', fontSize: '0.9rem' }}
            >
              Xem danh sách cấu hình đã lưu
            </button>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
              Đường link chia sẻ cho người khác
            </label>
            <div className="copy-input-group">
              <input
                type="text"
                className="form-control"
                value={shareUrl}
                readOnly
              />
              <button
                type="button"
                className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                onClick={handleCopyLink}
              >
                {copied ? 'Đã sao chép' : 'Sao chép link'}
              </button>
            </div>
          </div>
        </div>

        <div className="save-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
