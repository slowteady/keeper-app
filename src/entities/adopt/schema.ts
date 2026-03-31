import { z } from 'zod';

export const AdoptFilterSchema = z.enum(['NEW', 'NEAR_DEADLINE']);
export type AdoptFilterDto = z.infer<typeof AdoptFilterSchema>;

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
  careTel: z.string(),
  noticeNo: z.string(),
  rfid: z.string().nullable(),
  vaccinationCheck: z.string().nullable(),
  healthCheck: z.string().nullable()
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
  animalType: z.string(),
  size: z.number(),
  page: z.number().optional(),
  search: z.string().optional()
});
export type AdoptParamsDto = z.infer<typeof AdoptParamsSchema>;
