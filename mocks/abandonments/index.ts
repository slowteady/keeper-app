import { http, HttpResponse } from 'msw';
import abandonmentsData from './abandonments.json';

export const abandonment = http.get('https://app.our-keeper.com/api/abandonments/:id', ({ params }) => {
  const { id } = params;
  const abandonmentItem = abandonmentsData.find((item) => item.id === Number(id));

  return HttpResponse.json({
    code: 'OK',
    data: abandonmentItem
  });
});

export const abandonments = http.get('https://app.our-keeper.com/api/abandonments', ({ request }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const size = Number(url.searchParams.get('size')) || 10;
  const animalType = url.searchParams.get('animalType') || 'ALL';
  const filter = url.searchParams.get('filter') || 'NEAR_DEADLINE';

  // 데이터 필터링
  let filteredData =
    animalType === 'ALL' ? abandonmentsData : abandonmentsData.filter((item) => item.animalType === animalType);

  // 필터 옵션에 따른 정렬
  if (filter === 'NEAR_DEADLINE') {
    filteredData.sort((a, b) => new Date(a.noticeEndDt).getTime() - new Date(b.noticeEndDt).getTime());
  } else if (filter === 'NEW') {
    filteredData.sort((a, b) => new Date(b.noticeStartDt).getTime() - new Date(a.noticeStartDt).getTime());
  }

  const total = filteredData.length;
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const hasNext = endIndex < total;

  const responseData = {
    code: 'OK',
    data: {
      total,
      page,
      size,
      has_next: hasNext,
      value: paginatedData
    }
  };

  return HttpResponse.json(responseData);
});
