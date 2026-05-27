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
  distance: z.number().optional(),
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

export const ShelterCountSchema = z.object({
  distance: z.number(),
  count: z.number()
});
export type ShelterCountDto = z.infer<typeof ShelterCountSchema>;

export const SheltersParamsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  distance: z.number(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional()
});
export type SheltersParamsDto = z.infer<typeof SheltersParamsSchema>;

export const ShelterCountsParamsSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});
export type ShelterCountsParamsDto = z.infer<typeof ShelterCountsParamsSchema>;

export const ShelterAdoptsParamsSchema = z.object({
  size: z.number(),
  page: z.number(),
  filter: z.string()
});
export type ShelterAdoptsParamsDto = z.infer<typeof ShelterAdoptsParamsSchema>;

export const ShelterSearchParamsSchema = z.object({
  search: z.string(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional()
});
export type ShelterSearchParamsDto = z.infer<typeof ShelterSearchParamsSchema>;
