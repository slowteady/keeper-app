import { formatNicknameNextChangeDate, getNicknameCooldownDays } from './nickname-cooldown';

describe('getNicknameCooldownDays', () => {
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

  it('변경 이력이 없으면(null/undefined) 0', () => {
    expect(getNicknameCooldownDays(null)).toBe(0);
    expect(getNicknameCooldownDays(undefined)).toBe(0);
  });

  it('31일 전 변경이면 0 (변경 가능)', () => {
    expect(getNicknameCooldownDays(daysAgo(31))).toBe(0);
  });

  it('29일 전 변경이면 1일 남음', () => {
    expect(getNicknameCooldownDays(daysAgo(29))).toBe(1);
  });

  it('방금 변경했으면 30일 남음', () => {
    expect(getNicknameCooldownDays(daysAgo(0))).toBe(30);
  });
});

describe('formatNicknameNextChangeDate', () => {
  it('기준일 + 30일을 M월 D일로 반환', () => {
    expect(formatNicknameNextChangeDate('2026-01-01T00:00:00Z')).toBe('1월 31일');
  });

  it('월 경계를 넘기면 다음 달 날짜', () => {
    expect(formatNicknameNextChangeDate('2026-06-20T00:00:00Z')).toBe('7월 20일');
  });
});
