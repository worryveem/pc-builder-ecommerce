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
    const nextStatus = !user.active;
    const actionText = nextStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.username}"?`)) {
      return;
    }

    try {
      setActionLoading(user.id);
      await adminApi.updateUserStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: nextStatus } : u))
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
                users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.fullName || '---'}</td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber || '---'}</td>
                    <td>
                      <span className={`role-badge ${u.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Khách hàng'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.active !== false ? 'status-completed' : 'status-cancelled'}`}>
                        {u.active !== false ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          className={`btn btn-xs ${u.active !== false ? 'btn-outline-danger' : 'btn-outline'}`}
                          disabled={actionLoading === u.id}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.active !== false ? 'Khóa TK' : 'Mở khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
