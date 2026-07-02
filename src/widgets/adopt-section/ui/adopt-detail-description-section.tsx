import { ChevronRight } from '@tamagui/lucide-icons';
import { RelativePathString, router } from 'expo-router';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { hasValue } from '@/shared/lib';

type Shelter = {
  id: string;
  time: string;
  person: string;
  address: string;
  name: string;
  navigable: boolean;
};

export type AdoptDetailDescriptionSectionProps = {
  specialMark: string | null;
  shelter?: Shelter;
};

export const AdoptDetailDescriptionSection = ({ specialMark, shelter }: AdoptDetailDescriptionSectionProps) => {
  const { black500 } = useTheme();
  const { id, time, person, address, name, navigable } = shelter || {};
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
        <Card gap={hasShelter ? 16 : 0}>
          {hasShelter ? (
            <>
              {navigable ? (
                <Pressable onPress={() => router.push(`/shelter/${id}` as RelativePathString)}>
                  <XStack justify="space-between" items="center">
                    <ShelterName>{name}</ShelterName>
                    <ChevronRight size={18} color={iconColor} />
                  </XStack>
                </Pressable>
              ) : (
                <ShelterName>{name}</ShelterName>
              )}
              <CardDivider />
              {hasValue(time) && (
                <SpecRow>
                  <SpecLabel>운영시간</SpecLabel>
                  <SpecValue lineBreakStrategyIOS="hangul-word">{time}</SpecValue>
                </SpecRow>
              )}
              {hasValue(address) && (
                <SpecRow>
                  <SpecLabel>주소</SpecLabel>
                  <SpecValue lineBreakStrategyIOS="hangul-word">{address}</SpecValue>
                </SpecRow>
              )}
              {hasValue(person) && (
                <SpecRow>
                  <SpecLabel>담당</SpecLabel>
                  <SpecValue lineBreakStrategyIOS="hangul-word">{person}</SpecValue>
                </SpecRow>
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

const SpecRow = styled(XStack, {
  items: 'flex-start',
  gap: 12
});

const SpecLabel = styled(Text, {
  width: 72,
  fontSize: 15,
  fontWeight: '600',
  lineHeight: 22,
  color: '$black800'
});

const SpecValue = styled(Text, {
  flex: 1,
  fontSize: 15,
  fontWeight: '500',
  lineHeight: 22,
  color: '$black700'
});
