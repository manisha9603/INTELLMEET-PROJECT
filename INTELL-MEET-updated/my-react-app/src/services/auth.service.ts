 import API from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Register
export const signup = async (data: SignupData) => {
  const response = await API.post('/auth/signup', data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Login
export const login = async (data: LoginData) => {
  const response = await API.post('/auth/login', data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  return token ? true : false;
};