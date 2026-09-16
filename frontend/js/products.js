/**
 * Handles fetching and rendering of products 
 */

async function loadProducts(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetchAPI('/products');
        // Structure expected: { data: [...] }
        const products = response.data || [];
        
        let displayProducts = products;
        if (limit) {
            displayProducts = products.slice(0, limit);
        }

        renderProducts(displayProducts, container);

    } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        container.innerHTML = `<div style="text-align:center; color: red;">Xin lỗi, không thể tải danh sách sản phẩm.</div>`;
    }
}

async function renderProducts(products, container) {
    container.innerHTML = ''; // Clear loading state
    
    if (products.length === 0) {
        container.innerHTML = '<div style="text-align:center; color: var(--text-muted); width: 100%; grid-column: 1 / -1; padding: 3rem;">Không tìm thấy sản phẩm nào phù hợp.</div>';
        return;
    }

    // Check wishlist items for active heart state
    let wishlistIds = new Set();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        guestWishlist.forEach(id => wishlistIds.add(Number(id)));
    } else {
        try {
            const res = await fetchAPI('/wishlist');
            const items = res.data || [];
            items.forEach(item => {
                if (item.productId) wishlistIds.add(Number(item.productId));
                else if (item.product && item.product.id) wishlistIds.add(Number(item.product.id));
            });
        } catch (e) {
            // ignore
        }
    }

    products.forEach(product => {
        // Extract main image from DB relationship
        let mainImg = "https://via.placeholder.com/400x500?text=No+Image";
        if (product.images && product.images.length > 0) {
            const foundMain = product.images.find(img => img.isMain);
            let imgUrl = foundMain ? foundMain.imageUrl : product.images[0].imageUrl;
            mainImg = window.getImageUrl(imgUrl);
        }

        const catName = product.category ? product.category.name : 'Thời trang bé';
        const formattedPrice = formatPrice(product.price);
        const isWishlisted = wishlistIds.has(Number(product.id));

        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                window.location.href = `product.html?id=${product.id}`;
            }
        };

        card.innerHTML = `
            <div class="product-img-wrapper">
                <span class="badge-organic-corner">🌿 100% Organic</span>
                <button type="button" class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                        onclick="toggleWishlist(event, ${product.id})" 
                        title="${isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}">
                    ❤️
                </button>
                <img src="${mainImg}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/400x500?text=KiddieLuxe'">
            </div>
            <div class="product-content">
                <div class="product-category">🧸 ${catName}</div>
                <a href="product.html?id=${product.id}" class="product-name" title="${product.name}">${product.name}</a>
                <div class="product-rating">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span class="count">(4.9)</span>
                </div>
                <div class="product-price-row">
                    <div class="product-price">${formattedPrice}</div>
                    <a href="product.html?id=${product.id}" class="product-add-btn" title="Xem chi tiết & Mua">🛍️</a>
                </div>
                <a href="product.html?id=${product.id}" class="btn btn-soft-primary" style="width: 100%; margin-top: 0.8rem; padding: 0.55rem; font-size: 0.88rem; border-radius: var(--radius-sm); text-align: center; text-decoration: none; display: block;">Xem chi tiết & Mua</a>
            </div>
        `;
        
        container.appendChild(card);
    });
}

async function addToCart(productId, variantId, qty = 1) {
    const qtyInt = parseInt(qty, 10) || 1;
    const token = localStorage.getItem('jwtToken');
    
    if (!variantId || variantId === 'null' || variantId === 'undefined') {
        variantId = 1;
    }

    if (!token) {
        // Guest mode: Save to localStorage
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = guestCart.find(item => item.productId == productId && item.variantId == variantId);
        
        if (existingItem) {
            existingItem.quantity += qtyInt;
        } else {
            // Need product info for guest cart display
            try {
                const res = await fetchAPI(`/products/${productId}`);
                const product = (res && res.data) ? res.data : res;
                let variant = null;
                if (product && product.productVariants && product.productVariants.length > 0) {
                    variant = product.productVariants.find(v => v.id == variantId) || product.productVariants[0];
                } else {
                    variant = {
                        id: Number(variantId) || 1,
                        size: { id: 1, name: 'FreeSize (0-12M)' },
                        stockQuantity: 100
                    };
                }

                guestCart.push({
                    productId: Number(productId),
                    variantId: Number(variantId) || 1,
                    quantity: qtyInt,
                    // Store in a structure consistent with backend DTOs
                    productVariantResponse: {
                        ...variant,
                        productResponse: product
                    }
                });
            } catch (err) {
                console.error(err);
                showToast('Lỗi khi lấy thông tin sản phẩm', 'error');
                return;
            }
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        showToast('Đã thêm vào giỏ hàng thành công! 🎉', 'success');
        updateCartCount();
        return;
    }

    try {
        await fetchAPI(`/user/cart/items?productId=${productId}&variantId=${variantId}&quantity=${qtyInt}`, {
            method: 'POST'
        });
        showToast(`Đã thêm vào giỏ hàng thành công! 🎉`, 'success');
        updateCartCount(); 
    } catch (error) {
        console.warn('Backend cart item add failed, falling back to local cart:', error);
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = guestCart.find(item => item.productId == productId && item.variantId == variantId);
        if (existingItem) {
            existingItem.quantity += qtyInt;
        } else {
            const res = await fetchAPI(`/products/${productId}`);
            const product = (res && res.data) ? res.data : res;
            let variant = { id: Number(variantId) || 1, size: { id: 1, name: 'FreeSize' } };
            if (product && product.productVariants && product.productVariants.length > 0) {
                variant = product.productVariants.find(v => v.id == variantId) || product.productVariants[0];
            }
            guestCart.push({
                productId: Number(productId),
                variantId: Number(variantId) || 1,
                quantity: qtyInt,
                productVariantResponse: { ...variant, productResponse: product }
            });
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        showToast('Đã thêm vào giỏ hàng thành công! 🎉', 'success');
        updateCartCount();
    }
}

// Quick View Modal JS
window.showQuickView = async function(productId) {
    try {
        const res = await fetchAPI(`/products/${productId}`);
        const product = res.data;
        if (!product) return;

        let modal = document.getElementById('quick-view-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quick-view-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const images = product.images || [];
        const mainImg = images.length > 0 ? window.getImageUrl(images[0].imageUrl) : "https://via.placeholder.com/400x500";
        
        const thumbHtml = images.map((img, i) => `
            <img src="${window.getImageUrl(img.imageUrl)}" 
                 class="modal-thumb ${i===0?'active':''}" 
                 onclick="changeModalMainImg(this)">
        `).join('');

        const variants = product.productVariants || [];
        const sizeHtml = variants.map((v, i) => `
            <div class="size-item ${i===0?'active':''}" data-variant-id="${v.id}" data-stock="${v.stockQuantity || 0}" onclick="selectVariant(this)">
                ${v.size ? v.size.name : 'FreeSize'}
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="closeModal()">&times;</span>
                <div class="modal-left">
                    <img id="modal-main-img" src="${mainImg}" class="modal-img-main" onerror="this.src='https://via.placeholder.com/400x500'">
                    <div class="modal-thumbnails">${thumbHtml}</div>
                </div>
                <div class="modal-right">
                    <div class="product-category" style="margin-bottom: 0.5rem; color: var(--accent); font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">${product.category ? product.category.name : 'LUXE FW KIDS'}</div>
                    <h2 style="font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif; font-size: 1.8rem; font-weight: 700; color: #0f172a; margin-bottom: 0.8rem; text-transform: none; letter-spacing: -0.02em; line-height: 1.3;">${product.name}</h2>
                    <div class="product-price" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.8rem; margin-bottom: 1.5rem; color: var(--accent); font-weight: 700;">${formatPrice(product.price)}</div>
                    
                    <p style="color: var(--text-muted); margin-bottom: 2rem; line-height: 1.8; font-size: 1.05rem;">
                        ${product.description || 'Dòng sản phẩm thời trang cao cấp với chất liệu tự nhiên, an toàn tuyệt đối cho làn da bé, mang lại vẻ ngoài sành điệu và tự tin.'}
                    </p>

                    <div style="font-weight: 700; margin-bottom: 1rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">CHỌN KÍCH CỠ:</div>
                    <div class="size-grid">${sizeHtml}</div>

                    <div id="stock-display" style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.95rem;"></div>

                    <div style="font-weight: 700; margin-bottom: 1rem;">SỐ LƯỢNG:</div>
                    <div class="qty-box">
                        <input type="number" id="quick-qty" class="qty-input" value="1" min="1" oninput="validateQty(this)">
                    </div>

                    <button class="btn btn-primary" style="width: 100%; padding: 1.5rem; font-size: 1.2rem; border-radius: var(--radius-sm);" 
                            onclick="addToCartFromModal(${product.id})">
                        THÊM VÀO GIỎ HÀNG
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 

        const activeSize = document.querySelector('.size-item.active');
        if (activeSize) {
            selectVariant(activeSize);
        }

    } catch (err) {
        console.error(err);
        showToast("Không thể tải chi tiết sản phẩm.", "error");
    }
}

window.closeModal = function() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

window.changeModalMainImg = function(thumb) {
    const main = document.getElementById('modal-main-img');
    if (main) main.src = thumb.src;
    document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

window.selectVariant = function(el) {
    document.querySelectorAll('.size-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    const stock = parseInt(el.getAttribute('data-stock') || 0);
    const stockDisplay = document.getElementById('stock-display');
    const qtyInput = document.getElementById('quick-qty');
    
    if (stockDisplay) {
        stockDisplay.innerText = stock > 0 ? `Còn lại: ${stock} sản phẩm` : 'Hết hàng';
    }
    
    if (qtyInput) {
        qtyInput.max = stock;
        if (parseInt(qtyInput.value) > stock) {
            qtyInput.value = stock;
        }
    }
}

window.validateQty = function(input) {
    if (!input) return;
    const rawVal = input.value;
    if (rawVal === '') return; // Allow user typing/clearing
    let val = parseInt(rawVal, 10);
    if (isNaN(val) || val < 1) {
        input.value = 1;
        return;
    }
    const maxAttr = input.getAttribute('max');
    if (maxAttr) {
        const maxVal = parseInt(maxAttr, 10);
        if (!isNaN(maxVal) && maxVal > 0 && val > maxVal) {
            input.value = maxVal;
            if (typeof showToast === 'function') {
                showToast(`Số lượng tối đa có sẵn là ${maxVal}`, 'warning');
            }
        }
    }
};

window.ensureValidQty = function(input) {
    if (!input) return;
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1) {
        input.value = 1;
    }
};

window.addToCartFromModal = function(productId) {
    const activeSize = document.querySelector('.size-item.active');
    const variantId = activeSize ? activeSize.getAttribute('data-variant-id') : null;
    const stock = activeSize ? parseInt(activeSize.getAttribute('data-stock') || 0) : 0;
    const qty = document.getElementById('quick-qty').value;
    
    if (parseInt(qty) > stock) {
        showToast(`Số lượng yêu cầu vượt quá số lượng có sẵn (${stock})`, 'warning');
        return;
    }
    
    addToCart(productId, variantId, qty);
    closeModal();
}

// Search & Filter
window.handleSearch = async function() {
    const input = document.getElementById('search-input');
    const name = input ? input.value.trim() : "";
    const grid = document.getElementById('products-grid') || document.getElementById('new-products');
    
    if (!grid) return;
    grid.innerHTML = '<div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem;">Đang tìm kiếm...</div>';

    try {
        const res = await fetchAPI(`/products/search?name=${encodeURIComponent(name)}`);
        renderProducts(res.data || [], grid);
    } catch (err) {
        showToast("Lỗi tìm kiếm sản phẩm", "error");
    }
}

window.applyFilters = async function() {
    const minInput = document.getElementById('min-price');
    const maxInput = document.getElementById('max-price');
    const priceRadio = document.querySelector('input[name="price"]:checked');
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem;">Đang lọc sản phẩm...</div>';
    
    let minPrice = 0;
    let maxPrice = 999999999;

    let useRadio = true;

    if (minInput && minInput.value || maxInput && maxInput.value) {
        useRadio = false;
        minPrice = parseInt(minInput.value) || 0;
        maxPrice = parseInt(maxInput.value) || 999999999;
        
        // Uncheck radios
        document.querySelectorAll('input[name="price"]').forEach(r => r.checked = false);
    } else if (priceRadio) {
        if (priceRadio.value === 'under50') maxPrice = 50000;
        else if (priceRadio.value === '50to100') { minPrice = 50000; maxPrice = 100000; }
        else if (priceRadio.value === '100to200') { minPrice = 100000; maxPrice = 200000; }
        else if (priceRadio.value === 'over200') minPrice = 200000;
    }

    try {
        let res;
        if (useRadio && (!priceRadio || priceRadio.value === 'all')) {
            res = await fetchAPI('/products');
        } else {
            const resData = await fetchAPI(`/products/filter?minPrice=${minPrice}&maxPrice=${maxPrice}`);
            res = resData; 
        }
        renderProducts(res.data || res || [], grid);
        showToast("Đã áp dụng bộ lọc.", "success");
    } catch (err) {
        console.error(err);
        showToast("Lỗi khi lọc sản phẩm.", "error");
        grid.innerHTML = '<div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem; color: red;">Lỗi khi lọc sản phẩm.</div>';
    }
}

window.resetFilters = function() {
    const priceRadioAll = document.querySelector('input[name="price"][value="all"]');
    if (priceRadioAll) priceRadioAll.checked = true;
    
    const minInput = document.getElementById('min-price');
    const maxInput = document.getElementById('max-price');
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    const catAll = document.querySelector('input[name="category"][value="all"]');
    if (catAll) catAll.checked = true;

    applyFilters();
};

let allLoadedProducts = [];

window.loadCategoriesFilter = async function() {
    const list = document.getElementById('category-filter-list');
    if (!list) return;

    try {
        const res = await fetchAPI('/categories');
        const categories = res.data || [];
        
        let html = `<li><label><input type="radio" name="category" value="all" checked onchange="filterByCategory('all')"> Tất cả danh mục</label></li>`;
        categories.forEach(cat => {
            html += `<li><label><input type="radio" name="category" value="${cat.id}" onchange="filterByCategory(${cat.id})"> ${cat.name}</label></li>`;
        });
        list.innerHTML = html;

        // Check if URL has ?category=
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('category');
        if (catParam) {
            const targetRadio = document.querySelector(`input[name="category"][value="${catParam}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
                setTimeout(() => filterByCategory(catParam), 300);
            }
        }
    } catch(e) {
        console.error("Lỗi tải danh mục:", e);
    }
};

window.filterByCategory = async function(catId) {
    const grid = document.getElementById('products-grid') || document.getElementById('new-products');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem;">Đang tải danh mục...</div>';

    try {
        let products = [];
        if (catId === 'all') {
            const res = await fetchAPI('/products');
            products = res.data || [];
        } else {
            try {
                const res = await fetchAPI(`/products/category/${catId}`);
                products = res.data || [];
            } catch (err) {
                // Fallback to client filter
                const res = await fetchAPI('/products');
                products = (res.data || []).filter(p => {
                    if (p.categoryId && p.categoryId == catId) return true;
                    if (p.category && p.category.id == catId) return true;
                    return false;
                });
            }
        }

        renderProducts(products, grid);
    } catch (e) {
        console.error(e);
        showToast("Lỗi lọc danh mục", "error");
    }
};

// Auto call loadCategoriesFilter when on products.html
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('category-filter-list')) {
        loadCategoriesFilter();
    }
});
