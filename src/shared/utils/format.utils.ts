import dayjs from 'dayjs';

/**
 * - 보호소 운영시간으로 변환
 */
export const formatTimeAMPM = (time: string) => {
  if (!time) return null;

  const parsedTime = dayjs(time, 'HH:mm');
  const formattedTime = parsedTime.format('A h시');

  return formattedTime.replace('AM', '오전').replace('PM', '오후');
};
