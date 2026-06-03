import { AdoptDataDto } from './schema';
import { buildAdoptShareDesc } from './share-desc';

const base: AdoptDataDto = {
  id: '1',
  images: ['https://example.com/image.jpg'],
  animalType: 'DOG',
  specificType: '믹스견',
  fullName: '[개] 믹스견',
  neuterYn: 'Y',
  specialMark: '온순',
  color: '갈색',
  age: '2023(년생)',
  weight: '5.2(kg)',
  gender: 'M',
  happenPlace: '서울시 강남구',
  happenDt: '20240101',
  orgName: '서울특별시',
  noticeStartDt: '20240101',
  noticeEndDt: '20240201',
  shelterId: 'shelter-1',
  careTel: '02-1234-5678',
  noticeNo: 'NOTICE-001',
  rfid: null,
  vaccinationCheck: 'FIRST',
  healthCheck: 'Y'
};

describe('buildAdoptShareDesc', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-25T09:00:00+09:00'));
  });
  afterAll(() => jest.useRealTimers());

  it('종료된 공고는 [상태 라벨] 기관명 형태', () => {
    expect(buildAdoptShareDesc({ ...base, status: 'ADOPTED' })).toBe('[입양완료] 서울특별시');
  });

  it('진행 공고는 D-Day · 기관 · 품종 · 성별/나이를 합친다', () => {
    const result = buildAdoptShareDesc({ ...base, status: 'PROTECTING', noticeEndDt: '20240201' });
    expect(result).toContain('공고마감 D-7');
    expect(result).toContain('서울특별시');
    expect(result).toContain('믹스견');
  });

  it('마감일이 지난 경우 D-Day segment는 제외된다', () => {
    const result = buildAdoptShareDesc({ ...base, status: 'PROTECTING', noticeEndDt: '20240101' });
    expect(result).not.toContain('공고마감');
    expect(result).toContain('서울특별시');
  });

  it('모든 segment가 비면 fallback', () => {
    const result = buildAdoptShareDesc({
      ...base,
      status: 'PROTECTING',
      noticeEndDt: '20240101',
      orgName: '',
      specificType: '',
      gender: '',
      age: ''
    });
    expect(result).toBe('새 가족을 기다리는 아이예요');
  });
});
