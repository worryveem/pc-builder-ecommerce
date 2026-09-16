import axiosInstance from './axios';

export const voucherApi = {
  getActiveVouchers: async () => {
    const response = await axiosInstance.get('/vouchers');
    return response.data;
  },

  applyVoucher: async (code, orderAmount) => {
    const response = await axiosInstance.post('/vouchers/apply', { code, orderAmount });
    return response.data;
  }
};
