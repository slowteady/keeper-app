import { renderHook } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { isValidFile, showEditor } from 'react-native-video-trim';

import { globalToast } from '@/shared/lib';

import { useMediaPicker } from './use-media-picker';

jest.mock('@/shared/lib', () => ({
  ...jest.requireActual('@/shared/lib/utils/file-uri'),
  globalToast: jest.fn(),
  logger: { error: jest.fn() }
}));

jest.mock('react-native-video-trim', () => {
  const handlers: Record<string, (payload: unknown) => void> = {};
  const make = (name: string) => (cb: (payload: unknown) => void) => {
    handlers[name] = cb;
    return { remove: jest.fn() };
  };
  return {
    __esModule: true,
    default: {
      onFinishTrimming: make('finish'),
      onCancel: make('cancel'),
      onError: make('error')
    },
    showEditor: jest.fn(),
    isValidFile: jest.fn(() => Promise.resolve({ isValid: true, duration: 30266 })),
    __emit: (name: string, payload?: unknown) => handlers[name]?.(payload)
  };
});

jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(() => Promise.resolve({ uri: 'file:///mock/thumbnail.jpg', width: 100, height: 100 }))
}));

const mockedPicker = jest.mocked(ImagePicker.launchImageLibraryAsync);
const mockedShowEditor = jest.mocked(showEditor);
const emit = (jest.requireMock('react-native-video-trim') as { __emit: (n: string, p?: unknown) => void }).__emit;

const setPicked = (assets: { uri: string; type?: string }[]) => {
  mockedPicker.mockResolvedValue({ canceled: false, assets } as never);
};

beforeEach(() => {
  jest.clearAllMocks();
  (isValidFile as jest.Mock).mockResolvedValue({ isValid: true, duration: 30266 });
});

describe('useMediaPicker', () => {
  it('사진만 고르면 images 만 반환하고 트리밍은 안 연다', async () => {
    setPicked([
      { uri: 'file:///a.jpg', type: 'image' },
      { uri: 'file:///b.jpg', type: 'image' }
    ]);
    const { result } = renderHook(() => useMediaPicker());

    const picked = await result.current.pickMedia();

    expect(picked.images).toEqual(['file:///a.jpg', 'file:///b.jpg']);
    expect(picked.video).toBeNull();
    expect(mockedShowEditor).not.toHaveBeenCalled();
  });

  it('영상 포함 시 trim(30초) 후 outputPath + 썸네일을 반환한다', async () => {
    setPicked([
      { uri: 'file:///a.jpg', type: 'image' },
      { uri: 'file:///v.mov', type: 'video' }
    ]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: 'file:///trimmed.mp4' });
    const picked = await promise;

    expect(mockedShowEditor).toHaveBeenCalledWith('file:///v.mov', expect.objectContaining({ maxDuration: 30000 }));
    expect(picked.images).toEqual(['file:///a.jpg']);
    expect(picked.video).toEqual({
      uri: 'file:///trimmed.mp4',
      thumbnailUri: 'file:///mock/thumbnail.jpg',
      duration: 30
    });
  });

  it('영상 여러 개면 첫 1개만 트리밍하고 안내한다', async () => {
    setPicked([
      { uri: 'file:///v1.mov', type: 'video' },
      { uri: 'file:///v2.mov', type: 'video' }
    ]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: 'file:///trimmed.mp4' });
    await promise;

    expect(mockedShowEditor).toHaveBeenCalledTimes(1);
    expect(mockedShowEditor).toHaveBeenCalledWith('file:///v1.mov', expect.anything());
    expect(globalToast).toHaveBeenCalled();
  });

  it('트리밍 취소 시 video 는 null (사진은 유지)', async () => {
    setPicked([
      { uri: 'file:///a.jpg', type: 'image' },
      { uri: 'file:///v.mov', type: 'video' }
    ]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('cancel');
    const picked = await promise;

    expect(picked.images).toEqual(['file:///a.jpg']);
    expect(picked.video).toBeNull();
  });

  it('picker 취소 시 빈 결과', async () => {
    mockedPicker.mockResolvedValue({ canceled: true, assets: [] } as never);
    const { result } = renderHook(() => useMediaPicker());

    const picked = await result.current.pickMedia();

    expect(picked.images).toEqual([]);
    expect(picked.video).toBeNull();
  });

  it('트리밍 에러 시 명확한 토스트 + video null', async () => {
    setPicked([{ uri: 'file:///v.mov', type: 'video' }]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('error');
    const picked = await promise;

    expect(picked.video).toBeNull();
    expect(globalToast).toHaveBeenCalledWith('영상을 편집하지 못했어요. 다시 시도해 주세요', 'fail');
  });

  it('썸네일 생성 실패 시 안내 토스트 + 사진은 유지', async () => {
    (VideoThumbnails.getThumbnailAsync as jest.Mock).mockRejectedValueOnce(new Error('열 수 없음'));
    setPicked([
      { uri: 'file:///a.jpg', type: 'image' },
      { uri: 'file:///v.mov', type: 'video' }
    ]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: 'file:///trimmed.mp4' });
    const picked = await promise;

    expect(picked.images).toEqual(['file:///a.jpg']);
    expect(picked.video).toBeNull();
    expect(globalToast).toHaveBeenCalledWith('영상 미리보기를 만들지 못했어요. 다시 시도해 주세요', 'fail');
  });

  it('안드로이드 outputPath(스킴 없는 절대경로)를 file:// 로 정규화한다', async () => {
    setPicked([{ uri: 'file:///v.mov', type: 'video' }]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: '/data/user/0/com.keeper.love/files/trimmedVideo_1752.mp4' });
    const picked = await promise;

    const expected = 'file:///data/user/0/com.keeper.love/files/trimmedVideo_1752.mp4';
    expect(picked.video?.uri).toBe(expected);
    expect(isValidFile).toHaveBeenLastCalledWith(expected);
    expect((VideoThumbnails.getThumbnailAsync as jest.Mock).mock.calls[0][0]).toBe(expected);
  });

  it('이미 스킴이 있는 outputPath 는 그대로 둔다', async () => {
    setPicked([{ uri: 'file:///v.mov', type: 'video' }]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: 'file:///var/mobile/trimmed.mp4' });
    const picked = await promise;

    expect(picked.video?.uri).toBe('file:///var/mobile/trimmed.mp4');
  });

  it('썸네일을 0초가 아닌 지점에서 생성한다 (time:0 회귀 방지)', async () => {
    setPicked([{ uri: 'file:///v.mov', type: 'video' }]);
    const { result } = renderHook(() => useMediaPicker());

    const promise = result.current.pickMedia();
    await Promise.resolve();
    await Promise.resolve();
    emit('finish', { outputPath: 'file:///trimmed.mp4' });
    await promise;

    const call = (VideoThumbnails.getThumbnailAsync as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('file:///trimmed.mp4');
    expect(call[1].time).toBeGreaterThan(0);
  });
});
