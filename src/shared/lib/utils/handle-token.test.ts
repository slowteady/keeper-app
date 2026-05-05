import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

import { getAccessToken, getRefreshToken, removeToken, saveAccessToken, saveRefreshToken } from './handle-token';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY'
}));

const mockedSet = jest.mocked(setItemAsync);
const mockedGet = jest.mocked(getItemAsync);
const mockedDelete = jest.mocked(deleteItemAsync);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('saveAccessToken', () => {
  it('accessToken 키로 AFTER_FIRST_UNLOCK 옵션과 함께 저장', async () => {
    await saveAccessToken('a-token');

    expect(mockedSet).toHaveBeenCalledWith('accessToken', 'a-token', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK'
    });
  });
});

describe('saveRefreshToken', () => {
  it('refreshToken 키로 THIS_DEVICE_ONLY 옵션과 함께 저장', async () => {
    await saveRefreshToken('r-token');

    expect(mockedSet).toHaveBeenCalledWith('refreshToken', 'r-token', {
      keychainAccessible: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY'
    });
  });
});

describe('getAccessToken', () => {
  it('accessToken 키로 조회한 결과 반환', async () => {
    mockedGet.mockResolvedValueOnce('saved-access');

    const result = await getAccessToken();

    expect(mockedGet).toHaveBeenCalledWith('accessToken');
    expect(result).toBe('saved-access');
  });
});

describe('getRefreshToken', () => {
  it('refreshToken 키로 조회한 결과 반환', async () => {
    mockedGet.mockResolvedValueOnce('saved-refresh');

    const result = await getRefreshToken();

    expect(mockedGet).toHaveBeenCalledWith('refreshToken');
    expect(result).toBe('saved-refresh');
  });
});

describe('removeToken', () => {
  it('accessToken/refreshToken 둘 다 삭제', async () => {
    await removeToken();

    expect(mockedDelete).toHaveBeenCalledWith('accessToken');
    expect(mockedDelete).toHaveBeenCalledWith('refreshToken');
    expect(mockedDelete).toHaveBeenCalledTimes(2);
  });
});
