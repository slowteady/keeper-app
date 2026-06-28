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
  specialMark: z.string().nullable(),
  color: z.string(),
  age: z.string(),
  weight: z.string(),
  gender: z.string(),
  happenPlace: z.string(),
  happenDt: z.string(),
  orgName: z.string().nullable(),
  noticeStartDt: z.string().nullable(),
  noticeEndDt: z.string().nullable(),
  shelterId: z.string().nullable(),
  careNm: z.string().nullish(),
  careAddr: z.string().nullish(),
  careTel: z.string().nullable(),
  noticeNo: z.string(),
  rfid: z.string().nullable(),
  vaccinationCheck: z.string().nullable(),
  healthCheck: z.string().nullable(),
  isFavorited: z.boolean().optional(),
  status: AdoptStatusSchema.nullish(),
  chipType: AdoptChipTypeSchema.nullish()
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
  region: z.string().optional(),
  breed: z.string().optional(),
  gender: z.enum(['M', 'F', 'Q']).optional(),
  neuter: z.enum(['Y', 'N', 'U']).optional(),
  ageBuckets: z.array(AdoptAgeBucketSchema).optional()
});
export type AdoptParamsDto = z.infer<typeof AdoptParamsSchema>;
