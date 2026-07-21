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

  it('adopt refType 은 공고 상세로 보낸다', () => {
    expect(resolveNotificationPath('adopt', '448575202500001')).toBe('/(untabs)/adopt/448575202500001');
  });

  it('favorite refType 은 refId 없이 관심 목록으로 보낸다', () => {
    expect(resolveNotificationPath('favorite', null)).toBe('/(untabs)/profile/like');
  });

  it('shelter refType 은 보호소 상세로 보낸다', () => {
    expect(resolveNotificationPath('shelter', '331314202600001')).toBe('/(untabs)/shelter/331314202600001');
  });

  it('shelter-favorite refType 은 관심 목록의 보호소 탭으로 보낸다', () => {
    expect(resolveNotificationPath('shelter-favorite', null)).toBe('/(untabs)/profile/like?tab=shelter');
  });

  it('missing refType 은 유저 실종글 상세로 보낸다', () => {
    expect(resolveNotificationPath('missing', 'abc-123')).toBe('/(untabs)/missing/post/abc-123');
  });

  it('post refType 은 커뮤니티 상세로 보낸다(실종과 구분)', () => {
    expect(resolveNotificationPath('post', 'xyz')).toBe('/(untabs)/community/xyz');
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

  it('미지원 type 은 경로만 남겨 반환한다', () => {
    expect(redirectSystemPath({ path: 'https://our-keeper.com/share/foo/1', initial: true })).toBe('/share/foo/1');
  });

  it('id 가 없으면 경로만 남겨 반환한다', () => {
    expect(redirectSystemPath({ path: 'https://our-keeper.com/share/adopt', initial: true })).toBe('/share/adopt');
  });

  it('share prefix 없는 keeper 스킴도 변환한다', () => {
    expect(redirectSystemPath({ path: 'keeper://adopt/999', initial: false })).toBe('/(untabs)/adopt/999');
  });

  it.each([
    ['keeper:///(untabs)/profile/like?tab=shelter', '/(untabs)/profile/like?tab=shelter'],
    ['exp+keeper:///(untabs)/profile/like?tab=shelter', '/(untabs)/profile/like?tab=shelter'],
    ['keeper:///(untabs)/profile/like', '/(untabs)/profile/like']
  ])('공유 대상이 아닌 스킴 URL 은 라우터 경로로 정규화한다: %s → %s', (input, expected) => {
    expect(redirectSystemPath({ path: input, initial: true })).toBe(expected);
  });

  it('이미 라우터 경로면 그대로 반환한다', () => {
    expect(redirectSystemPath({ path: '/(untabs)/profile/like', initial: true })).toBe('/(untabs)/profile/like');
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
