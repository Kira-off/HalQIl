import api from './api';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return res.data;
  },
  register: async (data: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getMe: async () => {
    const res = await api.get('/users/me/');
    return res.data;
  },
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },
};
