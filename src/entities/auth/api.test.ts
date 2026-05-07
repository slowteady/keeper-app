import { authApi, publicApi } from '@/shared/api/instance';

import { authQueries, checkNickname, deleteUser, getRefresh, getUser, login, logout, signup, updateMe } from './api';

const mockedAuthGet = jest.mocked(authApi.get);
const mockedAuthPost = jest.mocked(authApi.post);
const mockedAuthDelete = jest.mocked(authApi.delete);
const mockedAuthPatch = jest.mocked(authApi.patch);
const mockedPublicPost = jest.mocked(publicApi.post);

beforeEach(() => {
  jest.clearAllMocks();
  const noop = { data: { data: null } } as never;
  mockedAuthGet.mockResolvedValue(noop);
  mockedAuthPost.mockResolvedValue(noop);
  mockedAuthDelete.mockResolvedValue(noop);
  mockedAuthPatch.mockResolvedValue(noop);
  mockedPublicPost.mockResolvedValue(noop);
});

describe('login', () => {
  it('publicApi 로 POST /auth/login + body 전달', async () => {
    await login({ socialType: 'KAKAO', token: 't' });

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/login', { socialType: 'KAKAO', token: 't' });
  });
});

describe('logout', () => {
  it('authApi 로 POST /auth/logout', async () => {
    await logout();

    expect(mockedAuthPost).toHaveBeenCalledWith('/auth/logout');
  });
});

describe('getUser', () => {
  it('authApi 로 GET /auth/me', async () => {
    await getUser();

    expect(mockedAuthGet).toHaveBeenCalledWith('/auth/me');
  });
});

describe('getRefresh', () => {
  it('publicApi 로 POST /auth/refresh + refreshToken 전달', async () => {
    await getRefresh('rt-1');

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-1' });
  });
});

describe('checkNickname', () => {
  it('publicApi 로 POST /auth/check-nickname + body 전달', async () => {
    await checkNickname({ nickname: 'keeper' });

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/check-nickname', { nickname: 'keeper' });
  });
});

describe('signup', () => {
  it('publicApi 로 POST /auth/signup + body 전달', async () => {
    const body = {
      socialType: 'KAKAO' as const,
      socialId: 's1',
      nickname: 'keeper',
      agreedTermsVersion: 'v1.0',
      agreedPrivacyVersion: 'v1.0',
      agreedAt: '2026-05-04T00:00:00Z'
    };
    await signup(body);

    expect(mockedPublicPost).toHaveBeenCalledWith('/auth/signup', body);
  });
});

describe('deleteUser', () => {
  it('authApi 로 DELETE /auth/me', async () => {
    await deleteUser();

    expect(mockedAuthDelete).toHaveBeenCalledWith('/auth/me');
  });
});

describe('updateMe', () => {
  it('authApi 로 PATCH /auth/me + body 전달 (image)', async () => {
    await updateMe({ image: 'https://x.jpg' });

    expect(mockedAuthPatch).toHaveBeenCalledWith('/auth/me', { image: 'https://x.jpg' });
  });

  it('authApi 로 PATCH /auth/me + body 전달 (nickname)', async () => {
    await updateMe({ nickname: 'keeper2' });

    expect(mockedAuthPatch).toHaveBeenCalledWith('/auth/me', { nickname: 'keeper2' });
  });

  it('빈 body 도 그대로 전달', async () => {
    await updateMe({});

    expect(mockedAuthPatch).toHaveBeenCalledWith('/auth/me', {});
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
