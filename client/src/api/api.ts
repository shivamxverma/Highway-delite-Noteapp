import axios from "axios";
import { supabase } from './supabase';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const googleLogin = (idToken: string) => {
  return axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/auth/google`, { idToken }, { withCredentials: true });
};

export const generateOTP = (email: string) => {
  return axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/generateotp`, { email }, { withCredentials: true });
};

export const register = (email: string, name: string, dob: Date, otp: string) => {
  return axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, { email, name, dob, otp }, { withCredentials: true });
};

export const login = (email: string, otp: string) => {
  return axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, { email, otp }, { withCredentials: true });
};

export const logout = () => {
  return apiClient.post("/users/logout", {});
};

export const getNotes = () => {
  return apiClient.get("/notes");
};

export const createNote = (title: string, description: string) => {
  return apiClient.post("/notes", { title, description });
};

export const deleteNote = (id: number) => {
  return apiClient.delete(`/notes/${id}`);
};