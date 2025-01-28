import { ShelterValue } from '@/types/scheme/shelters';
import { formatTimeAMPM } from '@/utils/timeUtils';

/**
 * 보호소 바텀시트 데이터로 변환
 * @param data
 */
export type TransformedShelterValue = ReturnType<typeof transformShelterData>;
export const transformShelterData = (data: ShelterValue) => {
  const formattedTime = formatOperatingTime(data);

  return [{ id: 'TIME', value: formattedTime }];
};

/**
 * 운영시간으로 변환
 * @param data
 * @returns
 */
const formatOperatingTime = (data: ShelterValue) => {
  const weekdayOpen = formatTimeAMPM(data.weekdayOpenTime);
  const weekdayClose = formatTimeAMPM(data.weekdayCloseTime);
  const weekendOpen = formatTimeAMPM(data.weekendOpenTime);
  const weekendClose = formatTimeAMPM(data.weekendCloseTime);

  const weekdayHours =
    weekdayOpen && weekdayClose
      ? `평일 ${weekdayOpen} ~ ${weekdayClose}`
      : weekdayOpen
        ? `평일 ${weekdayOpen} ~`
        : null;

  const weekendHours =
    weekendOpen && weekendClose
      ? `주말 ${weekendOpen} ~ ${weekendClose}`
      : weekendOpen
        ? `주말 ${weekendOpen} ~`
        : null;

  return {
    weekdayHours,
    weekendHours
  };
};
