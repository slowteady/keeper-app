import {
  addReadNoticeId,
  getReadNoticeIds,
  isUrgentNoticeDismissed,
  markUrgentNoticeDismissed
} from './notice-storage';

const store: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  })
}));

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
});

describe('읽음 ID', () => {
  it('처음에는 빈 배열', async () => {
    expect(await getReadNoticeIds()).toEqual([]);
  });

  it('추가한 ID가 저장된다', async () => {
    await addReadNoticeId('n1');
    expect(await getReadNoticeIds()).toEqual(['n1']);
  });

  it('중복 추가해도 한 번만 저장', async () => {
    await addReadNoticeId('n1');
    await addReadNoticeId('n1');
    expect(await getReadNoticeIds()).toEqual(['n1']);
  });
});

describe('긴급공지 dismiss', () => {
  it('dismiss 안 한 공지는 false', async () => {
    expect(await isUrgentNoticeDismissed('u1')).toBe(false);
  });

  it('dismiss 한 공지는 true, 다른 공지는 false', async () => {
    await markUrgentNoticeDismissed('u1');
    expect(await isUrgentNoticeDismissed('u1')).toBe(true);
    expect(await isUrgentNoticeDismissed('u2')).toBe(false);
  });
});
