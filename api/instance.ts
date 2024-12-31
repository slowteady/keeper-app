export interface PublicApiParams {
  endpoint: string;
  params?: Record<string, string>;
  options?: RequestInit;
  timeout?: number;
}

const BASE_URL = 'https://3.39.64.86:8080/api';

export const publicApi = async ({ endpoint, params = {}, options = {}, timeout = 10000 }: PublicApiParams) => {
  const controller = new AbortController();
  const { signal } = controller;

  const queryString = new URLSearchParams(params).toString();
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
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
