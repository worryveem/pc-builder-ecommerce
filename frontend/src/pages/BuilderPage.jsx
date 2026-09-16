import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { builderApi } from '../api/builderApi';
import { useAuth } from '../context/AuthContext';
import { SelectedComponentCard } from '../components/builder/SelectedComponentCard';
import { CompatibilityPanel } from '../components/builder/CompatibilityPanel';
import { BuilderSummary } from '../components/builder/BuilderSummary';
import { BuilderProductSelector } from '../components/builder/BuilderProductSelector';
import { SaveConfigurationModal } from '../components/builder/SaveConfigurationModal';
import { ShareConfigurationModal } from '../components/builder/ShareConfigurationModal';
import { AddToCartSuccessModal } from '../components/builder/AddToCartSuccessModal';

export const BuilderPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState({ coreComponents: [], optionalSetupGear: [] });
  const [selectedComponents, setSelectedComponents] = useState({});
  const [compatibility, setCompatibility] = useState({
    isCompatible: true,
    estimatedWattage: 70,
    recommendedPsuWattage: 88,
    errors: [],
    warnings: []
  });

  const [configurationId, setConfigurationId] = useState(null);
  const [configurationName, setConfigurationName] = useState('Untitled PC Build');
  const [shareToken, setShareToken] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddToCartSuccessOpen, setIsAddToCartSuccessOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Validate configuration whenever components change
  const triggerValidation = useCallback(async (currentSelected) => {
    const items = Object.values(currentSelected || {})
      .filter(item => item && item.product)
      .map(item => ({
        productId: item.product.id,
        quantity: item.quantity || 1
      }));

    try {
      setValidating(true);
      const res = await builderApi.validateConfiguration(items);
      if (res?.data) {
        setCompatibility(res.data);
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  }, []);

  // 2. Fetch builder categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setErrorMsg('');
        const res = await builderApi.getCategories();

        if (res?.data) {
          const core = res.data.coreComponents || [];
          const opt = res.data.optionalSetupGear || [];
          setCategories({ coreComponents: core, optionalSetupGear: opt });
        }
      } catch (err) {
        console.error('Failed to load builder categories:', err);
        setErrorMsg('Không thể nạp danh mục linh kiện builder từ máy chủ. Vui lòng kiểm tra lại kết nối.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // 3. Load configuration if id param exists or imported from shared page
  useEffect(() => {
    const loadConfig = async () => {
      // Case A: Imported from shared configuration page via location.state
      if (location.state?.importedConfig) {
        const imported = location.state.importedConfig;
        setConfigurationName(imported.name ? `${imported.name} (Tùy chỉnh)` : 'Cấu hình PC tùy chỉnh');
        setConfigurationId(null); // New copy to customize and save
        setShareToken(null);

        const newSelected = {};
        (imported.items || []).forEach(item => {
          const prod = item.product;
          const slug = prod?.category?.slug;
          if (slug && prod) {
            newSelected[slug] = {
              product: prod,
              quantity: item.quantity || 1
            };
          }
        });

        setSelectedComponents(newSelected);
        triggerValidation(newSelected);
        setIsDirty(true); // Imported configuration is considered unsaved until user saves it
        return;
      }

      // Case B: Load saved configuration by ID
      if (id) {
        try {
          const res = await builderApi.getConfiguration(id);
          if (res?.data) {
            const data = res.data;
            setConfigurationId(data.id);
            setConfigurationName(data.name || 'Cấu hình PC đã lưu');
            setShareToken(data.shareToken || null);

            const newSelected = {};
            (data.items || []).forEach(item => {
              const prod = item.product;
              const slug = prod?.category?.slug;
              if (slug && prod) {
                newSelected[slug] = {
                  product: prod,
                  quantity: item.quantity || 1
                };
              }
            });

            setSelectedComponents(newSelected);
            triggerValidation(newSelected);
            setIsDirty(false); // Clean saved configuration
          }
        } catch (err) {
          console.error('Failed to load configuration by id:', err);
          setErrorMsg('Không thể tải cấu hình đã lưu. Có thể cấu hình không tồn tại hoặc bạn không có quyền truy cập.');
        }
      }
    };

    loadConfig();
  }, [id, location.state, triggerValidation]);

  // 4. Selection / Replacement handler
  const handleSelectProduct = (product) => {
    if (!activeCategory) return;

    setSelectedComponents(prev => {
      const updated = {
        ...prev,
        [activeCategory.slug]: {
          product,
          quantity: prev[activeCategory.slug]?.quantity || 1
        }
      };
      triggerValidation(updated);
      setIsDirty(true);
      return updated;
    });
  };

  // 5. Removal handler
  const handleRemoveComponent = (categorySlug) => {
    setSelectedComponents(prev => {
      const updated = { ...prev };
      delete updated[categorySlug];
      triggerValidation(updated);
      setIsDirty(true);
      return updated;
    });
  };

  // 6. Quantity update handler
  const handleUpdateQuantity = (categorySlug, newQuantity) => {
    if (newQuantity < 1) return;

    setSelectedComponents(prev => {
      const current = prev[categorySlug];
      if (!current) return prev;

      const updated = {
        ...prev,
        [categorySlug]: {
          ...current,
          quantity: newQuantity
        }
      };
      triggerValidation(updated);
      setIsDirty(true);
      return updated;
    });
  };

  // 7. Reset build handler
  const handleResetBuild = () => {
    if (!window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ cấu hình đang chọn?')) return;
    setSelectedComponents({});
    setConfigurationId(null);
    setShareToken(null);
    setConfigurationName('Untitled PC Build');
    setIsDirty(false);
    triggerValidation({});
  };

  // 8. Open Save / Update modal
  const handleOpenSaveModal = () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập tài khoản để lưu cấu hình PC. Chuyển đến trang Đăng nhập ngay?')) {
        navigate('/login', { state: { from: location } });
      }
      return;
    }
    setIsSaveModalOpen(true);
  };

  // 9. Execute Save or Update
  const handleSaveConfiguration = async (name) => {
    const items = Object.values(selectedComponents)
      .filter(i => i && i.product)
      .map(i => ({
        productId: i.product.id,
        quantity: i.quantity || 1
      }));

    try {
      setSaving(true);
      setErrorMsg('');

      let res;
      if (configurationId) {
        // Update existing configuration
        res = await builderApi.updateConfiguration(configurationId, { name, items });
      } else {
        // Save brand new configuration
        res = await builderApi.saveConfiguration({ name, items });
      }

      if (res?.data) {
        setConfigurationId(res.data.id);
        setConfigurationName(res.data.name);
        setShareToken(res.data.shareToken);
        setIsDirty(false); // Saved successfully

        setIsSaveModalOpen(false);
        setIsShareModalOpen(true); // Open share modal to show success & copy link
      }
    } catch (err) {
      console.error('Failed to save configuration:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình. Vui lòng thử lại.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // 10. Add to Cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập tài khoản để thêm cấu hình vào giỏ hàng. Chuyển đến trang Đăng nhập ngay?')) {
        navigate('/login', { state: { from: location } });
      }
      return;
    }

    if (!configurationId) {
      setErrorMsg('Vui lòng lưu cấu hình trước khi thêm vào giỏ hàng.');
      return;
    }

    // A. Validate compatibility (Hard check: cannot add if there are ERRORs)
    if (compatibility?.errors && compatibility.errors.length > 0) {
      setErrorMsg('Không thể thêm cấu hình vào giỏ hàng. Cấu hình hiện tại có linh kiện không tương thích phần cứng.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    // B. Check if configuration has unsaved changes
    if (isDirty) {
      if (window.confirm('Cấu hình đã có thay đổi linh kiện chưa được lưu. Bạn có muốn cập nhật cấu hình trước khi thêm vào giỏ hàng không?')) {
        setIsSaveModalOpen(true);
        return;
      }
    }

    // C. Call backend add-to-cart API
    try {
      setAddingToCart(true);
      setErrorMsg('');
      await builderApi.addConfigurationToCart(configurationId);
      setIsAddToCartSuccessOpen(true);
    } catch (err) {
      console.error('Failed to add configuration to cart:', err);
      const msg = err.response?.data?.message || 'Không thể thêm cấu hình vào giỏ hàng. Vui lòng kiểm tra lại số lượng tồn kho hoặc thử lại sau.';
      setErrorMsg(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang chuẩn bị hệ thống Tự Build PC...</p>
      </div>
    );
  }

  const coreItemsCount = categories.coreComponents.filter(c => selectedComponents[c.slug]?.product).length;
  const totalBuilderPrice = Object.values(selectedComponents)
    .filter(i => i && i.product)
    .reduce((s, i) => s + (i.product.price || 0) * (i.quantity || 1), 0);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="container builder-page">
      {/* Page Header */}
      <div className="page-header builder-header">
        <div className="builder-header-top">
          <div className="builder-title-badge">HARDWARE COMPATIBILITY ENGINE</div>
          {configurationId && (
            <span className="badge badge-builder">
              ĐÃ LƯU CẤU HÌNH (#{configurationId})
            </span>
          )}
        </div>
        <h1>PC Builder</h1>
        <p className="builder-subtitle">
          Tự do tùy chọn cấu hình linh kiện máy tính phù hợp với nhu cầu và ngân sách của bạn.
          {configurationName && configurationName !== 'Untitled PC Build' && (
            <span className="current-build-name"> — <em>{configurationName}</em></span>
          )}
        </p>

        {/* 8-Component Hardware Step Indicator */}
        <div className="builder-core-stepper-wrap elevation-sm">
          <div className="stepper-summary-info">
            <div className="stepper-summary-left">
              <span className="stepper-title">Tiến độ cấu hình:</span>
              <span className="stepper-counter">{coreItemsCount} / 8 linh kiện cốt lõi</span>
            </div>
            <div className="stepper-quick-jump">
              <select
                className="form-control stepper-jump-select"
                value=""
                onChange={(e) => {
                  const targetCat = (categories.coreComponents || []).find(c => c.slug === e.target.value) || 
                                    (categories.optionalSetupGear || []).find(c => c.slug === e.target.value);
                  if (targetCat) setActiveCategory(targetCat);
                }}
                aria-label="Chọn nhanh linh kiện"
              >
                <option value="" disabled>Chọn nhanh linh kiện...</option>
                <optgroup label="Linh kiện cốt lõi (8 bước)">
                  {(categories.coreComponents || []).map((cat, idx) => (
                    <option key={cat.slug} value={cat.slug}>
                      {idx + 1}. {cat.name} {selectedComponents[cat.slug]?.product ? '✓' : '(Chưa chọn)'}
                    </option>
                  ))}
                </optgroup>
                {(categories.optionalSetupGear || []).length > 0 && (
                  <optgroup label="Thiết bị ngoại vi & Setup">
                    {categories.optionalSetupGear.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        + {cat.name} {selectedComponents[cat.slug]?.product ? '✓' : '(Chưa chọn)'}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          <div className="stepper-progress-track">
            <div
              className="stepper-progress-fill"
              style={{ width: `${Math.round((coreItemsCount / 8) * 100)}%` }}
            ></div>
          </div>

          <div className="builder-core-steps">
            {(categories.coreComponents || []).map((cat, idx) => {
              const isSelected = !!selectedComponents[cat.slug]?.product;
              return (
                <div
                  key={cat.id || cat.slug}
                  className={`core-step-pill ${isSelected ? 'pill-completed' : 'pill-empty'}`}
                  title={`${cat.name}: ${isSelected ? selectedComponents[cat.slug].product.name : 'Chưa chọn'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span className="pill-idx">{idx + 1}</span>
                  <span className="pill-name">{cat.builderComponentType || cat.name}</span>
                  <span className="pill-status">{isSelected ? '✓' : '+'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="builder-main-layout">
        {/* Left Column: Component Slots */}
        <div className="builder-slots-container">
          {/* Section A: Core Components */}
          <div className="slot-section">
            <div className="slot-section-title">
              <h2>Linh Kiện Cốt Lõi (Core Hardware)</h2>
              <span className="section-note">Bắt buộc tham gia kiểm tra tương thích socket, kích thước và nguồn</span>
            </div>

            <div className="slots-list">
              {categories.coreComponents.map(cat => (
                <SelectedComponentCard
                  key={cat.id || cat.slug}
                  category={cat}
                  selectedItem={selectedComponents[cat.slug]}
                  onOpenSelector={selectedCat => setActiveCategory(selectedCat)}
                  onRemove={handleRemoveComponent}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>

          {/* Section B: Optional Setup Gear */}
          {categories.optionalSetupGear.length > 0 && (
            <div className="slot-section optional-section">
              <div className="slot-section-title">
                <h2>Thiết Bị Ngoại Vi & Setup (Optional Gear)</h2>
                <span className="section-note">Màn hình, bàn phím, chuột, tai nghe (Không ảnh hưởng tương thích phần cứng)</span>
              </div>

              <div className="slots-list">
                {categories.optionalSetupGear.map(cat => (
                  <SelectedComponentCard
                    key={cat.id || cat.slug}
                    category={cat}
                    selectedItem={selectedComponents[cat.slug]}
                    onOpenSelector={selectedCat => setActiveCategory(selectedCat)}
                    onRemove={handleRemoveComponent}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Compatibility & Summary Sticky Sidebar */}
        <aside className="builder-sidebar-column">
          <div className="builder-sticky-sidebar">
            <CompatibilityPanel
              compatibility={compatibility}
              selectedComponents={selectedComponents}
              validating={validating}
            />

            <BuilderSummary
              selectedComponents={selectedComponents}
              compatibility={compatibility}
              onReset={handleResetBuild}
              onOpenSave={handleOpenSaveModal}
              onOpenShare={() => setIsShareModalOpen(true)}
              onAddToCart={handleAddToCart}
              configurationId={configurationId}
              shareToken={shareToken}
              saving={saving}
              addingToCart={addingToCart}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Floating Bar */}
      <div className="builder-mobile-floating-bar elevation-modal">
        <div className="mobile-bar-info">
          <div className="mobile-bar-qty">{coreItemsCount}/8 linh kiện</div>
          <div className="mobile-bar-price">{formatVND(totalBuilderPrice)}</div>
        </div>
        <div className="mobile-bar-actions">
          {configurationId ? (
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={handleAddToCart}
              disabled={coreItemsCount === 0 || addingToCart || !compatibility?.isCompatible}
            >
              {addingToCart ? 'Đang thêm...' : 'Vào giỏ'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleOpenSaveModal}
              disabled={coreItemsCount === 0 || saving}
            >
              Lưu cấu hình
            </button>
          )}
        </div>
      </div>

      {/* Product Selector Modal */}
      {activeCategory && (
        <BuilderProductSelector
          category={activeCategory}
          selectedComponents={selectedComponents}
          currentProduct={selectedComponents[activeCategory.slug]?.product}
          onSelectProduct={handleSelectProduct}
          onClose={() => setActiveCategory(null)}
        />
      )}

      {/* Save / Update Configuration Modal */}
      <SaveConfigurationModal
        isOpen={isSaveModalOpen}
        currentName={configurationName}
        isUpdate={!!configurationId}
        compatibility={compatibility}
        onSave={handleSaveConfiguration}
        onClose={() => setIsSaveModalOpen(false)}
        saving={saving}
      />

      {/* Share Configuration Modal */}
      <ShareConfigurationModal
        isOpen={isShareModalOpen}
        configurationName={configurationName}
        shareToken={shareToken}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Add to Cart Success Modal */}
      <AddToCartSuccessModal
        isOpen={isAddToCartSuccessOpen}
        configurationName={configurationName}
        itemCount={Object.values(selectedComponents).filter(i => i && i.product).reduce((s, i) => s + (i.quantity || 1), 0)}
        totalPrice={Object.values(selectedComponents).filter(i => i && i.product).reduce((s, i) => s + (i.product.price || 0) * (i.quantity || 1), 0)}
        onClose={() => setIsAddToCartSuccessOpen(false)}
      />
    </div>
  );
};
