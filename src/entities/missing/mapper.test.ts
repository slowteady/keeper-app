import { mapToMissingDetail, mapToMissingList } from './mapper';
import { MissingDataDto, MissingResponseDto } from './schema';

const mockItem: MissingResponseDto = {
  id: 'm1',
  photos: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
  kind: '진도견',
  color: '갈색',
  sex: 'M',
  age: '6살',
  specialMark: '왼쪽 귀가 접혀 있어요',
  happenAddr: '서울특별시 강남구 역삼동',
  happenPlace: '역삼역 3번 출구',
  happenDt: '2026-07-01',
  orgNm: '강남구청'
};

describe('mapToMissingList', () => {
  it('첫 사진을 uri 로, 지역은 앞 2토큰 요약, 특징은 trim, 실종일 포맷', () => {
    const [item] = mapToMissingList([mockItem]);

    expect(item.uri).toBe('https://example.com/1.jpg');
    expect(item.kind).toBe('진도견');
    expect(item.region).toBe('서울특별시 강남구');
    expect(item.specialMark).toBe('왼쪽 귀가 접혀 있어요');
    expect(item.date).toBe('2026.07.01');
  });

  it('특징이 없으면 빈 문자열', () => {
    const [item] = mapToMissingList([{ ...mockItem, specialMark: null }]);
    expect(item.specialMark).toBe('');
  });

  it('사진이 없으면 uri 는 undefined', () => {
    const [item] = mapToMissingList([{ ...mockItem, photos: [] }]);
    expect(item.uri).toBeUndefined();
  });

  it('빈 배열 입력 시 빈 배열 반환', () => {
    expect(mapToMissingList([])).toEqual([]);
  });

  it('동일 source 객체는 동일 매핑 참조 반환 (FlashList 최적화)', () => {
    const src = [mockItem, { ...mockItem, id: 'm2' }];
    const first = mapToMissingList(src);
    const second = mapToMissingList(src);
    expect(second[0]).toBe(first[0]);
    expect(second[1]).toBe(first[1]);
  });
});

describe('mapToMissingDetail', () => {
  const detail: MissingDataDto = { ...mockItem, callTel: '010-1234-5678' };

  it('callTel·사진·관할기관·실종장소·실종일(포맷) 전달', () => {
    const result = mapToMissingDetail(detail);
    expect(result.callTel).toBe('010-1234-5678');
    expect(result.photos).toEqual(mockItem.photos);
    expect(result.orgNm).toBe('강남구청');
    expect(result.happenPlace).toBe('역삼역 3번 출구');
    expect(result.happenDt).toBe('2026.07.01');
  });

  it('성별 M→남아, F→여아 변환(공통 라벨 재활용), 지역 스펙', () => {
    const male = mapToMissingDetail(detail);
    expect(male.rows.find((r) => r.label === '성별')?.value).toBe('남아');

    const female = mapToMissingDetail({ ...detail, sex: 'F' });
    expect(female.rows.find((r) => r.label === '성별')?.value).toBe('여아');

    expect(male.rows.find((r) => r.label === '지역')?.value).toBe('서울특별시 강남구 역삼동');
  });

  it('실종일은 스펙 행이 아니라 별도 필드로 노출', () => {
    const result = mapToMissingDetail(detail);
    expect(result.rows.map((r) => r.label)).not.toContain('실종일');
  });

  it('null 필드는 스펙 행에서 제외', () => {
    const result = mapToMissingDetail({
      ...detail,
      color: null,
      sex: null,
      age: null,
      specialMark: null
    });
    const labels = result.rows.map((r) => r.label);
    expect(labels).not.toContain('색상');
    expect(labels).not.toContain('성별');
    expect(labels).not.toContain('나이');
    expect(labels).not.toContain('특징');
    expect(labels).toContain('품종');
    expect(labels).toContain('지역');
  });
});
