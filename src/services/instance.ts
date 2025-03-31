import { buildQueryString } from '@/utils/queryUtils';

export interface PublicApiParams {
  endpoint: string;
  params?: Record<string, any>;
  options?: RequestInit;
  timeout?: number;
}

const BASE_URL = 'https://app.our-keeper.com/api';

export const publicApi = async ({ endpoint, params = {}, options = {}, timeout = 5000 }: PublicApiParams) => {
  const controller = new AbortController();
  const { signal } = controller;

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const headers = {
    accept: 'application/json',
    ...options.headers
  };
  const config = { ...options, headers, signal };
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
