import { z } from 'zod';

export const AdoptFilterSchema = z.enum(['ALL', 'NEW', 'NEAR_DEADLINE']);
export type AdoptFilterDto = z.infer<typeof AdoptFilterSchema>;

export const AdoptStatusSchema = z.enum([
  'PROTECTING',
  'ADOPTED',
  'RETURNED',
  'NATURAL_DEATH',
  'EUTHANIZED',
  'DONATED',
  'RELEASED'
]);
export type AdoptStatusDto = z.infer<typeof AdoptStatusSchema>;

export const AdoptChipTypeSchema = z.enum(['NEW', 'NEAR_DEADLINE']);
export type AdoptChipTypeDto = z.infer<typeof AdoptChipTypeSchema>;

export const AdoptDataSchema = z.object({
  id: z.string(),
  images: z.array(z.string()),
  animalType: z.string(),
  specificType: z.string(),
  fullName: z.string(),
  neuterYn: z.string(),
  specialMark: z.string(),
  color: z.string(),
  age: z.string(),
  weight: z.string(),
  gender: z.string(),
  happenPlace: z.string(),
  happenDt: z.string(),
  orgName: z.string(),
  noticeStartDt: z.string(),
  noticeEndDt: z.string(),
  shelterId: z.string(),
  careNm: z.string().optional(),
  careAddr: z.string().optional(),
  careTel: z.string(),
  noticeNo: z.string(),
  rfid: z.string().nullable(),
  vaccinationCheck: z.string().nullable(),
  healthCheck: z.string().nullable(),
  // 백엔드 isFavorited 응답 추가 (abandonment_favorite 마이그레이션 동기화)
  isFavorited: z.boolean().optional(),
  status: AdoptStatusSchema.optional(),
  chipType: AdoptChipTypeSchema.optional()
});
export type AdoptDataDto = z.infer<typeof AdoptDataSchema>;

export const AdoptResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
  items: z.array(AdoptDataSchema)
});
export type AdoptResponseDto = z.infer<typeof AdoptResponseSchema>;

export const AdoptMyFavoriteListSchema = z.object({
  items: z.array(AdoptDataSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type AdoptMyFavoriteListDto = z.infer<typeof AdoptMyFavoriteListSchema>;

export const AdoptAgeBucketSchema = z.enum(['UNDER_1', 'AGE_1_3', 'AGE_3_7', 'OVER_7']);
export type AdoptAgeBucketDto = z.infer<typeof AdoptAgeBucketSchema>;

export const AdoptParamsSchema = z.object({
  filter: AdoptFilterSchema,
  animalType: z.string(),
  size: z.number(),
  page: z.number().optional(),
  // 보호소 구조화 필터 (검색 인풋 대체)
  region: z.string().optional(),
  breed: z.string().optional(),
  gender: z.enum(['M', 'F', 'Q']).optional(),
  neuter: z.enum(['Y', 'N', 'U']).optional(),
  ageBuckets: z.array(AdoptAgeBucketSchema).optional()
});
export type AdoptParamsDto = z.infer<typeof AdoptParamsSchema>;
