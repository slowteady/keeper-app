import { resolveVideoUpload } from './resolve-video';

describe('resolveVideoUpload', () => {
  it('영상 없으면 null (업로드 호출 안 함)', async () => {
    const upload = jest.fn();
    const result = await resolveVideoUpload(null, upload);
    expect(result).toBeNull();
    expect(upload).not.toHaveBeenCalled();
  });

  it('로컬 영상(file://)이면 업로드해서 URL 반환', async () => {
    const upload = jest.fn().mockResolvedValue({
      videoUrl: 'https://r2/v.mp4',
      videoThumbnailUrl: 'https://r2/t.jpg'
    });
    const video = { uri: 'file:///v.mov', thumbnailUri: 'file:///t.jpg', duration: 27 };

    const result = await resolveVideoUpload(video, upload);

    expect(upload).toHaveBeenCalledWith(video);
    expect(result).toEqual({ videoUrl: 'https://r2/v.mp4', videoThumbnailUrl: 'https://r2/t.jpg', videoDuration: 27 });
  });

  it('기존 원격 영상(http)이면 재업로드 없이 그대로 재사용 (수정 시 미변경)', async () => {
    const upload = jest.fn();
    const video = { uri: 'https://r2/old.mp4', thumbnailUri: 'https://r2/old.jpg', duration: 12 };

    const result = await resolveVideoUpload(video, upload);

    expect(upload).not.toHaveBeenCalled();
    expect(result).toEqual({
      videoUrl: 'https://r2/old.mp4',
      videoThumbnailUrl: 'https://r2/old.jpg',
      videoDuration: 12
    });
  });
});
