import axiosInstance from './axios';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await axiosInstance.post(`/wishlist/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data;
  },

  checkWishlist: async (productId) => {
    const response = await axiosInstance.get(`/wishlist/check/${productId}`);
    return response.data;
  }
};
