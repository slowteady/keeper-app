import { z } from 'zod';

import { apiResponseSchema, pageResponseSchema } from './schema';

describe('apiResponseSchema', () => {
  it('should parse OK response and extract data', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({ code: 'OK', data: { id: '123' } });
    expect(result.data.id).toBe('123');
  });

  it('should accept response with message field', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({ code: 'OK', message: '조회 성공', data: { id: '123' } });
    expect(result.data.id).toBe('123');
  });

  it('should reject non-OK code', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    expect(() => schema.parse({ code: 'FAIL', message: 'error' })).toThrow();
  });
});

describe('pageResponseSchema', () => {
  it('should parse paginated response', () => {
    const schema = pageResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({
      total: 100,
      page: 0,
      size: 20,
      has_next: true,
      value: [{ id: '1' }]
    });
    expect(result.value).toHaveLength(1);
    expect(result.has_next).toBe(true);
  });
});
