import { z } from 'zod';

export const MissingResponseSchema = z.object({
  id: z.string(),
  photos: z.array(z.string()),
  kind: z.string(),
  color: z.string().nullable(),
  sex: z.string().nullable(),
  age: z.string().nullable(),
  specialMark: z.string().nullable(),
  happenAddr: z.string(),
  happenPlace: z.string().nullable(),
  happenDt: z.string(),
  orgNm: z.string().nullable()
});
export type MissingResponseDto = z.infer<typeof MissingResponseSchema>;

export const MissingDataSchema = MissingResponseSchema.extend({
  hasCallTel: z.boolean()
});
export type MissingDataDto = z.infer<typeof MissingDataSchema>;

export const MissingContactSchema = z.object({
  callTel: z.string()
});
export type MissingContactDto = z.infer<typeof MissingContactSchema>;

export const MissingListSchema = z.object({
  items: z.array(MissingResponseSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
  appliedRegion: z.string().nullable()
});
export type MissingListDto = z.infer<typeof MissingListSchema>;

export const MissingParamsSchema = z.object({
  size: z.number(),
  page: z.number().optional(),
  sido: z.string().optional(),
  sigungu: z.string().optional(),
  animalType: z.enum(['DOG', 'CAT', 'OTHER']).optional()
});
export type MissingParamsDto = z.infer<typeof MissingParamsSchema>;
