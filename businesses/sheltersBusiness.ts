import { ShelterValue } from '@/types/scheme/shelters';
import { formatTimeAMPM } from '@/utils/timeUtils';

/**
 * 보호소 바텀시트 데이터로 변환
 * @param data
 */
export type TransformedShelterValue = ReturnType<typeof transformShelterData>;
export const transformShelterData = (data: ShelterValue) => {
  const {
    address,
    weekdayOpenTime,
    weekdayCloseTime,
    weekendCloseTime,
    weekendOpenTime,
    veterinarianCount,
    caretakerCount
  } = data;

  const formattedTime = formatOperatingTime({ weekdayOpenTime, weekdayCloseTime, weekendCloseTime, weekendOpenTime });
  const formattedPerson = formatPerson({ veterinarianCount, caretakerCount });

  return {
    time: formattedTime,
    person: formattedPerson,
    address
  };
};

/**
 * 운영시간으로 변환
 * @param data
 * @returns
 */
interface FormatOperatingTimeParams {
  weekdayOpenTime: string;
  weekdayCloseTime: string;
  weekendOpenTime: string;
  weekendCloseTime: string;
}
const formatOperatingTime = ({
  weekdayOpenTime,
  weekdayCloseTime,
  weekendOpenTime,
  weekendCloseTime
}: FormatOperatingTimeParams) => {
  const weekdayOpen = formatTimeAMPM(weekdayOpenTime);
  const weekdayClose = formatTimeAMPM(weekdayCloseTime);
  const weekendOpen = formatTimeAMPM(weekendOpenTime);
  const weekendClose = formatTimeAMPM(weekendCloseTime);

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

  const timeString = (() => {
    if (weekdayHours && weekendHours) {
      return `${weekdayHours}\n${weekendHours}`; // 평일과 주말 둘 다 있을 경우
    }
    if (weekdayHours) {
      return weekdayHours; // 평일만 있을 경우
    }
    if (weekendHours) {
      return weekendHours; // 주말만 있을 경우
    }
    return '정보 없음'; // 둘 다 없을 경우
  })();

  return timeString;
};

/**
 * 수의사, 보조사 수 문장으로 변환
 */
interface FormatPersonParams {
  veterinarianCount: number;
  caretakerCount: number;
}
const formatPerson = ({ caretakerCount, veterinarianCount }: FormatPersonParams) => {
  if (veterinarianCount > 0) {
    return `수의사 ${veterinarianCount}명 외`;
  } else if (caretakerCount > 0) {
    return `보조사 ${caretakerCount}명 외`;
  } else {
    return '정보 없음';
  }
};
