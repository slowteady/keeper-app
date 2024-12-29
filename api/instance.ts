import axios from 'axios';

export const publicApi = axios.create({
  baseURL: 'http://3.39.64.86:8080/api',
  timeout: 10000
});
