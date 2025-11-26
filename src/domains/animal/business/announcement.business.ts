import dayjs from 'dayjs';

import { AnnouncementValue } from '../types/announcement.types';

export type TransformedAbandonmentDetail = ReturnType<typeof transformAbandonmentDetail>;
export const transformAbandonmentDetail = (data: AnnouncementValue) => {
  const { specificType, noticeStartDt, noticeEndDt, orgName, happenPlace, fullName, age, weight } = data;
  const descriptionParams: DescriptionParams = {
    specificType,
    noticeStartDt,
    noticeEndDt,
    orgName,
    happenPlace
  };
  const transformedDescription = transformDescription(descriptionParams);
  const convertedAge = `${age.substring(0, 4).replace(/[^0-9]/g, '')}`;
  const convertedWeight = `${parseFloat(weight)}kg`;

  return {
    ...data,
    age: convertedAge,
    weight: convertedWeight,
    title: fullName,
    description: transformedDescription
  };
};

interface DescriptionParams {
  specificType: string;
  noticeStartDt: string;
  noticeEndDt: string;
  orgName: string;
  happenPlace: string;
}
export const transformDescription = ({ noticeStartDt, noticeEndDt, orgName, happenPlace }: DescriptionParams) => {
  const startDt = dayjs(noticeStartDt).format('YY.MM.DD');
  const endDt = dayjs(noticeEndDt).format('YY.MM.DD');

  return [
    { label: '공고기간', value: `${startDt}-${endDt}` },
    { label: '지역', value: orgName },
    { label: '구조장소', value: happenPlace }
  ];
};
