import axiosInstance from './axios';

export const categoryApi = {
  getAllCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },

  getBuilderCategories: async () => {
    const response = await axiosInstance.get('/builder/categories');
    return response.data;
  }
};
