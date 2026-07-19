import { render } from '@testing-library/react-native';
import dayjs from 'dayjs';

import { MissingDetailDto } from '@/entities/missing';
import { createWrapper } from '@/test/create-wrapper';

import { MissingInfoSection } from './missing-info-section';

const BASE: MissingDetailDto = {
  id: 'p1',
  animalType: 'DOG',
  name: null,
  breed: '진돗개',
  gender: 'M',
  age: null,
  weight: null,
  hasIdTag: null,
  rfid: null,
  colorFeature: '갈색, 왼쪽 귀 접힘',
  description: null,
  lostAt: '2026-07-01T09:30:00.000Z',
  lat: 37.5,
  lng: 127.03,
  address: '서울특별시 강남구',
  regionCode: null,
  status: 'MISSING',
  hasContact: true,
  images: ['https://img/a.jpg'],
  videoUrl: null,
  videoThumbnailUrl: null,
  videoDuration: null,
  author: null,
  isOwner: false,
  createdAt: '2026-07-01T00:00:00.000Z'
};

describe('MissingInfoSection', () => {
  it('특징과 실종일시를 렌더한다', () => {
    const { getByText } = render(<MissingInfoSection missing={BASE} />, { wrapper: createWrapper() });
    expect(getByText('갈색, 왼쪽 귀 접힘')).toBeTruthy();
    expect(getByText(dayjs(BASE.lostAt).format('YYYY.MM.DD HH:mm'))).toBeTruthy();
  });

  it('사례금 행은 더 이상 렌더하지 않는다', () => {
    const { queryByText } = render(<MissingInfoSection missing={BASE} />, { wrapper: createWrapper() });
    expect(queryByText('사례금')).toBeNull();
  });

  it('선택 정보(이름·나이·몸무게·인식칩)가 있으면 렌더한다', () => {
    const { getByText } = render(
      <MissingInfoSection missing={{ ...BASE, name: '초코', age: '2020', weight: '3.5', hasIdTag: 'Y' }} />,
      { wrapper: createWrapper() }
    );
    expect(getByText('초코')).toBeTruthy();
    expect(getByText('2020년생')).toBeTruthy();
    expect(getByText('3.5kg')).toBeTruthy();
    expect(getByText('있음')).toBeTruthy();
  });

  it('선택 정보가 없으면 해당 행을 숨긴다', () => {
    const { queryByText } = render(<MissingInfoSection missing={BASE} />, { wrapper: createWrapper() });
    expect(queryByText('이름')).toBeNull();
    expect(queryByText('인식칩')).toBeNull();
  });

  it('실종장소(주소)를 렌더한다', () => {
    const { getByText } = render(<MissingInfoSection missing={BASE} />, { wrapper: createWrapper() });
    expect(getByText('실종장소')).toBeTruthy();
    expect(getByText('서울특별시 강남구')).toBeTruthy();
  });

  it('상세 설명이 있으면 렌더한다', () => {
    const { getByText } = render(
      <MissingInfoSection missing={{ ...BASE, description: '겁이 많아 이름 부르면 숨어요' }} />,
      { wrapper: createWrapper() }
    );
    expect(getByText('겁이 많아 이름 부르면 숨어요')).toBeTruthy();
  });

  it('상세 설명이 없으면 상세 특징 섹션을 숨긴다', () => {
    const { queryByText } = render(<MissingInfoSection missing={{ ...BASE, description: null }} />, {
      wrapper: createWrapper()
    });
    expect(queryByText('상세 특징')).toBeNull();
  });
});
