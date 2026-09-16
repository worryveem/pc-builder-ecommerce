let loadedData = {
    products: false,
    categories: false,
    orders: false,
    users: false,
    stats: false
};

let allLoadedOrders = [];

// Handle Tab Switching
window.switchTab = function(tabId) {
    // Update active class on nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Show correct section
    document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Trigger data fetch
    if (tabId === 'dashboard') loadStats();
    if (tabId === 'products') loadProducts();
    if (tabId === 'categories') loadCategories();
    if (tabId === 'orders') loadOrders();
    if (tabId === 'vouchers') loadVouchers();
    if (tabId === 'users') loadUsers();
};

function formatPrice(priceNum) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum || 0);
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* ==================
   STATISTICS MODULE
================== */
async function loadStats() {
    try {
        const prodRes = await fetchAdminAPI('/products');
        const orderRes = await fetchAdminAPI('/admin/orders');
        const userRes = await fetchAdminAPI('/admin/users');
        
        const products = prodRes.data || prodRes || [];
        const orders = orderRes.data || orderRes || [];
        const users = userRes.data || userRes || [];
        
        const totalRevenue = orders.reduce((sum, o) => {
            const st = (o.status || '').toUpperCase();
            return (st === 'COMPLETED' || st === 'DELIVERED') ? sum + (o.totalPrice || 0) : sum;
        }, 0);
        
        document.getElementById('stat-products').innerText = products.length;
        document.getElementById('stat-orders').innerText = orders.length;
        document.getElementById('stat-users').innerText = users.length;
        document.getElementById('stat-revenue').innerText = formatPrice(totalRevenue);
        
        initChart(orders);
    } catch (err) {
        console.error("Stats Error:", err);
    }
}

function initChart(orders) {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (window.myChart) window.myChart.destroy();
    
    // Last 7 days revenue calculation
    const labels = [];
    const data = [];
    const dateMap = {};

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
        labels.push(label);
        dateMap[dateKey] = 0;
    }

    if (Array.isArray(orders)) {
        orders.forEach(o => {
            if (o.createdAt) {
                const dateKey = o.createdAt.slice(0, 10);
                if (dateMap[dateKey] !== undefined) {
                    dateMap[dateKey] += (o.totalPrice || 0);
                }
            }
        });
    }

    Object.keys(dateMap).forEach(key => {
        data.push(dateMap[key]);
    });

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: data,
                borderColor: '#FF6584',
                backgroundColor: 'rgba(255, 101, 132, 0.1)',
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointBackgroundColor: '#FF6584',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Doanh thu: ${formatPrice(context.raw)}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value >= 1000000 ? (value / 1000000) + ' Tr' : (value / 1000) + ' k';
                        }
                    }
                } 
            }
        }
    });
}

/* ==================
   PRODUCTS MODULE
================== */
async function loadProducts() {
    const tbody = document.getElementById('tb-products');
    if (!tbody) return;
    try {
        const res = await fetchAdminAPI('/products');
        const products = res.data || res || [];
        
        let html = '';
        products.forEach(p => {
            const mainImg = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'hero_kids.png';
            const displayImg = mainImg.startsWith('http') ? mainImg : `../images/${mainImg}`;
            
            // Stock display
            let stockHtml = '<span style="color:#94a3b8; font-size:0.85rem;">Chưa có size</span>';
            if (p.productVariants && p.productVariants.length > 0) {
                stockHtml = p.productVariants.map(v => 
                    `<span style="display:inline-block; background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:0.82rem; margin:2px;"><b>${v.size ? v.size.name : '?'}:</b> ${v.stockQuantity}</span>`
                ).join('');
            }

            html += `
            <tr>
                <td style="font-weight:700; color:var(--text-muted);">#${p.id}</td>
                <td><img src="${displayImg}" class="product-tb-img" onerror="this.src='../images/hero_kids.png'"></td>
                <td>
                    <div class="item-name">${p.name}</div>
                    <small style="color:var(--text-muted);">${p.description ? p.description.slice(0, 50) + '...' : ''}</small>
                </td>
                <td style="font-weight:700; color:var(--primary);">${formatPrice(p.price)}</td>
                <td>${stockHtml}</td>
                <td>
                    <button class="act-btn" onclick="openProductModal(${p.id})">Sửa</button>
                    <button class="act-btn delete" onclick="deleteProduct(${p.id})">Xóa</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;">Chưa có sản phẩm nào.</td></tr>';
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Lỗi tải sản phẩm: ${err.message}</td></tr>`;
    }
}

window.openProductModal = async function(id = null) {
    const modal = document.getElementById('modal-product');
    if (!modal) return;
    const form = document.getElementById('form-product');
    form.reset();

    const titleEl = document.getElementById('modal-product-title');
    const idInput = document.getElementById('prod-id');
    
    if (id) {
        titleEl.innerText = "Chỉnh Sửa Sản Phẩm";
        idInput.value = id;
        idInput.disabled = true;
        try {
            const res = await fetchAdminAPI(`/products/${id}`);
            const p = res.data || res;
            if (p) {
                document.getElementById('prod-name').value = p.name || '';
                document.getElementById('prod-price').value = p.price || '';
                document.getElementById('prod-desc').value = p.description || '';
                document.getElementById('prod-image').value = (p.images && p.images.length > 0) ? p.images[0].imageUrl : '';

                if (p.productVariants && p.productVariants.length > 0) {
                    p.productVariants.forEach(v => {
                        const sizeName = v.size ? v.size.name.toLowerCase() : '';
                        const cb = document.getElementById(`size-${sizeName}`);
                        if (cb) {
                            cb.checked = true;
                            const row = cb.closest('.size-row');
                            if (row) {
                                const stockInput = row.querySelector('.size-stock-input');
                                if (stockInput) stockInput.value = v.stockQuantity;
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Lỗi lấy thông tin sản phẩm:", err);
        }
    } else {
        titleEl.innerText = "Thêm Sản Phẩm Mới";
        idInput.disabled = false;
    }
    
    modal.classList.add('active');
};

window.closeProductModal = function() {
    const modal = document.getElementById('modal-product');
    if (modal) modal.classList.remove('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('form-product');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('prod-id').value;
            const name = document.getElementById('prod-name').value.trim();
            const price = parseFloat(document.getElementById('prod-price').value);
            const description = document.getElementById('prod-desc').value.trim();
            const imageUrl = document.getElementById('prod-image').value.trim();

            const isEdit = document.getElementById('prod-id').disabled;

            // Collect variants
            const productVariants = [];
            document.querySelectorAll('.size-row').forEach(row => {
                const cb = row.querySelector('.size-checkbox');
                const stockInput = row.querySelector('.size-stock-input');
                if (cb && cb.checked) {
                    productVariants.push({
                        size: { name: cb.value },
                        stockQuantity: parseInt(stockInput.value) || 0
                    });
                }
            });

            const data = {
                id: isEdit ? parseInt(id) : parseInt(id),
                name,
                price,
                description,
                productVariants,
                images: imageUrl ? [{ imageUrl: imageUrl, isPrimary: true }] : []
            };

            try {
                const method = isEdit ? 'PUT' : 'POST';
                const url = isEdit ? `/admin/products/${id}` : '/admin/products';
                await fetchAdminAPI(url, method, data);
                alert("Lưu sản phẩm thành công!");
                closeProductModal();
                loadProducts();
            } catch (err) {
                alert("Lỗi khi lưu sản phẩm: " + err.message);
            }
        });
    }

    // Auth info header update
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const nameEl = document.getElementById('admin-name');
            const avatarEl = document.getElementById('admin-avatar');
            if (nameEl) nameEl.innerText = user.fullName || user.username || 'Admin';
            if (avatarEl) avatarEl.innerText = (user.username || 'A').charAt(0).toUpperCase();
        } catch(e) {}
    }

    loadStats();
});

async function deleteProduct(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
        await fetchAdminAPI(`/admin/products/${id}`, 'DELETE');
        alert("Xóa sản phẩm thành công!");
        loadProducts();
    } catch (err) { 
        alert("Lỗi: " + (err.message || "Không thể thực hiện yêu cầu xóa.")); 
    }
}

/* ==================
   CATEGORIES MODULE
================== */
async function loadCategories() {
    const tbody = document.getElementById('tb-categories');
    if (!tbody) return;
    try {
        const res = await fetchAdminAPI('/admin/categories');
        const categories = res.data || res || [];
        let html = '';
        categories.forEach(cat => {
            html += `
            <tr>
                <td style="font-weight:700; color:var(--text-muted);">#${cat.id}</td>
                <td style="font-weight:700; color:var(--text-main);">${cat.name}</td>
                <td style="color:var(--text-muted);">${cat.description || 'Không có mô tả'}</td>
                <td>
                    <button class="act-btn" onclick="openCategoryModal(${cat.id}, '${escapeHtml(cat.name)}', '${escapeHtml(cat.description || '')}')">Sửa</button>
                    <button class="act-btn delete" onclick="deleteCategory(${cat.id})">Xóa</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;">Chưa có danh mục nào</td></tr>';
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Lỗi tải danh mục: ${err.message}</td></tr>`;
    }
}

window.openCategoryModal = function(id = null, name = '', desc = '') {
    const modal = document.getElementById('category-modal');
    if (!modal) return;
    document.getElementById('modal-category-title').innerText = id ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới';
    document.getElementById('cat-id').value = id || '';
    document.getElementById('cat-name').value = name || '';
    document.getElementById('cat-desc').value = desc || '';
    modal.classList.add('active');
};

window.closeCategoryModal = function() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.remove('active');
};

window.handleCategorySubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('cat-id').value;
    const name = document.getElementById('cat-name').value.trim();
    const description = document.getElementById('cat-desc').value.trim();

    if (!name) {
        alert("Vui lòng nhập tên danh mục!");
        return;
    }

    const payload = { name, description };
    try {
        if (id) {
            await fetchAdminAPI(`/admin/category/${id}`, 'PUT', payload);
            alert("Cập nhật danh mục thành công!");
        } else {
            await fetchAdminAPI('/admin/category', 'POST', payload);
            alert("Thêm danh mục thành công!");
        }
        closeCategoryModal();
        loadCategories();
    } catch (err) {
        alert("Lỗi khi lưu danh mục: " + err.message);
    }
};

window.deleteCategory = async function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
        await fetchAdminAPI(`/admin/category/${id}`, 'DELETE');
        alert("Xóa danh mục thành công!");
        loadCategories();
    } catch (err) {
        alert("Lỗi khi xóa: " + err.message);
    }
};

/* ==================
   ORDERS MODULE
================== */
async function loadOrders(statusFilter = 'ALL') {
    const tbody = document.getElementById('tb-orders');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem;">Đang tải danh sách đơn hàng...</td></tr>';
    try {
        const res = await fetchAdminAPI('/admin/orders');
        allLoadedOrders = res.data || res || [];
        renderFilteredOrders(statusFilter);
    } catch (err) { 
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Lỗi tải đơn hàng: ${err.message}</td></tr>`; 
    }
}

function renderFilteredOrders(statusFilter = 'ALL') {
    const tbody = document.getElementById('tb-orders');
    if (!tbody) return;

    let orders = allLoadedOrders;
    if (statusFilter && statusFilter !== 'ALL') {
        orders = orders.filter(o => o.status === statusFilter);
    }

    let html = '';
    orders.forEach(o => {
        let badgeClass = 'badge-warning';
        if (o.status === 'DELIVERED' || o.status === 'COMPLETED') badgeClass = 'badge-success';
        if (o.status === 'CANCELLED') badgeClass = 'badge-danger';
        if (o.status === 'SHIPPING') badgeClass = 'badge-info';
        if (o.status === 'CONFIRMED') badgeClass = 'badge-primary';

        const recipient = o.fullName || 'Khách vãng lai';
        const phone = o.phone ? `📞 ${o.phone}` : 'Chưa có SĐT';
        const email = o.email || '';
        const address = o.address || 'Giao theo thông tin email';
        const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '';

        html += `
        <tr>
            <td>
                <span style="font-weight:800; color:var(--primary);">#${o.id}</span>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">${orderDate}</div>
            </td>
            <td>
                <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${recipient}</div>
                <div style="font-size:0.82rem; color:var(--text-muted);">${phone}</div>
                <div style="font-size:0.8rem; color:#94a3b8;">${email}</div>
            </td>
            <td>
                <div style="max-width:240px; font-size:0.88rem; color:var(--text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;" title="${address}">
                    ${address}
                </div>
                ${o.notes ? `<span style="display:inline-block; font-size:0.75rem; color:#d97706; background:#fffbeb; padding:1px 6px; border-radius:3px; margin-top:3px;">📝 ${o.notes}</span>` : ''}
            </td>
            <td>
                <div style="font-weight:800; color:var(--primary); font-size:1rem;">${formatPrice(o.totalPrice)}</div>
                <span style="font-size:0.75rem; color:var(--text-muted); background:#f1f5f9; padding:2px 6px; border-radius:4px;">${o.paymentMethod || 'COD'}</span>
            </td>
            <td><span class="badge ${badgeClass}">${o.status}</span></td>
            <td>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button class="act-btn detail" onclick="openAdminOrderDetail(${o.id})" title="Xem chi tiết đơn">👁️ Xem</button>
                    <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 5px 8px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:0.82rem; background:white; font-weight:600;">
                        <option value="">Đổi trạng thái</option>
                        <option value="PENDING" ${o.status === 'PENDING' ? 'disabled' : ''}>Chờ xử lý (PENDING)</option>
                        <option value="CONFIRMED" ${o.status === 'CONFIRMED' ? 'disabled' : ''}>Xác nhận (CONFIRMED)</option>
                        <option value="SHIPPING" ${o.status === 'SHIPPING' ? 'disabled' : ''}>Giao hàng (SHIPPING)</option>
                        <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'disabled' : ''}>Hoàn thành (DELIVERED)</option>
                        <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'disabled' : ''}>Hủy (CANCELLED)</option>
                    </select>
                </div>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center; padding:2rem;">Không tìm thấy đơn hàng nào</td></tr>';
}

window.filterOrders = function(status) {
    renderFilteredOrders(status);
};

window.updateOrderStatus = async function(id, newStatus) {
    if (!newStatus) return;
    try {
        await fetchAdminAPI(`/admin/orders/${id}/status?status=${newStatus}`, 'PATCH');
        alert("Đã cập nhật trạng thái đơn hàng #" + id + " sang: " + newStatus);
        
        // Update local status in array
        const found = allLoadedOrders.find(o => o.id === id);
        if (found) found.status = newStatus;
        
        const currentFilter = document.getElementById('order-status-filter') ? document.getElementById('order-status-filter').value : 'ALL';
        renderFilteredOrders(currentFilter);
        
        // If modal is currently open for this order, close it or refresh it
        closeAdminOrderModal();
    } catch (err) { 
        alert("Lỗi cập nhật trạng thái: " + err.message); 
    }
};

/* ==================
   ORDER DETAIL MODAL
================== */
window.openAdminOrderDetail = function(orderId) {
    const order = allLoadedOrders.find(o => o.id === orderId);
    if (!order) {
        alert("Không tìm thấy đơn hàng #" + orderId);
        return;
    }

    const modal = document.getElementById('admin-order-modal');
    const modalBody = document.getElementById('admin-order-modal-body');
    if (!modal || !modalBody) return;

    const items = order.orderItems || [];
    const itemsHtml = items.length > 0 ? items.map(item => {
        let imgUrl = '../images/hero_kids.png';
        let prodName = 'Sản phẩm trẻ em';
        let sizeName = 'Chuẩn';
        
        if (item.variant) {
            if (item.variant.productResponse) {
                prodName = item.variant.productResponse.name || prodName;
                if (item.variant.productResponse.images && item.variant.productResponse.images.length > 0) {
                    const img = item.variant.productResponse.images[0].imageUrl;
                    imgUrl = img.startsWith('http') ? img : `../images/${img}`;
                }
            }
            if (item.variant.size) {
                sizeName = item.variant.size.name || sizeName;
            }
        }

        const totalItemPrice = (item.price || 0) * (item.quantity || 1);

        return `
        <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #F1F5F9;">
            <img src="${imgUrl}" onerror="this.src='../images/hero_kids.png'" style="width:55px; height:55px; object-fit:cover; border-radius:8px; border:1px solid #E2E8F0;">
            <div style="flex:1;">
                <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${prodName}</div>
                <div style="font-size:0.82rem; color:var(--text-muted);">Phân loại: <span style="background:#f1f5f9; padding:1px 6px; border-radius:4px; font-weight:600;">Size ${sizeName}</span> | Đơn giá: ${formatPrice(item.price)}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.85rem; color:var(--text-muted);">x${item.quantity}</div>
                <div style="font-weight:700; color:var(--primary); font-size:0.95rem;">${formatPrice(totalItemPrice)}</div>
            </div>
        </div>`;
    }).join('') : '<p style="color:#888; text-align:center; padding:1rem;">Không có thông tin chi tiết sản phẩm.</p>';

    const recipient = order.fullName || 'Khách vãng lai';
    const phone = order.phone || 'Chưa cung cấp';
    const address = order.address || 'Giao theo email';
    const notes = order.notes ? `<div style="margin-top:8px; font-size:0.85rem; color:#d97706; background:#fffbeb; padding:6px 10px; border-radius:6px;"><b>Ghi chú từ khách:</b> ${order.notes}</div>` : '';

    modalBody.innerHTML = `
        <div style="border-bottom:1px solid #E2E8F0; padding-bottom:12px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span class="badge badge-primary" style="margin-bottom:6px;">ĐƠN HÀNG TRẺ EM</span>
                    <h2 style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin:0;">Mã Đơn: #${order.id}</h2>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Ngày đặt: ${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <span class="badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}" style="font-size:0.85rem; padding:6px 12px;">${order.status}</span>
            </div>
        </div>

        <div style="background:#F8FAFC; padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:16px;">
            <div style="font-weight:700; color:var(--text-main); font-size:0.92rem; margin-bottom:6px;">📍 Thông Tin Người Nhận</div>
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <div style="font-weight:700; color:var(--text-main);">${recipient}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">📞 SĐT: ${phone}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">✉️ Email: ${order.email || 'N/A'}</div>
                </div>
                <div style="max-width:300px; font-size:0.85rem; color:#475569; line-height:1.4;">
                    <b>Địa chỉ:</b> ${address}
                    ${notes}
                </div>
            </div>
        </div>

        <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-bottom:8px;">🛍️ Danh Sách Sản Phẩm (${items.length})</div>
        <div style="max-height:220px; overflow-y:auto; padding-right:6px; margin-bottom:16px;">
            ${itemsHtml}
        </div>

        <div style="background:#FAFBFD; border:1px solid #E2E8F0; border-radius:var(--radius-sm); padding:14px; margin-bottom:16px; font-size:0.9rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--text-muted);">Phương thức thanh toán:</span>
                <span style="font-weight:700;">${order.paymentMethod || 'COD'}</span>
            </div>
            ${order.voucherCode ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="color:var(--text-muted);">Mã ưu đãi đã dùng:</span>
                <span style="font-weight:700; color:var(--primary);">${order.voucherCode}</span>
            </div>` : ''}
            <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px dashed #E2E8F0; font-size:1.15rem; font-weight:800;">
                <span>Tổng tiền thanh toán:</span>
                <span style="color:var(--primary);">${formatPrice(order.totalPrice)}</span>
            </div>
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
            <label style="font-weight:700; font-size:0.88rem; color:var(--text-muted); white-space:nowrap;">Cập nhật nhanh:</label>
            <select onchange="updateOrderStatus(${order.id}, this.value)" class="form-control" style="flex:1;">
                <option value="">-- Chọn trạng thái mới --</option>
                <option value="CONFIRMED">Xác nhận đơn hàng (CONFIRMED)</option>
                <option value="SHIPPING">Bắt đầu giao hàng (SHIPPING)</option>
                <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
                <option value="CANCELLED">Hủy đơn hàng này (CANCELLED)</option>
            </select>
            <button class="btn-logout" onclick="closeAdminOrderModal()">Đóng</button>
        </div>
    `;

    modal.classList.add('active');
};

window.closeAdminOrderModal = function() {
    const modal = document.getElementById('admin-order-modal');
    if (modal) modal.classList.remove('active');
};

/* ==================
   VOUCHERS MODULE
================== */
async function loadVouchers() {
    const tbody = document.getElementById('tb-vouchers');
    if (!tbody) return;
    try {
        const res = await fetchAdminAPI('/admin/vouchers');
        const vouchers = res.data || res || [];
        let html = '';
        vouchers.forEach(v => {
            const isPercent = v.discountType === 'PERCENTAGE';
            const valueStr = isPercent ? `${v.discountValue}% (Tối đa ${v.maxDiscountAmount ? formatPrice(v.maxDiscountAmount) : 'KGH'})` : formatPrice(v.discountValue);
            const usageStr = `${v.usedCount || 0} / ${v.usageLimit || '∞'}`;
            const isActive = v.active;

            html += `
            <tr>
                <td style="font-weight:700; color:var(--text-muted);">#${v.id}</td>
                <td><strong style="color:var(--primary); font-size:1rem;">${v.code}</strong><br><small style="color:var(--text-muted);">${v.description || ''}</small></td>
                <td><span class="badge ${isPercent ? 'badge-info' : 'badge-warning'}">${isPercent ? 'Phần trăm' : 'Cố định'}</span></td>
                <td style="font-weight:700;">${valueStr}</td>
                <td>${v.minOrderAmount ? formatPrice(v.minOrderAmount) : '0 đ'}</td>
                <td>${usageStr}</td>
                <td><span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">${isActive ? 'Hoạt động' : 'Đã tắt'}</span></td>
                <td>
                    <button class="act-btn delete" onclick="deleteVoucher(${v.id})">Xóa</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;">Chưa có mã khuyến mãi nào</td></tr>';
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi tải voucher: ${err.message}</td></tr>`;
    }
}

window.openVoucherModal = function() {
    const modal = document.getElementById('voucher-modal');
    if (!modal) return;
    document.getElementById('voucher-form').reset();
    document.getElementById('voucher-id').value = '';
    toggleVoucherTypeInput();
    modal.classList.add('active');
};

window.closeVoucherModal = function() {
    const modal = document.getElementById('voucher-modal');
    if (modal) modal.classList.remove('active');
};

window.toggleVoucherTypeInput = function() {
    const type = document.getElementById('v-type').value;
    const label = document.getElementById('v-value-label');
    const input = document.getElementById('v-value');
    if (type === 'PERCENTAGE') {
        label.innerText = 'Mức Giảm (%)';
        input.placeholder = 'Ví dụ: 10';
        input.max = 100;
    } else {
        label.innerText = 'Mức Giảm (VNĐ)';
        input.placeholder = 'Ví dụ: 30000';
        input.removeAttribute('max');
    }
};

window.handleVoucherSubmit = async function(e) {
    e.preventDefault();
    const code = document.getElementById('v-code').value.trim().toUpperCase();
    const description = document.getElementById('v-desc').value.trim();
    const discountType = document.getElementById('v-type').value;
    const discountValue = parseFloat(document.getElementById('v-value').value);
    const minOrderAmount = parseFloat(document.getElementById('v-min').value) || 0;
    const maxDiscountAmountVal = document.getElementById('v-max').value;
    const maxDiscountAmount = maxDiscountAmountVal ? parseFloat(maxDiscountAmountVal) : null;
    const usageLimit = parseInt(document.getElementById('v-limit').value) || 100;

    if (!code || isNaN(discountValue)) {
        alert("Vui lòng điền đầy đủ thông tin voucher!");
        return;
    }

    const payload = {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        active: true
    };

    try {
        await fetchAdminAPI('/admin/vouchers', 'POST', payload);
        alert("Tạo voucher mới thành công!");
        closeVoucherModal();
        loadVouchers();
    } catch (err) {
        alert("Lỗi khi tạo voucher: " + err.message);
    }
};

window.deleteVoucher = async function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return;
    try {
        await fetchAdminAPI(`/admin/vouchers/${id}`, 'DELETE');
        alert("Đã xóa voucher thành công!");
        loadVouchers();
    } catch (err) {
        alert("Lỗi khi xóa voucher: " + err.message);
    }
};

/* ==================
   USERS MODULE
================== */
async function loadUsers() {
    const tbody = document.getElementById('tb-users');
    if (!tbody) return;
    try {
        const res = await fetchAdminAPI('/admin/users');
        const users = res.data || res || [];
        let html = '';
        users.forEach(u => {
            const isBanned = (u.status === 'LOCKED');
            html += `
            <tr>
                <td style="font-weight:700; color:var(--text-muted);">#${u.id}</td>
                <td><strong>${u.username}</strong><br><small style="color:var(--text-muted);">${u.fullName || ''}</small></td>
                <td>${u.email || 'N/A'}</td>
                <td>${u.phone || 'N/A'}</td>
                <td><span class="badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-info'}">${u.role || 'USER'}</span></td>
                <td><span class="badge ${isBanned ? 'badge-danger' : 'badge-success'}">${isBanned ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}</span></td>
                <td>
                    ${isBanned 
                        ? `<button class="act-btn" style="background:#20bf6b; color:white; margin-right:4px;" onclick="unbanUser(${u.id})">🔓 Mở khóa</button>`
                        : `<button class="act-btn" style="background:#f59e0b; color:white; margin-right:4px;" onclick="banUser(${u.id})">🔒 Khóa</button>`
                    }
                    <button class="act-btn delete" onclick="deleteUser(${u.id})">🗑️ Xóa</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;">Không có người dùng nào</td></tr>';
    } catch (err) { tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Lỗi tải User: ${err.message}</td></tr>`; }
}

window.banUser = async function(id) {
    if(!confirm("Khóa tài khoản này? Người dùng sẽ không thể đăng nhập.")) return;
    try {
        await fetchAdminAPI(`/admin/users/${id}/ban`, 'PATCH');
        alert("Đã khóa người dùng thành công!");
        loadUsers();
    } catch (err) { alert("Lỗi khóa: " + err.message); }
};

window.unbanUser = async function(id) {
    if(!confirm("Mở khóa cho người dùng này?")) return;
    try {
        await fetchAdminAPI(`/admin/users/${id}/unban`, 'PATCH');
        alert("Đã mở khóa người dùng thành công!");
        loadUsers();
    } catch (err) { alert("Lỗi mở khóa: " + err.message); }
};

window.deleteUser = async function(id) {
    if(!confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA vĩnh viễn người dùng này?")) return;
    try {
        await fetchAdminAPI(`/admin/users/${id}`, 'DELETE');
        alert("Đã xóa người dùng thành công!");
        loadUsers();
    } catch (err) { alert("Lỗi xóa người dùng: " + err.message); }
};

async function sendMail() {
    if (!confirm("Bạn có chắc muốn gửi email thông báo cho TẤT CẢ người dùng?")) return;

    try {
        await sendMailAPI();
        alert("✅ Gửi email thành công!");
    } catch (err) {
        console.error(err);
        alert("❌ Gửi email thất bại: " + err.message);
    }
}
