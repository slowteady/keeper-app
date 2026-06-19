import { z } from 'zod';

export const ShelterSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  tel: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  division: z.string().optional(),
  veterinarianCount: z.number().optional(),
  caretakerCount: z.number().optional(),
  weekdayOpenTime: z.string().nullable(),
  weekdayCloseTime: z.string().nullable(),
  weekendOpenTime: z.string().nullable(),
  weekendCloseTime: z.string().nullable(),
  weekdayCellOpenTime: z.string().nullable().optional(),
  weekdayCellCloseTime: z.string().nullable().optional(),
  weekendCellOpenTime: z.string().nullable().optional(),
  weekendCellCloseTime: z.string().nullable().optional(),
  closeDay: z.string().nullable(),
  distance: z.number().nullable().optional(),
  // 백엔드 isFavorited 추가 (마이그레이션 014 + shelter v2 controller 변경 동기화)
  isFavorited: z.boolean().optional()
});
export type ShelterDto = z.infer<typeof ShelterSchema>;

export const ShelterMyFavoriteListSchema = z.object({
  items: z.array(ShelterSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type ShelterMyFavoriteListDto = z.infer<typeof ShelterMyFavoriteListSchema>;

export const ShelterAdoptsParamsSchema = z.object({
  size: z.number(),
  page: z.number(),
  filter: z.string()
});
export type ShelterAdoptsParamsDto = z.infer<typeof ShelterAdoptsParamsSchema>;

export const ShelterWithinParamsSchema = z.object({
  minLatitude: z.number(),
  maxLatitude: z.number(),
  minLongitude: z.number(),
  maxLongitude: z.number()
});
export type ShelterWithinParamsDto = z.infer<typeof ShelterWithinParamsSchema>;
