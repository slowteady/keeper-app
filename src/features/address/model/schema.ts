import { z } from 'zod';

/**
 * 카카오 주소 문서
 */
export const KakaoAddressDocumentSchema = z.object({
  address: z.object({
    address_name: z.string(),
    b_code: z.string(),
    h_code: z.string(),
    main_address_no: z.string(),
    mountain_yn: z.enum(['Y', 'N']),
    region_1depth_name: z.string(),
    region_2depth_name: z.string(),
    region_3depth_h_name: z.string(),
    region_3depth_name: z.string(),
    sub_address_no: z.string(),
    x: z.string(),
    y: z.string()
  }),
  address_name: z.string(),
  address_type: z.string(),
  road_address: z
    .object({
      address_name: z.string(),
      region_1depth_name: z.string(),
      region_2depth_name: z.string(),
      region_3depth_name: z.string(),
      road_name: z.string(),
      underground_yn: z.enum(['Y', 'N']),
      main_building_no: z.string(),
      sub_building_no: z.string(),
      building_name: z.string(),
      zone_no: z.string(),
      x: z.string(),
      y: z.string()
    })
    .nullable(),
  x: z.string(),
  y: z.string()
});
export type KakaoAddressDocumentDto = z.infer<typeof KakaoAddressDocumentSchema>;

/**
 * 카카오 지오코드 메타 정보
 */
export const KakaoGeocodeMetaSchema = z.object({
  is_end: z.boolean(),
  pageable_count: z.number(),
  total_count: z.number()
});
export type KakaoGeocodeMetaDto = z.infer<typeof KakaoGeocodeMetaSchema>;

/**
 * Kakao Geocode API 응답
 */
export const KakaoGeocodeResponseSchema = z.object({
  documents: z.array(KakaoAddressDocumentSchema),
  meta: KakaoGeocodeMetaSchema
});
export type KakaoGeocodeResponseDto = z.infer<typeof KakaoGeocodeResponseSchema>;

export const KakaoGeocodeOptionalParamsSchema = z.object({
  /** 페이지 번호 (1~45, 기본 1) */
  page: z.number().optional(),
  /** 페이지당 문서 수 (1~30, 기본 10) */
  size: z.number().optional(),
  /** 좌표 기준 검색(“x,y” 문자열) */
  coordinate: z.string().optional(),
  /** 정확도 옵션: ‘exact’ 또는 ‘similar’ (기본 ‘similar’) */
  analyze_type: z.enum(['exact', 'similar']).optional()
});
export type KakaoGeocodeOptionalParamsDto = z.infer<typeof KakaoGeocodeOptionalParamsSchema>;

export const KakaoGeocodeParamsSchema = z.object({
  query: z.string(),
  params: KakaoGeocodeOptionalParamsSchema.optional()
});
export type KakaoGeocodeParamsDto = z.infer<typeof KakaoGeocodeParamsSchema>;
