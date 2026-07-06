import { act, renderHook } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import { globalToast } from '@/shared/lib';

import { usePosterSave } from './use-poster-save';

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
  saveToLibraryAsync: jest.fn()
}));

jest.mock('expo-file-system', () => ({
  File: Object.assign(
    jest.fn().mockImplementation(() => ({
      exists: false,
      delete: jest.fn(),
      uri: 'file:///cache/poster.png'
    })),
    { downloadFileAsync: jest.fn() }
  ),
  Paths: { cache: {} }
}));

jest.mock('@/shared/lib', () => ({ globalToast: jest.fn() }));

const mockPermission = MediaLibrary.requestPermissionsAsync as jest.Mock;
const mockSaveToLibrary = MediaLibrary.saveToLibraryAsync as jest.Mock;
const mockDownload = File.downloadFileAsync as jest.Mock;
const mockToast = globalToast as jest.Mock;

describe('usePosterSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownload.mockResolvedValue({ uri: 'file:///cache/downloaded.png' });
  });

  it('flat 객체로 save와 isSaving을 반환한다', () => {
    const { result } = renderHook(() => usePosterSave());
    expect(typeof result.current.save).toBe('function');
    expect(result.current.isSaving).toBe(false);
  });

  it('권한이 거부되면 저장하지 않고 실패 토스트', async () => {
    mockPermission.mockResolvedValue({ granted: false });
    const { result } = renderHook(() => usePosterSave());

    await act(async () => {
      await result.current.save('https://cdn/p.png', 'd1');
    });

    expect(mockToast).toHaveBeenCalledWith('사진 접근 권한이 필요해요', 'fail');
    expect(mockSaveToLibrary).not.toHaveBeenCalled();
  });

  it('권한 허용 시 다운로드 후 갤러리에 저장하고 성공 토스트', async () => {
    mockPermission.mockResolvedValue({ granted: true });
    const { result } = renderHook(() => usePosterSave());

    await act(async () => {
      await result.current.save('https://cdn/p.png', 'd1');
    });

    expect(mockDownload).toHaveBeenCalled();
    expect(mockSaveToLibrary).toHaveBeenCalledWith('file:///cache/downloaded.png');
    expect(mockToast).toHaveBeenCalledWith('포스터를 저장했어요', 'success');
  });

  it('저장 중 에러가 나면 실패 토스트', async () => {
    mockPermission.mockResolvedValue({ granted: true });
    mockDownload.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => usePosterSave());

    await act(async () => {
      await result.current.save('https://cdn/p.png', 'd1');
    });

    expect(mockToast).toHaveBeenCalledWith('포스터를 저장하지 못했어요', 'fail');
  });
});
