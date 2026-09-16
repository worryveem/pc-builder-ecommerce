const BASE_URL = 'http://localhost:8080/api';

/**
 * Common fetch wrapper handling Authorization via JWT Bearer Token
 */
async function fetchAdminAPI(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        throw new Error("Không tìm thấy thông tin đăng nhập.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('user');
            throw new Error("Lỗi xác thực hoặc bạn không có quyền Admin.");
        }
        
        let data;
        try {
            data = await response.json();
        } catch {
            return { success: response.ok };
        }
        
        return data; // Backend wraps in { success: true, data: ... }
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

function checkAdminAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("Vui lòng đăng nhập trước!");
        window.location.href = '../login.html';
        return;
    }
    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN' && user.username !== 'admin') {
            alert("Truy cập bị từ chối: Bạn không phải Quản trị viên (Admin)!");
            window.location.href = '../index.html';
            return;
        }
        const nameEl = document.getElementById('admin-name');
        if (nameEl) {
            nameEl.innerText = `Quản trị: ${user.fullName || user.username}`;
        }
    } catch(e) {
        alert("Lỗi dữ liệu đăng nhập.");
        window.location.href = '../login.html';
    }
}

function logoutAdmin() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

// Run auth check on load
document.addEventListener('DOMContentLoaded', checkAdminAuth);

async function sendMailAPI() {
    return await fetchAdminAPI('/send/mail', 'POST');
}