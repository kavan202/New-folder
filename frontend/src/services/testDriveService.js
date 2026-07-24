import api from './api';

export const testDriveService = {
  async bookTestDrive(bookingData) {
    const response = await api.post('/test-drives/book', bookingData);
    return response.data;
  },

  async getMyTestDrives(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/test-drives/my', { params: cleanParams });
    return response.data;
  },

  async getAllTestDrives(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/test-drives', { params: cleanParams });
    return response.data;
  },

  async approveTestDrive(id) {
    const response = await api.put(`/test-drives/${id}/approve`);
    return response.data;
  },

  async cancelTestDrive(id) {
    const response = await api.put(`/test-drives/${id}/cancel`);
    return response.data;
  },

  async completeTestDrive(id) {
    const response = await api.put(`/test-drives/${id}/complete`);
    return response.data;
  },
};
