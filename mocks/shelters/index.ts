import { http, HttpResponse } from 'msw';
import sheltersData from './shelters.json';

export const shelter = http.get('https://app.our-keeper.com/api/shelters/:id', ({ params }) => {
  const { id } = params;
  const shelterValue = sheltersData.find((item) => item.id === Number(id));

  return HttpResponse.json({
    code: 'OK',
    data: shelterValue
  });
});
