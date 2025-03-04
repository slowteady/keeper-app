import { Camera } from '@mj-studio/react-native-naver-map';

/**
 * region 정보(위도/경도/Delta)를 받아,
 * 지도 중심 ~ 모서리까지의 대략적인 반경(km)을 계산합니다.
 * 소수점 없이 반올림하여 정수로 반환합니다.
 */
export function calcMapRadiusKm(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): number {
  // 위도 1도는 약 111km
  const kmPerLat = 111;

  // 경도 1도는 약 111 * cos(위도) km
  const kmPerLng = 111 * Math.cos((region.latitude * Math.PI) / 180);

  // region 내 delta 값(도 단위)을 km로 환산
  const deltaLatKm = region.latitudeDelta * kmPerLat;
  const deltaLngKm = region.longitudeDelta * kmPerLng;

  // 지도 중심에서 사각형의 가로·세로 절반
  const halfLatKm = deltaLatKm / 2;
  const halfLngKm = deltaLngKm / 2;

  // 피타고라스 정리를 사용해 대각선 절반(=반경)을 구함
  const radiusKm = Math.sqrt(halfLatKm ** 2 + halfLngKm ** 2);

  // 소수점 버리고 정수로 반올림
  return Math.round(radiusKm);
}

const EPSILON_CAMERA_COORD = 0.001;
export const isCameraChanged = (prevCamera: Camera, newCamera: Camera): boolean => {
  return (
    Math.abs(prevCamera.latitude - newCamera.latitude) > EPSILON_CAMERA_COORD ||
    Math.abs(prevCamera.longitude - newCamera.longitude) > EPSILON_CAMERA_COORD
  );
};
