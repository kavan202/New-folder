import api from './api';

export const vehicleService = {
  async getAll() {
    const response = await api.get('/vehicles');
    return response.data;
  },

  async search(filters) {
    const cleanParams = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        cleanParams[key] = filters[key];
      }
    });
    const response = await api.get('/vehicles/search', { params: cleanParams });
    return response.data;
  },

  async create(vehicleData) {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  async update(id, vehicleData) {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  async purchase(id, customerData) {
    const response = await api.post(`/vehicles/${id}/purchase`, customerData);
    return response.data;
  },

  async restock(id, quantityToAdd) {
    const response = await api.post(`/vehicles/${id}/restock`, {
      quantity_to_add: parseInt(quantityToAdd, 10),
    });
    return response.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/vehicles/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async bookTestDrive(testDriveData) {
    const response = await api.post('/test-drives', testDriveData);
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/analytics');
    return response.data;
  },
};
