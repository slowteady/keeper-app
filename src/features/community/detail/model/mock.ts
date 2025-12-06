import { fakerKO } from '@faker-js/faker';

import { CommunityAdoptDetailDto } from '@/entities';
import { getUserValue } from '@/features/auth';
import { formatTimeAgo } from '@/shared';

export const getAdoptDetailValue = (id: string): CommunityAdoptDetailDto => {
  return {
    id: fakerKO.number.int({ min: 1, max: 1000000 }),
    user: getUserValue(),
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
