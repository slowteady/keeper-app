import { getKakaoRegionCode } from './api';
import { resolveRegionFromPlace } from './resolve-region';
import { KakaoKeywordDocumentDto, KakaoRegionDocumentDto } from './schema';

jest.mock('./api');

const mockGetRegion = getKakaoRegionCode as jest.MockedFunction<typeof getKakaoRegionCode>;

const place: KakaoKeywordDocumentDto = {
  id: '1',
  place_name: '분당정자동카페골목',
  category_name: '',
  category_group_code: '',
  category_group_name: '',
  phone: '',
  address_name: '경기 성남시 분당구 정자동 97-3',
  road_address_name: '',
  x: '127.1',
  y: '37.3',
  place_url: '',
  distance: ''
};

const regionDoc = (over: Partial<KakaoRegionDocumentDto> = {}): KakaoRegionDocumentDto => ({
  region_type: 'B',
  code: '4113510900',
  region_1depth_name: '경기도',
  region_2depth_name: '성남시 분당구',
  region_3depth_name: '정자동',
  region_4depth_name: '',
  ...over
});

const response = (documents: KakaoRegionDocumentDto[]) =>
  ({ data: { meta: { total_count: documents.length }, documents } }) as Awaited<ReturnType<typeof getKakaoRegionCode>>;

describe('resolveRegionFromPlace', () => {
  afterEach(() => jest.clearAllMocks());

  it('B(법정동) document로 표시값과 regionCode를 만든다', async () => {
    mockGetRegion.mockResolvedValue(response([regionDoc({ region_type: 'H', code: '4113558000' }), regionDoc()]));
    await expect(resolveRegionFromPlace(place)).resolves.toEqual({
      location: '경기 성남시 분당구 정자동',
      regionCode: '4113510900'
    });
  });

  it('B가 없으면 첫 document를 쓴다', async () => {
    mockGetRegion.mockResolvedValue(response([regionDoc({ region_type: 'H', code: '4113558000' })]));
    await expect(resolveRegionFromPlace(place)).resolves.toEqual({
      location: '경기 성남시 분당구 정자동',
      regionCode: '4113558000'
    });
  });

  it('document가 없으면 address_name으로 폴백한다', async () => {
    mockGetRegion.mockResolvedValue(response([]));
    await expect(resolveRegionFromPlace(place)).resolves.toEqual({
      location: '경기 성남시 분당구 정자동 97-3'
    });
  });

  it('호출 실패 시 address_name으로 폴백한다', async () => {
    mockGetRegion.mockRejectedValue(new Error('network'));
    await expect(resolveRegionFromPlace(place)).resolves.toEqual({
      location: '경기 성남시 분당구 정자동 97-3'
    });
  });
});
