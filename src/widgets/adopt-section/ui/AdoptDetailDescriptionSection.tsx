import { Image } from 'expo-image';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { Link } from '@/shared/ui';

export interface Shelter {
  id: number;
  time: string;
  person: string;
  address: string;
  name: string;
}

export interface AdoptDetailDescriptionSectionProps {
  specialMark: string;
  shelter?: Shelter;
  hasCallNumber?: boolean;
}

export const AdoptDetailDescriptionSection = ({
  specialMark,
  shelter,
  hasCallNumber
}: AdoptDetailDescriptionSectionProps) => {
  const { id, time, person, address, name } = shelter || {};

  const hasShelter = !!name;

  return (
    <>
      <XStack items="center" mb={20}>
        <XStack gap={4} items="center" minW={90}>
          <Text fontSize={18} fontWeight="600" lineHeight={24} color="$black800">
            특징
          </Text>
          <Image
            source={require('@/assets/images/message.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
        </XStack>
        <Text fontSize={16} fontWeight="500" lineHeight={22} color="#707070" flex={1}>
          {specialMark}
        </Text>
      </XStack>

      <Divider mb={20} />

      <XStack items="flex-start" mb={20}>
        <XStack gap={4} items="center" minW={90}>
          <Text fontSize={18} fontWeight="600" lineHeight={24} color="$black800">
            보호소
          </Text>
          <Image
            source={require('@/assets/images/noticebar.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
        </XStack>

        {hasShelter ? (
          <YStack gap={14} flex={1}>
            {name && (
              <DescriptionWrap>
                <Bullet>·</Bullet>
                <View flex={1} mb={4}>
                  <Link url={`/shelter/${id}`} text={name} />
                </View>
              </DescriptionWrap>
            )}
            {time && (
              <DescriptionWrap>
                <Bullet>·</Bullet>
                <Description flex={1}>{time}</Description>
              </DescriptionWrap>
            )}
            {person && (
              <DescriptionWrap>
                <Bullet>·</Bullet>
                <Description flex={1}>{person}</Description>
              </DescriptionWrap>
            )}
            {address && (
              <DescriptionWrap>
                <Bullet>·</Bullet>
                <Description flex={1} lineHeight={24}>
                  {address}
                </Description>
              </DescriptionWrap>
            )}
            {!hasCallNumber && (
              <DescriptionWrap>
                <Bullet>·</Bullet>
                <Description flex={1}>연락처 정보 없음</Description>
              </DescriptionWrap>
            )}
          </YStack>
        ) : (
          <DescriptionWrap>
            <Bullet>·</Bullet>
            <Description flex={1}>정보 없음</Description>
          </DescriptionWrap>
        )}
      </XStack>
    </>
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '#EDEDED'
});

const Description = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 18,
  color: '#707070'
});

const DescriptionWrap = styled(XStack, {
  items: 'flex-start',
  gap: 4
});

const Bullet = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 18,
  color: '#707070'
});
