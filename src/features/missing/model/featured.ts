import dayjs from 'dayjs';

export const dayOfYear = (date: Date): number => dayjs(date).diff(dayjs(date).startOf('year'), 'day') + 1;

export const rotateByDay = <T>(items: T[], seed: number): T[] => {
  if (items.length <= 1) return items;
  const offset = ((seed % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};
