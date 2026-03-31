import { makeQueryString, parseQueryParam } from './make-query';

describe('makeQueryString', () => {
  it('should encode special characters', () => {
    const result = makeQueryString({ search: 'hello world&foo=bar' });
    expect(result).toBe('search=hello%20world%26foo%3Dbar');
  });

  it('should encode Korean characters', () => {
    const result = makeQueryString({ name: '강아지' });
    expect(result).toBe('name=%EA%B0%95%EC%95%84%EC%A7%80');
  });

  it('should handle empty params', () => {
    const result = makeQueryString({});
    expect(result).toBe('');
  });

  it('should filter out undefined, null, and empty string values', () => {
    const result = makeQueryString({ a: 'hello', b: undefined, c: null, d: '' });
    expect(result).toBe('a=hello');
  });
});

describe('parseQueryParam', () => {
  const list = [{ id: 'DOG' }, { id: 'CAT' }] as const;

  it('should return matching value', () => {
    expect(parseQueryParam(list, 'DOG', 'CAT')).toBe('CAT');
  });

  it('should return fallback for invalid value', () => {
    expect(parseQueryParam(list, 'DOG', 'INVALID')).toBe('DOG');
  });

  it('should return fallback for undefined', () => {
    expect(parseQueryParam(list, 'DOG', undefined)).toBe('DOG');
  });

  it('should handle array input', () => {
    expect(parseQueryParam(list, 'DOG', ['CAT', 'DOG'])).toBe('CAT');
  });
});
