import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.active !== false && user.status !== 'LOCKED';
    const nextStatus = !isCurrentlyActive;
    const actionText = nextStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.username}"?`)) {
      return;
    }

    try {
      setActionLoading(user.id);
      await adminApi.updateUserStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: nextStatus, status: nextStatus ? 'ACTIVE' : 'LOCKED' } : u))
      );
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert(err?.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Quản lý người dùng</h2>
          <p className="subtitle">Xem danh sách thành viên và kiểm soát trạng thái tài khoản</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên người dùng</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Chưa có người dùng nào</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.active !== false && u.status !== 'LOCKED';
                  const isAdminUser = u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';

                  return (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.fullName || '---'}</td>
                      <td>{u.email}</td>
                      <td>{u.phoneNumber || u.phone || '---'}</td>
                      <td>
                        <span className={`role-badge ${isAdminUser ? 'role-admin' : 'role-user'}`}>
                          {isAdminUser ? 'Admin' : 'Khách hàng'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${isActive ? 'status-completed' : 'status-cancelled'}`}>
                          {isActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td>
                        {!isAdminUser && (
                          <button
                            className={`btn btn-xs ${isActive ? 'btn-outline-danger' : 'btn-outline'}`}
                            disabled={actionLoading === u.id}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {isActive ? 'Khóa TK' : 'Mở khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
