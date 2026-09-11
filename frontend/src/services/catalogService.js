import { apiRequest } from './authService';

export const catalogService = {
  list: () => apiRequest('/products'),
};
