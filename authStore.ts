import { create } from 'zustand';
import { AuthState, UserRole } from '../types';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(email, password);
      const { token, user } = data.data!;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, role?: UserRole) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(name, email, password, role);
      const { token, user } = data.data!;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
      toast.success(`Welcome, ${user.name}!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },
}));
