import { mapToShelter } from './mapper';
import { ShelterDto } from './schema';

const SHELTER_FALLBACK_DESC = '유기동물 보호소';

// 공유 시 desc 조립 — 주소 + 운영시간. 비어있으면 fallback.
export const buildShelterShareDesc = (shelter: ShelterDto): string => {
  const view = mapToShelter(shelter);
  // mapToShelter 의 time 은 멀티라인 ("평일 ...\n주말 ...") — 미리보기용으로 ' · ' 단일라인 변환.
  const formattedTime = view.time === '정보 없음' ? '' : view.time.replace(/\n/g, ' · ');

  const segments = [shelter.address, formattedTime].filter((s) => !!s && s.trim().length > 0);

  return segments.length > 0 ? segments.join(' · ') : SHELTER_FALLBACK_DESC;
};
