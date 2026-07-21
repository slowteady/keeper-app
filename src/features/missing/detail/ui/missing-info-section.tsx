import { Clock, MapPin } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { MissingDetailDto } from '@/entities/missing';
import { DetailSpecRow, DetailSpecSection } from '@/widgets/adopt-section';

const ANIMAL_TYPE_LABEL: Record<MissingDetailDto['animalType'], string> = {
  DOG: '강아지',
  CAT: '고양이',
  OTHER: '기타'
};

const GENDER_LABEL: Record<string, string> = {
  M: '수컷',
  F: '암컷'
};

const ID_TAG_LABEL: Record<string, string> = {
  Y: '있음',
  N: '없음'
};

export const MissingInfoSection = ({ missing }: { missing: MissingDetailDto }) => {
  const { black600 } = useTheme();
  const kind = [ANIMAL_TYPE_LABEL[missing.animalType], missing.breed].filter(Boolean).join(' · ');
  const rows: DetailSpecRow[] = [
    ...(missing.name ? [{ label: '이름', value: missing.name }] : []),
    { label: '종류', value: kind },
    ...(missing.gender && GENDER_LABEL[missing.gender] ? [{ label: '성별', value: GENDER_LABEL[missing.gender] }] : []),
    ...(missing.age ? [{ label: '나이', value: `${missing.age}년생` }] : []),
    ...(missing.weight ? [{ label: '몸무게', value: `${missing.weight}kg` }] : []),
    ...(missing.hasIdTag ? [{ label: '인식칩', value: ID_TAG_LABEL[missing.hasIdTag] }] : []),
    ...(missing.rfid ? [{ label: '동물등록번호', value: missing.rfid }] : []),
    { label: '특징', value: missing.colorFeature }
  ];

  return (
    <YStack gap={32}>
      <YStack gap={12}>
        <Title>실종 정보</Title>
        <YStack gap={10}>
          <InfoRow>
            <Clock size={16} color={black600.val as never} />
            <Label>실종일시</Label>
            <Value>{dayjs(missing.lostAt).format('YYYY.MM.DD HH:mm')}</Value>
          </InfoRow>
          <InfoRow>
            <MapPin size={16} color={black600.val as never} />
            <Label>실종장소</Label>
            <Value lineBreakStrategyIOS="hangul-word">{missing.address}</Value>
          </InfoRow>
        </YStack>
      </YStack>

      <DetailSpecSection title="기본정보" rows={rows} />

      {!!missing.description && (
        <YStack gap={12}>
          <Title>상세 특징</Title>
          <Body lineBreakStrategyIOS="hangul-word">{missing.description}</Body>
        </YStack>
      )}
    </YStack>
  );
};

const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const InfoRow = styled(XStack, {
  items: 'center',
  gap: 8
});

const Label = styled(Text, {
  width: 68,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black600'
});

const Value = styled(Text, {
  flex: 1,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});

const Body = styled(Text, {
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 24,
  color: '$black800'
});
