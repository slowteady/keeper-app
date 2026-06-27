import { formatRegionDisplay } from '../lib/region-display';
import { getKakaoRegionCode } from './api';
import { KakaoKeywordDocumentDto } from './schema';

export type ResolvedRegion = { location: string; regionCode?: string };

export const resolveRegionFromPlace = async (item: KakaoKeywordDocumentDto): Promise<ResolvedRegion> => {
  const fallback: ResolvedRegion = { location: item.address_name };
  try {
    const { data } = await getKakaoRegionCode(item.x, item.y);
    const doc = data.documents.find((d) => d.region_type === 'B') ?? data.documents[0];
    return doc ? { location: formatRegionDisplay(doc), regionCode: doc.code } : fallback;
  } catch {
    return fallback;
  }
};
