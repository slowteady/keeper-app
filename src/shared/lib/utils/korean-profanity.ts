const PROFANITY_WORDS = ['시발', '씨발', '병신', '지랄', '좆', '애미', '니미'];
const PROFANITY_CHOSEONG = ['ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ'];

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[0-9]/g, '')
    .replace(/[^가-힣ㄱ-ㅎa-z]/g, '')
    .replace(/(.)\1+/g, '$1');

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  const normalized = normalize(text);
  if (!normalized) return false;
  return (
    PROFANITY_WORDS.some((word) => normalized.includes(word)) ||
    PROFANITY_CHOSEONG.some((choseong) => normalized.includes(choseong))
  );
};
