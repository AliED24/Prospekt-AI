import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: {
    Accept: 'application/json',
  },
  // optional:  timeout: 10000,
});

export default api;

