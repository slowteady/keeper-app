import { fakerKO } from '@faker-js/faker';
import dayjs from 'dayjs';

import { CommentDto, CommentSortOrderDto } from '@/entities';
import { getUserValue } from '@/features/auth';
import { formatTimeAgo } from '@/shared';

export const getCommentList = (sortOrder: CommentSortOrderDto): CommentDto[] => {
  // 1. 원본 Date로 데이터 생성
  const commentsWithRawDate = Array.from({ length: 50 }, (_, id) => {
    const rawDate = id === 1 ? fakerKO.date.recent() : fakerKO.date.past();
    return {
      id: fakerKO.string.uuid(),
      user: getUserValue(),
      likeCount: fakerKO.number.int({ min: 0, max: 1000 }),
      content: fakerKO.lorem.text(),
      likeByMe: fakerKO.helpers.arrayElement([true, false]),
      rawDate
    };
  });

  // 2. dayjs로 정렬
  const sorted = commentsWithRawDate.sort((a, b) => {
    if (sortOrder === 'LATEST') {
      return dayjs(b.rawDate).diff(dayjs(a.rawDate));
    }
    return dayjs(a.rawDate).diff(dayjs(b.rawDate));
  });

  // 3. 정렬 후 formatTimeAgo로 변환
  return sorted.map(({ rawDate, ...comment }) => ({
    ...comment,
    createdAt: formatTimeAgo(rawDate)
  }));
};
