import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const login = async (formData: { login: string; password: string }): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const token = response.data.token;
    return token;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/auth/logout`);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};


export const subscribe = async (formData: { login: string; password: string, username:string, profileImageUrl:string, backgroundImageUrl:string, description:string, joinDate:Date }): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/subscribe`, formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user (subscribe):", error);
    throw error;
  }
};