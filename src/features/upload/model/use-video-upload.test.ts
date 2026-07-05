import { renderHook } from '@testing-library/react-native';
import { Video } from 'react-native-compressor';

import { getPresignedUrls } from '@/entities/upload';
import { createWrapper } from '@/test/create-wrapper';

import { useVideoUpload } from './use-video-upload';

jest.mock('@/entities/upload', () => ({
  getPresignedUrls: jest.fn()
}));

jest.mock('react-native-compressor', () => ({
  Video: { compress: jest.fn() }
}));

const mockedGetPresigned = jest.mocked(getPresignedUrls);
const mockedCompress = jest.mocked(Video.compress);

const originalFetch = global.fetch;
const mockedFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockedFetch as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

const fakeBlob = new Blob(['fake'], { type: 'video/mp4' });

const setupFetch = () => {
  mockedFetch.mockImplementation((_input: string | URL | Request, init?: RequestInit) => {
    if (init?.method === 'PUT') return Promise.resolve({ ok: true } as Response);
    return Promise.resolve({ ok: true, blob: () => Promise.resolve(fakeBlob) } as unknown as Response);
  });
};

const setPresign = (video: string, thumb: string) => {
  mockedGetPresigned.mockImplementation((body) =>
    Promise.resolve({
      data: {
        data: {
          items: [
            body.mediaType === 'video'
              ? { uploadUrl: `${video}/put`, publicUrl: video }
              : { uploadUrl: `${thumb}/put`, publicUrl: thumb }
          ]
        }
      }
    } as never)
  );
};

const localVideo = { uri: 'file:///v.mov', thumbnailUri: 'file:///t.jpg' };

beforeEach(() => {
  jest.clearAllMocks();
  mockedCompress.mockResolvedValue('file:///compressed.mp4');
  setupFetch();
});

describe('useVideoUpload', () => {
  it('compress → presign(video)+presign(image) → PUT×2 → 공개 URL 반환', async () => {
    setPresign('https://r2/videos/v.mp4', 'https://r2/videos/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    const res = await result.current.mutateAsync({ video: localVideo });

    expect(res).toEqual({
      videoUrl: 'https://r2/videos/v.mp4',
      videoThumbnailUrl: 'https://r2/videos/t.jpg'
    });
  });

  it('영상은 720p/H.264 manual 압축한다', async () => {
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    expect(mockedCompress).toHaveBeenCalledWith(
      'file:///v.mov',
      expect.objectContaining({ compressionMethod: 'manual', maxSize: 720, bitrate: 2000000 }),
      expect.any(Function)
    );
  });

  it('presign 은 video/image 각각 mediaType 으로 호출한다', async () => {
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    expect(mockedGetPresigned).toHaveBeenCalledWith({ count: 1, mediaType: 'video' });
    expect(mockedGetPresigned).toHaveBeenCalledWith({ count: 1, mediaType: 'image' });
  });

  it('영상 PUT 은 Content-Type video/mp4 로 압축본을 올린다', async () => {
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    const put = mockedFetch.mock.calls.find(([url, init]) => init?.method === 'PUT' && url === 'https://r2/v.mp4/put');
    expect(put?.[1]?.headers).toMatchObject({ 'Content-Type': 'video/mp4' });
  });

  it('압축 실패(미지원 기기) 시 원본으로 fallback 해 첨부를 유지한다', async () => {
    mockedCompress.mockRejectedValue(new Error('unsupported'));
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    const res = await result.current.mutateAsync({ video: localVideo });

    expect(res.videoUrl).toBe('https://r2/v.mp4');
    const put = mockedFetch.mock.calls.find(([url, init]) => init?.method === 'PUT' && url === 'https://r2/v.mp4/put');
    expect(put?.[1]?.body).toBe(fakeBlob);
  });

  it('onProgress 를 compress 진행률로 전달한다', async () => {
    mockedCompress.mockImplementation(async (_uri, _opts, onProgress) => {
      (onProgress as (p: number) => void)?.(0.5);
      return 'file:///compressed.mp4';
    });
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const onProgress = jest.fn();
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo, onProgress });

    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('PUT 실패 시 reject', async () => {
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    mockedFetch.mockImplementation((_url, init?: RequestInit) => {
      if (init?.method === 'PUT') return Promise.reject(new Error('r2 down'));
      return Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as unknown as Response);
    });
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync({ video: localVideo })).rejects.toThrow('r2 down');
  });
});
