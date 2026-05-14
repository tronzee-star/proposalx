import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users/');
    return response.data;
  },

  createUser: async (payload) => {
    const response = await api.post('/admin/users/', payload);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getProposals: async () => {
    const response = await api.get('/admin/proposals/');
    return response.data;
  },

  deleteProposal: async (proposalId) => {
    const response = await api.delete(`/admin/proposals/${proposalId}`);
    return response.data;
  },

  getReviewers: async () => {
    const response = await api.get('/admin/reviewers/');
    return response.data;
  },

  uploadProposal: async (formData) => {
    const response = await api.post('/admin/proposals/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
