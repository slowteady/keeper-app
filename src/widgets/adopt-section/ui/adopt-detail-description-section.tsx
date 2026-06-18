import { ChevronRight, Clock, MapPin, Stethoscope } from '@tamagui/lucide-icons';
import { RelativePathString, router } from 'expo-router';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

type Shelter = {
  id: string;
  time: string;
  person: string;
  address: string;
  name: string;
};

export type AdoptDetailDescriptionSectionProps = {
  specialMark: string;
  shelter?: Shelter;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;

export const AdoptDetailDescriptionSection = ({ specialMark, shelter }: AdoptDetailDescriptionSectionProps) => {
  const { black500 } = useTheme();
  const { id, time, person, address, name } = shelter || {};
  const hasShelter = !!name;
  const iconColor = black500.val as never;

  return (
    <YStack gap={28}>
      <YStack gap={12}>
        <SectionTitle>특징</SectionTitle>
        <Card>
          <CardText color={hasValue(specialMark) ? '$black700' : '$black500'}>
            {hasValue(specialMark) ? specialMark : '등록된 특이사항이 없어요'}
          </CardText>
        </Card>
      </YStack>

      <YStack gap={12}>
        <SectionTitle>담당 보호소</SectionTitle>
        <Card gap={hasShelter ? 14 : 0}>
          {hasShelter ? (
            <>
              <Pressable onPress={() => router.push(`/shelter/${id}` as RelativePathString)}>
                <XStack justify="space-between" items="center">
                  <ShelterName>{name}</ShelterName>
                  <ChevronRight size={18} color={iconColor} />
                </XStack>
              </Pressable>
              <CardDivider />
              {hasValue(time) && (
                <IconRow>
                  <Clock size={16} color={iconColor} />
                  <RowText>{time}</RowText>
                </IconRow>
              )}
              {hasValue(address) && (
                <IconRow>
                  <MapPin size={16} color={iconColor} />
                  <RowText>{address}</RowText>
                </IconRow>
              )}
              {hasValue(person) && (
                <IconRow>
                  <Stethoscope size={16} color={iconColor} />
                  <RowText>{person}</RowText>
                </IconRow>
              )}
            </>
          ) : (
            <CardText color="$black500">보호소 정보가 없어요</CardText>
          )}
        </Card>
      </YStack>
    </YStack>
  );
};

const SectionTitle = styled(Text, {
  fontSize: 18,
  fontWeight: '700',
  lineHeight: 24,
  color: '$black800'
});

const ShelterName = styled(Text, {
  flex: 1,
  fontSize: 16,
  fontWeight: '700',
  lineHeight: 22,
  color: '$black800'
});

const Card = styled(YStack, {
  bg: '$backgroundDefault',
  rounded: 12,
  p: 20
});

const CardText = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 24,
  color: '$black700'
});

const CardDivider = styled(View, {
  height: 1,
  bg: '#EDEDED'
});

const IconRow = styled(XStack, {
  items: 'center',
  gap: 8
});

const RowText = styled(Text, {
  flex: 1,
  fontSize: 15,
  fontWeight: '500',
  lineHeight: 22,
  color: '$black700'
});
