import api from './api';

export const evaluationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/evaluations', { params });
    return response.data;
  },

  getByProposal: async (proposalId) => {
    const response = await api.get(`/evaluations/proposal/${proposalId}`);
    return response.data;
  },

  submit: async (evaluationData) => {
    const response = await api.post('/evaluations', evaluationData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/evaluations/stats');
    return response.data;
  },
};
