import { act, renderHook } from '@testing-library/react-native';
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

import { throwToErrorBoundary } from '@/shared/lib';

import { clearSuspended, useSuspension } from '../lib/suspension';
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

const suspendedError = () => {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

  return new AxiosError('Forbidden', '403', config, undefined, {
    status: 403,
    data: { code: 'FAIL', error: 'USER_SUSPENDED', details: { reason: '욕설', suspendedUntil: null } },
    statusText: 'Forbidden',
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

  afterEach(() => act(() => clearSuspended()));

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
      message: '인증이 만료됐어요 다시 로그인해주세요'
    });
    expect(throwToErrorBoundary(error)).toBe(false);
    expect(mockedRemoveToken).toHaveBeenCalledTimes(1);
    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
  });

  it('USER_SUSPENDED(403)면 갱신 시도 없이 토큰 제거 + 정지 상태로 전파', async () => {
    const api = axios.create({
      adapter: async () => Promise.reject(suspendedError())
    });
    const refreshFn = jest.fn();

    setupInterceptor(api, { refreshFn });

    const { result } = renderHook(() => useSuspension());
    let error: unknown;
    await act(async () => {
      error = await api.get('/users/me').catch((caught: unknown) => caught);
    });

    expect(error).toBeInstanceOf(AxiosError);
    expect(refreshFn).not.toHaveBeenCalled();
    expect(mockedRemoveToken).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ reason: '욕설', suspendedUntil: null });
  });
});
