import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { accept: 'application/json' }
});

export const authApi = api.create();
export const _publicApi = api.create();
