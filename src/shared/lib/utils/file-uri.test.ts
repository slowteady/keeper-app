import { toFileUri } from './file-uri';

describe('toFileUri', () => {
  it('스킴 없는 절대경로에 file:// 를 붙인다', () => {
    expect(toFileUri('/data/user/0/com.keeper.love/files/trimmedVideo_1752.mp4')).toBe(
      'file:///data/user/0/com.keeper.love/files/trimmedVideo_1752.mp4'
    );
  });

  it('이미 file:// 이면 그대로 둔다', () => {
    expect(toFileUri('file:///var/mobile/trimmed.mp4')).toBe('file:///var/mobile/trimmed.mp4');
  });

  it('다른 스킴도 그대로 둔다', () => {
    expect(toFileUri('content://media/external/video/media/1')).toBe('content://media/external/video/media/1');
    expect(toFileUri('https://cdn.example.com/a.mp4')).toBe('https://cdn.example.com/a.mp4');
  });
});
