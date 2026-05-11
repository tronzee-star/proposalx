import api from './api';

export const proposalService = {
  getAll: async (params = {}) => {
    const response = await api.get('/proposals', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
  },

  submit: async (formData) => {
    const response = await api.post('/proposals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyProposals: async () => {
    const response = await api.get('/proposals/my');
    return response.data;
  },
};
