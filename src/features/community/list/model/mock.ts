import { fakerKO } from '@faker-js/faker';

import { CommunityAdoptListDto } from '@/entities';
import { getUserValue } from '@/features/auth';
import { formatTimeAgo } from '@/shared';

export const getAdoptListValue = (): CommunityAdoptListDto[] => {
  return Array.from({ length: 50 }, (_, id) => ({
    id: fakerKO.string.uuid(),
    user: getUserValue(),
    displayTime: id === 1 ? formatTimeAgo(fakerKO.date.recent()) : formatTimeAgo(fakerKO.date.past()),
    title: fakerKO.book.title(),
    content: fakerKO.lorem.text(),
    tags: [fakerKO.animal.dog(), fakerKO.animal.cat(), fakerKO.animal.bird(), fakerKO.animal.lion()],
    images: Array.from({ length: 5 }, () => fakerKO.image.avatar()),
    counts: {
      like: fakerKO.number.int({ min: 0, max: 1000 }),
      comment: fakerKO.number.int({ min: 0, max: 1000 }),
      view: fakerKO.number.int({ min: 0, max: 1000 })
    },
    isLiked: fakerKO.helpers.arrayElement([true, false])
  })).sort((a, b) => new Date(b.displayTime).getTime() - new Date(a.displayTime).getTime());
};
