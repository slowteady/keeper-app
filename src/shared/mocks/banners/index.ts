import { fakerKO as faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

export const banners = http.get('https://app.our-keeper.com/api/banners', ({ request }) => {
  const url = new URL(request.url);
  const quantity = Number(url.searchParams.get('quantity')) || 10;

  const data = Array.from({ length: quantity }, (_, i) => ({
    id: i + 1,
    image: faker.image.urlLoremFlickr({ width: 480, height: 480 }),
    title: faker.lorem.words(3),
    description: faker.lorem.sentence()
  }));

  return HttpResponse.json({
    code: 'OK',
    data
  });
});
