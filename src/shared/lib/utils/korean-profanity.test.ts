import { containsProfanity } from './korean-profanity';

describe('containsProfanity', () => {
  it('빈 문자열은 통과', () => {
    expect(containsProfanity('')).toBe(false);
  });

  it('명백한 욕설을 잡는다', () => {
    expect(containsProfanity('씨발 진짜')).toBe(true);
    expect(containsProfanity('이런 병신')).toBe(true);
    expect(containsProfanity('지랄하지마')).toBe(true);
  });

  it('공백·특수문자 삽입 우회를 잡는다', () => {
    expect(containsProfanity('씨 발')).toBe(true);
    expect(containsProfanity('씨@발')).toBe(true);
    expect(containsProfanity('병.신')).toBe(true);
  });

  it('연속 반복 글자 우회를 잡는다', () => {
    expect(containsProfanity('씨발발발')).toBe(true);
    expect(containsProfanity('병신!!!!')).toBe(true);
  });

  it('숫자 치환(leet) 우회를 잡는다', () => {
    expect(containsProfanity('시1발')).toBe(true);
  });

  it('초성 욕설을 잡는다', () => {
    expect(containsProfanity('진짜 ㅅㅂ')).toBe(true);
    expect(containsProfanity('ㅈㄹ하네')).toBe(true);
  });

  it('정상 표현은 통과한다', () => {
    expect(containsProfanity('안녕하세요 강아지 입양 문의해요')).toBe(false);
    expect(containsProfanity('2개월 강아지예요')).toBe(false);
    expect(containsProfanity('존맛탱 간식 추천해요')).toBe(false);
  });

  it('유기동물 맥락의 "새끼"는 통과한다', () => {
    expect(containsProfanity('강아지 새끼 세 마리 있어요')).toBe(false);
    expect(containsProfanity('고양이 새끼 분양해요')).toBe(false);
  });
});
