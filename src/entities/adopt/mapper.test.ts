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

  it('NEAR_DEADLINE 은 공고마감임박 라벨 칩을 넣지 않는다 (D-day 로 대체)', () => {
    const data = { ...mockAdoptData, chipType: 'NEAR_DEADLINE' as const };
    const result = mapToAdoptList([data]);
    const filterChip = result[0].chips.find((c: { id: string }) => c.id === 'NEAR_DEADLINE');

    expect(filterChip).toBeUndefined();
  });
});

describe('mapToAdoptList — edge cases', () => {
  it('returns empty array for empty input', () => {
    const result = mapToAdoptList([]);
    expect(result).toEqual([]);
  });

  it('handles missing age gracefully', () => {
    const data = { ...mockAdoptData, age: '' };
    const result = mapToAdoptList([data]);
    const ageChip = result[0].chips.find((c: { id: string }) => c.id === 'AGE');
    expect(ageChip).toBeUndefined();
  });

  it('handles missing weight gracefully', () => {
    const data = { ...mockAdoptData, weight: '' };
    const result = mapToAdoptList([data]);
    const weightChip = result[0].chips.find((c: { id: string }) => c.id === 'WEIGHT');
    expect(weightChip).toBeUndefined();
  });

  it('handles invalid weight (NaN)', () => {
    const data = { ...mockAdoptData, weight: 'abc' };
    const result = mapToAdoptList([data]);
    const weightChip = result[0].chips.find((c: { id: string }) => c.id === 'WEIGHT');
    expect(weightChip).toBeUndefined();
  });

  it('handles neuterYn N — no neuter chip', () => {
    const data = { ...mockAdoptData, neuterYn: 'N' as const };
    const result = mapToAdoptList([data]);
    const neuterChip = result[0].chips.find((c: { id: string }) => c.id === 'NEUTER');
    expect(neuterChip).toBeUndefined();
  });

  it('handles unknown gender', () => {
    const data = { ...mockAdoptData, gender: 'Q' as any };
    const result = mapToAdoptList([data]);
    const genderChip = result[0].chips.find((c: { id: string }) => c.id === 'GENDER');
    expect(genderChip?.value).toBe('미상');
  });

  it('handles female gender', () => {
    const data = { ...mockAdoptData, gender: 'F' as const };
    const result = mapToAdoptList([data]);
    const genderChip = result[0].chips.find((c: { id: string }) => c.id === 'GENDER');
    expect(genderChip?.value).toBe('여아');
  });

  it('uses first image as uri', () => {
    const data = { ...mockAdoptData, images: ['first.jpg', 'second.jpg'] };
    const result = mapToAdoptList([data]);
    expect(result[0].uri).toBe('first.jpg');
  });

  it('handles empty images array', () => {
    const data = { ...mockAdoptData, images: [] as string[] };
    const result = mapToAdoptList([data]);
    expect(result[0].uri).toBeUndefined();
  });

  it('does not include D-day chip for NEW chipType', () => {
    const data = { ...mockAdoptData, chipType: 'NEW' as const };
    const result = mapToAdoptList([data]);
    const ddayChip = result[0].chips.find((c: { id: string }) => c.id === 'DDAY');
    expect(ddayChip).toBeUndefined();
  });

  it('does not include D-day chip when notice already expired', () => {
    const data = { ...mockAdoptData, noticeEndDt: '20200101', chipType: 'NEAR_DEADLINE' as const };
    const result = mapToAdoptList([data]);
    const ddayChip = result[0].chips.find((c: { id: string }) => c.id === 'DDAY');
    expect(ddayChip).toBeUndefined();
  });

  it('converts [개] to [강아지] in fullName', () => {
    const data = { ...mockAdoptData, fullName: '[개] 포메라니안' };
    const result = mapToAdoptList([data]);
    expect(result[0].title).toBe('[강아지] 포메라니안');
  });

  it('does not convert [고양이] in fullName', () => {
    const data = { ...mockAdoptData, fullName: '[고양이] 코리안숏헤어' };
    const result = mapToAdoptList([data]);
    expect(result[0].title).toBe('[고양이] 코리안숏헤어');
  });
});

describe('mapToAdopt', () => {
  it('transforms single adopt data with formatted fields', () => {
    const result = mapToAdopt(mockAdoptData);

    expect(result.title).toBe('[강아지] 믹스견');
    expect(result.gender).toBe('남아');
    expect(result.age).toBe('2023년생');
    expect(result.weight).toBe('5.2kg');
  });

  it('handles missing age', () => {
    const data = { ...mockAdoptData, age: '' };
    const result = mapToAdopt(data);
    expect(result.age).toBe('');
  });

  it('handles missing weight', () => {
    const data = { ...mockAdoptData, weight: '' };
    const result = mapToAdopt(data);
    expect(result.weight).toBe('');
  });

  it('formats weight without trailing .0', () => {
    const data = { ...mockAdoptData, weight: '10.0(kg)' };
    const result = mapToAdopt(data);
    expect(result.weight).toBe('10kg');
  });

  it('formats weight with decimal', () => {
    const data = { ...mockAdoptData, weight: '3.7(kg)' };
    const result = mapToAdopt(data);
    expect(result.weight).toBe('3.7kg');
  });
});
