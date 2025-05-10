import { AnimalType } from '@/types/common';
import { faker, fakerKO } from '@faker-js/faker/.';

export interface AdoptCardData {
  id: number;
  title: string;
  content: string;
  animalType: Omit<AnimalType, 'ALL'>;
  images: string[];
  comments: number;
  likes: number;
  views: number;
}

/**
 * 커뮤니티 - 개인입양 목록 데이터
 */
export const getAdoptListMockData = (count: number): AdoptCardData[] => {
  const ids = faker.helpers.uniqueArray(() => faker.number.int({ min: 1, max: count * 10 }), count);

  return ids.map((id) => {
    const animalType = fakerKO.helpers.arrayElement<AnimalType>(['DOG', 'CAT', 'OTHER']);
    const imageCount = fakerKO.number.int({ min: 1, max: 10 });
    const images = Array.from({ length: imageCount }, () => {
      return fakerKO.image.avatar();
    });

    return {
      id,
      title: fakerKO.lorem.sentence(),
      content: fakerKO.lorem.paragraphs(2),
      animalType,
      images,
      comments: fakerKO.number.int({ min: 0, max: 500 }),
      likes: fakerKO.number.int({ min: 0, max: 1000 }),
      views: fakerKO.number.int({ min: 0, max: 10000 })
    };
  });
};
