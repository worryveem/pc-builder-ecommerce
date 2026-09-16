import React, { useState, useEffect, useCallback } from 'react';
import { builderApi } from '../api/builderApi';
import { SelectedComponentCard } from '../components/builder/SelectedComponentCard';
import { CompatibilityPanel } from '../components/builder/CompatibilityPanel';
import { BuilderSummary } from '../components/builder/BuilderSummary';
import { BuilderProductSelector } from '../components/builder/BuilderProductSelector';

export const BuilderPage = () => {
  const [categories, setCategories] = useState({ coreComponents: [], optionalSetupGear: [] });
  const [selectedComponents, setSelectedComponents] = useState({});
  const [compatibility, setCompatibility] = useState({
    isCompatible: true,
    estimatedWattage: 70,
    recommendedPsuWattage: 88,
    errors: [],
    warnings: []
  });

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // 1. Fetch builder categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setErrorMsg('');
        const res = await builderApi.getCategories();

        if (res?.data) {
          setCategories({
            coreComponents: res.data.coreComponents || [],
            optionalSetupGear: res.data.optionalSetupGear || []
          });
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

  // 2. Validate configuration whenever selectedComponents change
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

  // 3. Selection / Replacement handler
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
      return updated;
    });
  };

  // 4. Removal handler
  const handleRemoveComponent = (categorySlug) => {
    setSelectedComponents(prev => {
      const updated = { ...prev };
      delete updated[categorySlug];
      triggerValidation(updated);
      return updated;
    });
  };

  // 5. Quantity update handler
  const handleUpdateQuantity = (categorySlug, newQuantity) => {
    if (newQuantity < 1) return;

    setSelectedComponents(prev => {
      if (!prev[categorySlug]) return prev;
      const updated = {
        ...prev,
        [categorySlug]: {
          ...prev[categorySlug],
          quantity: newQuantity
        }
      };
      triggerValidation(updated);
      return updated;
    });
  };

  // 6. Reset build handler
  const handleResetBuild = () => {
    if (!window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ cấu hình đang chọn?')) return;
    setSelectedComponents({});
    triggerValidation({});
  };

  if (loadingCategories) {
    return (
      <div className="container loading-container">
        <div className="spinner"></div>
        <p>Đang chuẩn bị hệ thống Tự Build PC...</p>
      </div>
    );
  }

  return (
    <div className="container builder-page">
      {/* Page Header */}
      <div className="page-header builder-header">
        <div className="builder-title-badge">⚡ Real-time Compatibility Engine</div>
        <h1>Xây Dựng Cấu Hình PC Thông Minh</h1>
        <p>Tự do lựa chọn linh kiện phần cứng máy tính với công cụ kiểm tra tương thích tự động và tính toán công suất nguồn thông minh.</p>
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
              onReset={handleResetBuild}
            />
          </div>
        </aside>
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
    </div>
  );
};
