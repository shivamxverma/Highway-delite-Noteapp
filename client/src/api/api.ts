import axios from "axios";

const BASE_URL = "https://highway-delite-noteapp-o5ew.onrender.com/api/v1";

export const googleLogin = (idToken: string) => {
  return axios.post(`${BASE_URL}/users/auth/google`, { idToken }, { withCredentials: true });
};

export const generateOTP = (email: string) => {
  return axios.post(`${BASE_URL}/users/generateotp`, { email }, { withCredentials: true });
};

export const register = (email: string, name: string, dob: Date, otp: string) => {
  return axios.post(`${BASE_URL}/users/register`, { email, name, dob, otp }, { withCredentials: true });
};

export const login = (email: string, otp: string) => {
  return axios.post(`${BASE_URL}/users/login`, { email, otp }, { withCredentials: true });
};


export const logout = () => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/users/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const getNotes = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/notes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const createNote = (title: string, description: string) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/notes`, { title, description }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const deleteNote = (id: number) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};