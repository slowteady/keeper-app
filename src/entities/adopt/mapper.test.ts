import { mapToAdopt, mapToAdoptList } from './mapper';
import { AdoptDataDto } from './schema';

const mockAdoptData: AdoptDataDto = {
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

describe('mapToAdoptList', () => {
  it('transforms adopt data array with chips and description', () => {
    const result = mapToAdoptList([mockAdoptData]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('uri');
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('chips');
    expect(result[0]).toHaveProperty('description');
    expect(result[0].title).toBe('[강아지] 믹스견');
  });

  it('includes neuter chip when neuterYn is Y', () => {
    const result = mapToAdoptList([mockAdoptData]);
    const neuterChip = result[0].chips.find((c: { id: string }) => c.id === 'NEUTER');

    expect(neuterChip).toBeDefined();
    expect(neuterChip?.value).toBe('중성화');
  });

  it('includes filter chip for NEAR_DEADLINE', () => {
    const result = mapToAdoptList([mockAdoptData], 'NEAR_DEADLINE');
    const filterChip = result[0].chips.find((c: { id: string }) => c.id === 'NEAR_DEADLINE');

    expect(filterChip).toBeDefined();
    expect(filterChip?.value).toBe('안락사 위기');
  });
});

describe('mapToAdopt', () => {
  it('transforms single adopt data with formatted fields', () => {
    const result = mapToAdopt(mockAdoptData);

    expect(result.title).toBe('[강아지] 믹스견');
    expect(result.gender).toBe('남아');
    expect(result.age).toBe('2023');
    expect(result.weight).toBe('5.2kg');
  });
});
