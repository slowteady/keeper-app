export const convertNumber = (number: number) => {
  if (number > 999) {
    return '999+';
  }

  return number;
};
