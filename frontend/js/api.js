const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Handle fetch requests and automatic JSON parsing
 */
async function fetchAPI(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Include Auth Token if available (Using JWT Bearer Token)
    const token = localStorage.getItem('jwtToken');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('user');
            }
            throw { status: response.status, data };
        }

        return data; // ResponseData { success, data, message }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    let icon = '🧸';
    if (type === 'success') icon = '🎉';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// Check logged-in status to update nav
function updateNav() {
    const userString = localStorage.getItem('user');
    const authLinksId = document.getElementById('auth-links');

    if (!authLinksId) return;

    // Base Wishlist Icon
    const wishlistIconHtml = `
        <a href="wishlist.html" class="nav-wishlist-icon" title="Danh sách yêu thích" style="position: relative; margin-right: 1.1rem; text-decoration: none; color: var(--text-main); display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span id="wishlist-badge" style="position: absolute; top: -7px; right: -11px; background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; display: none; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 2px 6px rgba(244,63,94,0.4);">0</span>
        </a>
    `;

    // Base Cart Icon (always visible)
    const cartIconHtml = `
        <a href="cart.html" class="nav-cart-icon" title="Giỏ hàng của bé" style="position: relative; margin-right: 1.2rem; text-decoration: none; color: var(--text-main); display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span id="cart-badge" style="position: absolute; top: -7px; right: -11px; background: linear-gradient(135deg, var(--primary) 0%, #ff85a1 100%); color: white; border-radius: 50%; width: 22px; height: 22px; font-size: 11px; display: none; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 2px 6px rgba(255,101,132,0.4);">0</span>
        </a>
    `;

    if (userString) {
        try {
            const user = JSON.parse(userString);
            let adminBtn = '';
            if (user.username === 'admin') {
                adminBtn = `<a href="admin/index.html" class="btn btn-outline" style="border-color: var(--primary); color: var(--primary); margin-right: 0.8rem; padding: 0.4rem 1rem; font-size: 0.88rem;">👑 Quản Trị</a>`;
            }

            authLinksId.innerHTML = `
                <div style="display: flex; align-items: center;">
                    ${wishlistIconHtml}
                    ${cartIconHtml}
                    ${adminBtn}
                    <div style="position: relative;" class="user-dropdown-container">
                         <button type="button" class="btn btn-soft-primary" style="padding: 0.45rem 1.1rem; border-radius: var(--radius-full); cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-size: 0.92rem;">
                            <span>👶</span> <strong>${user.username}</strong> ▾
                         </button>
                         <div class="user-dropdown-content" style="position: absolute; top: 110%; right: 0; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.12); border-radius: var(--radius-md); border: 1px solid var(--border); width: 200px; display: none; flex-direction: column; z-index: 1000; overflow: hidden; padding: 0.4rem 0;">
                             <a href="profile.html" style="padding: 0.75rem 1.2rem; text-decoration:none; color: var(--text-main); font-weight: 600; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;"><span>👤</span> Hồ sơ cá nhân</a>
                             <a href="orders.html" style="padding: 0.75rem 1.2rem; text-decoration:none; color: var(--text-main); font-weight: 600; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; border-bottom: 1px dashed var(--border);"><span>📦</span> Đơn hàng của tôi</a>
                             <a href="wishlist.html" style="padding: 0.75rem 1.2rem; text-decoration:none; color: var(--text-main); font-weight: 600; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; border-bottom: 1px dashed var(--border);"><span>❤️</span> Danh sách yêu thích</a>
                             <a href="javascript:void(0)" onclick="logout()" style="padding: 0.75rem 1.2rem; text-decoration:none; color: #e74c3c; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;"><span>🚪</span> Đăng xuất</a>
                         </div>
                    </div>
                </div>
            `;

            // Toggle dropdown logic
            const container = authLinksId.querySelector('.user-dropdown-container');
            const content = container ? container.querySelector('.user-dropdown-content') : null;
            if (container && content) {
                container.onclick = (e) => {
                    e.stopPropagation();
                    content.style.display = content.style.display === 'flex' ? 'none' : 'flex';
                };
                document.addEventListener('click', () => {
                    content.style.display = 'none';
                });
            }

            updateCartCount();
            updateWishlistCount();
        } catch (e) {
            console.error("Lỗi đọc user cache.");
        }
    } else {
        authLinksId.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                ${wishlistIconHtml}
                ${cartIconHtml}
                <a href="login.html" class="btn btn-outline" style="padding: 0.5rem 1.2rem; font-size: 0.92rem;">Đăng nhập</a>
                <a href="register.html" class="btn btn-primary" style="padding: 0.5rem 1.3rem; font-size: 0.92rem;">Đăng ký</a>
            </div>
        `;
        updateCartCount();
        updateWishlistCount();
    }
}

async function updateWishlistCount() {
    const badge = document.getElementById('wishlist-badge');
    if (!badge) return;

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        badge.innerText = guestWishlist.length;
        badge.style.display = guestWishlist.length > 0 ? 'flex' : 'none';
        return;
    }

    try {
        const res = await fetchAPI('/wishlist');
        const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        badge.innerText = list.length;
        badge.style.display = list.length > 0 ? 'flex' : 'none';
    } catch (e) {
        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        badge.innerText = guestWishlist.length;
        badge.style.display = guestWishlist.length > 0 ? 'flex' : 'none';
    }
}

// Global Wishlist Toggle Helper
window.toggleWishlist = async function(event, productId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const token = localStorage.getItem('jwtToken');
    const btn = event ? (event.currentTarget || (event.target && event.target.closest('button'))) : null;
    const pId = Number(productId);

    if (!token) {
        // Guest mode in localStorage
        let guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        const idx = guestWishlist.indexOf(pId);
        if (idx >= 0) {
            guestWishlist.splice(idx, 1);
            if (btn) btn.classList.remove('active');
            showToast('Đã bỏ khỏi danh sách yêu thích');
        } else {
            guestWishlist.push(pId);
            if (btn) btn.classList.add('active');
            showToast('❤️ Đã thêm vào danh sách yêu thích!', 'success');
        }
        localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
        updateWishlistCount();
        return;
    }

    try {
        // Check current status: backend may return { success: true, data: true/false } or boolean
        const checkRes = await fetchAPI(`/wishlist/check/${pId}`);
        const isWishlisted = checkRes 
            ? (checkRes.data === true || checkRes === true || checkRes.inWishlist === true || (checkRes.data && (checkRes.data.inWishlist === true || checkRes.data.isWishlisted === true)))
            : false;

        if (isWishlisted) {
            await fetchAPI(`/wishlist/${pId}`, { method: 'DELETE' });
            if (btn) btn.classList.remove('active');
            showToast('Đã bỏ khỏi danh sách yêu thích');
        } else {
            await fetchAPI(`/wishlist/${pId}`, { method: 'POST' });
            if (btn) btn.classList.add('active');
            showToast('❤️ Đã thêm vào danh sách yêu thích!', 'success');
        }
        updateWishlistCount();
    } catch (e) {
        console.warn('API wishlist call failed, falling back to local guestWishlist:', e);
        let guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        const idx = guestWishlist.indexOf(pId);
        if (idx >= 0) {
            guestWishlist.splice(idx, 1);
            if (btn) btn.classList.remove('active');
            showToast('Đã bỏ khỏi danh sách yêu thích');
        } else {
            guestWishlist.push(pId);
            if (btn) btn.classList.add('active');
            showToast('❤️ Đã thêm vào danh sách yêu thích!', 'success');
        }
        localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
        updateWishlistCount();
    }
};

async function updateCartCount() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const userString = localStorage.getItem('user');
    if (!userString) {
        // Guest mode
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
        return;
    }

    try {
        const response = await fetchAPI('/user/cart');
        const cart = response.data || response;
        const count = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    showToast('Đã đăng xuất thành công', 'success');
    updateNav();
    setTimeout(() => {
        window.location.reload();
    }, 800);
}

// Format price payload
function formatPrice(price) {
    if(!price) return "0 đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Image Mapping Helper (Redirects DB placeholders to actual files)
window.getImageUrl = function(rawUrl) {
    if (!rawUrl) return "images/hero_kids.png";
    return rawUrl.startsWith('http') ? rawUrl : `images/${rawUrl}`;
};

// Attach load to modify UI
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
});