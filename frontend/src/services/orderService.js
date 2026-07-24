import api from './api';

export const orderService = {
  async purchaseVehicle(purchaseData) {
    const response = await api.post('/orders/purchase', purchaseData);
    return response.data;
  },

  async getMyOrders(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/orders/my', { params: cleanParams });
    return response.data;
  },

  async getAllOrders(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/orders', { params: cleanParams });
    return response.data;
  },
};
