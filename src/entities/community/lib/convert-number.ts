export const convertCountOver999 = (number: number): string => {
  if (number > 999) return '999+';
  return String(number);
};
