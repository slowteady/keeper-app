import { z } from 'zod';

export const KakaoGeocodeMetaSchema = z.object({
  is_end: z.boolean(),
  pageable_count: z.number(),
  total_count: z.number()
});
export type KakaoGeocodeMetaDto = z.infer<typeof KakaoGeocodeMetaSchema>;

export const KakaoKeywordDocumentSchema = z.object({
  id: z.string(),
  place_name: z.string(),
  category_name: z.string(),
  category_group_code: z.string(),
  category_group_name: z.string(),
  phone: z.string(),
  address_name: z.string(),
  road_address_name: z.string(),
  x: z.string(),
  y: z.string(),
  place_url: z.string(),
  distance: z.string()
});
export type KakaoKeywordDocumentDto = z.infer<typeof KakaoKeywordDocumentSchema>;

export const KakaoKeywordResponseSchema = z.object({
  documents: z.array(KakaoKeywordDocumentSchema),
  meta: KakaoGeocodeMetaSchema
});
export type KakaoKeywordResponseDto = z.infer<typeof KakaoKeywordResponseSchema>;

export const KakaoKeywordParamsSchema = z.object({
  query: z.string(),
  page: z.number().min(1).max(45).optional(),
  size: z.number().min(1).max(15).optional()
});
export type KakaoKeywordParamsDto = z.infer<typeof KakaoKeywordParamsSchema>;

export const KakaoRegionDocumentSchema = z.object({
  region_type: z.enum(['H', 'B']),
  code: z.string(),
  region_1depth_name: z.string(),
  region_2depth_name: z.string(),
  region_3depth_name: z.string(),
  region_4depth_name: z.string()
});
export type KakaoRegionDocumentDto = z.infer<typeof KakaoRegionDocumentSchema>;

export const KakaoRegionResponseSchema = z.object({
  meta: z.object({ total_count: z.number() }),
  documents: z.array(KakaoRegionDocumentSchema)
});
export type KakaoRegionResponseDto = z.infer<typeof KakaoRegionResponseSchema>;
