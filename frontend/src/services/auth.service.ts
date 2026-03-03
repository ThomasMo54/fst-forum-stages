import { jwtDecode } from 'jwt-decode';
import api from "./api.ts";

interface LoginResponse {
  token: string;
  refreshToken: string;
  lastLoginAt: string | null;
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  userId: string;
  entityId: string;
}

const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post(`/auth/login`, { email, password });
  const data: LoginResponse = response.data;
  if (data.token && data.refreshToken && data.lastLoginAt) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.lastLoginAt) {
      localStorage.setItem('lastLoginAt', data.lastLoginAt);
    }
  }
  return data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('lastLoginAt');
};

const getCurrentUser = (): DecodedToken | null => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      return null;
    }
  }
  return null;
};

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const updateTokens = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};

const getLastLoginAt = () => localStorage.getItem('lastLoginAt');

const AuthService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  getRefreshToken,
  updateTokens,
  getLastLoginAt
};

export default AuthService;