import { buildAdoptTags } from './build-adopt-tags';

describe('buildAdoptTags', () => {
  it('모든 enum 이 채워지면 라벨 5개를 순서대로 생성한다', () => {
    expect(
      buildAdoptTags({
        animalType: 'DOG',
        gender: 'M',
        neuterYn: 'Y',
        protectionType: 'ADOPTION',
        vaccinationCheck: 'THIRD'
      })
    ).toEqual(['강아지', '남아', '중성화', '입양', '3차접종']);
  });

  it('animalType 매핑 — DOG/CAT/OTHER', () => {
    expect(buildAdoptTags({ animalType: 'DOG' })).toContain('강아지');
    expect(buildAdoptTags({ animalType: 'CAT' })).toContain('고양이');
    expect(buildAdoptTags({ animalType: 'OTHER' })).toContain('기타');
  });

  it('gender 매핑 — M/F', () => {
    expect(buildAdoptTags({ gender: 'M' })).toContain('남아');
    expect(buildAdoptTags({ gender: 'F' })).toContain('여아');
  });

  it('neuterYn 매핑 — Y/N', () => {
    expect(buildAdoptTags({ neuterYn: 'Y' })).toContain('중성화');
    expect(buildAdoptTags({ neuterYn: 'N' })).toContain('비중성화');
  });

  it('protectionType 매핑 — ADOPTION/TEMPORARY/BOTH', () => {
    expect(buildAdoptTags({ protectionType: 'ADOPTION' })).toContain('입양');
    expect(buildAdoptTags({ protectionType: 'TEMPORARY' })).toContain('임시보호');
    expect(buildAdoptTags({ protectionType: 'BOTH' })).toContain('모두가능');
  });

  it('vaccinationCheck 매핑 — NOT/FIRST/SECOND/THIRD, NONE 은 생략', () => {
    expect(buildAdoptTags({ vaccinationCheck: 'NOT' })).toContain('미접종');
    expect(buildAdoptTags({ vaccinationCheck: 'FIRST' })).toContain('1차접종');
    expect(buildAdoptTags({ vaccinationCheck: 'SECOND' })).toContain('2차접종');
    expect(buildAdoptTags({ vaccinationCheck: 'THIRD' })).toContain('3차접종');
    expect(buildAdoptTags({ vaccinationCheck: 'NONE' })).toEqual([]);
  });

  it('값이 모두 없거나 NONE / 미상이면 빈 배열을 반환한다', () => {
    expect(buildAdoptTags({})).toEqual([]);
    expect(
      buildAdoptTags({
        gender: 'NONE',
        neuterYn: 'NONE',
        vaccinationCheck: 'NONE'
      })
    ).toEqual([]);
  });
});
