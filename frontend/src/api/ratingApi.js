import axiosInstance from './axios';

export const ratingApi = {
  getProductRatings: async (productId) => {
    const response = await axiosInstance.get(`/ratings/product/${productId}`);
    return response.data;
  },

  getProductRatingSummary: async (productId) => {
    const response = await axiosInstance.get(`/ratings/product/${productId}/summary`);
    return response.data;
  },

  addRating: async (ratingData) => {
    const response = await axiosInstance.post('/ratings', ratingData);
    return response.data;
  }
};
