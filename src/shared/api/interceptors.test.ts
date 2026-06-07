import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

import { throwToErrorBoundary } from '@/shared/lib';

import { getAccessToken, getRefreshToken, removeToken } from '../lib/utils/handle-token';
import { setupInterceptor } from './interceptors';

jest.mock('../lib/utils/handle-token');

const mockedGetAccessToken = jest.mocked(getAccessToken);
const mockedGetRefreshToken = jest.mocked(getRefreshToken);
const mockedRemoveToken = jest.mocked(removeToken);

const unauthorizedError = () => {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

  return new AxiosError('Unauthorized', '401', config, undefined, {
    status: 401,
    data: null,
    statusText: 'Unauthorized',
    headers: {},
    config
  });
};

describe('setupInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('expired-access-token');
    mockedGetRefreshToken.mockResolvedValue('expired-refresh-token');
    mockedRemoveToken.mockResolvedValue();
  });

  it('토큰 갱신 실패 오류는 AxiosError 타입을 보존해 에러 바운더리로 보내지 않는다', async () => {
    const api = axios.create({
      adapter: async () => Promise.reject(unauthorizedError())
    });
    const onRefreshFailed = jest.fn();

    setupInterceptor(api, {
      refreshFn: async () => Promise.reject(unauthorizedError()),
      onRefreshFailed
    });

    const error = await api.get('/favorites').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(AxiosError);
    expect(error).toMatchObject({
      isAuthError: true,
      message: '인증이 만료되었습니다 다시 로그인해주세요'
    });
    expect(throwToErrorBoundary(error)).toBe(false);
    expect(mockedRemoveToken).toHaveBeenCalledTimes(1);
    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
  });
});
