import { fakerKO } from '@faker-js/faker';
import dayjs from 'dayjs';

import { CommentDto, CommentSortOrderDto } from '@/entities/comment';
import { CommunityAdoptDetailDto } from '@/entities/community';
import { formatTimeAgo } from '@/shared/lib';

const mockUser = () => ({
  id: fakerKO.number.int(),
  name: fakerKO.person.fullName(),
  nickname: fakerKO.person.firstName(),
  email: fakerKO.internet.email(),
  image: fakerKO.image.avatar(),
  socialType: 'KAKAO' as const
});

export const getAdoptDetailValue = (id: string): CommunityAdoptDetailDto => {
  return {
    id: fakerKO.number.int({ min: 1, max: 1000000 }),
    user: mockUser(),
    displayTime: formatTimeAgo(fakerKO.date.recent()),
    title: fakerKO.lorem.sentences(2),
    images: Array.from({ length: 5 }, () => fakerKO.image.avatar()),
    tags: [fakerKO.animal.dog(), fakerKO.animal.cat(), fakerKO.animal.bird(), fakerKO.animal.lion()],
    content: fakerKO.lorem.text(),
    age: fakerKO.date.birthdate().getFullYear().toString(),
    gender: fakerKO.helpers.arrayElement(['M', 'F']),
    weight: fakerKO.number.int({ min: 1, max: 100 }).toString(),
    healthCheck: fakerKO.helpers.arrayElement(['Y', 'N', 'NONE']),
    neuterYn: fakerKO.helpers.arrayElement(['Y', 'N', 'NONE']),
    vaccinationCheck: fakerKO.helpers.arrayElement(['NOT', 'FIRST', 'SECOND', 'THIRD', 'NONE']),
    specialMark: fakerKO.lorem.text(),
    likes: fakerKO.lorem.text(),
    dislikes: fakerKO.lorem.text(),
    health: fakerKO.lorem.text(),
    relatedLink: fakerKO.internet.url(),
    counts: {
      like: fakerKO.number.int({ min: 0, max: 1000 }),
      comment: fakerKO.number.int({ min: 0, max: 1000 }),
      view: fakerKO.number.int({ min: 0, max: 1000 })
    }
  };
};

export const getCommentList = (sortOrder: CommentSortOrderDto): CommentDto[] => {
  const commentsWithRawDate = Array.from({ length: 50 }, (_, id) => {
    const rawDate = id === 1 ? fakerKO.date.recent() : fakerKO.date.past();
    return {
      id: fakerKO.string.uuid(),
      user: mockUser(),
      likeCount: fakerKO.number.int({ min: 0, max: 1000 }),
      content: fakerKO.lorem.text(),
      likeByMe: fakerKO.helpers.arrayElement([true, false]),
      rawDate
    };
  });

  const sorted = commentsWithRawDate.sort((a, b) => {
    if (sortOrder === 'LATEST') return dayjs(b.rawDate).diff(dayjs(a.rawDate));
    return dayjs(a.rawDate).diff(dayjs(b.rawDate));
  });

  return sorted.map(({ rawDate, ...comment }) => ({
    ...comment,
    createdAt: formatTimeAgo(rawDate)
  }));
};
