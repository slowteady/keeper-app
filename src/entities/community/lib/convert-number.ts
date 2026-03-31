export const convertCountOver999 = (number: number) => {
  if (number > 999) {
    return '999+';
  }

  return number;
};
