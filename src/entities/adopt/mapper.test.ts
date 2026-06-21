import { mapToAdopt, mapToAdoptList, mapToPersonalAdoptList, PersonalAdoptSource } from './mapper';
import { AdoptDataDto } from './schema';

const personalSource = (over: Partial<PersonalAdoptSource> = {}): PersonalAdoptSource => ({
  id: 'p1',
  title: '코숏 나비 입양 보내요',
  content: '사람을 잘 따르는 순둥이예요',
  images: ['https://example.com/p.jpg'],
  animalType: 'CAT',
  specificType: '코숏',
  gender: 'F',
  neuterYn: 'N',
  age: '2022',
  weight: '3.5',
  location: '서울 마포구',
  displayTime: '2026-05-12T00:00:00.000Z',
  isLiked: false,
  adoptionStatus: 'IN_PROGRESS',
  ...over
});

describe('mapToPersonalAdoptList', () => {
  it('개인 공고를 카드 props로 변환 — 글 제목 헤드라인·선택값 칩·지역·시간 메타', () => {
    const [item] = mapToPersonalAdoptList([personalSource()]);

    expect(item.uri).toBe('https://example.com/p.jpg');
    // 헤드라인 = 작성 글 제목(필수값)
    expect(item.title).toBe('코숏 나비 입양 보내요');
    expect(item.intro).toBe('사람을 잘 따르는 순둥이예요');
    expect(item.isLiked).toBe(false);
    expect(item.completed).toBe(false);
    // 분류 칩(고양이=cat 색) 선두 + 품종은 칩 아닌 breed 필드로 분리 + 중성화 N → 생략
    expect(item.chips.find((c) => c.id === 'ANIMAL')).toMatchObject({ value: '고양이', variant: 'cat' });
    expect(item.chips.find((c) => c.id === 'KIND')).toBeUndefined();
    expect(item.breed).toBe('코숏');
    expect(item.chips.find((c) => c.id === 'GENDER')?.value).toBe('여아');
    expect(item.chips.find((c) => c.id === 'AGE')?.value).toBe('2022년생');
    expect(item.chips.find((c) => c.id === 'WEIGHT')?.value).toBe('3.5kg');
    expect(item.chips.find((c) => c.id === 'NEUTER')).toBeUndefined();
    // 지역·날짜는 분리 (묶지 않음)
    expect(item.region).toBe('서울 마포구');
    expect(item.dateText.length).toBeGreaterThan(0);
  });

  it('중성화 Y면 중성화 칩(notice) 포함', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ neuterYn: 'Y' })]);
    expect(item.chips.find((c) => c.id === 'NEUTER')).toMatchObject({ value: '중성화', variant: 'notice' });
  });

  it('성별 모름이면 성별 칩 생략', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ gender: null })]);
    expect(item.chips.find((c) => c.id === 'GENDER')).toBeUndefined();
  });

  it('protectionType 을 그대로 전달 (없으면 null)', () => {
    expect(mapToPersonalAdoptList([personalSource({ protectionType: 'ADOPTION' })])[0].protectionType).toBe('ADOPTION');
    expect(mapToPersonalAdoptList([personalSource()])[0].protectionType).toBeNull();
  });

  it('소개글이 없으면 intro 는 빈 문자열', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ content: null })]);
    expect(item.intro).toBe('');
  });

  it('입양완료면 completed=true', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ adoptionStatus: 'COMPLETED' })]);
    expect(item.completed).toBe(true);
  });

  it('품종이 없으면 breed 빈 문자열, 분류 칩은 기타(etc 색)', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ specificType: null, animalType: 'OTHER' })]);
    expect(item.title).toBe('코숏 나비 입양 보내요');
    expect(item.chips.find((c) => c.id === 'ANIMAL')).toMatchObject({ value: '기타', variant: 'etc' });
    expect(item.breed).toBe('');
  });

  it('지역이 없으면 region 은 빈 문자열 (날짜만 노출)', () => {
    const [item] = mapToPersonalAdoptList([personalSource({ location: null })]);
    expect(item.region).toBe('');
    expect(item.dateText.length).toBeGreaterThan(0);
  });
});

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
    expect(result[0].title).toBe('믹스견');
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
    expect(genderChip?.value).toBe('모름');
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

  it('[개] prefix 를 분리해 title 은 이름만, ANIMAL 칩은 강아지', () => {
    const data = { ...mockAdoptData, fullName: '[개] 포메라니안' };
    const result = mapToAdoptList([data]);
    expect(result[0].title).toBe('포메라니안');
    expect(result[0].chips.find((c: { id: string }) => c.id === 'ANIMAL')?.value).toBe('강아지');
  });

  it('[고양이] prefix 를 분리해 title 은 이름만, ANIMAL 칩은 고양이', () => {
    const data = { ...mockAdoptData, fullName: '[고양이] 코리안숏헤어' };
    const result = mapToAdoptList([data]);
    expect(result[0].title).toBe('코리안숏헤어');
    expect(result[0].chips.find((c: { id: string }) => c.id === 'ANIMAL')?.value).toBe('고양이');
  });
});

describe('mapToAdopt', () => {
  it('transforms single adopt data with formatted fields', () => {
    const result = mapToAdopt(mockAdoptData);

    expect(result.title).toBe('믹스견');
    expect(result.gender).toBe('남아');
    expect(result.age).toBe('2023년생');
    expect(result.weight).toBe('5.2kg');
  });

  it('handles missing age', () => {
    const data = { ...mockAdoptData, age: '' };
    const result = mapToAdopt(data);
    expect(result.age).toBe('모름');
  });

  it('handles missing weight', () => {
    const data = { ...mockAdoptData, weight: '' };
    const result = mapToAdopt(data);
    expect(result.weight).toBe('모름');
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
