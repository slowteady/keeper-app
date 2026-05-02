import { AxiosError, AxiosHeaders } from 'axios';

import { throwToErrorBoundary } from './handle-error';

describe('throwToErrorBoundary', () => {
  it('returns true for 500 error', () => {
    const error = new AxiosError('Server Error', '500', undefined, undefined, {
      status: 500,
      data: null,
      statusText: 'Internal Server Error',
      headers: {},
      config: { headers: new AxiosHeaders() }
    });
    expect(throwToErrorBoundary(error)).toBe(true);
  });

  it('returns true for 502 error', () => {
    const error = new AxiosError('Bad Gateway', '502', undefined, undefined, {
      status: 502,
      data: null,
      statusText: 'Bad Gateway',
      headers: {},
      config: { headers: new AxiosHeaders() }
    });
    expect(throwToErrorBoundary(error)).toBe(true);
  });

  it('returns false for 400 error', () => {
    const error = new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      data: null,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() }
    });
    expect(throwToErrorBoundary(error)).toBe(false);
  });

  it('returns false for 401 error', () => {
    const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
      status: 401,
      data: null,
      statusText: 'Unauthorized',
      headers: {},
      config: { headers: new AxiosHeaders() }
    });
    expect(throwToErrorBoundary(error)).toBe(false);
  });

  it('returns false for 404 error', () => {
    const error = new AxiosError('Not Found', '404', undefined, undefined, {
      status: 404,
      data: null,
      statusText: 'Not Found',
      headers: {},
      config: { headers: new AxiosHeaders() }
    });
    expect(throwToErrorBoundary(error)).toBe(false);
  });

  it('returns true for network error (no response)', () => {
    const error = new AxiosError('Network Error');
    expect(throwToErrorBoundary(error)).toBe(true);
  });

  it('returns true for non-Axios error', () => {
    expect(throwToErrorBoundary(new Error('Unknown'))).toBe(true);
  });

  it('returns true for string error', () => {
    expect(throwToErrorBoundary('something went wrong')).toBe(true);
  });

  it('returns true for null', () => {
    expect(throwToErrorBoundary(null)).toBe(true);
  });
});
