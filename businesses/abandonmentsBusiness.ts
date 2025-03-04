import { ChipVariant } from '@/components/organisms/card/AnimalCard';
import { AbandonmentsChipId, AbandonmentsFilter } from '@/types/abandonments';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import dayjs from 'dayjs';

export type AbandonmentsBusinessResult = ReturnType<typeof abandonmentsBusiness>[number];
export const abandonmentsBusiness = (data: AbandonmentValue[], filter?: AbandonmentsFilter) => {
  return data.map((item) => transformAbandonmentData(item, filter));
};

export type TransformedAbandonmentData = ReturnType<typeof transformAbandonmentData>;
export const transformAbandonmentData = (data: AbandonmentValue, filter?: AbandonmentsFilter) => {
  const { image, neuterYn, weight, gender, age, specificType, noticeStartDt, noticeEndDt, orgName, happenPlace } = data;

  const chipLabelParams: ChipLabelParams = {
    neuterYn,
    weight,
    gender,
    age,
    filter
  };

  const descriptionParams: DescriptionParams = {
    specificType,
    noticeStartDt,
    noticeEndDt,
    orgName,
    happenPlace
  };

  const transformedDescription = transformDescription(descriptionParams);
  const transformedChipLabel = transformChipLabel(chipLabelParams);

  return {
    ...data,
    uri: image,
    title: specificType,
    description: transformedDescription,
    chips: transformedChipLabel
  };
};

interface ChipLabelParams {
  neuterYn: string;
  weight: string;
  gender: string;
  age: string;
  filter?: AbandonmentsFilter;
}
export const transformChipLabel = ({ neuterYn, filter, weight, gender, age }: ChipLabelParams) => {
  let data: {
    id: AbandonmentsChipId;
    value: string;
    sort: number;
    variant?: ChipVariant;
  }[] = [];

  switch (filter) {
    case 'NEAR_DEADLINE':
      data.push({
        id: 'NEAR_DEADLINE',
        value: '안락사 위기',
        sort: 1,
        variant: 'error'
      });
      break;
    case 'NEW':
      data.push({
        id: 'NEW',
        value: '신규',
        sort: 1,
        variant: 'success'
      });
      break;
  }

  if (neuterYn === 'Y') {
    data.push({
      id: 'NEUTER',
      value: '중성화',
      sort: 2,
      variant: 'notice'
    });
  }

  const genderLabel = gender === 'F' ? '여아' : gender === 'M' ? '남아' : '미상';
  data.push({
    id: 'GENDER',
    value: genderLabel,
    sort: 3
  });

  if (age) {
    data.push({
      id: 'AGE',
      value: `${age}년생`,
      sort: 4
    });
  }

  if (weight) {
    data.push({
      id: 'WEIGHT',
      value: `${weight}kg`,
      sort: 5
    });
  }

  return data;
};

interface DescriptionParams {
  specificType: string;
  noticeStartDt: string;
  noticeEndDt: string;
  orgName: string;
  happenPlace: string;
}
export const transformDescription = ({
  noticeStartDt,
  noticeEndDt,
  specificType,
  orgName,
  happenPlace
}: DescriptionParams) => {
  const startDt = dayjs(noticeStartDt).format('YY.MM.DD');
  const endDt = dayjs(noticeEndDt).format('YY.MM.DD');

  return [
    { label: '공고기간', value: `${startDt} - ${endDt}` },
    { label: '품종', value: specificType },
    { label: '지역', value: orgName },
    { label: '구조장소', value: happenPlace }
  ];
};
