import { renderHook } from '@testing-library/react-native';
import * as ImageManipulator from 'expo-image-manipulator';

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

beforeEach(() => {
  jest.clearAllMocks();
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

  it('JPEG URI 는 ImageManipulator 변환을 호출하지 않는다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///photo.jpg']);

    expect(mockedManipulate).not.toHaveBeenCalled();
  });

  it('HEIC URI 는 ImageManipulator JPEG 변환 후 PUT 한다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    mockedManipulate.mockResolvedValue({
      uri: 'file:///converted.jpg',
      width: 100,
      height: 100
    } as never);
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///photo.HEIC']);

    expect(mockedManipulate).toHaveBeenCalledWith(
      'file:///photo.HEIC',
      [],
      expect.objectContaining({ format: 'jpeg' })
    );
    const blobCall = mockedFetch.mock.calls.find(([, init]) => !init || init.method !== 'PUT');
    expect(blobCall?.[0]).toBe('file:///converted.jpg');
  });

  it('PNG URI 도 JPEG 변환을 호출한다', async () => {
    setPresignedItems([{ uploadUrl: 'https://s3/u1', publicUrl: 'https://s3/p1' }]);
    setupFetch();
    mockedManipulate.mockResolvedValue({
      uri: 'file:///converted2.jpg',
      width: 100,
      height: 100
    } as never);
    const { result } = renderHook(() => useImageUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync(['file:///photo.png']);

    expect(mockedManipulate).toHaveBeenCalledTimes(1);
  });
});
