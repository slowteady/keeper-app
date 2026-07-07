import { PosterSchema } from './schema';

describe('PosterSchema', () => {
  it('유효한 url을 통과시킨다', () => {
    expect(PosterSchema.parse({ url: 'https://cdn.example.com/poster.png' })).toEqual({
      url: 'https://cdn.example.com/poster.png'
    });
  });

  it('url 형식이 아니면 실패한다', () => {
    expect(() => PosterSchema.parse({ url: 'not-a-url' })).toThrow();
  });

  it('url이 없으면 실패한다', () => {
    expect(() => PosterSchema.parse({})).toThrow();
  });
});
