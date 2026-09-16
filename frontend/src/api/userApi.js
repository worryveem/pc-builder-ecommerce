import axiosInstance from './axios';

export const userApi = {
  getMyProfile: async () => {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await axiosInstance.put(`/user/profile/${id}`, data);
    return response.data;
  },

  changePassword: async (id, data) => {
    const response = await axiosInstance.put(`/user/${id}/change-password`, data);
    return response.data;
  },

  getUserDiscount: async () => {
    const response = await axiosInstance.post('/user/discount');
    return response.data;
  }
};
