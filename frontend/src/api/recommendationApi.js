import axiosInstance from './axios';

export const recommendationApi = {
  getRecommendations: async ({ query, categoryId, budget, useCase }) => {
    const response = await axiosInstance.post('/recommendations', {
      query,
      categoryId,
      budget,
      useCase
    });
    return response.data;
  }
};
