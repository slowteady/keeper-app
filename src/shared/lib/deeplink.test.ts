import { DeeplinkEvent, redirectSystemPath, resolveNotificationPath, subscribeDeeplink } from './deeplink';
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

  it('CONTENT_BLINDED 통지는 이의제기(문의 작성)로 보낸다', () => {
    expect(resolveNotificationPath('post', 'p1', 'CONTENT_BLINDED')).toBe('/(untabs)/profile/inquiry/new');
    expect(resolveNotificationPath(null, null, 'CONTENT_BLINDED')).toBe('/(untabs)/profile/inquiry/new');
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
    ['https://our-keeper.com/share/missing/77', '/(untabs)/missing/77'],
    ['keeper://adopt/123', '/(untabs)/adopt/123'],
    ['keeper://shelter/abc', '/(untabs)/shelter/abc'],
    ['keeper://community/45', '/(untabs)/community/45'],
    ['keeper://missing/77', '/(untabs)/missing/77']
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

  it('utm 쿼리가 붙어도 경로 변환은 동일하다', () => {
    const path = 'https://our-keeper.com/share/adopt/123?utm_source=instagram';
    expect(redirectSystemPath({ path, initial: true })).toBe('/(untabs)/adopt/123');
  });
});

describe('subscribeDeeplink', () => {
  let received: DeeplinkEvent[];
  let unsubscribe: () => void;

  beforeEach(() => {
    subscribeDeeplink(() => {})();
    received = [];
    unsubscribe = subscribeDeeplink((event) => received.push(event));
  });

  afterEach(() => unsubscribe());

  it('공유 링크 유입 시 type/id 와 utm 을 전달한다', () => {
    redirectSystemPath({
      path: 'https://our-keeper.com/share/adopt/123?utm_source=instagram&utm_medium=social&utm_content=post-1',
      initial: true
    });

    expect(received).toEqual([
      {
        type: 'adopt',
        id: '123',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmContent: 'post-1',
        initial: true
      }
    ]);
  });

  it('utm 이 없으면 null 로 채운다', () => {
    redirectSystemPath({ path: 'keeper://community/45', initial: false });

    expect(received).toEqual([
      { type: 'community', id: '45', utmSource: null, utmMedium: null, utmContent: null, initial: false }
    ]);
  });

  it('공유 링크가 아니면 방출하지 않는다', () => {
    redirectSystemPath({ path: 'https://our-keeper.com/share/foo/1', initial: true });
    redirectSystemPath({ path: '!!!', initial: true });

    expect(received).toEqual([]);
  });

  it('구독 전 유입은 보관했다가 구독 시점에 전달한다', () => {
    unsubscribe();
    redirectSystemPath({ path: 'keeper://missing/77', initial: true });

    const late: DeeplinkEvent[] = [];
    unsubscribe = subscribeDeeplink((event) => late.push(event));

    expect(late).toHaveLength(1);
    expect(late[0]).toMatchObject({ type: 'missing', id: '77' });
  });

  it('보관된 유입은 한 번만 전달한다', () => {
    unsubscribe();
    redirectSystemPath({ path: 'keeper://missing/77', initial: true });
    subscribeDeeplink(() => {})();

    const late: DeeplinkEvent[] = [];
    unsubscribe = subscribeDeeplink((event) => late.push(event));

    expect(late).toEqual([]);
  });
});
