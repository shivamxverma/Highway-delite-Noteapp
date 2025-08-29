import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1"; 

export const generateOTP = async(email : string) => {
    return axios.post(`${BASE_URL}/users/generateotp`, { email }, { withCredentials: true });
}

export const register = async(email : string,name : string, dob : Date,otp : string) => {
    return axios.post(`${BASE_URL}/users/register`, { email,name,dob ,otp}, { withCredentials: true });
}

export const login = async(email : string, otp : string) => {
    return axios.post(`${BASE_URL}/users/login`, { email,otp }, { withCredentials: true });
}

export const logout = async() => {
    return axios.post(`${BASE_URL}/users/logout`, {}, { withCredentials: true });
}

export const getNotes = async(accessToken : string) => {
    return axios.get(`${BASE_URL}/notes`, { 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true 
    });
}

export const createNote = async(accessToken : string, title: string, description: string) => {
    return axios.post(`${BASE_URL}/notes`, { title, description }, { 
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true 
    });
}