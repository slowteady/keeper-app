import { fakerKO as faker } from '@faker-js/faker';

export const getBannerMockData = (quantity: number) => {
  let data = [];

  for (let i = 0; i < quantity; i++) {
    data.push({
      id: i + 1,
      image: faker.image.urlLoremFlickr({ category: 'dog', width: 480, height: 480 })
    });
  }

  return data;
};
