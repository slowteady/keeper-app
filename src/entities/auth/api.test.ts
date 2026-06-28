import { authApi, publicApi } from '@/shared/api/instance';

import { authQueries, checkNickname, deleteUser, getRefresh, getUser, login, logout, updateMe } from './api';

const mockedAuthGet = jest.mocked(authApi.get);
const mockedAuthPost = jest.mocked(authApi.post);
const mockedAuthDelete = jest.mocked(authApi.delete);
const mockedAuthPatch = jest.mocked(authApi.patch);
const mockedPublicGet = jest.mocked(publicApi.get);
const mockedPublicPost = jest.mocked(publicApi.post);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedAuthGet.mockResolvedValue(noop);
  mockedAuthPost.mockResolvedValue(noop);
  mockedAuthDelete.mockResolvedValue(noop);
  mockedAuthPatch.mockResolvedValue(noop);
  mockedPublicGet.mockResolvedValue(noop);
  mockedPublicPost.mockResolvedValue(noop);
});

describe('login', () => {
  it('publicApi 로 POST /auth/login + body 전달', async () => {
    await login({ socialType: 'KAKAO', token: 't' });

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/login', { socialType: 'KAKAO', token: 't' });
  });
});

describe('logout', () => {
  it('authApi 로 POST /auth/logout (refreshToken 동봉)', async () => {
    await logout('r-token');

    expect(mockedAuthPost).toHaveBeenCalledWith('/auth/logout', {
      refreshToken: 'r-token'
    });
  });
});

describe('getUser', () => {
  it('authApi 로 GET /users/me', async () => {
    await getUser();

    expect(mockedAuthGet).toHaveBeenCalledWith('/users/me');
  });
});

describe('getRefresh', () => {
  it('publicApi 로 POST /auth/refresh + refreshToken 전달', async () => {
    await getRefresh('rt-1');

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-1' });
  });
});

describe('checkNickname', () => {
  it('publicApi 로 GET /users/check-nickname + params 전달', async () => {
    await checkNickname({ nickname: 'keeper' });

    expect(mockedPublicGet).toHaveBeenCalledWith('/users/check-nickname', { params: { nickname: 'keeper' } });
  });
});

describe('deleteUser', () => {
  it('authApi 로 DELETE /users/me + body (사유) 전달', async () => {
    const body = { reason: 'OTHER' as const, reasonDetail: '테스트' };
    await deleteUser(body);

    expect(mockedAuthDelete).toHaveBeenCalledWith('/users/me', { data: body });
  });
});

describe('updateMe', () => {
  it('authApi 로 PATCH /users/me + body 전달 (image)', async () => {
    await updateMe({ image: 'https://x.jpg' });

    expect(mockedAuthPatch).toHaveBeenCalledWith('/users/me', { image: 'https://x.jpg' });
  });

  it('authApi 로 PATCH /users/me + body 전달 (nickname)', async () => {
    await updateMe({ nickname: 'keeper2' });

    expect(mockedAuthPatch).toHaveBeenCalledWith('/users/me', { nickname: 'keeper2' });
  });

  it('빈 body 도 그대로 전달', async () => {
    await updateMe({});

    expect(mockedAuthPatch).toHaveBeenCalledWith('/users/me', {});
  });
});

describe('authQueries', () => {
  it('all() 키는 ["auth"] 이다', () => {
    expect(authQueries.all()).toEqual(['auth']);
  });

  it('me().queryKey 는 ["auth", "me"] 이다', () => {
    expect(authQueries.me().queryKey).toEqual(['auth', 'me']);
  });
});
