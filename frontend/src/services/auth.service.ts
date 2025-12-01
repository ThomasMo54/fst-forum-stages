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
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

const logout = () => {
  localStorage.removeItem('token');
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

const AuthService = {
  login,
  logout,
  getCurrentUser,
};

export default AuthService;