import apiClient from './client';

export const authAPI = {
  register: (email: string, name: string, password: string, birthDate?: string) =>
    apiClient.post('/auth/register', { email, name, password, birthDate }),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
};

export const cabinAPI = {
  getAll: () =>
    apiClient.get('/cabins'),
  
  getById: (id: string) =>
    apiClient.get(`/cabins/${id}`),
  
  create: (data: any) =>
    apiClient.post('/cabins', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/cabins/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/cabins/${id}`),
};

export const bookingAPI = {
  create: (data: any) =>
    apiClient.post('/bookings', data),
  
  getMyBookings: () =>
    apiClient.get('/bookings'),
  
  cancel: (id: string) =>
    apiClient.patch(`/bookings/${id}/cancel`),
};

export const reviewAPI = {
  create: (data: any) =>
    apiClient.post('/reviews', data),
  
  getCabinReviews: (cabinId: string) =>
    apiClient.get(`/reviews/cabin/${cabinId}`),
};
