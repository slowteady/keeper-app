import { parseQueryParam } from './make-query';

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
