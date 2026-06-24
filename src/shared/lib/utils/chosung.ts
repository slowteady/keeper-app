const CHOSUNG_ALL = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ'
] as const;

export const CHOSUNG_LABELS = [
  'ㄱ',
  'ㄴ',
  'ㄷ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅅ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ'
] as const;
export type ChosungLabel = (typeof CHOSUNG_LABELS)[number] | '#';

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const CHOSUNG_STRIDE = 588;

const DOUBLE_TO_SINGLE: Record<string, ChosungLabel> = {
  ㄲ: 'ㄱ',
  ㄸ: 'ㄷ',
  ㅃ: 'ㅂ',
  ㅆ: 'ㅅ',
  ㅉ: 'ㅈ'
};

export const getChosung = (text: string): ChosungLabel => {
  if (!text) return '#';
  const code = text.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return '#';
  const raw = CHOSUNG_ALL[Math.floor((code - HANGUL_START) / CHOSUNG_STRIDE)];
  return DOUBLE_TO_SINGLE[raw] ?? (raw as ChosungLabel);
};

export type ChosungSection<T> = { title: ChosungLabel; data: T[] };

export const groupByChosung = <T>(items: readonly T[], pick: (item: T) => string): ChosungSection<T>[] => {
  const map = new Map<ChosungLabel, T[]>();
  for (const item of items) {
    const key = getChosung(pick(item));
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  const order: ChosungLabel[] = [...CHOSUNG_LABELS, '#'];
  return order.filter((k) => map.has(k)).map((title) => ({ title, data: map.get(title)! }));
};
