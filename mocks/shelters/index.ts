import { http, HttpResponse } from 'msw';
import shelterCountData from './shelterCount.json';
import sheltersData from './shelters.json';

export const shelters = http.get('https://app.our-keeper.com/api/shelters', ({ params }) => {
  return HttpResponse.json({
    code: 'OK',
    data: sheltersData
  });
});

export const shelter = http.get('https://app.our-keeper.com/api/shelters/:id', ({ params }) => {
  const { id } = params;
  const shelterValue = sheltersData.find((item) => item.id === Number(id));

  return HttpResponse.json({
    code: 'OK',
    data: shelterValue
  });
});

export const shelterCount = http.get('https://app.our-keeper.com/api/shelters/nearby/count', ({ params }) => {
  return HttpResponse.json({
    code: 'OK',
    data: shelterCountData
  });
});
