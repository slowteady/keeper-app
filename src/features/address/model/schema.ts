import { z } from 'zod';

/**
 * 주소 요소
 * 주소의 각 구성 요소 정보 (시/도, 구/군, 동 등)
 */
export const AddressElementSchema = z.object({
  /** 주소 요소의 타입 배열 (예: ["SIDO"], ["SIGUGUN"], ["DONGMYUN"] 등) */
  types: z.array(z.string()),
  /** 주소 요소의 전체 이름 */
  longName: z.string(),
  /** 주소 요소의 약식 이름 */
  shortName: z.string(),
  /** 코드 정보 (필요 시 사용) */
  code: z.string()
});
export type AddressElementDto = z.infer<typeof AddressElementSchema>;

/**
 * 주소 정보
 */
export const AddressSchema = z.object({
  /** 도로명 주소 */
  roadAddress: z.string(),
  /** 지번 주소 */
  jibunAddress: z.string(),
  /** 영문 주소 */
  englishAddress: z.string(),
  /** 주소의 각 요소 정보 (예: 시/도, 구/군, 동, 도로명, 건물번호 등) */
  addressElements: z.array(AddressElementSchema),
  /** x 좌표 (경도), API에서는 문자열로 제공됨 */
  x: z.string(),
  /** y 좌표 (위도), API에서는 문자열로 제공됨 */
  y: z.string(),
  /** 중심 좌표로부터의 거리 (단위 km) */
  distance: z.number()
});
export type AddressDto = z.infer<typeof AddressSchema>;

/**
 * 메타 정보
 * 전체 개수, 페이지 번호, 한 페이지에 포함된 개수
 */
export const MetaSchema = z.object({
  totalCount: z.number(),
  page: z.number(),
  count: z.number()
});
export type MetaDto = z.infer<typeof MetaSchema>;

/**
 * Naver Geocode API 응답
 */
export const GeocodeResponseSchema = z.object({
  /** 응답 상태 (예: "OK") */
  status: z.string(),
  /** 메타 정보: 전체 개수, 페이지 번호, 한 페이지에 포함된 개수 */
  meta: MetaSchema,
  /** 검색 결과 주소 목록 */
  addresses: z.array(AddressSchema),
  /** 에러 메시지 (정상일 경우 빈 문자열) */
  errorMessage: z.string()
});
export type GeocodeResponseDto = z.infer<typeof GeocodeResponseSchema>;

// ============================================
// Kakao Geocode API 스키마
// ============================================

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
  params: z.object(KakaoGeocodeOptionalParamsSchema).optional()
});
export type KakaoGeocodeParamsDto = z.infer<typeof KakaoGeocodeParamsSchema>;
