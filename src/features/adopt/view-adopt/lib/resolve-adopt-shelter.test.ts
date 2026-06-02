import type { ShelterDto } from '@/entities/shelter';
import { mapToShelter } from '@/entities/shelter';

import { resolveAdoptShelter } from './resolve-adopt-shelter';

// 헬퍼: 마스터 mapToShelter 통과한 형태로 입력값을 만든다.
const makeShelter = (overrides: Partial<ShelterDto> = {}) =>
  mapToShelter({
    id: 'sh-1',
    name: '창녕 유기동물보호소',
    address: '경상남도 창녕군 고암면 창밀로 335-26',
    tel: '055-000-0000',
    latitude: 35,
    longitude: 128,
    veterinarianCount: 1,
    caretakerCount: 0,
    weekdayOpenTime: '09:00',
    weekdayCloseTime: '18:00',
    weekendOpenTime: null,
    weekendCloseTime: null,
    closeDay: null,
    ...overrides
  });

// adopt 는 단순 객체. 실제 useAdopt 가 반환하는 형태 중 본 헬퍼가 참조하는 필드만 채운다.
const makeAdopt = (
  overrides: { careTel?: string | null; careNm?: string; careAddr?: string; shelterId?: string } = {}
) =>
  ({
    shelterId: 'sh-1',
    careNm: '창녕 유기동물보호소',
    careAddr: '경상남도 창녕군 고암면 창밀로 335-26',
    careTel: '010-5488-5003',
    ...overrides
  }) as Parameters<typeof resolveAdoptShelter>[0];

describe('resolveAdoptShelter', () => {
  it('shelter 마스터 매칭 + 공고 careTel 정상 → tel 은 공고 데이터 사용 (공고 우선 정책)', () => {
    const result = resolveAdoptShelter(makeAdopt({ careTel: '010-5488-5003' }), makeShelter({ tel: '055-000-0000' }));

    expect(result.tel).toBe('010-5488-5003');
  });

  it('shelter 마스터의 tel 이 마스킹(***********) → sanitize 후 falsy → 공고 careTel 로 회수', () => {
    // mapToShelter 안의 validateAndSanitizeTel 가 마스킹값을 falsy 로 처리한다고 가정.
    // 실제 운영에서 약 25개 보호소가 이 케이스.
    const result = resolveAdoptShelter(makeAdopt({ careTel: '010-5488-5003' }), makeShelter({ tel: '***********' }));

    expect(result.tel).toBe('010-5488-5003');
  });

  it('공고 careTel 비어있음 + shelter 마스터 tel 정상 → 마스터 tel fallback', () => {
    const result = resolveAdoptShelter(makeAdopt({ careTel: '' }), makeShelter({ tel: '055-000-0000' }));

    expect(result.tel).toBe('055-000-0000');
  });

  it('shelter 마스터 매칭 실패(undefined) + 공고 careTel 정상 → 공고 데이터로 합성', () => {
    const result = resolveAdoptShelter(
      makeAdopt({ careTel: '010-5488-5003', careNm: '창녕 보호소', careAddr: '서울 강남' }),
      undefined
    );

    expect(result).toEqual({
      id: 'sh-1',
      name: '창녕 보호소',
      address: '서울 강남',
      tel: '010-5488-5003',
      time: '운영시간 정보 없음',
      person: '담당자 정보 없음'
    });
  });

  it('shelter 마스터 매칭 실패 + 공고 careTel 도 비어있음 → tel 비어있어 hasCallNumber=false 가능', () => {
    const result = resolveAdoptShelter(makeAdopt({ careTel: '' }), undefined);

    expect(result.tel).toBeFalsy();
  });

  it('shelter 마스터 매칭 성공 → 운영시간/인력은 마스터 데이터 그대로 보존', () => {
    const result = resolveAdoptShelter(makeAdopt(), makeShelter());

    // mapToShelter 가 평일 시간을 사람이 읽는 포맷으로 변환했음을 그대로 노출
    expect(result.time).toContain('평일');
    expect(result.person).toContain('수의사');
  });

  it('shelter 마스터 매칭 성공 → name/address 는 마스터 우선 (공고가 다르면 마스터 값 노출)', () => {
    const result = resolveAdoptShelter(
      makeAdopt({ careNm: '공고에 잘못 들어간 이름', careAddr: '공고 주소 raw' }),
      makeShelter({ name: '창녕 유기동물보호소', address: '경상남도 창녕군 정규화 주소' })
    );

    expect(result.name).toBe('창녕 유기동물보호소');
    expect(result.address).toBe('경상남도 창녕군 정규화 주소');
  });
});
