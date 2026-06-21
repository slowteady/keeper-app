import type { AdoptStatusDto } from './schema';

export const ADOPT_OPTIONS = {
  ANIMAL: [
    { id: 'ALL', label: '전체' },
    { id: 'DOG', label: '강아지' },
    { id: 'CAT', label: '고양이' },
    { id: 'OTHER', label: '기타' }
  ] as const,
  FILTER: [
    { id: 'ALL', label: '전체' },
    { id: 'NEAR_DEADLINE', label: '마감임박' },
    { id: 'NEW', label: '신규' }
  ] as const,
  SOURCE: [
    { id: 'SHELTER', label: '보호소' },
    { id: 'PERSONAL', label: '개인' }
  ] as const
} as const;

export type AdoptSourceDto = (typeof ADOPT_OPTIONS.SOURCE)[number]['id'];

export const PROTECTION_LABEL: Record<string, string> = {
  ADOPTION: '입양',
  TEMPORARY: '임시보호',
  BOTH: '입양·임보'
};

export const SHELTER_SIDO = [
  { id: 'SEOUL', label: '서울' },
  { id: 'BUSAN', label: '부산' },
  { id: 'DAEGU', label: '대구' },
  { id: 'INCHEON', label: '인천' },
  { id: 'GWANGJU', label: '광주' },
  { id: 'DAEJEON', label: '대전' },
  { id: 'ULSAN', label: '울산' },
  { id: 'SEJONG', label: '세종' },
  { id: 'GYEONGGI', label: '경기' },
  { id: 'GANGWON', label: '강원' },
  { id: 'CHUNGBUK', label: '충북' },
  { id: 'CHUNGNAM', label: '충남' },
  { id: 'JEONBUK', label: '전북' },
  { id: 'JEONNAM', label: '전남' },
  { id: 'GYEONGBUK', label: '경북' },
  { id: 'GYEONGNAM', label: '경남' },
  { id: 'JEJU', label: '제주' }
] as const;

export const SHELTER_FILTER_OPTIONS = {
  GENDER: [
    { id: '', label: '전체' },
    { id: 'M', label: '남아' },
    { id: 'F', label: '여아' },
    { id: 'Q', label: '모름' }
  ] as const,
  NEUTER: [
    { id: '', label: '전체' },
    { id: 'Y', label: '완료' },
    { id: 'N', label: '미완료' },
    { id: 'U', label: '미상' }
  ] as const,
  AGE: [
    { id: 'UNDER_1', label: '1살 미만' },
    { id: 'AGE_1_3', label: '1~3살' },
    { id: 'AGE_3_7', label: '3~7살' },
    { id: 'OVER_7', label: '7살 이상' }
  ] as const
} as const;

export type ShelterAgeBucket = (typeof SHELTER_FILTER_OPTIONS.AGE)[number]['id'];

export const PERSONAL_FILTER_OPTIONS = {
  GENDER: [
    { id: '', label: '전체' },
    { id: 'M', label: '남아' },
    { id: 'F', label: '여아' },
    { id: 'NONE', label: '모름' }
  ] as const,
  NEUTER: [
    { id: '', label: '전체' },
    { id: 'Y', label: '완료' },
    { id: 'N', label: '미완료' }
  ] as const,
  VACCINATION: [
    { id: '', label: '전체' },
    { id: 'VACCINATED', label: '접종' },
    { id: 'NOT', label: '미접종' }
  ] as const,
  HEALTH: [
    { id: '', label: '전체' },
    { id: 'Y', label: '완료' },
    { id: 'N', label: '미완료' }
  ] as const,
  PROTECTION: [
    { id: '', label: '전체' },
    { id: 'ADOPTION', label: '입양 가능' },
    { id: 'TEMPORARY', label: '임보 가능' }
  ] as const,
  STATUS: [
    { id: 'IN_PROGRESS', label: '입양중' },
    { id: 'COMPLETED', label: '입양완료' }
  ] as const
} as const;

export const PERSONAL_SORT_OPTIONS = [
  { id: 'NEW', label: '최신순' },
  { id: 'OLD', label: '오래된순' }
] as const;

export type PersonalSort = (typeof PERSONAL_SORT_OPTIONS)[number]['id'];

export type PersonalGender = 'M' | 'F' | 'NONE';
export type PersonalNeuter = 'Y' | 'N';
export type PersonalVaccination = 'VACCINATED' | 'NOT';
export type PersonalHealth = 'Y' | 'N';
export type PersonalProtection = 'ADOPTION' | 'TEMPORARY';
export type PersonalAdoptionStatus = 'IN_PROGRESS' | 'COMPLETED';

type AdoptStatusInfo = {
  label: string;
  tone: 'positive' | 'neutral';
  bannerText: string;
};

export const ADOPT_STATUS_INFO: Record<Exclude<AdoptStatusDto, 'PROTECTING'>, AdoptStatusInfo> = {
  ADOPTED: {
    label: '입양완료',
    tone: 'positive',
    bannerText: '이 친구는 새 가족을 만났어요'
  },
  DONATED: {
    label: '기증',
    tone: 'positive',
    bannerText: '이 친구는 다른 기관으로 보내졌어요'
  },
  RELEASED: {
    label: '방사',
    tone: 'positive',
    bannerText: '이 친구는 자연으로 돌아갔어요'
  },
  RETURNED: {
    label: '반환',
    tone: 'neutral',
    bannerText: '보호자에게 반환되어 종료된 공고예요'
  },
  NATURAL_DEATH: {
    label: '자연사',
    tone: 'neutral',
    bannerText: '이 공고는 종료되었어요'
  },
  EUTHANIZED: {
    label: '안락사',
    tone: 'neutral',
    bannerText: '이 공고는 종료되었어요'
  }
};

export type EndedStatus = Exclude<AdoptStatusDto, 'PROTECTING'>;

export const isAdoptEnded = (status?: AdoptStatusDto): status is EndedStatus =>
  status !== undefined && status !== 'PROTECTING';
