import { z } from 'zod';

import {
  AnimalTypeSchema,
  GenderSchema,
  HealthCheckSchema,
  NeuterYnSchema,
  VaccinationCheckSchema
} from '@/shared/model';

export const AdoptFilterSchema = z.enum(['NEW', 'NEAR_DEADLINE']);
export type AdoptFilterDto = z.infer<typeof AdoptFilterSchema>;

export const AdoptDataSchema = z.object({
  id: z.string(), // 공고 id
  images: z.array(z.string()), // 이미지
  animalType: AnimalTypeSchema, // 동물 종류
  specificType: z.string(), // 품종
  fullName: z.string(), // 타이틀 - ex) [개] 믹스견
  neuterYn: NeuterYnSchema, // 중성화 여부
  specialMark: z.string(), // 특이 사항
  color: z.string(), // 색깔
  age: z.string(), // 출생년도
  weight: z.string(), // 몸무게
  gender: GenderSchema, // 성별
  happenPlace: z.string(), // 구조 장소
  happenDt: z.string(), // 구조 일시
  orgName: z.string(), // 지역
  noticeStartDt: z.string(), // 공고 시작일
  noticeEndDt: z.string(), // 공고 종료일
  shelterId: z.string(), // 보호소 id
  careTel: z.string(), // 보호소 전화번호
  noticeNo: z.string(), // 공고 번호
  rfid: z.string().nullable(), // 칩 번호
  vaccinationCheck: VaccinationCheckSchema, // 백신 검사 여부
  healthCheck: HealthCheckSchema // 건강 검진 여부
});
export type AdoptDataDto = z.infer<typeof AdoptDataSchema>;

export const AdoptResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  size: z.number(),
  has_next: z.boolean(),
  value: z.array(AdoptDataSchema)
});
export type AdoptResponseDto = z.infer<typeof AdoptResponseSchema>;

export const AdoptParamsSchema = z.object({
  filter: AdoptFilterSchema,
  animalType: AnimalTypeSchema,
  size: z.number(),
  page: z.number().optional(),
  search: z.string().optional()
});
export type AdoptParamsDto = z.infer<typeof AdoptParamsSchema>;
