import axios from "axios";

const API_URL = "http://localhost:5000";

export const getAuthStatus = async (userId: string) => {
  const response = await axios.get(`${API_URL}/auth/google/status/${userId}`);
  return response.data;
};

export const getAuthUrl = async (userId: string) => {
  const response = await axios.get(`${API_URL}/auth/google/url-auth/${userId}`);
  return response.data;
};