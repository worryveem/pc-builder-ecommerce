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
  },

  /**
   * Save new PC configuration (requires auth)
   */
  saveConfiguration: async ({ name, items }) => {
    const response = await axiosInstance.post('/builder/configurations', { name, items });
    return response.data;
  },

  /**
   * Load saved PC configuration by ID or shareToken (public)
   */
  getConfiguration: async (idOrToken) => {
    const response = await axiosInstance.get(`/builder/configurations/${idOrToken}`);
    return response.data;
  },

  /**
   * Update existing PC configuration by ID (requires ownership)
   */
  updateConfiguration: async (id, { name, items }) => {
    const response = await axiosInstance.put(`/builder/configurations/${id}`, { name, items });
    return response.data;
  },

  /**
   * Add entire saved PC configuration to user's cart (requires auth and ownership)
   */
  addConfigurationToCart: async (id) => {
    const response = await axiosInstance.post(`/builder/configurations/${id}/add-to-cart`);
    return response.data;
  },

  /**
   * Get all saved PC configurations of current user
   */
  getMyConfigurations: async () => {
    const response = await axiosInstance.get('/builder/configurations/my');
    return response.data;
  },

  /**
   * Delete a saved PC configuration
   */
  deleteConfiguration: async (id) => {
    const response = await axiosInstance.delete(`/builder/configurations/${id}`);
    return response.data;
  }
};
