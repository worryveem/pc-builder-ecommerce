import axiosInstance from './axios';

export const productApi = {
  getAllProducts: async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId) => {
    const response = await axiosInstance.get(`/products/category/${categoryId}`);
    return response.data;
  },

  filterPrice: async (minPrice, maxPrice) => {
    const response = await axiosInstance.get('/products/filter', {
      params: { minPrice, maxPrice }
    });
    return response.data;
  },

  searchByName: async (name) => {
    const response = await axiosInstance.get('/products/search', {
      params: { name }
    });
    return response.data;
  }
};
