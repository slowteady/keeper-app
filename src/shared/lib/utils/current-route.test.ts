import { getCurrentPathname, setCurrentPathname } from './current-route';

afterEach(() => {
  setCurrentPathname('/');
});

describe('current-route', () => {
  it('초기값은 "/"', () => {
    expect(getCurrentPathname()).toBe('/');
  });

  it('setCurrentPathname 후 getCurrentPathname 으로 갱신값 반환', () => {
    setCurrentPathname('/profile');

    expect(getCurrentPathname()).toBe('/profile');
  });

  it('여러 번 갱신되면 마지막 값 유지', () => {
    setCurrentPathname('/a');
    setCurrentPathname('/b');
    setCurrentPathname('/c');

    expect(getCurrentPathname()).toBe('/c');
  });
});
