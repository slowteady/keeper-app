import { validateAndSanitizeTel } from './validation';

describe('validateAndSanitizeTel', () => {
  it('null 또는 빈 문자열은 null', () => {
    expect(validateAndSanitizeTel(null)).toBeNull();
    expect(validateAndSanitizeTel('')).toBeNull();
    expect(validateAndSanitizeTel('   ')).toBeNull();
  });

  it('별표/특수문자만 있는 경우 null', () => {
    expect(validateAndSanitizeTel('***')).toBeNull();
    expect(validateAndSanitizeTel('-()')).toBeNull();
    expect(validateAndSanitizeTel('  -- ')).toBeNull();
  });

  it('숫자만 추출했을 때 9자리 미만이면 null', () => {
    expect(validateAndSanitizeTel('012-345')).toBeNull();
  });

  it('숫자만 추출했을 때 11자리 초과면 null', () => {
    expect(validateAndSanitizeTel('010-1234-56789')).toBeNull();
  });

  it('유효한 전화번호는 그대로 반환 (9~11자리)', () => {
    expect(validateAndSanitizeTel('02-123-4567')).toBe('02-123-4567');
    expect(validateAndSanitizeTel('010-1234-5678')).toBe('010-1234-5678');
    expect(validateAndSanitizeTel('031-1234-5678')).toBe('031-1234-5678');
  });

  it('괄호가 있으면 괄호 이전 부분만 추출', () => {
    expect(validateAndSanitizeTel('02-1234-5678 (내선: 1234)')).toBe('02-1234-5678');
  });

  it('앞뒤 공백 제거', () => {
    expect(validateAndSanitizeTel('  010-1234-5678  ')).toBe('010-1234-5678');
  });
});
