import { redirectSystemPath, resolveNotificationPath } from './deeplink';
import { logger } from './utils/handle-error';

jest.mock('./utils/handle-error', () => ({
  logger: { error: jest.fn() }
}));

describe('resolveNotificationPath', () => {
  it.each([
    ['post', 'p1', '/(untabs)/community/p1'],
    ['comment', 'p2', '/(untabs)/community/p2'],
    ['inquiry', 'i1', '/(untabs)/profile/inquiry/i1']
  ])('refType=%s refId=%s → %s', (refType, refId, expected) => {
    expect(resolveNotificationPath(refType, refId)).toBe(expected);
  });

  it('refType/refId 가 없으면 null', () => {
    expect(resolveNotificationPath(null, null)).toBeNull();
    expect(resolveNotificationPath('post', null)).toBeNull();
    expect(resolveNotificationPath(undefined, undefined)).toBeNull();
  });

  it('미지원 refType 은 null 이고 logger.error 로 기록한다', () => {
    expect(resolveNotificationPath('unknown', 'x')).toBeNull();
    expect(logger.error).toHaveBeenCalledWith('[deeplink] unsupported refType', 'unknown');
  });
});

describe('redirectSystemPath', () => {
  it.each([
    ['https://our-keeper.com/share/adopt/123', '/(untabs)/adopt/123'],
    ['https://our-keeper.com/share/shelter/abc', '/(untabs)/shelter/abc'],
    ['https://our-keeper.com/share/community/45', '/(untabs)/community/45'],
    ['keeper://adopt/123', '/(untabs)/adopt/123'],
    ['keeper://shelter/abc', '/(untabs)/shelter/abc'],
    ['keeper://community/45', '/(untabs)/community/45']
  ])('%s → %s', (input, expected) => {
    expect(redirectSystemPath({ path: input, initial: true })).toBe(expected);
  });

  it('미지원 type 은 원본 path 를 반환한다', () => {
    const path = 'https://our-keeper.com/share/foo/1';
    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });

  it('id 가 없으면 원본 path 를 반환한다', () => {
    const path = 'https://our-keeper.com/share/adopt';
    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });

  it('share prefix 없는 keeper 스킴도 변환한다', () => {
    expect(redirectSystemPath({ path: 'keeper://adopt/999', initial: false })).toBe('/(untabs)/adopt/999');
  });

  it('깨진 입력에도 throw 하지 않는다', () => {
    expect(() => redirectSystemPath({ path: '!!!', initial: true })).not.toThrow();
  });
});
