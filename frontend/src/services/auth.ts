import axios from 'axios';

const API_URL = '/api/auth';

export const signup = async (
  password: string,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string
) => {
  return axios.post(`${API_URL}/signup`, {
    password,
    firstName,
    lastName,
    email,
    dateOfBirth,
  });
};

export const login = async (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};