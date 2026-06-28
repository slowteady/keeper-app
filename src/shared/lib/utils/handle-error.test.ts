import { AxiosError, AxiosHeaders } from 'axios';

import { getModerationMessage, throwToErrorBoundary } from './handle-error';

const axiosErrorWith = (status: number, data: unknown) =>
  new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() }
  });

describe('getModerationMessage', () => {
  it('CONTENT_MODERATION 에러면 서버 메시지를 반환한다', () => {
    const error = axiosErrorWith(400, {
      code: 'FAIL',
      error: 'CONTENT_MODERATION',
      message: '혐오·괴롭힘 표현이 감지됐어요. 커뮤니티 가이드라인을 확인해주세요.'
    });
    expect(getModerationMessage(error)).toBe('혐오·괴롭힘 표현이 감지됐어요. 커뮤니티 가이드라인을 확인해주세요.');
  });

  it('다른 에러 코드면 null', () => {
    const error = axiosErrorWith(400, { code: 'FAIL', error: 'VALIDATION_FAILED', message: '검증 실패' });
    expect(getModerationMessage(error)).toBeNull();
  });

  it('Axios 에러가 아니면 null', () => {
    expect(getModerationMessage(new Error('boom'))).toBeNull();
  });
});

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
