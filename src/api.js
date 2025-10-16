// src/api.js
import axios from 'axios';

const API_KEY = 'abc_dev_xZwnXJBRhBQtF0KmkjmzzUHD';  // Substitua pela sua chave de API
const BASE_URL = 'https://api.abacatepay.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export default api; 