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

/**
 * - 시간 차이를 방금 막, 분 전, 시간 전, 일 전, 날짜로 변환
 */
export const formatTimeAgo = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);

  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) {
    return '방금 막';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  if (diffDays < 2) {
    return `${diffDays}일 전`;
  }

  // 2일 이상이면 날짜로 출력
  return target.format('YYYY-MM-DD');
};
