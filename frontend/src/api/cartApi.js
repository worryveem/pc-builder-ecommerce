import axiosInstance from './axios';

export const cartApi = {
  getCart: async () => {
    const response = await axiosInstance.get('/user/cart');
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/user/cart/clear');
    return response.data;
  },

  addToCart: async (productId, quantity = 1, configurationId = null) => {
    const params = { productId, quantity };
    if (configurationId) {
      params.configurationId = configurationId;
    }
    const response = await axiosInstance.post('/user/cart/items', null, { params });
    return response.data;
  },

  updateCartItem: async (id, quantity) => {
    const response = await axiosInstance.put(`/user/cart/items/${id}`, null, {
      params: { quantity }
    });
    return response.data;
  },

  removeCartItem: async (id) => {
    const response = await axiosInstance.delete(`/user/cart/items/${id}`);
    return response.data;
  }
};
