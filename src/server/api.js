import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const registerUser = async (userData) => {
    return axios.post(`http://localhost:3000/api/register`, userData);
};

export const loginUser = async (credentials) => {
    return await axios.post('http://localhost:3000/api/login', credentials);
  };
