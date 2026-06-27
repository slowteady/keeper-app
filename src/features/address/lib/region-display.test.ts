import { formatRegionDisplay } from './region-display';

describe('formatRegionDisplay', () => {
  it('시도를 축약하고 시군구·동을 공백으로 잇는다', () => {
    expect(
      formatRegionDisplay({
        region_1depth_name: '서울특별시',
        region_2depth_name: '광진구',
        region_3depth_name: '화양동'
      })
    ).toBe('서울 광진구 화양동');
  });

  it('시군구에 공백이 포함돼도(성남시 분당구) 그대로 잇는다', () => {
    expect(
      formatRegionDisplay({
        region_1depth_name: '경기도',
        region_2depth_name: '성남시 분당구',
        region_3depth_name: '정자동'
      })
    ).toBe('경기 성남시 분당구 정자동');
  });

  it('특별자치도를 축약한다', () => {
    expect(
      formatRegionDisplay({
        region_1depth_name: '강원특별자치도',
        region_2depth_name: '춘천시',
        region_3depth_name: '교동'
      })
    ).toBe('강원 춘천시 교동');
    expect(
      formatRegionDisplay({
        region_1depth_name: '세종특별자치시',
        region_2depth_name: '',
        region_3depth_name: '한솔동'
      })
    ).toBe('세종 한솔동');
  });

  it('구 명칭(강원도)도 축약한다', () => {
    expect(
      formatRegionDisplay({
        region_1depth_name: '강원도',
        region_2depth_name: '원주시',
        region_3depth_name: '단계동'
      })
    ).toBe('강원 원주시 단계동');
  });

  it('매핑에 없는 시도명은 원본을 쓴다', () => {
    expect(
      formatRegionDisplay({
        region_1depth_name: '서울특별시',
        region_2depth_name: '',
        region_3depth_name: ''
      })
    ).toBe('서울');
  });
});
