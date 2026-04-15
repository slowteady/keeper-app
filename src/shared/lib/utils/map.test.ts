import { calcMapRadiusKm } from './map';

describe('calcMapRadiusKm', () => {
  it('returns 0 for zero deltas', () => {
    const result = calcMapRadiusKm({
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0,
      longitudeDelta: 0
    });

    expect(result).toBe(0);
  });

  it('calculates radius for Seoul region', () => {
    const result = calcMapRadiusKm({
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    });

    // 0.1도 ≈ 약 8.88km (위도) / 약 7.03km (경도, 위도 37도 기준)
    // VIEWPORT_RATIO 0.8 적용 후 반경 계산
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(8);
  });

  it('returns larger radius for larger deltas', () => {
    const small = calcMapRadiusKm({
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    });

    const large = calcMapRadiusKm({
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2
    });

    expect(large).toBeGreaterThan(small);
  });

  it('returns integer (floor)', () => {
    const result = calcMapRadiusKm({
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.07,
      longitudeDelta: 0.07
    });

    expect(Number.isInteger(result)).toBe(true);
  });

  it('accounts for latitude in longitude distance', () => {
    // 적도 근처는 경도 1도 ≈ 111km, 고위도에서는 줄어듦
    const equator = calcMapRadiusKm({
      latitude: 0,
      longitude: 126.978,
      latitudeDelta: 0,
      longitudeDelta: 0.1
    });

    const highLat = calcMapRadiusKm({
      latitude: 60,
      longitude: 126.978,
      latitudeDelta: 0,
      longitudeDelta: 0.1
    });

    expect(equator).toBeGreaterThan(highLat);
  });
});
