document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

async function loadCart() {
    const container = document.getElementById('cart-content');
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        // Guest mode
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 5rem 0;">
                    <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Giỏ hàng trống</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.2rem;">Hãy ghé thăm Cửa hàng để thêm các sản phẩm tuyệt vời nhé!</p>
                    <a href="products.html" class="btn btn-primary" style="padding: 1.2rem 3rem;">Khám phá Sản phẩm</a>
                </div>
            `;
            return;
        }
        // Wrapping guest data into a DTO-like object
        renderCart({ items: guestCart }, container);
        return;
    }

    try {
        const response = await fetchAPI('/user/cart');
        const cart = response.data;
        
        if (!cart || !cart.items || cart.items.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 5rem 0;">
                    <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Giỏ hàng trống</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.2rem;">Hãy ghé thăm Cửa hàng để thêm các sản phẩm tuyệt vời nhé!</p>
                    <a href="products.html" class="btn btn-primary" style="padding: 1.2rem 3rem;">Khám phá Sản phẩm</a>
                </div>
            `;
            return;
        }

        renderCart(cart, container);
    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem 0; color: red;">
                Không thể tải thông tin giỏ hàng. <br> Vui lòng thử đăng nhập lại.
            </div>
        `;
    }
}

function renderCart(cart, container) {
    let itemsHtml = '';
    
    // Iterate over CartItemDTO
    cart.items.forEach(item => {
        // Extract from DTO hierarchy
        const prodVariant = item.productVariantResponse || {};
        const prodInfo = prodVariant.productResponse || {};
        
        const productName = prodInfo.name || ('Trang phục bé ' + (item.productId || ''));
        const price = prodInfo.price || 0;
        
        // Determination of ID for deletion/checking
        const itemId = item.id || item.variantId || (prodVariant ? prodVariant.id : null);
        
        let mainImg = "https://via.placeholder.com/150";
        if (prodInfo.images && prodInfo.images.length > 0) {
            let imgObj = prodInfo.images[0]; 
            mainImg = window.getImageUrl(imgObj.imageUrl);
        }
        
        const itemTotal = price * item.quantity;
        
        // Extract size name
        const sizeName = (prodVariant.size && prodVariant.size.name) || 'FreeSize';

        itemsHtml += `
            <tr>
                <td style="width: 40px; text-align: center;">
                    <input type="checkbox" class="cart-item-check" data-id="${itemId}" data-price="${itemTotal}" checked onchange="updateTotal()">
                </td>
                <td>
                    <div class="cart-item-info">
                        <img src="${mainImg}" alt="${productName}" class="cart-item-img">
                        <div>
                            <div class="cart-item-title">${productName}</div>
                            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem;">
                                <span style="background: var(--primary-light); color: var(--primary); font-weight: 700; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px;">Size: ${sizeName}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 700; color: var(--text-main);">${formatPrice(price)}</td>
                <td style="text-align: center;">
                    <div class="cart-qty-stepper">
                        <button type="button" class="cart-qty-btn" onclick="changeCartItemQuantity('${itemId}', -1, ${price})">-</button>
                        <input type="number" class="cart-qty-input" id="cart-qty-${itemId}" value="${item.quantity}" min="1" max="99" 
                               oninput="handleCartQtyInput(this)" 
                               onblur="handleCartQtyBlur(this, '${itemId}', ${price})">
                        <button type="button" class="cart-qty-btn" onclick="changeCartItemQuantity('${itemId}', 1, ${price})">+</button>
                    </div>
                </td>
                <td style="font-weight: 800; color: var(--primary); font-size: 1.05rem;" id="item-total-${itemId}">${formatPrice(itemTotal)}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.85rem; color: #e74c3c; border-color: #fca5a5;" onclick="removeCartItem('${itemId}')">Xóa</button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="freeship-meter-box" id="freeship-meter">
            <div id="freeship-text" style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                🚚 Đang tính toán phí vận chuyển...
            </div>
            <div class="freeship-progress">
                <div class="freeship-progress-bar" id="freeship-bar" style="width: 0%;"></div>
            </div>
        </div>

        <table class="cart-table">
            <thead>
                <tr>
                    <th style="width: 40px; text-align: center;"><input type="checkbox" id="check-all" checked onchange="toggleAllCheckboxes()"></th>
                    <th>Sản phẩm cho bé</th>
                    <th>Đơn giá</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 2rem; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; gap: 0.8rem;">
                <button class="btn btn-outline" style="color: #e74c3c; border-color: #fca5a5; font-size: 0.9rem;" onclick="deleteSelectedItems()">Xóa mục đã chọn</button>
                <button class="btn btn-outline" style="color: #64748b; font-size: 0.9rem;" onclick="clearEntireCart()">🗑️ Xóa sạch giỏ hàng</button>
            </div>
            <div class="cart-summary">
                <h3 style="margin-bottom: 0.6rem; font-size: 1.15rem;">CỘNG GIỎ HÀNG:</h3>
                <div class="summary-row" style="margin-bottom: 0.5rem;">
                    <span>Tạm tính tiền hàng:</span>
                    <span id="cart-total-price" style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">0 đ</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem;">
                    * Phí giao hàng & mã giảm giá sẽ được áp dụng tại bước Thanh Toán.
                </div>
                <button class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: var(--radius-sm);" onclick="proceedToCheckout()">
                    Tiến hành đặt hàng &rarr;
                </button>
            </div>
        </div>
    `;
    
    updateTotal();
}

window.proceedToCheckout = function() {
    window.location.href = 'checkout.html';
}

window.toggleAllCheckboxes = function() {
    const isChecked = document.getElementById('check-all').checked;
    const checkboxes = document.querySelectorAll('.cart-item-check');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
    updateTotal();
}

window.updateTotal = function() {
    let sum = 0;
    const checkboxes = document.querySelectorAll('.cart-item-check');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            sum += parseFloat(cb.getAttribute('data-price')) || 0;
        }
    });
    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) {
        totalEl.innerText = formatPrice(sum);
    }

    // Update freeship meter
    const freeshipText = document.getElementById('freeship-text');
    const freeshipBar = document.getElementById('freeship-bar');
    if (freeshipText && freeshipBar) {
        const threshold = 300000;
        const pct = Math.min(100, Math.round((sum / threshold) * 100));
        freeshipBar.style.width = `${pct}%`;
        if (sum >= threshold) {
            freeshipText.innerHTML = '🎉 Chúc mừng ba mẹ! Đơn hàng của bé được <strong>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</strong>! 🚚';
        } else {
            freeshipText.innerHTML = `🚚 Mua thêm <strong>${formatPrice(threshold - sum)}</strong> để nhận <strong>MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</strong>!`;
        }
    }
}

async function removeCartItem(itemId) {
    if(!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Guest mode
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        guestCart = guestCart.filter(item => item.variantId != itemId);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        showToast('Đã xóa sản phẩm.', 'success');
        loadCart();
        updateCartCount();
        return;
    }

    try {
        await fetchAPI(`/user/cart/items/${itemId}`, { method: 'DELETE' });
        showToast('Đã xóa sản phẩm.', 'success');
        await loadCart();
        if (typeof updateCartCount === 'function') updateCartCount();
    } catch (error) {
        showToast('Lỗi khi xóa sản phẩm.', 'error');
    }
}

window.deleteSelectedItems = async function() {
    const checkboxes = document.querySelectorAll('.cart-item-check:checked');
    if (checkboxes.length === 0) {
        showToast('Vui lòng chọn sản phẩm để xóa.', 'warning');
        return;
    }

    if (!confirm(`Xóa ${checkboxes.length} sản phẩm đã chọn khỏi giỏ hàng?`)) return;

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Guest mode
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const idsToRemove = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));
        guestCart = guestCart.filter(item => !idsToRemove.some(id => id == item.variantId));
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        showToast('Đã xóa các sản phẩm chọn.', 'success');
        loadCart();
        updateCartCount();
        return;
    }

    try {
        for (const cb of checkboxes) {
            const itemId = cb.getAttribute('data-id');
            await fetchAPI(`/user/cart/items/${itemId}`, { method: 'DELETE' });
        }
        showToast('Đã xóa các sản phẩm chọn.', 'success');
        await loadCart();
        if (typeof updateCartCount === 'function') updateCartCount();
    } catch (err) {
        console.error(err);
        showToast('Lỗi khi xóa nhiều sản phẩm.', 'error');
    }
}

window.clearEntireCart = async function() {
    if (!confirm("Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng?")) return;
    const token = localStorage.getItem('jwtToken');
    if (token) {
        try {
            await fetchAPI('/user/cart/clear', { method: 'DELETE' });
        } catch(e) {
            console.error('Lỗi xóa giỏ hàng server', e);
        }
    }
    localStorage.removeItem('guestCart');
    showToast('Đã làm trống toàn bộ giỏ hàng!', 'success');
    loadCart();
    if (typeof updateCartCount === 'function') updateCartCount();
};

// Quantity stepper and input handlers (Prevent 0 bug)
window.handleCartQtyInput = function(input) {
    if (!input) return;
    const raw = input.value;
    if (raw === '') return; // Let user type freely without flipping to 0
    let val = parseInt(raw, 10);
    if (isNaN(val) || val < 1) {
        input.value = 1;
        return;
    }
    if (val > 99) {
        input.value = 99;
    }
};

window.handleCartQtyBlur = async function(input, itemId, unitPrice) {
    if (!input) return;
    let qty = parseInt(input.value, 10);
    if (isNaN(qty) || qty < 1) {
        qty = 1;
        input.value = 1;
    }
    await syncCartQuantity(itemId, qty, unitPrice);
};

window.changeCartItemQuantity = async function(itemId, delta, unitPrice) {
    const input = document.getElementById(`cart-qty-${itemId}`);
    let current = parseInt(input ? input.value : 1, 10);
    if (isNaN(current) || current < 1) current = 1;
    let newQty = current + delta;
    if (newQty < 1) return;
    if (input) input.value = newQty;
    await syncCartQuantity(itemId, newQty, unitPrice);
};

async function syncCartQuantity(itemId, newQty, unitPrice) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Guest mode
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const target = guestCart.find(it => it.variantId == itemId || it.id == itemId);
        if (target) {
            target.quantity = newQty;
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
        }
    } else {
        try {
            await fetchAPI(`/user/cart/items/${itemId}?quantity=${newQty}`, { method: 'PUT' });
        } catch (e) {
            console.error('Error updating cart quantity on server:', e);
        }
    }

    // Update row total
    const itemTotalEl = document.getElementById(`item-total-${itemId}`);
    const rowCheck = document.querySelector(`.cart-item-check[data-id="${itemId}"]`);
    const newTotal = unitPrice * newQty;
    if (itemTotalEl) itemTotalEl.innerText = formatPrice(newTotal);
    if (rowCheck) rowCheck.setAttribute('data-price', newTotal);

    updateTotal();
    if (typeof updateCartCount === 'function') updateCartCount();
}
