import React, { useState } from 'react';

export const ShareConfigurationModal = ({
  isOpen,
  configurationName,
  shareToken,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !shareToken) return null;

  const shareUrl = `${window.location.origin}/builder/share/${shareToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy share link to clipboard:', err);
      // Fallback for older browsers
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

  return (
    <div className="selector-modal-backdrop" onClick={onClose}>
      <div className="save-modal-container share-modal elevation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <h3 className="modal-title">Chia Sẻ Cấu Hình PC</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="save-modal-body">
          <div className="alert alert-success">
            <strong>Cấu hình đã sẵn sàng chia sẻ</strong>
            <p className="mt-1">
              Bất kỳ ai có đường link này đều có thể xem cấu hình và nạp vào máy tính của họ để tùy chỉnh tiếp.
            </p>
          </div>

          <div className="config-meta-info mb-4">
            <span className="text-muted text-sm">Tên cấu hình:</span>
            <h4 className="font-bold text-lg">{configurationName}</h4>
            <span className="badge badge-builder mt-1">Mã Token: {shareToken}</span>
          </div>

          <div className="form-group">
            <label>Đường link chia sẻ công khai</label>
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
