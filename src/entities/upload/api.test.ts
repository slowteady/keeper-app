import { authApi } from '@/shared/api/instance';

import { getPresignedUrls } from './api';

const mockedPost = jest.mocked(authApi.post);

describe('getPresignedUrls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPost.mockResolvedValue({ data: { data: { items: [] } } } as never);
  });

  it('POST /uploads/presign 으로 count 를 전달한다', async () => {
    await getPresignedUrls({ count: 3 });

    expect(mockedPost).toHaveBeenCalledWith('/uploads/presign', { count: 3 });
  });

  it('authApi 응답을 그대로 반환한다', async () => {
    const fakeResponse = {
      data: {
        data: {
          items: [
            { uploadUrl: 'https://a', publicUrl: 'https://a' },
            { uploadUrl: 'https://b', publicUrl: 'https://b' }
          ]
        }
      }
    };
    mockedPost.mockResolvedValue(fakeResponse as never);

    const result = await getPresignedUrls({ count: 2 });

    expect(result).toBe(fakeResponse);
  });
});
