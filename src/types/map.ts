import { Camera, CameraChangeReason, Region } from '@mj-studio/react-native-naver-map';

export type CameraParams = Camera & {
  reason?: CameraChangeReason;
  region?: Region;
};

export interface GeocodeResponse {
  /** 응답 상태 (예: "OK") */
  status: string;
  /** 메타 정보: 전체 개수, 페이지 번호, 한 페이지에 포함된 개수 */
  meta: Meta;
  /** 검색 결과 주소 목록 */
  addresses: Address[];
  /** 에러 메시지 (정상일 경우 빈 문자열) */
  errorMessage: string;
}

export interface Meta {
  totalCount: number;
  page: number;
  count: number;
}

export interface Address {
  /** 도로명 주소 */
  roadAddress: string;
  /** 지번 주소 */
  jibunAddress: string;
  /** 영문 주소 */
  englishAddress: string;
  /** 주소의 각 요소 정보 (예: 시/도, 구/군, 동, 도로명, 건물번호 등) */
  addressElements: AddressElement[];
  /** x 좌표 (경도), API에서는 문자열로 제공됨 */
  x: string;
  /** y 좌표 (위도), API에서는 문자열로 제공됨 */
  y: string;
  /** 중심 좌표로부터의 거리 (단위 km) */
  distance: number;
}

export interface AddressElement {
  /** 주소 요소의 타입 배열 (예: ["SIDO"], ["SIGUGUN"], ["DONGMYUN"] 등) */
  types: string[];
  /** 주소 요소의 전체 이름 */
  longName: string;
  /** 주소 요소의 약식 이름 */
  shortName: string;
  /** 코드 정보 (필요 시 사용) */
  code: string;
}

export interface KakaoAddressDocument {
  address: {
    address_name: string;
    b_code: string;
    h_code: string;
    main_address_no: string;
    mountain_yn: 'Y' | 'N';
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_h_name: string;
    region_3depth_name: string;
    sub_address_no: string;
    x: string; // longitude as string
    y: string; // latitude as string
  };
  address_name: string;
  address_type: 'REGION' | 'ROAD' | string;
  road_address: null | {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: 'Y' | 'N';
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
    x: string;
    y: string;
  };
  x: string;
  y: string;
}

export interface KakaoGeocodeMeta {
  is_end: boolean;
  pageable_count: number;
  total_count: number;
}

export interface KakaoGeocodeResponse {
  documents: KakaoAddressDocument[];
  meta: KakaoGeocodeMeta;
}
