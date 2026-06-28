import { normalizeUrl } from './normalize-url';

describe('normalizeUrl', () => {
  it('스킴이 없으면 https:// 를 붙인다', () => {
    expect(normalizeUrl('instagram.com/keeper')).toBe('https://instagram.com/keeper');
    expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
  });

  it('스킴이 있으면 그대로 둔다', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('앞뒤 공백을 제거한다', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('빈 문자열은 그대로 둔다', () => {
    expect(normalizeUrl('   ')).toBe('');
  });
});
