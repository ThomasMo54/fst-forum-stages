import { jwtDecode } from 'jwt-decode';
import api from "./api.ts";

interface LoginResponse {
  token: string;
  refreshToken: string;
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
}

const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post(`/auth/login`, { email, password });
  const data: LoginResponse = response.data;
  if (data.token && data.refreshToken) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/';
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

const AuthService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  getRefreshToken,
  updateTokens
};

export default AuthService;