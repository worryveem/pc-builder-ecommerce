document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.innerText = 'Đang xử lý...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response && response.success && response.data) {
            showToast('Đăng nhập thành công!', 'success');
            
            const authData = response.data;
            // Lưu chuỗi JWT Bearer token vào localStorage
            localStorage.setItem('jwtToken', authData.token);
            
            // Lưu thông tin người dùng
            localStorage.setItem('user', JSON.stringify({
                userId: authData.userId,
                username: authData.username,
                fullName: authData.fullName,
                role: authData.role
            }));
            
            setTimeout(() => {
                if (authData.role === 'ADMIN' || authData.username === 'admin') {
                    window.location.href = 'admin/index.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            const errorMsg = (response && response.message) ? response.message : 'Đăng nhập thất bại. Kiểm tra lại thông tin.';
            showToast(errorMsg, 'error');
            btn.disabled = false;
            btn.innerText = 'Đăng nhập';
        }

    } catch (error) {
        console.error(error);
        const errorMsg = (error.data && error.data.message) ? error.data.message : 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        showToast(errorMsg, 'error');
        btn.disabled = false;
        btn.innerText = 'Đăng nhập';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    btn.innerText = 'Đang xử lý...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Bypass confirm password check since it's hidden now
    delete data.confirmPassword;

    try {
        const response = await fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response && response.success) {
            showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            const errorMsg = (response && response.message) ? response.message : 'Đăng ký thất bại.';
            showToast(errorMsg, 'error');
            btn.disabled = false;
            btn.innerText = 'Đăng ký';
        }

    } catch (error) {
        console.error(error);
        const errorMsg = (error.data && error.data.message) ? error.data.message : 'Tên đăng nhập hoặc email đã tồn tại.';
        showToast(errorMsg, 'error');
        btn.disabled = false;
        btn.innerText = 'Đăng ký';
    }
}
