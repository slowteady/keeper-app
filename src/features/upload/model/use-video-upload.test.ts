import { renderHook } from '@testing-library/react-native';
import { ImageManipulator } from 'expo-image-manipulator';
import { compress } from 'react-native-video-trim';

import { getPresignedUrls } from '@/entities/upload';
import { createWrapper } from '@/test/create-wrapper';

import { useVideoUpload } from './use-video-upload';

jest.mock('@/entities/upload', () => ({
  getPresignedUrls: jest.fn()
}));

jest.mock('react-native-video-trim', () => ({
  compress: jest.fn()
}));

const mockedGetPresigned = jest.mocked(getPresignedUrls);
const mockedCompress = jest.mocked(compress);

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

const setThumbnailSize = (width: number, height: number) => {
  (ImageManipulator.manipulate as jest.Mock).mockReturnValue({
    renderAsync: jest.fn(() =>
      Promise.resolve({
        width,
        height,
        saveAsync: jest.fn(() => Promise.resolve({ uri: 'file:///mock/manipulated.jpg' }))
      })
    )
  });
};

const localVideo = { uri: 'file:///v.mov', thumbnailUri: 'file:///t.jpg' };

beforeEach(() => {
  jest.clearAllMocks();
  mockedCompress.mockResolvedValue({ outputPath: 'file:///compressed.mp4' });
  setThumbnailSize(800, 800);
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

  it('가로 영상은 너비를 720 으로 맞춘다', async () => {
    setThumbnailSize(1920, 1080);
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    expect(mockedCompress).toHaveBeenCalledWith(
      'file:///v.mov',
      expect.objectContaining({ bitrate: 2000000, width: 720, height: -1 })
    );
  });

  it('세로 영상은 높이를 720 으로 맞춘다', async () => {
    setThumbnailSize(1080, 1920);
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    expect(mockedCompress).toHaveBeenCalledWith(
      'file:///v.mov',
      expect.objectContaining({ bitrate: 2000000, width: -1, height: 720 })
    );
  });

  it('안드로이드 outputPath(스킴 없는 절대경로)를 file:// 로 정규화해 업로드한다', async () => {
    mockedCompress.mockResolvedValue({ outputPath: '/data/user/0/com.keeper.love/cache/compressed.mp4' });
    setPresign('https://r2/v.mp4', 'https://r2/t.jpg');
    const { result } = renderHook(() => useVideoUpload(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ video: localVideo });

    expect(mockedFetch).toHaveBeenCalledWith('file:///data/user/0/com.keeper.love/cache/compressed.mp4');
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
