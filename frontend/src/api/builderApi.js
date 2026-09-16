import axiosInstance from './axios';

export const builderApi = {
  /**
   * Get builder categories split into core components and optional setup gear
   */
  getCategories: async () => {
    const response = await axiosInstance.get('/builder/categories');
    return response.data;
  },

  /**
   * Filter compatible products for a specific slot based on selected components
   */
  filterProducts: async ({
    categorySlug,
    selectedCpuId,
    selectedCaseId,
    selectedMainboardId,
    brand,
    minPrice,
    maxPrice,
    sort
  }) => {
    const params = { categorySlug };
    if (selectedCpuId) params.selectedCpuId = selectedCpuId;
    if (selectedCaseId) params.selectedCaseId = selectedCaseId;
    if (selectedMainboardId) params.selectedMainboardId = selectedMainboardId;
    if (brand) params.brand = brand;
    if (minPrice != null && minPrice !== '') params.minPrice = minPrice;
    if (maxPrice != null && maxPrice !== '') params.maxPrice = maxPrice;
    if (sort) params.sort = sort;

    const response = await axiosInstance.get('/builder/filter-products', { params });
    return response.data;
  },

  /**
   * Validate entire PC configuration against CompatibilityService in backend
   */
  validateConfiguration: async (items) => {
    const response = await axiosInstance.post('/builder/validate', { items });
    return response.data;
  }
};
