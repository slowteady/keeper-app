import { getChosung, groupByChosung } from './chosung';

describe('getChosung', () => {
  it('returns chosung of korean syllable', () => {
    expect(getChosung('가')).toBe('ㄱ');
    expect(getChosung('나')).toBe('ㄴ');
    expect(getChosung('힣')).toBe('ㅎ');
  });

  it('returns first char chosung for multi-character text', () => {
    expect(getChosung('말티즈')).toBe('ㅁ');
    expect(getChosung('골든 리트리버')).toBe('ㄱ');
    expect(getChosung('푸들')).toBe('ㅍ');
  });

  it('maps double consonants to single consonant group', () => {
    expect(getChosung('까')).toBe('ㄱ'); // ㄲ → ㄱ
    expect(getChosung('따')).toBe('ㄷ'); // ㄸ → ㄷ
    expect(getChosung('빠')).toBe('ㅂ'); // ㅃ → ㅂ
    expect(getChosung('싸')).toBe('ㅅ'); // ㅆ → ㅅ
    expect(getChosung('짜')).toBe('ㅈ'); // ㅉ → ㅈ
  });

  it('returns # for non-korean text', () => {
    expect(getChosung('Apple')).toBe('#');
    expect(getChosung('123')).toBe('#');
    expect(getChosung('')).toBe('#');
  });
});

describe('groupByChosung', () => {
  it('groups items by chosung and preserves order', () => {
    const items = ['말티즈', '닥스훈트', '골든 리트리버', '시바견', '미니어처 푸들', '도베르만'];
    const sections = groupByChosung(items, (it) => it);
    expect(sections).toEqual([
      { title: 'ㄱ', data: ['골든 리트리버'] },
      { title: 'ㄷ', data: ['닥스훈트', '도베르만'] },
      { title: 'ㅁ', data: ['말티즈', '미니어처 푸들'] },
      { title: 'ㅅ', data: ['시바견'] }
    ]);
  });

  it('groups non-korean items under #', () => {
    const items = ['리트리버', 'Bulldog', '말티즈'];
    const sections = groupByChosung(items, (it) => it);
    expect(sections).toEqual([
      { title: 'ㄹ', data: ['리트리버'] },
      { title: 'ㅁ', data: ['말티즈'] },
      { title: '#', data: ['Bulldog'] }
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(groupByChosung([], (it) => it)).toEqual([]);
  });
});
