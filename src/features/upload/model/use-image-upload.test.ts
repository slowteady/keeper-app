import { renderHook } from '@testing-library/react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

import { getPresignedUrls } from '@/entities/upload';
import { createWrapper } from '@/test/create-wrapper';

import { useImageUpload } from './use-image-upload';

jest.mock('@/entities/upload', () => ({
  getPresignedUrls: jest.fn()
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' }
}));

const mockedGetPresigned = jest.mocked(getPresignedUrls);
const mockedManipulate = jest.mocked(ImageManipulator.manipulateAsync);

const originalFetch = global.fetch;
const mockedFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockedFetch as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

const setImageSize = (width: number, height: number) => {
  jest
    .spyOn(Image, 'getSize')
    .mockImplementation((_uri, success) => (success as (w: number, h: number) => void)(width, height));
};

beforeEach(() => {
  jest.clearAllMocks();
  setImageSize(100, 100);
  mockedManipulate.mockResolvedValue({ uri: 'file:///processed.jpg', width: 100, height: 100 } as never);
});

const fakeBlob = new Blob(['fake'], { type: 'image/jpeg' });

const setPresignedItems = (items: { uploadUrl: string; publicUrl: string }[]) => {
  mockedGetPresigned.mockResolvedValue({ data: { data: { items } } } as never);
};

const setupFetch = () => {
  mockedFetch.mockImplementation((input: string | URL | Request, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      return Promise.resolve({ ok: true } as Response);
    }
    return Promise.resolve({ ok: true, blob: () => Promise.resolve(fakeBlob) } as unknown as Response);
  });
};

describe('useImageUpload', () => {
  it('uris 빈 배열이면 presign 호출 없이 빈 배열을 반환', async () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    const urls = await result.current.mutateAsync([]);

    expect(mockedGetPresigned).not.toHaveBeenCalled();
    expect(urls).toEqual([]);
  });

  it('uris N개면 count: N 으로 presign 을 1번만 호출한다', async () => {
    setPresignedItems([
      { uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' },
      { uploadUrl: 'https://s3/u2', publicUrl: 'https://s3/p2' }
    ]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///a.jpg', 'file:///b.jpg']);

    expect(mockedGetPresigned).toHaveBeenCalledTimes(1);
    expect(mockedGetPresigned).toHaveBeenCalledWith({ count: 2 });
  });

  it('각 uploadUrl 에 대해 PUT(Content-Type image/jpeg) 을 호출한다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///a.jpg']);

    const putCall = mockedFetch.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(putCall?.[0]).toBe('https://s3/u1');
    expect(putCall?.[1]?.headers).toMatchObject({ 'Content-Type': 'image/jpeg' });
    expect(putCall?.[1]?.body).toBe(fakeBlob);
  });

  it('publicUrl 배열을 presign 응답 순서대로 반환한다', async () => {
    setPresignedItems([
      { uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' },
      { uploadUrl: 'https://s3/u2', publicUrl: 'https://s3/p2' },
      { uploadUrl: 'https://s3/u3', publicUrl: 'https://s3/p3' }
    ]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    const urls = await result.current.mutateAsync(['file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg']);

    expect(urls).toEqual(['https://s3/p1', 'https://s3/p2', 'https://s3/p3']);
  });

  it('PUT 실패 시 mutateAsync 가 reject 된다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    mockedFetch.mockImplementation((_, init?: RequestInit) => {
      if (init?.method === 'PUT') return Promise.reject(new Error('s3 down'));
      return Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as unknown as Response);
    });
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync(['file:///a.jpg'])).rejects.toThrow('s3 down');
  });

  it('useMutation 인터페이스(mutateAsync, isPending)를 노출한다', () => {
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    expect(typeof result.current.mutateAsync).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('이미지를 JPEG 로 가공(manipulate)한 결과 uri 를 업로드한다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///photo.heic']);

    expect(mockedManipulate).toHaveBeenCalledWith(
      'file:///photo.heic',
      expect.any(Array),
      expect.objectContaining({ format: 'jpeg' })
    );
    const blobCall = mockedFetch.mock.calls.find(([, init]) => !init || init.method !== 'PUT');
    expect(blobCall?.[0]).toBe('file:///processed.jpg');
  });

  it('긴 변이 1920 초과면 리사이즈 action 을 포함해 가공한다', async () => {
    setImageSize(4000, 3000);
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///big.jpg']);

    expect(mockedManipulate).toHaveBeenCalledWith(
      'file:///big.jpg',
      [{ resize: { width: 1920 } }],
      expect.objectContaining({ format: 'jpeg' })
    );
  });

  it('긴 변이 1920 이하면 리사이즈 없이 압축만 한다', async () => {
    setImageSize(800, 600);
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///small.jpg']);

    expect(mockedManipulate).toHaveBeenCalledWith('file:///small.jpg', [], expect.objectContaining({ format: 'jpeg' }));
  });
});
