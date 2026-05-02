type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const KM_PER_DEGREE = 111;
/** 뷰포트 대비 검색 영역 비율 (가장자리 마커 누락 방지용 80% 축소) */
const VIEWPORT_RATIO = 0.8;

export const calcMapRadiusKm = (region: Region) => {
  const kmPerLat = VIEWPORT_RATIO * KM_PER_DEGREE;
  const kmPerLng = VIEWPORT_RATIO * KM_PER_DEGREE * Math.cos((region.latitude * Math.PI) / 180);

  const halfLatKm = (region.latitudeDelta * kmPerLat) / 2;
  const halfLngKm = (region.longitudeDelta * kmPerLng) / 2;

  return Math.floor(Math.sqrt(halfLatKm ** 2 + halfLngKm ** 2));
};
