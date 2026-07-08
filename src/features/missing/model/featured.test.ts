import { dayOfYear, rotateByDay } from './featured';

describe('dayOfYear', () => {
  it('1월 1일은 1', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it('1월 10일은 10', () => {
    expect(dayOfYear(new Date(2026, 0, 10))).toBe(10);
  });
});

describe('rotateByDay', () => {
  it('seed 만큼 앞으로 회전한다', () => {
    expect(rotateByDay(['a', 'b', 'c', 'd'], 1)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('seed 0 이면 그대로', () => {
    expect(rotateByDay(['a', 'b', 'c'], 0)).toEqual(['a', 'b', 'c']);
  });

  it('길이를 넘는 seed 는 wraparound', () => {
    expect(rotateByDay(['a', 'b', 'c'], 4)).toEqual(['b', 'c', 'a']);
  });

  it('음수 seed 도 정상 회전', () => {
    expect(rotateByDay(['a', 'b', 'c', 'd'], -1)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('빈 배열/단일 원소는 그대로', () => {
    expect(rotateByDay([], 3)).toEqual([]);
    expect(rotateByDay(['a'], 3)).toEqual(['a']);
  });
});
