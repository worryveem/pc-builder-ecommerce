import axiosInstance from './axios';

export const orderApi = {
  getMyOrders: async () => {
    const response = await axiosInstance.get('/order/user');
    return response.data;
  },

  getMyOrdersByStatus: async (status) => {
    const response = await axiosInstance.get('/order/user/status', {
      params: { status }
    });
    return response.data;
  },

  getMyOrderDetail: async (id) => {
    const response = await axiosInstance.get(`/order/user/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await axiosInstance.put(`/order/user/${id}/cancel`);
    return response.data;
  },

  placeOrder: async (orderData) => {
    const response = await axiosInstance.post('/order', orderData);
    return response.data;
  }
};
