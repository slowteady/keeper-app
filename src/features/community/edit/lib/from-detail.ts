import { CommunityAdoptDetailDto, CommunityAdoptFormDto } from '@/entities/community';

// 구버전 데이터(NONE chip default 시절) 호환 — 'NONE' / null / undefined 모두 미선택으로 정규화
const orUndefined = <T>(value: T | 'NONE' | null | undefined): T | undefined =>
  value === 'NONE' || value === null || value === undefined ? undefined : (value as T);

export const fromAdoptionPersonalDetail = (detail: CommunityAdoptDetailDto): CommunityAdoptFormDto => ({
  // 필수
  animalType: detail.animalType,
  protectionType: detail.protectionType,
  title: detail.title,
  content: detail.content ?? '',
  images: detail.images,
  contact: detail.contacts.map((c) => ({ type: c.type, value: c.value })),
  // 선택 — null/undefined/'NONE' 모두 undefined 로 통일
  specificType: orUndefined(detail.specificType),
  gender: detail.gender === 'M' || detail.gender === 'F' ? detail.gender : undefined,
  neuterYn: orUndefined(detail.neuterYn),
  healthCheck: orUndefined(detail.healthCheck),
  vaccinationCheck: orUndefined(detail.vaccinationCheck),
  age: orUndefined(detail.age),
  weight: orUndefined(detail.weight),
  location: orUndefined(detail.location),
  health: orUndefined(detail.health),
  relatedLink: orUndefined(detail.relatedLink),
  toiletTraining: orUndefined(detail.toiletTraining),
  separationAnxiety: orUndefined(detail.separationAnxiety),
  barking: orUndefined(detail.barking),
  activityLevel: orUndefined(detail.activityLevel),
  withChildren: orUndefined(detail.withChildren),
  withDogs: orUndefined(detail.withDogs),
  withCats: orUndefined(detail.withCats)
});
