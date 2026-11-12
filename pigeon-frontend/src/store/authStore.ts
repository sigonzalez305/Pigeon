import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: number;
  phone: string;
  displayName: string;
  avatarUrl?: string;
  activePigeonId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const USER_KEY = 'pigeon.user';

// Only the token used to survive a reload, which left a signed-in session with
// no user: the profile was blank and every message looked like someone else's.
const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const storeSession = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (phone, password) => {
    const response = await axios.post('/api/auth/login', { phone, password });
    const { token, user } = response.data;
    storeSession(token, user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ user, token, isAuthenticated: true });
  },

  register: async (phone, password, displayName) => {
    const response = await axios.post('/api/auth/register', { phone, password, displayName });
    const { token, user } = response.data;
    storeSession(token, user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

// Set token header if exists on init
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
