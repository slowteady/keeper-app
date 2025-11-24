import { z } from 'zod';

import { AdoptFilterSchema } from '@/entities/adopt';

// 동물보호센터유형
// - ANIMAL_HOSPITAL: 동물병원
// - CORPORATION: 기타 동물보호 기관
export const ShelterDivisionSchema = z.enum(['ANIMAL_HOSPITAL', 'CORPORATION']);
export type ShelterDivisionDto = z.infer<typeof ShelterDivisionSchema>;

export const ShelterSchema = z.object({
  id: z.number(), // 보호소 아이디
  name: z.string(), // 보호소 이름
  address: z.string(), // 보호소 주소
  tel: z.string(), // 보호소 전화번호
  latitude: z.number(), // 위도
  longitude: z.number(), // 경도
  division: ShelterDivisionSchema.optional(), // 동물보호센터유형
  veterinarianCount: z.number().optional(), // 수의사 인원수
  caretakerCount: z.number().optional(), // 사양관리사 인원수
  weekdayOpenTime: z.string(), // 평일운영시작시간
  weekdayCloseTime: z.string(), // 평일운영종료시간
  weekendOpenTime: z.string(), // 주말운영시작시간
  weekendCloseTime: z.string(), // 주말운영종료시간
  distance: z.number() // 내 위치 기준으로 보호소 거리
});
export type ShelterDto = z.infer<typeof ShelterSchema>;

export const ShelterCountSchema = z.object({
  distance: z.number(), // 내 위치 기준으로 보호소 거리
  count: z.number() // 보호소 갯수
});
export type ShelterCountDto = z.infer<typeof ShelterCountSchema>;

export const SheltersParamsSchema = z.object({
  latitude: z.number(), // 위도
  longitude: z.number(), // 경도
  distance: z.number(), // 내 위치 기준으로 보호소 거리
  userLatitude: z.number(), // 사용자 위도
  userLongitude: z.number() // 사용자 경도
});
export type SheltersParamsDto = z.infer<typeof SheltersParamsSchema>;

export const ShelterCountsParamsSchema = z.object({
  latitude: z.number(), // 위도
  longitude: z.number() // 경도
});
export type ShelterCountsParamsDto = z.infer<typeof ShelterCountsParamsSchema>;

export const ShelterAdoptParamsSchema = z.object({
  size: z.number(),
  page: z.number(),
  filter: AdoptFilterSchema
});
export type ShelterAdoptParamsDto = z.infer<typeof ShelterAdoptParamsSchema>;

export const ShelterSearchParamsSchema = z.object({
  search: z.string(),
  userLatitude: z.number(),
  userLongitude: z.number()
});
export type ShelterSearchParamsDto = z.infer<typeof ShelterSearchParamsSchema>;
