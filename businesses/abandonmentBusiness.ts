import theme from '@/constants/theme';
import { AbandonmentsChipId, AbandonmentsFilter } from '@/type/abandonments';
import { AbandonmentValue } from '@/type/scheme/abandonments';
import dayjs from 'dayjs';
import { TextStyle, ViewStyle } from 'react-native';

export type AbandonmentBusinessResult = ReturnType<typeof abandonmentBusiness>[number];
export const abandonmentBusiness = (data: AbandonmentValue[], filter: AbandonmentsFilter) => {
  return data.map(
    ({
      id,
      image,
      specificType,
      noticeStartDt,
      noticeEndDt,
      orgName,
      happenPlace,
      color,
      neuterYn,
      weight,
      gender,
      age
    }) => {
      const chipLabelParams: ChipLabelParams = {
        color,
        neuterYn,
        filter,
        weight,
        gender,
        age
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
        id,
        uri: image,
        title: specificType,
        description: transformedDescription,
        chips: transformedChipLabel
      };
    }
  );
};

interface ChipLabelParams {
  color: string;
  neuterYn: string;
  filter: AbandonmentsFilter;
  weight: string;
  gender: string;
  age: string;
}
export const transformChipLabel = ({ color, neuterYn, filter, weight, gender, age }: ChipLabelParams) => {
  let data: {
    id: AbandonmentsChipId;
    value: string;
    sort: number;
    containerStyle?: ViewStyle;
    chipStyle?: TextStyle;
  }[] = [];
  const { error, success, white, black, primary, background } = theme.colors;

  switch (filter) {
    case 'NEAR_DEADLINE':
      data.push({
        id: 'NEAR_DEADLINE',
        value: '안락사 위기',
        sort: 1,
        containerStyle: { backgroundColor: error.lightest },
        chipStyle: { color: error.main }
      });
      break;
    case 'NEW':
      data.push({
        id: 'NEW',
        value: '신규',
        sort: 1,
        containerStyle: { backgroundColor: success.lightest },
        chipStyle: { color: success.main }
      });
      break;
  }

  const genderLabel = gender === 'F' ? '여아' : gender === 'M' ? '남아' : '미상';
  data.push({
    id: 'GENDER',
    value: genderLabel,
    sort: 2,
    containerStyle: { backgroundColor: white[800] },
    chipStyle: { color: black[600] }
  });

  if (age) {
    data.push({
      id: 'AGE',
      value: `${age}년생`,
      sort: 3,
      containerStyle: { backgroundColor: primary.lightest },
      chipStyle: { color: black[800] }
    });
  }

  if (neuterYn === 'Y') {
    data.push({
      id: 'NEUTER',
      value: '중성화',
      sort: 4,
      containerStyle: { backgroundColor: white[600] },
      chipStyle: { color: primary.dark }
    });
  }

  if (weight) {
    data.push({
      id: 'WEIGHT',
      value: `${weight}kg`,
      sort: 5,
      containerStyle: { backgroundColor: background.default },
      chipStyle: { color: black[600] }
    });
  }

  if (color) {
    data.push({
      id: 'COLOR',
      value: color,
      sort: 6,
      containerStyle: { backgroundColor: background.default },
      chipStyle: { color: primary.dark }
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
