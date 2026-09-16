import axiosInstance from './axios';

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },

  addProduct: async (data) => {
    const response = await axiosInstance.post('/admin/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await axiosInstance.put(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await axiosInstance.get('/admin/categories');
    return response.data;
  },

  addCategory: async (data) => {
    const response = await axiosInstance.post('/admin/category', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/admin/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/admin/category/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/cancel`);
    return response.data;
  },

  // Vouchers
  getVouchers: async () => {
    const response = await axiosInstance.get('/admin/vouchers');
    return response.data;
  },

  getVoucherById: async (id) => {
    const response = await axiosInstance.get(`/admin/vouchers/${id}`);
    return response.data;
  },

  createVoucher: async (data) => {
    const response = await axiosInstance.post('/admin/vouchers', data);
    return response.data;
  },

  updateVoucher: async (id, data) => {
    const response = await axiosInstance.put(`/admin/vouchers/${id}`, data);
    return response.data;
  },

  deleteVoucher: async (id) => {
    const response = await axiosInstance.delete(`/admin/vouchers/${id}`);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  banUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/ban`);
    return response.data;
  },

  unbanUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/unban`);
    return response.data;
  }
};
